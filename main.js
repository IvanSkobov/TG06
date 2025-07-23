const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.png'), // используйте icon.ico, если скачаете .ico
    title: 'Калькулятор ставок',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
