<template>
  <div class="flex flex-col h-full items-center justify-center p-8 bg-background relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none" />

    <div class="z-10 w-full max-w-2xl flex flex-col items-center gap-8">
      <div class="text-center space-y-2">
        <div class="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
           <Icon icon="lucide:bot" class="w-10 h-10" />
        </div>
        <h1 class="text-3xl font-bold text-foreground tracking-tight">{{ t('home.greeting') }}</h1>
        <p class="text-muted-foreground">{{ t('home.selectModelHint') }}</p>
      </div>

      <div class="w-full space-y-4">
        <ProviderSelect :items="providers" v-model="currentProvider"/>
        <MessageInput 
          @create="createConversation" 
          :disabled="currentProvider === ''"
          class="shadow-lg border-primary/20 focus-within:border-primary/50 focus-within:ring-primary/20" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { db } from '../db'
import { useConversationStore } from '../stores/conversation'
import { useProviderStore } from '../stores/provider'
import ProviderSelect from '../components/ProviderSelect.vue'
import MessageInput from '../components/MessageInput.vue'

const { t } = useI18n()
const currentProvider = ref('')
const router = useRouter()
const conversationStore = useConversationStore()
const providerStore = useProviderStore()
const providers = computed(() => providerStore.items)
const modelInfo = computed(() => {
  const [ providerId, selectedModel ] = currentProvider.value.split('/')
  return {
    providerId: parseInt(providerId),
    selectedModel
  }
})
const createConversation = async (question: string, imagePath?: string) => {
  const { providerId, selectedModel } = modelInfo.value
  const currentDate = new Date().toISOString()
  let copiedImagePath: string | undefined
  if (imagePath) {
    try {
      copiedImagePath = await window.electronAPI.copyImageToUserDir(imagePath)
      console.log('copiedImagePath', copiedImagePath)
    } catch (error) {
      console.error('Failed to copy image:', error)
    }
  }
  const conversationId = await conversationStore.createConversation({
    title: question,
    providerId,
    selectedModel,
    createdAt: currentDate,
    updatedAt: currentDate
  })
  const newMessageId  = await db.messages.add({
    content: question,
    conversationId,
    createdAt: currentDate,
    updatedAt: currentDate,
    type: 'question',
    ...(copiedImagePath && { imagePath: copiedImagePath })
  })
  conversationStore.selectedId = conversationId
  router.push(`/conversation/${conversationId}?init=${newMessageId}`)
}
</script>
