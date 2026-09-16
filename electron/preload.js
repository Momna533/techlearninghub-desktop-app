const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  getFoundationStatus: () => ipcRenderer.invoke('foundation:get-status'),
  testElectronIpc: () => ipcRenderer.invoke('electron:test-ipc')
});
