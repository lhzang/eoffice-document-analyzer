<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { ref, watch } from 'vue'

type TProps = {
  placeholder: string
  searchString?: string
}
type TEmits = {
  (event: 'search', value: string): void
}

const props = defineProps<TProps>()
const { placeholder } = props

const emits = defineEmits<TEmits>()

const searchValue = ref<string>('')
const searchInputRef = ref<HTMLInputElement | null>(null)

//clear search case
const emitSearch = () => {
  emits('search', searchValue.value)
}

//this use for debounce when typing search
const debouncedEmitSearch = useDebounceFn(() => {
  emits('search', searchValue.value)
}, 500)

const handleInput = () => {
  //prevent search when type spaces only
  if (searchValue.value?.length && !searchValue?.value?.trim()?.length) return
  debouncedEmitSearch()
}

const handleClearSearch = () => {
  searchValue.value = ''
  emitSearch()
}

watch(
  () => props.searchString,
  () => {
    searchValue.value = props.searchString as string
  },
  {
    immediate: true
    // once: true
  }
)
</script>
<template>
  <div
    class="inline-flex w-[300px] items-center rounded-xl border-[1px] border-gray-500 px-2 py-1 focus-within:border-[1px] focus-within:border-[var(--p-primary-color)]"
    v-bind="$attrs"
    @click="searchInputRef?.focus()"
  >
    <span
      class="custom-input--icon__search pl-2 text-2xl text-gray-500"
      :class="'icon-[line-md--search]'"
    />
    <input
      ref="searchInputRef"
      class="w-full border-[1px] border-none px-2 py-1 outline-none"
      :placeholder="placeholder"
      v-model="searchValue"
      @input="handleInput"
    />
    <span
      v-if="searchValue"
      class="mr-1 text-xl text-gray-400 hover:cursor-pointer active:text-gray-500"
      :class="'icon-[line-md--close-circle-filled]'"
      @click="handleClearSearch"
    />
  </div>
</template>
