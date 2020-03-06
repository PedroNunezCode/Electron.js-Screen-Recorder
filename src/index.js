const { app, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// This function is triggered by the ready event listener below it, It created a new browser window
// and sets some very basic preferences! feel free to change these and take a look at the full
// preferences lists: https://www.electronjs.org/docs/api/web-contents
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    // Allow nodejs global variables in the frontend
    webPreferences: {
      nodeIntegration: true,
    },
    // You can uncomment these and comment the options below to set a static height on startup!
    height: 1000,
    width: 2000,
  });

  //Set the window to max size, You can also set it to full screen, or simply choose the height and width attributes above.
  // mainWindow.maximize();
  // mainWindow.setFullScreen(true);
  // Load file containing the frontend interface.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Open devtools on browser to check the console.
  mainWindow.webContents.openDevTools();
};

// Create a new window upon ready event being fired.
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // You can check what platform a user is on with the variable "platform"
  // Different OS can have different behavior.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});