<script setup lang="ts">
import { Dialog, type DialogBreakpoints } from 'primevue'
import { type CSSProperties } from 'vue'

type TProps = {
  wrapperStyle?: CSSProperties
  title?: string
  placeholder?: string
  cancelText?: string
  submitText?: string
  breakpoints?: DialogBreakpoints
  isCloseModalImmediately?: false
  classContent?: string
  isLoading?: boolean
  closeWhenClickOutSide?: boolean
  hideCloseButton?: boolean
}

const {
  title,
  wrapperStyle = {},
  breakpoints = {},
  classContent,
  isLoading,
  hideCloseButton = false,
  closeWhenClickOutSide = true
} = defineProps<TProps>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const openModal = () => {
  visible.value = true
}
const closeModal = () => {
  visible.value = false
}

defineExpose({
  get visible() {
    return visible.value
  },
  openModal,
  closeModal
})
</script>

<template>
  <!-- <div class="flex justify-center"> -->
  <template v-if="$slots.triggerBtn">
    <slot name="triggerBtn"></slot>
  </template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="title"
    class="w-[300px]"
    v-bind="$attrs"
    :dismissableMask="closeWhenClickOutSide"
    :style="{ ...wrapperStyle }"
    :breakpoints="breakpoints"
    :pt="{
      header: {
        class: !title && !$slots.header ? '!hidden' : ''
      },
      title: {
        class: 'text-primary'
      },
      content: {
        class: `max-h-full relative ${classContent || ''}`
      },
      pcCloseButton: {
        icon: {
          class:
            '!p-2 rounded-full outline-none border-none hover:bg-gray-100 text-gray-500 hover:text-gray-700 active:text-gray-700 !w-full !h-full transition-colors duration-200 ease-in-out'
        },
        root: {
          class: '!w-9 !h-9'
        }
      },
      headerActions: {
        class: hideCloseButton ? 'hidden!' : ''
      }
    }"
  >
    <template v-if="!title && $slots.header" #header>
      <slot name="header"></slot>
    </template>
    <div v-if="isLoading" class="mt-10 flex h-full min-h-[200px] items-center justify-center">
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <template v-else>
      <slot></slot>
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </Dialog>
  <!-- </div>  -->
</template>
