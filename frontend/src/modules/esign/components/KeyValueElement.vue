<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{
  label: string;
  value: string | string[];
  isSingle?: boolean;
}>();

const formatValue = (value: string | string[]) => {
  return Array.isArray(value) ? value.join(", ") : value;
};

const expanded = ref(false)
const contentRef = ref<HTMLElement | null>(null)
const isOverflowing = ref(false)
const checkOverflow = () => {
  const el = contentRef.value
  isOverflowing.value = el ? el.scrollHeight > el.clientHeight : false
}
onMounted(() => {
  checkOverflow()
  window.addEventListener('resize', checkOverflow)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkOverflow)
})

const displayedValue = computed(() => formatValue(props.value))
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:items-startpy-2 gap-1 sm:gap-4 bg-white"
    :class="{
      'border-b border-gray-200': !isSingle,
      'py-2': !isSingle,
    }"
  >
    <dt class="text-base font-medium text-gray-600 sm:w-1/3 break-words">{{ label }}</dt>
    <dd class="text-base text-gray-800 sm:w-2/3 break-words whitespace-pre-wrap">
      <div
        ref="contentRef"
        class="whitespace-pre-wrap break-words break-all transition-all duration-300"
        :class="expanded ? '' : 'line-clamp-2'"
        style="overflow: hidden"
      >
        {{ displayedValue }}
      </div>

      <button
        v-if="isOverflowing || expanded"
        class="mt-1 text-blue-500 text-base hover:underline"
        type="button"
        @click="expanded = !expanded"
      >
        {{ expanded ? "Thu gọn" : "Xem thêm" }}
      </button>
    </dd>
  </div>
</template>
