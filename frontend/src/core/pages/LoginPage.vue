<script setup lang="ts">
import { useAuth } from '@/shared/composables/useAuth'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { Button, useToast } from 'primevue'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

const toast = useToast()
const auth = useAuth()
const profileStore = useUserProfileStore()
const router = useRouter()

async function login() {
  try {
    await auth.login()
  } catch {
    toast.add({ severity: 'error', life: 3000, summary: 'Không thể kết nối tới máy chủ xác thực' })
  }
}

watch(
  () => profileStore.user,
  (user) => {
    if (user) router.push('/')
  },
  {
    immediate: true
  }
)
</script>
<template>
  <div class="flex h-full items-center justify-center">
    <div class="text-center">
      <h1 class="mb-6 text-2xl font-bold text-gray-800">Please login!</h1>
      <Button
        raised
        class="auto flex"
        label="Login"
        severity="success"
        icon="icon-[material-symbols--login]"
        @click="login"
      />
    </div>
  </div>
</template>
