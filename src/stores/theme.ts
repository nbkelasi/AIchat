import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeColor = 'blue' | 'green' | 'orange' | 'violet' | 'rose'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>((localStorage.getItem('theme-mode') as ThemeMode) || 'system')
  const color = ref<ThemeColor>((localStorage.getItem('theme-color') as ThemeColor) || 'blue')

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem('theme-mode', newMode)
    applyTheme()
  }

  function setColor(newColor: ThemeColor) {
    color.value = newColor
    localStorage.setItem('theme-color', newColor)
    applyTheme()
  }

  function applyTheme() {
    const root = window.document.documentElement
    
    // Handle Mode
    root.classList.remove('light', 'dark')
    if (mode.value === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(mode.value)
    }

    // Handle Color
    root.setAttribute('data-theme', color.value)
  }

  // Listen to system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (mode.value === 'system') {
      applyTheme()
    }
  })

  // Apply on init
  watch([mode, color], applyTheme, { immediate: true })

  return {
    mode,
    color,
    setMode,
    setColor,
    // Compat for existing code that might use 'theme'
    theme: mode,
    setTheme: setMode 
  }
})
