const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { createHttpApp } = require("../src/infrastructure/http/app");
const {
  getFoundationStatus,
} = require("../src/application/services/foundation.service");
const {
  closeDatabase,
  initializeDatabase,
} = require("../src/infrastructure/database/connection");
const {
  bootstrapAuthorization,
} = require("../src/application/services/rbac-bootstrap.service");
const { registerFoundationIpc } = require("./ipc/foundation.ipc");
const { registerAuthIpc } = require("./ipc/auth.ipc");
const { registerRbacIpc } = require("./ipc/rbac.ipc");
const { registerStudentIpc } = require("./ipc/student.ipc");
const { registerCoursesIpc } = require("./ipc/courses.ipc");
const { registerBatchesIpc } = require("./ipc/batch.ipc");
const { registerEnrollmentsIpc } = require("./ipc/enrollments.ipc");
const { registerAdmissionIpc } = require("./ipc/admission.ipc");
const { registerClientIpc } = require("./ipc/client.ipc");
const { registerTeamIpc } = require("./ipc/team.ipc");
const { registerEmployeeIpc } = require("./ipc/employee.ipc");
const { registerTeamMemberIpc } = require("./ipc/team-member.ipc");
const { registerStudentPaymentIpc } = require("./ipc/student-payment.ipc");
const { registerProjectIpc } = require("./ipc/projects.ipc");
const { registerProjectMemberIpc } = require("./ipc/project-member.ipc");

const { runShellSmoke } = require("./smoke-shell");

const isDevelopment = Boolean(process.env.ELECTRON_RENDERER_URL);
const isShellSmoke = process.env.SHELL_SMOKE === "1";

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: !isShellSmoke,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDevelopment) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    window.loadFile(path.join(__dirname, "../dist/renderer/index.html"));
  }

  if (isShellSmoke) {
    window.webContents.once("did-finish-load", async () => {
      try {
        await runShellSmoke(window);
        app.exit(0);
      } catch (error) {
        console.error("[shell-smoke] Smoke run failed.", error);
        app.exit(1);
      }
    });
  }

  return window;
}

app.whenReady().then(async () => {
  try {
    initializeDatabase({
      databasePath: path.join(
        app.getPath("userData"),
        "techlearninghub.sqlite",
      ),
    });
    await bootstrapAuthorization();
  } catch (error) {
    console.error("Failed to initialize the local SQLite database.", error);
    app.quit();
    return;
  }

  createHttpApp();
  registerFoundationIpc({ ipcMain, getFoundationStatus });
  registerAuthIpc({ ipcMain });
  registerRbacIpc({ ipcMain });
  registerStudentIpc({ ipcMain });
  registerCoursesIpc({ ipcMain });
  registerBatchesIpc({ ipcMain });
  registerEnrollmentsIpc({ ipcMain });
  registerAdmissionIpc({ ipcMain });
  registerClientIpc({ ipcMain });
  registerTeamIpc({ ipcMain });
  registerEmployeeIpc({ ipcMain });
  registerTeamMemberIpc({ ipcMain });
  registerStudentPaymentIpc({ ipcMain });
  registerProjectIpc({ ipcMain });
  registerProjectMemberIpc({ ipcMain });

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("before-quit", closeDatabase);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
