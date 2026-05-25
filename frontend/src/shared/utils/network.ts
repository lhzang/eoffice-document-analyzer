import { useNetwork } from '@vueuse/core'
import type { useToast } from 'primevue'
import { watchEffect } from 'vue'

const { isOnline } = useNetwork()

export function observerNetwork(toast: ReturnType<typeof useToast>) {
  watchEffect(() => {
    toast.removeGroup('network')

    toast.add({
      summary: isOnline.value ? 'Đã khôi phục kết nối internet' : 'Mất kết nối internet',
      closable: true,
      life: 3000,
      severity: isOnline.value ? 'success' : 'error',
      group: 'network',
    })
  })
}
