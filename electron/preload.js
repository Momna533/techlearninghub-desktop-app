const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  getFoundationStatus: () => ipcRenderer.invoke('foundation:get-status'),

  testElectronIpc: () => ipcRenderer.invoke('electron:test-ipc'),

  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),

    getSession: () => ipcRenderer.invoke('auth:get-session'),

    logout: () => ipcRenderer.invoke('auth:logout'),
  },
});