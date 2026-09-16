function registerFoundationIpc({ ipcMain, getFoundationStatus }) {
  ipcMain.handle('foundation:get-status', () => getFoundationStatus());
  ipcMain.handle('electron:test-ipc', () => ({
    message: 'IPC response received from the Electron main process.'
  }));
}

module.exports = { registerFoundationIpc };
