import { ipcMain, BrowserWindow, app, net } from 'electron'
import { CreateChatProps } from './types'
import { createProvider } from './providers/createProvider'
import { configManager } from './config'
import { createContextMenu, updateMenu } from './menu'
import fs from 'fs/promises'
import path from 'path'
import url from 'url'

export function setupIPC(mainWindow: BrowserWindow) {
  // 右键菜单处理
  ipcMain.on('show-context-menu', (event, id) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    createContextMenu(win, id)
  })

  // 聊天处理
  const abortControllers = new Map<number, AbortController>()

  ipcMain.on('stop-chat', (event, messageId?: number) => {
    if (messageId) {
      const controller = abortControllers.get(messageId)
      if (controller) {
        controller.abort()
        abortControllers.delete(messageId)
      }
    } else {
      // 如果没有传递 ID，中止所有正在进行的对话
      for (const [id, controller] of abortControllers.entries()) {
        controller.abort()
      }
      abortControllers.clear()
    }
  })

  ipcMain.on('start-chat', async (event, data: CreateChatProps) => {
    console.log('开始对话:', data)
    const { providerName, messages, messageId, selectedModel } = data
    
    const controller = new AbortController()
    abortControllers.set(messageId, controller)

    try {
      const provider = createProvider(providerName)
      const stream = await provider.chat(messages, selectedModel, controller.signal)
      
      for await (const chunk of stream) {
        // 检查是否已被中止
        if (!abortControllers.has(messageId)) break
        
        const content = {
          messageId,
          data: chunk
        }
        mainWindow.webContents.send('update-message', content)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`对话 ${messageId} 已中止`)
        return
      }
      console.error('聊天错误:', error)
      const errorContent = {
        messageId,
        data: {
          is_end: true,
          result: error instanceof Error ? error.message : '与AI服务通信时发生错误',
          is_error: true
        }
      }
      mainWindow.webContents.send('update-message', errorContent)
    } finally {
      abortControllers.delete(messageId)
    }
  })

  // 配置处理
  ipcMain.handle('get-config', () => {
    return configManager.get()
  })

  ipcMain.handle('update-config', async (event, newConfig) => {
    const updatedConfig = await configManager.update(newConfig)
    // 如果语言发生变化，更新菜单
    if (newConfig.language) {
      updateMenu(mainWindow)
    }
    return updatedConfig
  })

  // 文件处理
  ipcMain.handle('copy-image-to-user-dir', async (event, sourcePath: string) => {
    const userDataPath = app.getPath('userData')
    const imagesDir = path.join(userDataPath, 'images')
    await fs.mkdir(imagesDir, { recursive: true })
    const fileName = path.basename(sourcePath)
    const destPath = path.join(imagesDir, fileName)
    await fs.copyFile(sourcePath, destPath)
    return destPath
  })
}