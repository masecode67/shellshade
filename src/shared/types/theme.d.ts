/**
 * Theme format identifiers for import/export
 */
export type ThemeFormat = 'terminal' | 'iterm2' | 'iterm2-json' | 'alacritty' | 'kitty' | 'base16' | 'warp' | 'json' | 'css';
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
    background: string;
    foreground: string;
    cursor: string;
    cursorText: string;
    selection: string;
    selectionText: string;
    ansi: AnsiColors;
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
    previewColors: {
        background: string;
        foreground: string;
        ansiColors: string[];
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
export declare const DEFAULT_THEME_COLORS: ThemeColors;
/**
 * Default theme settings
 */
export declare const DEFAULT_THEME_SETTINGS: ThemeSettings;
//# sourceMappingURL=theme.d.ts.map