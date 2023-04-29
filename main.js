const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
const path = require("path");
require("update-electron-app")();

const remoteMain = require("@electron/remote/main");
remoteMain.initialize();

if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

try {
  require("electron-reloader")();
} catch (_) {}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  remoteMain.enable(mainWindow.webContents);

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("getSources", async () => {
  return await desktopCapturer.getSources({ types: ["window", "screen"] });
});
