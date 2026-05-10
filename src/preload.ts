// 关于如何使用预加载脚本，请参阅 Electron 文档：
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { ipcRenderer, contextBridge } from 'electron'
import { CreateChatProps, OnUpdatedCallback, AppConfig } from './types'

contextBridge.exposeInMainWorld('electronAPI', {
  startChat: (data: CreateChatProps) => ipcRenderer.send('start-chat', data),
  onUpdateMessage: (callback: OnUpdatedCallback) => {
    const listener = (_event: any, value: any) => callback(value)
    ipcRenderer.on('update-message', listener)
    return () => ipcRenderer.removeListener('update-message', listener)
  },
  showContextMenu: (id: number) => ipcRenderer.send('show-context-menu', id),
  onDeleteConversation: (callback: (id: number) => void) => {
    const listener = (_event: any, id: number) => callback(id)
    ipcRenderer.on('delete-conversation', listener)
    return () => ipcRenderer.removeListener('delete-conversation', listener)
  },
  copyImageToUserDir: (sourcePath: string) => ipcRenderer.invoke('copy-image-to-user-dir', sourcePath),
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: (config: Partial<AppConfig>) => ipcRenderer.invoke('update-config', config),
  onMenuNewConversation: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('menu-new-conversation', listener)
    return () => ipcRenderer.removeListener('menu-new-conversation', listener)
  },
  onMenuOpenSettings: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('menu-open-settings', listener)
    return () => ipcRenderer.removeListener('menu-open-settings', listener)
  },
  stopChat: (messageId?: number) => ipcRenderer.send('stop-chat', messageId)
})