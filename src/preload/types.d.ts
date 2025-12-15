import type { IpcApi } from '../shared/types/ipc';

/**
 * Type declaration for the global window.api object
 * This makes the preload API available to TypeScript in the renderer process
 */
declare global {
  interface Window {
    api: IpcApi;
  }
}

export {};
