"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_CHANNELS = void 0;
/**
 * IPC channel names
 */
exports.IPC_CHANNELS = {
    // Theme operations
    THEMES_GET_ALL: 'themes:getAll',
    THEMES_GET_BY_ID: 'themes:getById',
    THEMES_CREATE: 'themes:create',
    THEMES_UPDATE: 'themes:update',
    THEMES_DELETE: 'themes:delete',
    THEMES_DUPLICATE: 'themes:duplicate',
    THEMES_TOGGLE_FAVORITE: 'themes:toggleFavorite',
    // File operations
    FILES_IMPORT: 'files:import',
    FILES_EXPORT: 'files:export',
    FILES_DRAG_IMPORT: 'files:dragImport',
    // Installation
    INSTALL_TERMINAL_APP: 'install:terminalApp',
    INSTALL_ITERM2: 'install:iterm2',
    INSTALL_DETECT: 'install:detect',
    // Tags
    TAGS_GET_ALL: 'tags:getAll',
    TAGS_CREATE: 'tags:create',
    TAGS_DELETE: 'tags:delete',
    TAGS_ADD_TO_THEME: 'tags:addToTheme',
    TAGS_REMOVE_FROM_THEME: 'tags:removeFromTheme',
    // System
    SYSTEM_GET_FONTS: 'system:getFonts',
    SYSTEM_OPEN_IN_FINDER: 'system:openInFinder',
    SYSTEM_GET_VERSION: 'system:getVersion',
};
//# sourceMappingURL=ipc.js.map