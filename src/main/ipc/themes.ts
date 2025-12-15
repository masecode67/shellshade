import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/connection';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import type { Theme, ThemeSummary, ThemeColors, ThemeSettings, AnsiColors } from '../../shared/types/theme';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function colorsToRows(themeId: string, colors: ThemeColors): Array<{ theme_id: string; color_key: string; hex_value: string }> {
  const rows: Array<{ theme_id: string; color_key: string; hex_value: string }> = [];

  // Core colors
  rows.push({ theme_id: themeId, color_key: 'background', hex_value: colors.background });
  rows.push({ theme_id: themeId, color_key: 'foreground', hex_value: colors.foreground });
  rows.push({ theme_id: themeId, color_key: 'cursor', hex_value: colors.cursor });
  rows.push({ theme_id: themeId, color_key: 'cursorText', hex_value: colors.cursorText });
  rows.push({ theme_id: themeId, color_key: 'selection', hex_value: colors.selection });
  rows.push({ theme_id: themeId, color_key: 'selectionText', hex_value: colors.selectionText });

  // ANSI colors
  const ansiKeys: (keyof AnsiColors)[] = [
    'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
    'brightBlack', 'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite'
  ];

  for (const key of ansiKeys) {
    rows.push({ theme_id: themeId, color_key: `ansi_${key}`, hex_value: colors.ansi[key] });
  }

  // Optional colors
  if (colors.link) rows.push({ theme_id: themeId, color_key: 'link', hex_value: colors.link });
  if (colors.badge) rows.push({ theme_id: themeId, color_key: 'badge', hex_value: colors.badge });
  if (colors.tab) rows.push({ theme_id: themeId, color_key: 'tab', hex_value: colors.tab });

  return rows;
}

function rowsToColors(rows: Array<{ color_key: string; hex_value: string }>): ThemeColors {
  const colorMap = new Map(rows.map(r => [r.color_key, r.hex_value]));

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
    link: colorMap.get('link'),
    badge: colorMap.get('badge'),
    tab: colorMap.get('tab'),
  };
}

function rowsToSettings(rows: Array<{ setting_key: string; setting_value: string }>): ThemeSettings {
  const settingsMap = new Map(rows.map(r => [r.setting_key, r.setting_value]));

  return {
    fontFamily: settingsMap.get('fontFamily'),
    fontSize: settingsMap.get('fontSize') ? parseInt(settingsMap.get('fontSize')!, 10) : undefined,
    lineHeight: settingsMap.get('lineHeight') ? parseFloat(settingsMap.get('lineHeight')!) : undefined,
    cursorStyle: settingsMap.get('cursorStyle') as 'block' | 'beam' | 'underline' | undefined,
    cursorBlink: settingsMap.get('cursorBlink') === 'true',
  };
}

export function registerThemeHandlers(): void {
  const db = getDatabase();

  // Get all themes (summaries) - dark themes first, then light themes
  ipcMain.handle(IPC_CHANNELS.THEMES_GET_ALL, async (): Promise<ThemeSummary[]> => {
    const themes = db.prepare(`
      SELECT id, name, slug, author, is_favorite, is_builtin, updated_at,
        CASE
          WHEN name LIKE '%Light%' OR name LIKE '%Latte%' OR name LIKE '%Dawn%' THEN 1
          ELSE 0
        END as is_light
      FROM themes
      ORDER BY is_light ASC, name ASC
    `).all() as Array<{
      id: string;
      name: string;
      slug: string;
      author: string | null;
      is_favorite: number;
      is_builtin: number;
      updated_at: number;
    }>;

    return themes.map(theme => {
      const colors = db.prepare(`
        SELECT color_key, hex_value FROM theme_colors WHERE theme_id = ?
      `).all(theme.id) as Array<{ color_key: string; hex_value: string }>;

      const colorMap = new Map(colors.map(c => [c.color_key, c.hex_value]));

      const tags = db.prepare(`
        SELECT t.name FROM tags t
        JOIN theme_tags tt ON t.id = tt.tag_id
        WHERE tt.theme_id = ?
      `).all(theme.id) as Array<{ name: string }>;

      return {
        id: theme.id,
        name: theme.name,
        slug: theme.slug,
        author: theme.author || undefined,
        isFavorite: theme.is_favorite === 1,
        isBuiltin: theme.is_builtin === 1,
        updatedAt: new Date(theme.updated_at),
        previewColors: {
          background: colorMap.get('background') || '#000000',
          foreground: colorMap.get('foreground') || '#ffffff',
          ansiColors: [
            colorMap.get('ansi_black') || '#000000',
            colorMap.get('ansi_red') || '#ff0000',
            colorMap.get('ansi_green') || '#00ff00',
            colorMap.get('ansi_yellow') || '#ffff00',
            colorMap.get('ansi_blue') || '#0000ff',
            colorMap.get('ansi_magenta') || '#ff00ff',
            colorMap.get('ansi_cyan') || '#00ffff',
            colorMap.get('ansi_white') || '#ffffff',
          ],
        },
        tags: tags.map(t => t.name),
      };
    });
  });

  // Get theme by ID
  ipcMain.handle(IPC_CHANNELS.THEMES_GET_BY_ID, async (_, id: string): Promise<Theme | null> => {
    const theme = db.prepare(`
      SELECT * FROM themes WHERE id = ?
    `).get(id) as {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      author: string | null;
      source_url: string | null;
      source_format: string | null;
      created_at: number;
      updated_at: number;
      is_favorite: number;
      is_builtin: number;
    } | undefined;

    if (!theme) return null;

    const colors = db.prepare(`
      SELECT color_key, hex_value FROM theme_colors WHERE theme_id = ?
    `).all(id) as Array<{ color_key: string; hex_value: string }>;

    const settings = db.prepare(`
      SELECT setting_key, setting_value FROM theme_settings WHERE theme_id = ?
    `).all(id) as Array<{ setting_key: string; setting_value: string }>;

    const tags = db.prepare(`
      SELECT t.name FROM tags t
      JOIN theme_tags tt ON t.id = tt.tag_id
      WHERE tt.theme_id = ?
    `).all(id) as Array<{ name: string }>;

    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      description: theme.description || undefined,
      author: theme.author || undefined,
      sourceUrl: theme.source_url || undefined,
      sourceFormat: theme.source_format as Theme['sourceFormat'],
      createdAt: new Date(theme.created_at),
      updatedAt: new Date(theme.updated_at),
      isFavorite: theme.is_favorite === 1,
      isBuiltin: theme.is_builtin === 1,
      colors: rowsToColors(colors),
      settings: rowsToSettings(settings),
      tags: tags.map(t => t.name),
    };
  });

  // Create theme
  ipcMain.handle(IPC_CHANNELS.THEMES_CREATE, async (_, themeData: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Promise<Theme> => {
    const id = uuidv4();
    const now = Date.now();
    const slug = slugify(themeData.name);

    const insertTheme = db.prepare(`
      INSERT INTO themes (id, name, slug, description, author, source_url, source_format, created_at, updated_at, is_favorite, is_builtin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertColor = db.prepare(`
      INSERT INTO theme_colors (theme_id, color_key, hex_value) VALUES (?, ?, ?)
    `);

    const insertSetting = db.prepare(`
      INSERT INTO theme_settings (theme_id, setting_key, setting_value) VALUES (?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertTheme.run(
        id,
        themeData.name,
        slug,
        themeData.description || null,
        themeData.author || null,
        themeData.sourceUrl || null,
        themeData.sourceFormat || null,
        now,
        now,
        themeData.isFavorite ? 1 : 0,
        themeData.isBuiltin ? 1 : 0
      );

      const colorRows = colorsToRows(id, themeData.colors);
      for (const row of colorRows) {
        insertColor.run(row.theme_id, row.color_key, row.hex_value);
      }

      const settings = themeData.settings;
      if (settings.fontFamily) insertSetting.run(id, 'fontFamily', settings.fontFamily);
      if (settings.fontSize) insertSetting.run(id, 'fontSize', settings.fontSize.toString());
      if (settings.lineHeight) insertSetting.run(id, 'lineHeight', settings.lineHeight.toString());
      if (settings.cursorStyle) insertSetting.run(id, 'cursorStyle', settings.cursorStyle);
      if (settings.cursorBlink !== undefined) insertSetting.run(id, 'cursorBlink', settings.cursorBlink.toString());
    });

    transaction();

    return {
      id,
      ...themeData,
      slug,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  });

  // Update theme
  ipcMain.handle(IPC_CHANNELS.THEMES_UPDATE, async (_, id: string, updates: Partial<Theme>): Promise<Theme> => {
    const now = Date.now();

    const transaction = db.transaction(() => {
      if (updates.name || updates.description !== undefined || updates.author !== undefined) {
        const fields: string[] = ['updated_at = ?'];
        const values: (string | number | null)[] = [now];

        if (updates.name) {
          fields.push('name = ?', 'slug = ?');
          values.push(updates.name, slugify(updates.name));
        }
        if (updates.description !== undefined) {
          fields.push('description = ?');
          values.push(updates.description || null);
        }
        if (updates.author !== undefined) {
          fields.push('author = ?');
          values.push(updates.author || null);
        }

        values.push(id);
        db.prepare(`UPDATE themes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
      }

      if (updates.colors) {
        db.prepare('DELETE FROM theme_colors WHERE theme_id = ?').run(id);
        const insertColor = db.prepare('INSERT INTO theme_colors (theme_id, color_key, hex_value) VALUES (?, ?, ?)');
        const colorRows = colorsToRows(id, updates.colors);
        for (const row of colorRows) {
          insertColor.run(row.theme_id, row.color_key, row.hex_value);
        }
      }

      if (updates.settings) {
        db.prepare('DELETE FROM theme_settings WHERE theme_id = ?').run(id);
        const insertSetting = db.prepare('INSERT INTO theme_settings (theme_id, setting_key, setting_value) VALUES (?, ?, ?)');
        const settings = updates.settings;
        if (settings.fontFamily) insertSetting.run(id, 'fontFamily', settings.fontFamily);
        if (settings.fontSize) insertSetting.run(id, 'fontSize', settings.fontSize.toString());
        if (settings.lineHeight) insertSetting.run(id, 'lineHeight', settings.lineHeight.toString());
        if (settings.cursorStyle) insertSetting.run(id, 'cursorStyle', settings.cursorStyle);
        if (settings.cursorBlink !== undefined) insertSetting.run(id, 'cursorBlink', settings.cursorBlink.toString());
      }

      db.prepare('UPDATE themes SET updated_at = ? WHERE id = ?').run(now, id);
    });

    transaction();

    // Return updated theme
    const result = await ipcMain.emit(IPC_CHANNELS.THEMES_GET_BY_ID, null, id);
    return result as unknown as Theme;
  });

  // Delete theme
  ipcMain.handle(IPC_CHANNELS.THEMES_DELETE, async (_, id: string): Promise<void> => {
    db.prepare('DELETE FROM themes WHERE id = ?').run(id);
  });

  // Toggle favorite
  ipcMain.handle(IPC_CHANNELS.THEMES_TOGGLE_FAVORITE, async (_, id: string): Promise<boolean> => {
    const theme = db.prepare('SELECT is_favorite FROM themes WHERE id = ?').get(id) as { is_favorite: number } | undefined;
    if (!theme) throw new Error('Theme not found');

    const newValue = theme.is_favorite === 1 ? 0 : 1;
    db.prepare('UPDATE themes SET is_favorite = ?, updated_at = ? WHERE id = ?').run(newValue, Date.now(), id);

    return newValue === 1;
  });

  // Duplicate theme
  ipcMain.handle(IPC_CHANNELS.THEMES_DUPLICATE, async (_, id: string, newName: string): Promise<Theme> => {
    const original = db.prepare('SELECT * FROM themes WHERE id = ?').get(id) as any;
    if (!original) throw new Error('Theme not found');

    const colors = db.prepare('SELECT color_key, hex_value FROM theme_colors WHERE theme_id = ?').all(id);
    const settings = db.prepare('SELECT setting_key, setting_value FROM theme_settings WHERE theme_id = ?').all(id);

    const newId = uuidv4();
    const now = Date.now();
    const newSlug = slugify(newName);

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO themes (id, name, slug, description, author, source_url, source_format, created_at, updated_at, is_favorite, is_builtin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
      `).run(newId, newName, newSlug, original.description, original.author, original.source_url, original.source_format, now, now);

      const insertColor = db.prepare('INSERT INTO theme_colors (theme_id, color_key, hex_value) VALUES (?, ?, ?)');
      for (const color of colors as Array<{ color_key: string; hex_value: string }>) {
        insertColor.run(newId, color.color_key, color.hex_value);
      }

      const insertSetting = db.prepare('INSERT INTO theme_settings (theme_id, setting_key, setting_value) VALUES (?, ?, ?)');
      for (const setting of settings as Array<{ setting_key: string; setting_value: string }>) {
        insertSetting.run(newId, setting.setting_key, setting.setting_value);
      }
    });

    transaction();

    return {
      id: newId,
      name: newName,
      slug: newSlug,
      description: original.description || undefined,
      author: original.author || undefined,
      sourceUrl: original.source_url || undefined,
      sourceFormat: original.source_format || undefined,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      isFavorite: false,
      isBuiltin: false,
      colors: rowsToColors(colors as Array<{ color_key: string; hex_value: string }>),
      settings: rowsToSettings(settings as Array<{ setting_key: string; setting_value: string }>),
      tags: [],
    };
  });
}
