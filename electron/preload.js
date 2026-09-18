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

  students: {
  list: (filters) => ipcRenderer.invoke('students:list', filters),

  get: (id) => ipcRenderer.invoke('students:get', id),

  create: (student) => ipcRenderer.invoke('students:create', student),

  update: (payload) => ipcRenderer.invoke('students:update', payload),

  deactivate: (id) => ipcRenderer.invoke('students:deactivate', id),
},
});
