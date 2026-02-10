/**
 * 此文件由 Vite 自动加载，运行在"渲染进程"上下文中。
 * 了解更多关于 Electron 中"主进程"和"渲染进程"的区别，请访问：
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * 默认情况下，此文件禁用了 Node.js 集成。启用渲染进程中的 Node.js 集成时，
 * 请注意潜在的安全隐患。更多安全风险信息请参阅：
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * 要在此文件中启用 Node.js 集成，请打开 `main.ts` 并启用 `nodeIntegration` 选项：
 *
 * ```
 *  // 创建浏览器窗口
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Conversation from './views/Conversation.vue'
import Settings from './views/Settings.vue'
import { useConversationStore } from './stores/conversation'
import './index.css'
import 'highlight.js/styles/github-dark.min.css'
import { i18n } from './i18n'

const routes = [
  { path: '/', component: Home },
  { path: '/conversation/:id', component: Conversation },
  { path: '/settings', component: Settings }
]
const router = createRouter({
  history: createMemoryHistory(),
  routes
})
router.beforeEach((to) => {
  const store = useConversationStore()
  console.log('path', to.path)
  if (!to.path.startsWith('/conversation/')) {
    store.selectedId = -1
  }
})
const pinia = createPinia()
console.log('👋 此消息由 "renderer.ts" 输出，通过 Vite 加载');

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(i18n)
app.mount('#app')