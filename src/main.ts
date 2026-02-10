import { app, BrowserWindow, protocol, net } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import url from 'url'
import 'dotenv/config'
import { configManager } from './config'
import { createMenu, updateMenu } from './menu'
import { setupIPC } from './ipc'

// 处理 Windows 安装/卸载时创建/移除快捷方式
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async () => {
  // 初始化配置
  await configManager.load()

  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'VChat',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 创建应用菜单
  createMenu(mainWindow)

  // 设置 IPC 通信处理
  setupIPC(mainWindow)

  protocol.handle('safe-file', async (request) => {
    console.log(request.url)
    const filePath = decodeURIComponent(request.url.slice('safe-file://'.length))
    console.log(filePath)
    const newFilePath = url.pathToFileURL(filePath).toString()
    console.log(newFilePath)
    return net.fetch(newFilePath)
  })

  // 加载应用的 index.html
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // 在开发环境下打开开发者工具
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

// 当 Electron 完成初始化并准备好创建浏览器窗口时调用此方法。
// 某些 API 只能在此事件发生后使用。
app.on('ready', createWindow);

// 当所有窗口关闭时退出应用，macOS 除外。
// 在 macOS 上，应用和菜单栏通常会保持活动状态，
// 直到用户使用 Cmd + Q 显式退出。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上，当点击 Dock 图标且没有其他窗口打开时，
  // 通常会重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 你可以在此文件中包含应用主进程的其他代码。
// 也可以将它们放在单独的文件中并在此处导入。
