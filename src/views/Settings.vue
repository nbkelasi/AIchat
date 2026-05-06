<template>
  <div class="w-full max-w-3xl mx-auto p-8 overflow-y-auto h-full">
    <h1 class="text-2xl font-bold mb-8 text-foreground">{{ t('settings.title') }}</h1>
    
    <TabsRoot v-model="activeTab" class="w-full">
      <TabsList class="flex border-b border-border mb-6">
        <TabsTrigger 
           value="general" 
           class="px-4 py-2 -mb-[1px] text-sm font-medium text-muted-foreground hover:text-foreground transition-colors data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          {{ t('settings.general') }}
        </TabsTrigger>
        <TabsTrigger 
           value="models" 
           class="px-4 py-2 -mb-[1px] text-sm font-medium text-muted-foreground hover:text-foreground transition-colors data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          {{ t('settings.models') }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" class="space-y-8 max-w-[600px]">
        
        <!-- 外观设置 -->
        <section class="space-y-4">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <Icon icon="radix-icons:desktop" class="w-5 h-5" />
            {{ t('settings.appearance') }}
          </h2>
          <div class="grid gap-6 p-4 border rounded-lg bg-card">
            
            <!-- 主题模式 -->
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">{{ t('settings.themeMode') }}</label>
              <div class="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <button 
                  v-for="m in themeOptions" 
                  :key="m.value"
                  @click="themeStore.setMode(m.value)"
                  class="px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2"
                  :class="themeStore.mode === m.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
                >
                  <Icon :icon="m.icon" />
                  <span>{{ t(m.labelKey) }}</span>
                </button>
              </div>
            </div>

            <!-- 主题颜色 -->
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">{{ t('settings.accentColor') }}</label>
              <div class="flex gap-2">
                <button 
                  v-for="c in ['blue', 'green', 'orange', 'violet', 'rose'] as const" 
                  :key="c"
                  @click="themeStore.setColor(c)"
                  class="w-6 h-6 rounded-full border-2 ring-offset-background transition-all"
                  :class="[
                    `bg-${c}-500`, // 需要确保这些类存在，或使用内联样式来预览按钮颜色
                    themeStore.color === c ? 'ring-2 ring-ring ring-offset-2 border-background' : 'border-transparent hover:scale-110'
                  ]"
                  :style="{ backgroundColor: getColorValue(c) }"
                  :title="c"
                />
              </div>
            </div>

            <!-- 字体大小 -->
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">{{ t('settings.fontSize') }}</label>
              <NumberFieldRoot v-model="currentConfig.fontSize" :min="14" :max="24" class="inline-flex items-center">
                <NumberFieldDecrement class="flex h-8 w-8 items-center justify-center border border-r-0 border-input rounded-l-md bg-background hover:bg-accent text-muted-foreground focus:outline-none">
                  <Icon icon="radix-icons:minus" />
                </NumberFieldDecrement>
                <NumberFieldInput 
                  class="h-8 w-12 border border-input bg-background text-center text-sm focus:outline-none focus:ring-1 focus:ring-ring z-10"
                  :min="14"
                  :max="24"
                />
                <NumberFieldIncrement class="flex h-8 w-8 items-center justify-center border border-l-0 border-input rounded-r-md bg-background hover:bg-accent text-muted-foreground focus:outline-none">
                  <Icon icon="radix-icons:plus" />
                </NumberFieldIncrement>
              </NumberFieldRoot>
            </div>

          </div>
        </section>

        <!-- 语言设置 -->
        <section class="space-y-4">
           <h2 class="text-lg font-semibold flex items-center gap-2">
            <Icon icon="radix-icons:globe" class="w-5 h-5" />
            {{ t('settings.languageSection') }}
          </h2>
          <div class="p-4 border rounded-lg bg-card flex items-center justify-between">
            <label class="text-sm font-medium">{{ t('settings.language') }}</label>
            <SelectRoot v-model="currentConfig.language">
              <SelectTrigger class="inline-flex items-center justify-between rounded-md px-3 py-2 text-sm gap-2 bg-background border border-input hover:bg-accent hover:text-accent-foreground w-[160px] focus:outline-none focus:ring-1 focus:ring-ring">
                <SelectValue :placeholder="t('settings.selectLanguage')" />
                <SelectIcon>
                  <Icon icon="radix-icons:chevron-down" class="text-muted-foreground" />
                </SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectContent class="bg-popover text-popover-foreground rounded-md shadow-md border border-border overflow-hidden z-50">
                  <SelectViewport class="p-1">
                    <SelectGroup>
                      <SelectItem value="zh" class="relative flex items-center px-8 py-2 text-sm rounded-sm cursor-default hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none">
                        <SelectItemText>{{ t('common.chinese') }}</SelectItemText>
                        <SelectItemIndicator class="absolute left-2 inline-flex items-center">
                          <Icon icon="radix-icons:check" />
                        </SelectItemIndicator>
                      </SelectItem>
                      <SelectItem value="en" class="relative flex items-center px-8 py-2 text-sm rounded-sm cursor-default hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none">
                        <SelectItemText>{{ t('common.english') }}</SelectItemText>
                        <SelectItemIndicator class="absolute left-2 inline-flex items-center">
                          <Icon icon="radix-icons:check" />
                        </SelectItemIndicator>
                      </SelectItem>
                    </SelectGroup>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </SelectRoot>
          </div>
        </section>

      </TabsContent>

      <TabsContent value="models" class="space-y-4">
        <AccordionRoot type="single" collapsible class="w-full space-y-2">
          <AccordionItem 
             v-for="provider in providers" 
             :key="provider.id" 
             :value="provider.name" 
             class="border border-border rounded-lg bg-card text-card-foreground overflow-hidden"
          >
            <AccordionTrigger class="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-all [&[data-state=open]>svg]:rotate-180">
              <div class="flex items-center gap-2">
                <img :src="provider.avatar" :alt="provider.name" class="w-6 h-6 rounded bg-muted">
                <span class="font-medium text-sm">{{ provider.title }}</span>
              </div>
              <Icon icon="radix-icons:chevron-down" class="text-muted-foreground transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent class="p-4 pt-0 border-t border-border/50 bg-muted/20">
              <div class="space-y-4 pt-4">
                <div v-for="config in getProviderConfig(provider.name)" :key="config.key" class="flex flex-col gap-2">
                  <label class="text-xs font-medium text-muted-foreground">{{ config.label }}</label>
                  <input 
                    :type="config.type"
                    :placeholder="config.placeholder"
                    :required="config.required"
                    :value="config.value"
                    @input="(e) => updateProviderConfig(provider.name, config.key, (e.target as HTMLInputElement).value)"
                    class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { AppConfig } from '../types'
import { setI18nLanguage } from '../i18n'
import { useProviderStore } from '../stores/provider'
import { useThemeStore } from '../stores/theme'
import { useConfigStore } from '../stores/config'
import { providerConfigs, ProviderConfigItem } from '../config/providerConfig'
import {
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  NumberFieldRoot,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from 'radix-vue'

const { t } = useI18n()
const activeTab = ref('general')
const providerStore = useProviderStore()
const themeStore = useThemeStore()
const providers = computed(() => providerStore.items)

// 主题选项配置
const themeOptions = [
  { value: 'light' as const, icon: 'radix-icons:sun', labelKey: 'theme.light' },
  { value: 'system' as const, icon: 'radix-icons:laptop', labelKey: 'theme.system' },
  { value: 'dark' as const, icon: 'radix-icons:moon', labelKey: 'theme.dark' }
]

const currentConfig = reactive<AppConfig>({
  language: 'zh',
  fontSize: 14,
  providerConfigs: {}
})

// 颜色预览辅助函数
const getColorValue = (color: string) => {
  const colors: Record<string, string> = {
    blue: '#3b82f6',
    green: '#22c55e',
    orange: '#f97316',
    violet: '#8b5cf6',
    rose: '#f43f5e'
  }
  return colors[color]
}

onMounted(async () => {
  const config = await window.electronAPI.getConfig()
  Object.assign(currentConfig, config)
})

// 监听配置变化并自动保存
watch(currentConfig, async (newConfig) => {
  // 实时应用字体大小到根元素
  if (newConfig.fontSize) {
    document.documentElement.style.fontSize = `${newConfig.fontSize}px`
  }

  // 创建一个普通对象来传递配置
  const configToSave = {
    language: newConfig.language,
    fontSize: newConfig.fontSize,
    providerConfigs: JSON.parse(JSON.stringify(newConfig.providerConfigs))
  }
  await window.electronAPI.updateConfig(configToSave)
  // 更新界面语言
  setI18nLanguage(newConfig.language)
}, { deep: true })

// 获取provider对应的配置项
const getProviderConfig = (providerName: string): ProviderConfigItem[] => {
  const configs = providerConfigs[providerName] || []
  // 确保配置值被初始化
  if (!currentConfig.providerConfigs[providerName]) {
    currentConfig.providerConfigs[providerName] = {}
  }
  return configs.map(config => ({
    ...config,
    value: currentConfig.providerConfigs[providerName][config.key] || config.value
  }))
}

// 更新provider配置值
const updateProviderConfig = (providerName: string, key: string, value: string) => {
  if (!currentConfig.providerConfigs[providerName]) {
    currentConfig.providerConfigs[providerName] = {}
  }
  currentConfig.providerConfigs[providerName][key] = value
}
</script>
