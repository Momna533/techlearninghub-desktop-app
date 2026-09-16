const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { createHttpApp } = require('../src/infrastructure/http/app');
const { getFoundationStatus } = require('../src/application/services/foundation.service');
const { closeDatabase, initializeDatabase } = require('../src/infrastructure/database/connection');
const { registerFoundationIpc } = require('./ipc/foundation.ipc');

const isDevelopment = Boolean(process.env.ELECTRON_RENDERER_URL);

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (isDevelopment) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    window.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  }
}

app.whenReady().then(() => {
  try {
    initializeDatabase({
      databasePath: path.join(app.getPath('userData'), 'techlearninghub.sqlite')
    });
  } catch (error) {
    console.error('Failed to initialize the local SQLite database.', error);
    app.quit();
    return;
  }

  createHttpApp();
  registerFoundationIpc({ ipcMain, getFoundationStatus });
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('before-quit', closeDatabase);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
