<template>
  <div class="space-y-1">
    <div 
      v-for="item in items"
      :key="item.id"
      class="group flex flex-col gap-1 rounded-lg p-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
      :class="{
        'bg-accent text-accent-foreground': store.selectedId === item.id,
        'text-muted-foreground': store.selectedId !== item.id,
        'items-center justify-center': collapsed
      }"
      @click="goToConversation(item.id)"
      @contextmenu.prevent="showContextMenu(item.id)"
      :title="collapsed ? item.title : ''"
    >
      <!-- 折叠状态 -->
      <div v-if="collapsed" class="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs flex-shrink-0">
         {{ getInitials(item.title) }}
      </div>

      <!-- 展开状态 -->
      <div v-else class="flex w-full flex-col gap-1">
        <div class="flex items-center">
          <div class="flex items-center gap-2 overflow-hidden">
            <div class="font-semibold line-clamp-1 break-all">
              {{ item.title || t('common.newChat') }}
            </div>
          </div>
          <div :class="cn(
            'ml-auto text-xs whitespace-nowrap pl-2',
            store.selectedId === item.id ? 'text-foreground' : 'text-muted-foreground'
          )">
            {{ dayjs(item.updatedAt).fromNow(true) }}
          </div>
        </div>
        
        <div class="line-clamp-2 text-xs opacity-80 break-all">
          {{ item.selectedModel }}
        </div>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import { ConversationProps } from '../types'
import { useConversationStore } from '../stores/conversation'
import { cn } from '../lib/utils'

dayjs.extend(relativeTime)

interface Props {
  items: ConversationProps[]
  collapsed?: boolean
}

defineProps<Props>()
const router = useRouter()
const store = useConversationStore()
const { t, locale } = useI18n()

// 监听语言变化，更新 dayjs 语言
watch(locale, (newLocale) => {
  dayjs.locale(newLocale === 'zh' ? 'zh-cn' : 'en')
}, { immediate: true })

const showContextMenu = (id: number) => {
  window.electronAPI.showContextMenu(id)
}

const getInitials = (title: string): string => {
  if (!title) return '?'
  // 如果是中文，取第一个字符
  if (/[\u4e00-\u9fa5]/.test(title)) {
    return title.charAt(0)
  }
  // 如果是英文，取前两个字符
  const words = title.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return title.charAt(0).toUpperCase()
}

onMounted(() => {
  window.electronAPI.onDeleteConversation(async (id: number) => {
    await store.deleteConversation(id)
    if (store.selectedId === id) {
      store.selectedId = -1
      router.push('/')
    }
  })
})

const goToConversation = (id: number) => {
  router.push({ path: `/conversation/${id}`})
  store.selectedId = id
}
</script>
