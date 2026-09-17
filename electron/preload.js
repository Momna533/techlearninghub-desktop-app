const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  getFoundationStatus: () => ipcRenderer.invoke('foundation:get-status'),

  testElectronIpc: () => ipcRenderer.invoke('electron:test-ipc'),

  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),

    getSession: () => ipcRenderer.invoke('auth:get-session'),

    logout: () => ipcRenderer.invoke('auth:logout'),
  },

  rbac: {
    listRoles: () => ipcRenderer.invoke('rbac:list-roles'),

    assignRole: (payload) => ipcRenderer.invoke('rbac:assign-role', payload),

    revokeRole: (payload) => ipcRenderer.invoke('rbac:revoke-role', payload),

    demoAdminAction: () => ipcRenderer.invoke('rbac:demo-admin-action'),

    demoHrAction: () => ipcRenderer.invoke('rbac:demo-hr-action'),

    demoFinanceAction: () => ipcRenderer.invoke('rbac:demo-finance-action'),

    checkPermission: (permissionCode) => (
      ipcRenderer.invoke('rbac:check-permission', permissionCode)
    ),
  },
});
