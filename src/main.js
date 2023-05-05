const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
const path = require("path");

const remoteMain = require("@electron/remote/main");
remoteMain.initialize();

if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
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
