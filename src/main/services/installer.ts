import { app } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { getDatabase } from '../db/connection';
import type { ThemeColors } from '../../shared/types/theme';
import type { InstallResult } from '../../shared/types/ipc';

const execAsync = promisify(exec);

// Get theme colors from database
function getThemeColors(themeId: string): ThemeColors | null {
  const db = getDatabase();
  const colors = db.prepare(`
    SELECT color_key, hex_value FROM theme_colors WHERE theme_id = ?
  `).all(themeId) as Array<{ color_key: string; hex_value: string }>;

  if (colors.length === 0) return null;

  const colorMap = new Map(colors.map(c => [c.color_key, c.hex_value]));

  return {
    background: colorMap.get('background') || '#000000',
    foreground: colorMap.get('foreground') || '#ffffff',
    cursor: colorMap.get('cursor') || '#ffffff',
    cursorText: colorMap.get('cursorText') || '#000000',
    selection: colorMap.get('selection') || '#444444',
    selectionText: colorMap.get('selectionText') || '#ffffff',
    ansi: {
      black: colorMap.get('ansi_black') || '#000000',
      red: colorMap.get('ansi_red') || '#ff0000',
      green: colorMap.get('ansi_green') || '#00ff00',
      yellow: colorMap.get('ansi_yellow') || '#ffff00',
      blue: colorMap.get('ansi_blue') || '#0000ff',
      magenta: colorMap.get('ansi_magenta') || '#ff00ff',
      cyan: colorMap.get('ansi_cyan') || '#00ffff',
      white: colorMap.get('ansi_white') || '#ffffff',
      brightBlack: colorMap.get('ansi_brightBlack') || '#666666',
      brightRed: colorMap.get('ansi_brightRed') || '#ff6666',
      brightGreen: colorMap.get('ansi_brightGreen') || '#66ff66',
      brightYellow: colorMap.get('ansi_brightYellow') || '#ffff66',
      brightBlue: colorMap.get('ansi_brightBlue') || '#6666ff',
      brightMagenta: colorMap.get('ansi_brightMagenta') || '#ff66ff',
      brightCyan: colorMap.get('ansi_brightCyan') || '#66ffff',
      brightWhite: colorMap.get('ansi_brightWhite') || '#ffffff',
    },
  };
}

// Get theme name from database
function getThemeName(themeId: string): string {
  const db = getDatabase();
  const theme = db.prepare('SELECT name FROM themes WHERE id = ?').get(themeId) as { name: string } | undefined;
  return theme?.name || 'Untitled';
}

// Convert hex color to iTerm2 color dict format
function hexToItermColorDict(hex: string): {
  'Red Component': number;
  'Green Component': number;
  'Blue Component': number;
  'Alpha Component': number;
  'Color Space': string;
} {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  return {
    'Red Component': r,
    'Green Component': g,
    'Blue Component': b,
    'Alpha Component': 1,
    'Color Space': 'sRGB',
  };
}

// Install to iTerm2 via Dynamic Profiles and auto-apply
export async function installToIterm2(themeId: string): Promise<InstallResult> {
  const colors = getThemeColors(themeId);
  const themeName = getThemeName(themeId);

  if (!colors) {
    return { success: false, path: '', error: 'Theme not found' };
  }

  const dynamicProfilesDir = path.join(
    app.getPath('home'),
    'Library/Application Support/iTerm2/DynamicProfiles'
  );

  // Ensure directory exists
  if (!fs.existsSync(dynamicProfilesDir)) {
    fs.mkdirSync(dynamicProfilesDir, { recursive: true });
  }

  // Build iTerm2 profile
  const profile = {
    Profiles: [{
      Name: themeName,
      Guid: themeId,
      'Background Color': hexToItermColorDict(colors.background),
      'Foreground Color': hexToItermColorDict(colors.foreground),
      'Cursor Color': hexToItermColorDict(colors.cursor),
      'Cursor Text Color': hexToItermColorDict(colors.cursorText),
      'Selection Color': hexToItermColorDict(colors.selection),
      'Selected Text Color': hexToItermColorDict(colors.selectionText),
      'Ansi 0 Color': hexToItermColorDict(colors.ansi.black),
      'Ansi 1 Color': hexToItermColorDict(colors.ansi.red),
      'Ansi 2 Color': hexToItermColorDict(colors.ansi.green),
      'Ansi 3 Color': hexToItermColorDict(colors.ansi.yellow),
      'Ansi 4 Color': hexToItermColorDict(colors.ansi.blue),
      'Ansi 5 Color': hexToItermColorDict(colors.ansi.magenta),
      'Ansi 6 Color': hexToItermColorDict(colors.ansi.cyan),
      'Ansi 7 Color': hexToItermColorDict(colors.ansi.white),
      'Ansi 8 Color': hexToItermColorDict(colors.ansi.brightBlack),
      'Ansi 9 Color': hexToItermColorDict(colors.ansi.brightRed),
      'Ansi 10 Color': hexToItermColorDict(colors.ansi.brightGreen),
      'Ansi 11 Color': hexToItermColorDict(colors.ansi.brightYellow),
      'Ansi 12 Color': hexToItermColorDict(colors.ansi.brightBlue),
      'Ansi 13 Color': hexToItermColorDict(colors.ansi.brightMagenta),
      'Ansi 14 Color': hexToItermColorDict(colors.ansi.brightCyan),
      'Ansi 15 Color': hexToItermColorDict(colors.ansi.brightWhite),
    }],
  };

  const slugName = themeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const profilePath = path.join(dynamicProfilesDir, `${slugName}.json`);

  try {
    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));

    // Auto-apply using AppleScript to all windows/tabs/sessions
    const appleScript = `
      tell application "iTerm"
        repeat with w in windows
          repeat with t in tabs of w
            repeat with s in sessions of t
              tell s to set profile to "${themeName}"
            end repeat
          end repeat
        end repeat
      end tell
    `;

    try {
      await execAsync(`osascript -e '${appleScript.replace(/'/g, "'\"'\"'")}'`);
      return {
        success: true,
        path: profilePath,
        instructions: `Theme "${themeName}" applied to iTerm2!`,
      };
    } catch (scriptErr) {
      // AppleScript failed, but profile was created
      return {
        success: true,
        path: profilePath,
        instructions: `Theme "${themeName}" installed. Open iTerm2 and select it from Profiles menu, or restart iTerm2.`,
      };
    }
  } catch (err) {
    return {
      success: false,
      path: profilePath,
      error: `Failed to write profile: ${err}`,
    };
  }
}

// Install to Terminal.app and auto-apply
export async function installToTerminalApp(themeId: string): Promise<InstallResult> {
  const colors = getThemeColors(themeId);
  const themeName = getThemeName(themeId);

  if (!colors) {
    return { success: false, path: '', error: 'Theme not found' };
  }

  // Use AppleScript to directly set Terminal colors
  const hexToRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) * 257;
    const g = parseInt(hex.slice(3, 5), 16) * 257;
    const b = parseInt(hex.slice(5, 7), 16) * 257;
    return `{${r}, ${g}, ${b}}`;
  };

  // Escape theme name for AppleScript
  const escapedName = themeName.replace(/"/g, '\\"');

  // Step 1: Create the profile and set as default
  const createProfileScript = `
    tell application "Terminal"
      if not (exists settings set "${escapedName}") then
        make new settings set with properties {name:"${escapedName}"}
      end if

      set targetSettings to settings set "${escapedName}"
      set background color of targetSettings to ${hexToRGB(colors.background)}
      set normal text color of targetSettings to ${hexToRGB(colors.foreground)}
      set cursor color of targetSettings to ${hexToRGB(colors.cursor)}

      -- Set as default and startup profile
      set default settings to targetSettings
      set startup settings to targetSettings
    end tell
  `;

  try {
    // Create the profile first
    await execAsync(`osascript -e '${createProfileScript.replace(/'/g, "'\"'\"'")}'`);
    console.log('Profile created successfully');

    // Step 2: Try to apply to open windows (separate try/catch so profile creation is not affected)
    let appliedToWindows = false;
    try {
      const applyScript = `
        tell application "Terminal"
          set targetSettings to settings set "${escapedName}"
          if (count of windows) > 0 then
            repeat with w in windows
              try
                set current settings of selected tab of w to targetSettings
              end try
            end repeat
          end if
        end tell
      `;
      await execAsync(`osascript -e '${applyScript.replace(/'/g, "'\"'\"'")}'`);
      appliedToWindows = true;
    } catch (applyErr) {
      console.log('Could not apply to open windows (this is ok):', applyErr);
    }

    if (appliedToWindows) {
      return {
        success: true,
        path: '',
        instructions: `Theme "${themeName}" applied! Profile saved in Terminal → Settings → Profiles.`,
      };
    } else {
      return {
        success: true,
        path: '',
        instructions: `Theme "${themeName}" saved to Terminal profiles. Select it in Terminal → Settings → Profiles, or close and reopen Terminal windows.`,
      };
    }
  } catch (err) {
    console.error('Terminal.app AppleScript error:', err);
    return {
      success: false,
      path: '',
      error: `Failed to create Terminal profile. Make sure Terminal.app is running.`,
    };
  }
}

// Set theme as default in Terminal.app
export async function setTerminalDefault(themeId: string): Promise<InstallResult> {
  const colors = getThemeColors(themeId);
  const themeName = getThemeName(themeId);

  if (!colors) {
    return { success: false, path: '', error: 'Theme not found' };
  }

  const hexToRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) * 257;
    const g = parseInt(hex.slice(3, 5), 16) * 257;
    const b = parseInt(hex.slice(5, 7), 16) * 257;
    return `{${r}, ${g}, ${b}}`;
  };

  const escapedName = themeName.replace(/"/g, '\\"');

  const appleScript = `
    tell application "Terminal"
      -- Create or update the profile (settings set)
      if not (exists settings set "${escapedName}") then
        set newSettings to make new settings set with properties {name:"${escapedName}"}
      end if

      tell settings set "${escapedName}"
        set background color to ${hexToRGB(colors.background)}
        set normal text color to ${hexToRGB(colors.foreground)}
        set cursor color to ${hexToRGB(colors.cursor)}
      end tell

      -- Set as default profile
      set default settings to settings set "${escapedName}"

      -- Also set startup settings (for new windows)
      set startup settings to settings set "${escapedName}"
    end tell
  `;

  try {
    await execAsync(`osascript -e '${appleScript.replace(/'/g, "'\"'\"'")}'`);

    return {
      success: true,
      path: '',
      instructions: `Theme "${themeName}" is now the default Terminal.app profile! New windows will use this theme.`,
    };
  } catch (err) {
    return {
      success: false,
      path: '',
      error: `Failed to set default: ${err}`,
    };
  }
}
