<template>
  <div class="message-list w-full space-y-4" ref="_ref">
    <div 
      class="message-item w-full flex flex-col" 
      v-for="message in messages" 
      :key="message.id"
      :class="{'items-end': message.type === 'question', 'items-start': message.type !== 'question'}"
    >
      <div class="max-w-[85%]">
        <!-- 时间 -->
        <div 
          class="text-xs text-muted-foreground mb-1" 
          :class="{'text-right': message.type === 'question'}"
        >
          {{ dayjs(message.createdAt).format('HH:mm') }}
        </div>

        <!-- 内容 -->
        <div 
          class="p-3 rounded-lg shadow-sm"
          :class="{
            'bg-primary text-primary-foreground rounded-tr-none': message.type === 'question',
            'bg-secondary text-secondary-foreground rounded-tl-none': message.type !== 'question',
            'bg-destructive/10 text-destructive': message.status === 'error'
          }"
        >
          <!-- 图片 -->
          <img 
            v-if="message.imagePath" 
            :src="`safe-file://${message.imagePath}`" 
            :alt="t('common.messageImage')" 
            class="mb-2 max-w-full h-auto rounded-md object-cover"
            style="max-height: 200px;"
          >

          <!-- 文本/Markdown -->
          <template v-if="message.status === 'loading'">
             <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
             </div>
          </template>
          <template v-else-if="message.status === 'error'">
            <span>{{message.content}}</span>
          </template>
          <div v-else class="prose prose-sm dark:prose-invert max-w-none break-words" :class="{'text-primary-foreground': message.type === 'question'}">
            <vue-markdown :source="message.content" :plugins="plugins"/>
          </div>
        </div>
      </div>
    </div>    
  </div>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import VueMarkdown from 'vue-markdown-render'
import markdownItHighlightjs from 'markdown-it-highlightjs'
import { MessageProps } from '../types'

const { t } = useI18n()
defineProps<{ messages: MessageProps[] }>()
const plugins = [ markdownItHighlightjs ]
const _ref = ref<HTMLDivElement>()
defineExpose({
  ref: _ref
})
</script>
