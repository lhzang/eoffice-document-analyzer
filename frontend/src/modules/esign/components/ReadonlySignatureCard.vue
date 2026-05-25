<script setup lang="ts">
import { Divider } from 'primevue'

const props = defineProps<{
  label: string
  type: string
  url?: string
}>()
</script>

<template>
  <div class="flex-1 rounded-xl border border-gray-200 bg-white p-4 text-gray-800">
    <div class="mb-2">
      <p class="text-primary text-base font-semibold">
        {{ label }}
      </p>
      <Divider />
    </div>

    <div class="mt-4">
      <div v-if="props.url">
        <div class="h-36 w-full overflow-hidden">
          <img class="h-full w-full object-contain" :src="props.url" />
        </div>
      </div>
      <div v-else>
        <p class="m-0">Chưa có</p>
      </div>
    </div>
  </div>
</template>
