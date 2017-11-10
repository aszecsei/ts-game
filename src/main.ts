import { app, BrowserWindow } from 'electron';
declare var __dirname: string;
let mainWindow: Electron.BrowserWindow;

function onReady() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    frame: false,
    show: false,
    useContentSize: true,
    backgroundColor: '#000',
    enableLargerThanScreen: true
  });

  const fileName = `file://${__dirname}/index.html`;
  mainWindow.loadURL(fileName);
  // mainWindow.setFullScreen(true);
  mainWindow.on('ready-to-show', () => mainWindow.show());
  mainWindow.on('close', () => app.quit());
}

app.on('ready', () => onReady());
app.on('window-all-closed', () => app.quit());
console.log(`Electron Version ${app.getVersion()}`);
