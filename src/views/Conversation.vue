<template>
  <div class="flex flex-col h-full bg-background" v-if="conversation">
    <!-- Header -->
    <div class="h-14 lg:h-[60px] flex items-center justify-between px-6 border-b bg-background/95 backdrop-blur z-10 flex-shrink-0">
      <div class="flex flex-col">
        <h3 class="font-semibold text-foreground text-sm lg:text-base">{{ conversation.title }}</h3>
        <span class="text-xs text-muted-foreground">{{ dayjs(conversation.updatedAt).format('YYYY-MM-DD HH:mm') }}</span>
      </div>
      <div class="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
        {{ conversation.selectedModel }}
      </div>
    </div>

    <!-- Messages Area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
      <div class="max-w-3xl mx-auto pb-4">
        <MessageList :messages="filteredMessages" ref="messageListRef"/>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 bg-background/95 backdrop-blur border-t flex-shrink-0 relative">
      <div class="max-w-3xl mx-auto relative">
        <!-- Floating Actions -->
        <div class="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-2">
          <Button 
            v-if="messageStore.isMessageLoading"
            @click="stopGenerating"
            variant="destructive"
            size="sm"
            class="shadow-md rounded-full px-4"
          >
            <Icon icon="mdi:stop-circle-outline" class="mr-1" />
            <span>{{ t('conversation.stopGenerating') }}</span>
          </Button>
          <Button 
            v-else-if="lastQuestion && filteredMessages[filteredMessages.length - 1]?.type === 'answer'"
            @click="regenerate"
            variant="secondary"
            size="sm"
            class="shadow-md rounded-full px-4 bg-background border border-border hover:bg-accent"
          >
            <Icon icon="mdi:refresh" class="mr-1" />
            <span>{{ t('conversation.regenerate') }}</span>
          </Button>
        </div>

        <MessageInput  @create="sendNewMessage" v-model="inputValue" :disabled="messageStore.isMessageLoading"/>
        
        <div class="text-center text-[10px] text-muted-foreground mt-2 opacity-50">
           {{ t('conversation.aiDisclaimer') }}
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex h-full items-center justify-center text-muted-foreground">
     {{ t('conversation.selectToStart') }}
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import MessageInput from '../components/MessageInput.vue'
import MessageList from '../components/MessageList.vue'
import Button from '../components/Button.vue'
import { useConversationStore } from '../stores/conversation'
import { useMessageStore } from '../stores/message'
import { useProviderStore } from '../stores/provider'
import { MessageProps, MessageListInstance, MessageStatus } from '../types'

const { t } = useI18n()
const inputValue = ref('')
let currentMessageListHeight = 0
const messageListRef = ref<MessageListInstance>()
const route = useRoute()
const conversationStore = useConversationStore()
const messageStore = useMessageStore()
const provdierStore = useProviderStore()
const filteredMessages = computed(() => messageStore.items)
const sendedMessages = computed(() => filteredMessages.value
  .filter(message => message.status!== 'loading' && message.status !== 'error')
  .map(message => {
    return {
      role: message.type === 'question' ? 'user' : 'assistant',
      content: message.content,
      ...(message.imagePath && { imagePath: message.imagePath })
    }
  })
)
let conversationId = ref(parseInt(route.params.id as string))
const initMessageId = parseInt(route.query.init as string)
const conversation = computed(() => conversationStore.getConversationById(conversationId.value))
const lastQuestion = computed(() => messageStore.getLastQuestion(conversationId.value))

const sendNewMessage = async (question: string, imagePath?: string) => {
  if (question) {
    let copiedImagePath: string | undefined
    if (imagePath) {
      try {
        copiedImagePath = await window.electronAPI.copyImageToUserDir(imagePath)
        console.log('copiedImagePath', copiedImagePath)
      } catch (error) {
        console.error('Failed to copy image:', error)
      }
    }
    const date = new Date().toISOString()
    await messageStore.createMessage({
			content: question,
			conversationId: conversationId.value,
			createdAt: date,
      updatedAt: date,
			type: 'question',
      ...(copiedImagePath && { imagePath: copiedImagePath })
    })
    inputValue.value = ''
    creatingInitialMessage()
  }
}
const messageScrollToBottom = async () => {
	await nextTick()
  if (messageListRef.value) {
    messageListRef.value.ref.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }
}
const creatingInitialMessage = async () => {
  const createdData: Omit<MessageProps, 'id'> = {
    content: '',
    conversationId: conversationId.value,
    type: 'answer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'loading'
  }
  const newMessageId = await messageStore.createMessage(createdData)
  await messageScrollToBottom()
  if (conversation.value) {
    const provider = provdierStore.getProviderById(conversation.value.providerId)
    if (provider) {
      console.log('provider', provider)
      await window.electronAPI.startChat({
        messageId: newMessageId,
        providerName: provider.name,
        selectedModel: conversation.value.selectedModel,
        messages: sendedMessages.value
      })
    }
  }
}

const stopGenerating = async () => {
  window.electronAPI.stopChat()
  // Manually mark the loading message as finished/stopped
  const loadingMsg = messageStore.items.find(item => item.status === 'loading' || item.status === 'streaming')
  if (loadingMsg) {
    await messageStore.updateMessage(loadingMsg.id, { status: 'finished' })
  }
}

const regenerate = async () => {
  const lastMsg = filteredMessages.value[filteredMessages.value.length - 1]
  if (lastMsg && lastMsg.type === 'answer') {
    await messageStore.deleteMessage(lastMsg.id)
    await creatingInitialMessage()
  }
}

watch(() => route.params.id, async (newId: string) => {
  conversationId.value = parseInt(newId)
  await messageStore.fetchMessagesByConversation(conversationId.value)
  await messageScrollToBottom()
  currentMessageListHeight = 0
})
onMounted(async () => {
  await messageStore.fetchMessagesByConversation(conversationId.value)
  await messageScrollToBottom()
  if (initMessageId) {
    await creatingInitialMessage()
  }
  let streamContent = ''
  const checkAndScrollToBottom = async () => {
    if (messageListRef.value) {
      const newHeight = messageListRef.value.ref.clientHeight
      console.log('the newHeight', newHeight)
			console.log('the currentMessageListHeight', currentMessageListHeight)
      if (newHeight > currentMessageListHeight) {
        console.log('scroll to bottom')
        currentMessageListHeight = newHeight
        await messageScrollToBottom()
      }
    }
  }
  window.electronAPI.onUpdateMessage(async (streamData) => {
    console.log('stream', streamData)
    const { messageId, data } = streamData
    streamContent += data.result
    const getMessageStatus = (data: any): MessageStatus => {
      if (data.is_error) {
        return 'error'
      } else if (data.is_end) {
        return 'finished' 
      } else {
        return 'streaming'
      }
    }
    const updatedData = {
      content: streamContent,
      status: getMessageStatus(data),
      updatedAt: new Date().toISOString()
    }
    // update database
    // update filteredMessages
    await messageStore.updateMessage(messageId, updatedData)
    await nextTick()
    await checkAndScrollToBottom()
    if(data.is_end) {
      streamContent = ''
    }
  })
})
</script>
