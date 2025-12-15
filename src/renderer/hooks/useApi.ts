import { useEffect, useState } from 'react';
import type { IpcApi } from '../../shared/types/ipc';

/**
 * Hook to access the Electron IPC API with proper typing
 */
export function useApi(): IpcApi | null {
  const [api, setApi] = useState<IpcApi | null>(null);

  useEffect(() => {
    // Access the window.api object injected by preload script
    if (window.api) {
      setApi(window.api);
    } else {
      console.warn('window.api is not available. Make sure preload script is configured.');
    }
  }, []);

  return api;
}

/**
 * Typed window interface for TypeScript
 */
declare global {
  interface Window {
    api: IpcApi;
  }
}
