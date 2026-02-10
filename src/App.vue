<template>
  <div class="flex h-screen w-full bg-background text-foreground overflow-hidden">
    <!-- 侧边栏 -->
    <aside 
      class="flex h-full flex-col border-r bg-muted/30 transition-all duration-300 ease-in-out relative group"
      :class="[isCollapsed ? 'w-[70px]' : 'w-[280px]']"
    >
      <!-- 展开/折叠按钮 -->
      <button 
        @click="toggleSidebar"
        class="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-accent hover:text-accent-foreground transition-transform duration-200"
        :class="{'rotate-180': isCollapsed}"
      >
        <Icon icon="radix-icons:chevron-left" class="h-4 w-4" />
      </button>

      <!-- 侧边栏头部 -->
      <div class="flex h-14 items-center border-b px-4 lg:h-[60px] flex-shrink-0 overflow-hidden whitespace-nowrap">
        <div class="flex items-center gap-2">
           <div class="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
             <Icon icon="lucide:bot" class="w-5 h-5" />
           </div>
           <span 
             class="font-semibold text-lg transition-opacity duration-300"
             :class="{'opacity-0 w-0': isCollapsed, 'opacity-100': !isCollapsed}"
           >
             {{ t('app.name') }}
           </span>
        </div>
      </div>

      <!-- 对话列表 -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <ConversationList :items="items" :collapsed="isCollapsed"/>
      </div>

      <!-- 侧边栏底部 -->
      <div class="mt-auto p-4 border-t bg-background/50 backdrop-blur-sm flex flex-col gap-2">
        <div class="grid gap-2" :class="isCollapsed ? 'grid-cols-1' : 'grid-cols-2'">
          <RouterLink to="/" class="w-full">
            <Button variant="default" class="w-full justify-center" :size="isCollapsed ? 'icon' : 'default'" :title="t('common.newChat')">
              <Icon icon="radix-icons:plus" class="h-4 w-4" :class="{'mr-2': !isCollapsed}" />
              <span v-if="!isCollapsed">{{ t('common.newChat') }}</span>
            </Button>
          </RouterLink>
          <RouterLink to="/settings" class="w-full">
            <Button variant="outline" class="w-full justify-center" :size="isCollapsed ? 'icon' : 'default'" :title="t('common.settings')">
              <Icon icon="radix-icons:gear" class="h-4 w-4" :class="{'mr-2': !isCollapsed}" />
              <span v-if="!isCollapsed">{{ t('common.settings') }}</span>
            </Button>
          </RouterLink>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 flex flex-col h-full relative overflow-hidden">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { initI18n } from './i18n'
import { initProviders } from './db'
import { useConversationStore } from './stores/conversation'
import { useProviderStore } from './stores/provider'
import ConversationList from './components/ConversationList.vue'
import Button from './components/Button.vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()
const { t } = useI18n()
const conversationStore = useConversationStore()
const provdierStore = useProviderStore()
const items = computed(() => conversationStore.items)

const isCollapsed = ref(false)
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 监听菜单事件
window.electronAPI.onMenuNewConversation(() => {
  router.push('/')
})

window.electronAPI.onMenuOpenSettings(() => {
  router.push('/settings')
})

onMounted(async () => {
  await initI18n()
  await initProviders()
  // 获取最初需要的数据
  conversationStore.fetchConversations()
  provdierStore.fetchProviders()
})
</script>
