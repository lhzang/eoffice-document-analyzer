<script setup lang="ts">
import { type Placement } from '@popperjs/core'
import { computed, ref, watch, type CSSProperties } from 'vue'
import { Tippy } from 'vue-tippy'

type TAppLongTextProps = {
  placement?: Placement
  wrapperStyle?: CSSProperties
  textStyle?: CSSProperties
  showReadMoreMoreStyles?: CSSProperties
  spliceLength?: number
  isShowReadMore?: boolean
  isShowTooltips?: boolean
  // texts: string[]
  text: string
}

const {
  text,
  // texts,
  placement = 'right',
  isShowTooltips = true,
  isShowReadMore = true,
  wrapperStyle,
  textStyle,
  showReadMoreMoreStyles,
  spliceLength = 150
} = defineProps<TAppLongTextProps>()

const emits = defineEmits<{
  click: []
}>()

const textRef = ref<HTMLElement | null>(null)
const textTooltip = ref<string>('')
const isShowMore = ref<boolean>(false)
const hasOverflow = ref(isShowReadMore ?? false)
// const textShow = ref<string>('')

const textShow = computed(() => {
  return isShowMore.value
    ? text
    : // : texts
      //   ? `${getShortText(spliceLength, texts)}${hasOverflow.value ? ',...' : ''}`
      `${text?.toString()?.slice(0, spliceLength)}${hasOverflow.value ? '...' : ''}`
})

watch(
  () => [text, isShowMore.value],
  () => {
    // const result = getShortText(spliceLength, texts)
    // const isOverflowText = texts?.length
    //   ? text?.length > result.length
    //   : text?.length > spliceLength
    const isOverflowText = text?.length > spliceLength
    hasOverflow.value = isOverflowText
    if (isOverflowText && isShowTooltips && !isShowMore.value) {
      textTooltip.value = text || ''
    } else textTooltip.value = ''
  },
  { immediate: true }
)
</script>
<template>
  <Tippy
    tag="div"
    :title="textTooltip"
    :placement="placement"
    class="w-full max-w-full overflow-hidden"
  >
    <div :style="{ ...wrapperStyle }" class="w-full max-w-full overflow-hidden">
      <span
        @click="emits('click')"
        class="wrap-break-word"
        :style="{ ...textStyle, overflowWrap: 'anywhere' }"
        ref="textRef"
        >{{ textShow }}</span
      >
      <span
        v-if="hasOverflow && isShowReadMore"
        @click.stop="isShowMore = !isShowMore"
        class="text-primary cursor-pointer font-medium whitespace-nowrap"
        :style="{
          ...showReadMoreMoreStyles
        }"
      >
        {{ isShowMore ? 'Ẩn bớt' : ' Xem thêm' }}
      </span>
    </div>
  </Tippy>
</template>

<style scoped></style>
