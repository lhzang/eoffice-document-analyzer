<script setup lang="ts">
import { useAuth } from '@/shared/composables/useAuth'
import { toastError } from '@/shared/utils/common'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const auth = useAuth()

onMounted(async () => {
  try {
    await auth.handleCallback()
    router.replace('/')
  } catch (error) {
    toastError({
      detail: error instanceof Error ? error?.message : 'Đã có lỗi xảy ra khi đăng nhập'
    })
    console.error('Callback handling failed:', error)
    auth.logout()
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="text-center text-lg font-semibold text-gray-700">
      Đang đăng nhập vào hệ thống...
    </div>
  </div>
</template>
