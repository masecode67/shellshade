/**
 * Theme format identifiers for import/export
 */
export type ThemeFormat =
  | 'terminal' // macOS Terminal.app
  | 'iterm2' // iTerm2 .itermcolors
  | 'iterm2-json' // iTerm2 JSON profile
  | 'alacritty' // Alacritty YAML
  | 'kitty' // Kitty conf
  | 'base16' // Base16 YAML
  | 'warp' // Warp YAML
  | 'json' // Universal JSON
  | 'css'; // CSS variables

/**
 * ANSI color palette (16 colors)
 */
export interface AnsiColors {
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

/**
 * Complete theme color configuration
 */
export interface ThemeColors {
  // Core colors
  background: string;
  foreground: string;
  cursor: string;
  cursorText: string;
  selection: string;
  selectionText: string;

  // ANSI 16 colors
  ansi: AnsiColors;

  // Extended (optional, iTerm2-specific)
  link?: string;
  badge?: string;
  tab?: string;
}

/**
 * Theme settings (font, cursor, etc.)
 */
export interface ThemeSettings {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  cursorStyle?: 'block' | 'beam' | 'underline';
  cursorBlink?: boolean;
}

/**
 * Full theme representation
 */
export interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  author?: string;
  sourceUrl?: string;
  sourceFormat?: ThemeFormat;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  isBuiltin: boolean;
  colors: ThemeColors;
  settings: ThemeSettings;
  tags: string[];
}

/**
 * Summary for list views (without full color data)
 */
export interface ThemeSummary {
  id: string;
  name: string;
  slug: string;
  author?: string;
  isFavorite: boolean;
  isBuiltin: boolean;
  updatedAt: Date;
  // Preview colors for thumbnails
  previewColors: {
    background: string;
    foreground: string;
    ansiColors: string[]; // First 8 ANSI colors for preview
  };
  tags: string[];
}

/**
 * Tag for organizing themes
 */
export interface Tag {
  id: number;
  name: string;
  color?: string;
}

/**
 * Default theme colors (Dracula-inspired)
 */
export const DEFAULT_THEME_COLORS: ThemeColors = {
  background: '#282a36',
  foreground: '#f8f8f2',
  cursor: '#f8f8f2',
  cursorText: '#282a36',
  selection: '#44475a',
  selectionText: '#f8f8f2',
  ansi: {
    black: '#21222c',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
    brightBlack: '#6272a4',
    brightRed: '#ff6e6e',
    brightGreen: '#69ff94',
    brightYellow: '#ffffa5',
    brightBlue: '#d6acff',
    brightMagenta: '#ff92df',
    brightCyan: '#a4ffff',
    brightWhite: '#ffffff',
  },
};

/**
 * Default theme settings
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  fontFamily: 'SF Mono',
  fontSize: 13,
  lineHeight: 1.2,
  cursorStyle: 'block',
  cursorBlink: true,
};
