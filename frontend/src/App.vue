<script setup lang="ts">
import '@/assets/style.css'
import { useToast } from 'primevue'
import Toast from 'primevue/toast'
import { watch } from 'vue'
import { appConfig } from './config/app-config'
import { useGetSystemConfig } from './shared/composables/queries/system/useGetSystemConfig'
import { useThemeStore } from './shared/stores/useThemeStore'
import { observerNetwork } from './shared/utils/network'
import { applyTheme } from './shared/utils/theme'
const toast = useToast()

const themeStore = useThemeStore()
const { data: systemConfigInfo } = useGetSystemConfig()
watch(
  () => systemConfigInfo.value,
  (val) => {
    if (val) {
      themeStore.updateSystemConfig(val)
      applyTheme(val.mainColor, val.backgroundColor, false)
    } else {
      applyTheme(
        `#${appConfig.VITE_APP_PRIMARY_COLOR}`,
        `#${appConfig.VITE_APP_BACKGROUND_COLOR}`,
        false
      )
    }
  },
  { immediate: true }
)
observerNetwork(toast)
</script>

<template>
  <Toast position="top-right" :base-z-index="1000" />
  <Toast
    position="bottom-right"
    :base-z-index="1000"
    group="network"
    success-icon="icon-[material-symbols--wifi] text-green-700"
    error-icon="icon-[material-symbols--wifi-off] text-red-400"
  />
  <div class="h-screen w-screen">
    <Suspense>
      <RouterView />

      <template #fallback>
        <div class="flex h-screen w-screen items-center justify-center bg-red-500">
          <span
            class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-2xl"
          ></span>
        </div>
      </template>
    </Suspense>
  </div>
</template>
