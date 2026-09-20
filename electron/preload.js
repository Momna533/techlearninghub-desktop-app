const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  getFoundationStatus: () => ipcRenderer.invoke("foundation:get-status"),

  testElectronIpc: () => ipcRenderer.invoke("electron:test-ipc"),

  auth: {
    login: (credentials) => ipcRenderer.invoke("auth:login", credentials),

    signup: (data) => ipcRenderer.invoke("auth:signup", data),

    getSession: () => ipcRenderer.invoke("auth:get-session"),

    logout: () => ipcRenderer.invoke("auth:logout"),
  },

  rbac: {
    listRoles: () => ipcRenderer.invoke("rbac:list-roles"),

    assignRole: (payload) => ipcRenderer.invoke("rbac:assign-role", payload),

    revokeRole: (payload) => ipcRenderer.invoke("rbac:revoke-role", payload),

    demoAdminAction: () => ipcRenderer.invoke("rbac:demo-admin-action"),

    demoHrAction: () => ipcRenderer.invoke("rbac:demo-hr-action"),

    demoFinanceAction: () => ipcRenderer.invoke("rbac:demo-finance-action"),

    checkPermission: (permissionCode) =>
      ipcRenderer.invoke("rbac:check-permission", permissionCode),
  },

  students: {
    list: (filters) => ipcRenderer.invoke("students:list", filters),

    get: (id) => ipcRenderer.invoke("students:get", id),

    create: (student) => ipcRenderer.invoke("students:create", student),

    update: (payload) => ipcRenderer.invoke("students:update", payload),

    deactivate: (id) => ipcRenderer.invoke("students:deactivate", id),
  },
  courses: {
    list: (filters) => ipcRenderer.invoke("courses:list", filters),

    get: (id) => ipcRenderer.invoke("courses:get", id),

    create: (course) => ipcRenderer.invoke("courses:create", course),

    update: (payload) => ipcRenderer.invoke("courses:update", payload),

    deactivate: (id) => ipcRenderer.invoke("courses:deactivate", id),
  },
  batches: {
    list: (filters = {}) => ipcRenderer.invoke("batches:list", filters),

    get: (id) => ipcRenderer.invoke("batches:get", id),

    create: (batch) => ipcRenderer.invoke("batches:create", batch),

    update: (payload) => ipcRenderer.invoke("batches:update", payload),

    courses: () => ipcRenderer.invoke("batches:courses"),

    trainers: () => ipcRenderer.invoke("batches:trainers"),
  },
  enrollments: {
    list: (filters = {}) => ipcRenderer.invoke("enrollments:list", filters),

    get: (id) => ipcRenderer.invoke("enrollments:get", id),

    getByStudent: (studentId) =>
      ipcRenderer.invoke("enrollments:student", studentId),

    getByBatch: (batchId) => ipcRenderer.invoke("enrollments:batch", batchId),

    create: (enrollment) =>
      ipcRenderer.invoke("enrollments:create", enrollment),

    update: (payload) => ipcRenderer.invoke("enrollments:update", payload),

    updateStatus: (payload) =>
      ipcRenderer.invoke("enrollments:status", payload),
  },
  admissions: {
    create: (admission) => ipcRenderer.invoke("admissions:create", admission),
  },
  clients: {
  list: (filters = {}) => ipcRenderer.invoke("clients:list", filters),

  get: (id) => ipcRenderer.invoke("clients:get", id),

  create: (client) => ipcRenderer.invoke("clients:create", client),

  update: (payload) => ipcRenderer.invoke("clients:update", payload),

  deactivate: (id) => ipcRenderer.invoke("clients:deactivate", id),

  archive: (id) => ipcRenderer.invoke("clients:archive", id),
},
teams: {
  list: (filters = {}) => ipcRenderer.invoke("teams:list", filters),

  get: (id) => ipcRenderer.invoke("teams:get", id),

  create: (team) => ipcRenderer.invoke("teams:create", team),

  update: (payload) => ipcRenderer.invoke("teams:update", payload),

  deactivate: (id) => ipcRenderer.invoke("teams:deactivate", id),

  archive: (id) => ipcRenderer.invoke("teams:archive", id),
},
employees: {
  list: (filters = {}) => ipcRenderer.invoke("employees:list", filters),
  get: (id) => ipcRenderer.invoke("employees:get", id),
  create: (employee) => ipcRenderer.invoke("employees:create", employee),
  update: (payload) => ipcRenderer.invoke("employees:update", payload),
  deactivate: (id) => ipcRenderer.invoke("employees:deactivate", id),
},
teamMembers: {
  list: (filters = {}) =>
    ipcRenderer.invoke("team-members:list", filters),

  get: (id) =>
    ipcRenderer.invoke("team-members:get", id),

  create: (member) =>
    ipcRenderer.invoke("team-members:create", member),

  update: (payload) =>
    ipcRenderer.invoke("team-members:update", payload),

  remove: (id) =>
    ipcRenderer.invoke("team-members:remove", id),
},
});
