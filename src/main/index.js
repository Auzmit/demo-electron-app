import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import XLSX, { utils } from "xlsx";
import db, { createTable } from './db.js';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')
  
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  
  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  
  ipcMain.on('importTable', async () => {
    const { filePaths } = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
    filePaths.forEach(async (filepath) => {
      const [tableName, extension] = path.basename(filepath).split('.');
      if (extension !== 'xlsx') return;
      const res = await XLSX.readFile(filepath);
      const ws = res.Sheets[res.SheetNames[0]];
      const data = utils.sheet_to_json(ws);
      createTable(tableName, data);
    })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close()
    app.quit()
  }
})
