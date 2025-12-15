import type { Theme, ThemeSummary, ThemeFormat, Tag } from './theme';
/**
 * Result of theme installation
 */
export interface InstallResult {
    success: boolean;
    path: string;
    instructions?: string;
    error?: string;
}
/**
 * Information about installed themes
 */
export interface InstalledTheme {
    name: string;
    emulator: 'terminal' | 'iterm2' | 'alacritty' | 'kitty' | 'warp';
    path: string;
}
/**
 * IPC channel names
 */
export declare const IPC_CHANNELS: {
    readonly THEMES_GET_ALL: "themes:getAll";
    readonly THEMES_GET_BY_ID: "themes:getById";
    readonly THEMES_CREATE: "themes:create";
    readonly THEMES_UPDATE: "themes:update";
    readonly THEMES_DELETE: "themes:delete";
    readonly THEMES_DUPLICATE: "themes:duplicate";
    readonly THEMES_TOGGLE_FAVORITE: "themes:toggleFavorite";
    readonly FILES_IMPORT: "files:import";
    readonly FILES_EXPORT: "files:export";
    readonly FILES_DRAG_IMPORT: "files:dragImport";
    readonly INSTALL_TERMINAL_APP: "install:terminalApp";
    readonly INSTALL_ITERM2: "install:iterm2";
    readonly INSTALL_DETECT: "install:detect";
    readonly TAGS_GET_ALL: "tags:getAll";
    readonly TAGS_CREATE: "tags:create";
    readonly TAGS_DELETE: "tags:delete";
    readonly TAGS_ADD_TO_THEME: "tags:addToTheme";
    readonly TAGS_REMOVE_FROM_THEME: "tags:removeFromTheme";
    readonly SYSTEM_GET_FONTS: "system:getFonts";
    readonly SYSTEM_OPEN_IN_FINDER: "system:openInFinder";
    readonly SYSTEM_GET_VERSION: "system:getVersion";
};
/**
 * Type-safe IPC API exposed to renderer
 */
export interface IpcApi {
    themes: {
        getAll(): Promise<ThemeSummary[]>;
        getById(id: string): Promise<Theme | null>;
        create(theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Promise<Theme>;
        update(id: string, updates: Partial<Theme>): Promise<Theme>;
        delete(id: string): Promise<void>;
        duplicate(id: string, newName: string): Promise<Theme>;
        toggleFavorite(id: string): Promise<boolean>;
    };
    files: {
        import(path?: string): Promise<Theme>;
        export(themeId: string, format: ThemeFormat, path?: string): Promise<string>;
        dragImport(filePath: string): Promise<Theme>;
    };
    install: {
        toTerminalApp(themeId: string): Promise<InstallResult>;
        toIterm2(themeId: string): Promise<InstallResult>;
        detectInstalled(): Promise<InstalledTheme[]>;
    };
    tags: {
        getAll(): Promise<Tag[]>;
        create(name: string, color?: string): Promise<Tag>;
        delete(id: number): Promise<void>;
        addToTheme(themeId: string, tagId: number): Promise<void>;
        removeFromTheme(themeId: string, tagId: number): Promise<void>;
    };
    system: {
        getFonts(): Promise<string[]>;
        openInFinder(path: string): Promise<void>;
        getVersion(): Promise<string>;
    };
}
//# sourceMappingURL=ipc.d.ts.map