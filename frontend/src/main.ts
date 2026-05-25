import '@/assets/style.css'
import { QueryClient, VueQueryPlugin as vueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { ConfirmationService } from 'primevue'
import PrimeVue from 'primevue/config'
import DialogService from 'primevue/dialogservice'
import KeyFilter from 'primevue/keyfilter'
import ToastService from 'primevue/toastservice'
import 'tippy.js/dist/tippy.css' // optional for styling
import 'tippy.js/themes/light-border.css'
// import 'tippy.js/themes/light.css'
import { createApp, h } from 'vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import VueTippy from 'vue-tippy'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'
import { appConfig } from './config/app-config.ts'
import Noir from './presets/Noir.ts'
import { router } from './router.ts'
import { APP_NOTI_TIME } from './shared/constants/common.ts'

const app = createApp(App)

async function enableMocking() {
  if (appConfig.VITE_ENV_NAME !== 'mock') {
    return
  }

  const { worker } = await import('./shared/mocks/browser.ts')
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: 'bypass'
  })
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      // staleTime: 0,
      // gcTime: 0,
      refetchOnWindowFocus: false
    }
  }
})

// ui layer
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(vueQueryPlugin, {
  queryClient
})
app.use(ToastService, {
  life: APP_NOTI_TIME,
  position: 'top-left'
})
app.use(PrimeVue, {
  ripple: true,
  toast: {
    life: APP_NOTI_TIME,
    position: 'top-right'
  },
  theme: {
    preset: Noir,
    options: {
      prefix: 'p',
      darkModeSelector: '.p-dark',
      cssLayer: false
    }
  }
})
app.use(ConfirmationService)
app.use(VueApexCharts)

app.use(DialogService)
app.use(router)
app.use(
  VueTippy,
  // optional
  {
    directive: 'tippy',
    component: 'Tippy',
    componentSingleton: 'tippy-singleton',
    defaultProps: {
      theme: 'light-border',
      placement: 'auto',
      allowHTML: true,
      arrow: true
    }
  }
)
// custom icon for select
// @ts-expect-error:next-line
vSelect.props.components.default = () => ({
  Deselect: {
    render: () => h('span', { class: 'icon-[eva--close-fill] text-primary text-xl' })
  },
  OpenIndicator: {
    render: () =>
      h('span', {
        class:
          'icon-[ic--round-keyboard-arrow-down] focus:text-primary shrink-0  text-inherit text-lg'
      })
  }
})

if (appConfig.VITE_ENV_NAME !== 'development') {
  // console.log = function () {}
  // console.info = function () {}
  // console.warn = function () {}
  // console.error = function () {}
}
app.component('v-select', vSelect)
app.directive('keyfilter', KeyFilter)

enableMocking().then(() => {
  app.mount('#app')
})
