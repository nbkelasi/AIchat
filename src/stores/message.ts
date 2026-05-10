import { defineStore } from 'pinia'
import { db } from '../db'
import { MessageProps, MessageStatus, UpdatgedStreamData } from '../types'

export interface MessageStore {
  items: MessageProps[]
  messageBuffers: Map<number, string>
}

export const useMessageStore = defineStore('message', {
  state: (): MessageStore => {
    return {
      items: [],
      messageBuffers: new Map()
    }
  },
  actions: {
    initListening() {
      window.electronAPI.onUpdateMessage(async (streamData) => {
        const { messageId, data } = streamData
        
        // 更新缓冲区
        let currentBuffer = this.messageBuffers.get(messageId) || ''
        currentBuffer += data.result
        this.messageBuffers.set(messageId, currentBuffer)

        const getMessageStatus = (data: any): MessageStatus => {
          if (data.is_error) return 'error'
          if (data.is_end) return 'finished' 
          return 'streaming'
        }

        const updatedData = {
          content: currentBuffer,
          status: getMessageStatus(data),
          updatedAt: new Date().toISOString()
        }

        // 持久化到数据库
        await db.messages.update(messageId, updatedData)

        // 如果当前 UI 正在显示这条消息，更新内存中的 items
        const index = this.items.findIndex(item => item.id === messageId)
        if (index !== -1) {
          this.items[index] = { ...this.items[index], ...updatedData }
        }

        // 如果结束，清理缓冲区
        if (data.is_end) {
          this.messageBuffers.delete(messageId)
        }
      })
    },
    async fetchMessagesByConversation(conversationId: number) {
      const items = await db.messages.where({ conversationId }).toArray()
      this.items = items
    },
    async createMessage(createdData: Omit<MessageProps, 'id'>) {
      const newMessageId = await db.messages.add(createdData)
      this.items.push( { id: newMessageId, ...createdData })
      return newMessageId
    },
    async updateMessage(messageId: number, updatedData: Partial<MessageProps>) {
      await db.messages.update(messageId, updatedData)
      const index = this.items.findIndex(item => item.id === messageId)
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...updatedData }
      }
    },
    async deleteMessage(messageId: number) {
      await db.messages.delete(messageId)
      const index = this.items.findIndex(item => item.id === messageId)
      if (index !== -1) {
        this.items.splice(index, 1)
      }
    }
  },
  getters: {
    getLastQuestion: (state) => (conversationId: number) => {
      return state.items.findLast(item => item.conversationId === conversationId && item.type === 'question')
    },
    isMessageLoading: (state) => {
      return state.items.some(item => item.status === 'loading' || item.status === 'streaming')
    }
  }
})