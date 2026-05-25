<script setup lang="ts">
import { computed } from 'vue'
import AppLongText from '../AppLongText.vue'

type TRelatedTaskInfo = {
  workId: string
  title: string
}

type TProps = {
  tasks: {}
}

const { tasks } = defineProps<TProps>()

const taskNames = computed(() => {
  return tasks?.map((task) => task?.name)
})
</script>
<template>
  <div class="flex w-full gap-2">
    <AppLongText :text="taskNames?.join(', ') ?? '--'" :splice-length="50" />
  </div>
</template>
