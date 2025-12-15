import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import { installToIterm2, installToTerminalApp, setTerminalDefault } from '../services/installer';
import type { InstallResult, InstalledTheme } from '../../shared/types/ipc';

export function registerInstallHandlers(): void {
  // Install to Terminal.app
  ipcMain.handle(IPC_CHANNELS.INSTALL_TERMINAL_APP, async (_, themeId: string): Promise<InstallResult> => {
    return installToTerminalApp(themeId);
  });

  // Install to iTerm2
  ipcMain.handle(IPC_CHANNELS.INSTALL_ITERM2, async (_, themeId: string): Promise<InstallResult> => {
    return installToIterm2(themeId);
  });

  // Set as default Terminal.app profile
  ipcMain.handle('install:set-terminal-default', async (_, themeId: string): Promise<InstallResult> => {
    return setTerminalDefault(themeId);
  });

  // Detect installed themes (placeholder)
  ipcMain.handle(IPC_CHANNELS.INSTALL_DETECT, async (): Promise<InstalledTheme[]> => {
    // TODO: Scan for installed themes in various locations
    return [];
  });
}
