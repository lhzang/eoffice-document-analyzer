import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SystemConfigVM } from '../services/api'

export const useThemeStore = defineStore(
  'themeStore',
  () => {
    const systemConfig = ref<SystemConfigVM | null>(null)
    function updateSystemConfig(newSystemConfig: SystemConfigVM) {
      systemConfig.value = newSystemConfig
    }
    return { systemConfig, updateSystemConfig }
  },
  {
    persist: {
      storage: localStorage
    }
  }
)
