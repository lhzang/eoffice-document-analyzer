<script setup lang="ts" generic="TOptionValue, TIsMulti extends boolean">
import { IcLoading } from '@/assets/icons'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import { createPopper } from '@popperjs/core'
import { useDebounce } from '@vueuse/core'
import { Message } from 'primevue'
import { useField } from 'vee-validate'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { type VueSelectProps } from 'vue-select'

export type TCommonSelectOptions<TOptionValue> = {
  label: string
  value: TOptionValue
}

type TProps = Partial<
  Pick<
    VueSelectProps,
    | 'appendToBody'
    | 'clearable'
    | 'disabled'
    | 'placeholder'
    | 'reduce'
    | 'searchable'
    | 'selectable'
    | 'closeOnSelect'
  >
> & {
  loading?: boolean
  multiple?: TIsMulti
  name: string
  label?: string
  required?: boolean
  additionalErrorMessage?: string
  cacheUniqs?: string[]
  isFetchOnInit?: boolean
  selectFirstOnDefault?: boolean
  modelValue?: TIsMulti extends false
    ? TCommonSelectOptions<TOptionValue>
    : TCommonSelectOptions<TOptionValue>[]
  defaultValue?: TIsMulti extends false
    ? TCommonSelectOptions<TOptionValue>
    : TCommonSelectOptions<TOptionValue>[]
  fetchOptions: (
    search: string,
    page: number
  ) =>
    | { options: TCommonSelectOptions<TOptionValue>[]; hasMore: boolean }
    | Promise<{ options: TCommonSelectOptions<TOptionValue>[]; hasMore: boolean }>
}

type TEmits = {
  (
    event: 'change',
    value: TIsMulti extends false
      ? TCommonSelectOptions<TOptionValue>
      : TCommonSelectOptions<TOptionValue>[]
  ): void
  (event: 'select', value: TCommonSelectOptions<TOptionValue>): void
  (
    event: 'update:modelValue',
    value: TIsMulti extends false
      ? TCommonSelectOptions<TOptionValue>
      : TCommonSelectOptions<TOptionValue>[]
  ): void
}

const emit = defineEmits<TEmits>()

const {
  label,
  name,
  loading: loadingProps,
  additionalErrorMessage,
  appendToBody = true,
  required = false,
  multiple = false,
  isFetchOnInit = false,
  selectFirstOnDefault = false,
  placeholder = MSG_PLEASE_SELECT,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modelValue,
  fetchOptions,
  clearable = false,
  disabled,
  cacheUniqs,
  defaultValue,
  ...rest
} = defineProps<TProps>()

const otherProps = computed(() => rest)

const { value, errorMessage, resetField } = useField<
  TIsMulti extends false ? TCommonSelectOptions<TOptionValue> : TCommonSelectOptions<TOptionValue>[]
>(() => name, undefined, { syncVModel: true })

watch(
  value,
  (
    newValue: TIsMulti extends false
      ? TCommonSelectOptions<TOptionValue>
      : TCommonSelectOptions<TOptionValue>[]
  ) => {
    emit('change', newValue)
    emit('update:modelValue', newValue)
  },
  { immediate: true }
)

// Set default value when it changes
watch(
  () => defaultValue,
  (newValue) => {
    if (newValue) resetField({ value: newValue })
  },
  { immediate: true }
)

const observer = ref<IntersectionObserver | null>(null)
const loadMoreRef = ref<HTMLElement | null>(null)

const page = ref(0)
const options = ref<TCommonSelectOptions<TOptionValue>[]>([])
const hasMore = ref(false)
const localLoading = ref(false)
const searchString = ref('')
const debouncedSearch = useDebounce(searchString, 300)

const isLoading = computed(() => localLoading.value || !!loadingProps)

let currentRequestId = 0

const infiniteScroll: IntersectionObserverCallback = async ([entry]) => {
  if (entry?.isIntersecting && hasMore.value && !isLoading.value) {
    const element = entry.target as HTMLElement
    const ul = element.offsetParent
    const scrollTop = element?.offsetParent?.scrollTop ?? 0
    await loadOptions(debouncedSearch.value)
    await nextTick()
    if (ul) ul.scrollTop = scrollTop
  }
}

const loadOptions = async (search: string, isNewFetch = false) => {
  const requestId = ++currentRequestId

  localLoading.value = true

  const isFirstLoad = page.value === 0

  try {
    const { options: resOptions, hasMore: resHasMore } = await fetchOptions(search, page.value)

    if (requestId !== currentRequestId) return

    if (isNewFetch) {
      options.value = resOptions
      page.value = 1
    } else {
      options.value = [...(options.value as TCommonSelectOptions<TOptionValue>[]), ...resOptions]
      page.value += 1
    }

    if (selectFirstOnDefault && isFirstLoad && options.value.length && !value.value) {
      value.value = (multiple ? [options.value[0]] : options.value[0]) as TIsMulti extends false
        ? TCommonSelectOptions<TOptionValue>
        : TCommonSelectOptions<TOptionValue>[]
    }

    hasMore.value = resHasMore
    await nextTick()
  } finally {
    if (requestId === currentRequestId) localLoading.value = false
  }
}

const handleSearch = (search: string) => {
  localLoading.value = true
  searchString.value = search
}

const onOpen = async () => {
  if (!options.value.length && (page.value < 1 || isFetchOnInit)) {
    await loadOptions(debouncedSearch.value)
  }
  if (hasMore.value && !isLoading.value) {
    await nextTick()
    if (loadMoreRef.value) observer.value?.observe(loadMoreRef.value)
  }
}

const onClose = () => {
  observer.value?.disconnect()
}

watch(debouncedSearch, async (newSearch) => {
  page.value = 0
  await loadOptions(newSearch, true)
  await nextTick()
  if (hasMore.value && loadMoreRef.value) {
    observer.value?.observe(loadMoreRef.value)
  }
})

onMounted(async () => {
  observer.value = new IntersectionObserver(infiniteScroll)
  if (!options.value.length && isFetchOnInit) {
    await loadOptions(debouncedSearch.value)
  }
})

watch(
  () => cacheUniqs?.join(','),
  (newVal, oldVal) => {
    if (newVal === oldVal) return
    page.value = 0
    resetField()
    options.value = []
    hasMore.value = false
    localLoading.value = false
    searchString.value = ''
    if (isFetchOnInit) loadOptions(debouncedSearch.value, true)
  }
)

onUnmounted(() => {
  observer.value?.disconnect()
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withPopper = (dropdownList: HTMLElement, component: any, { width }: { width: string }) => {
  dropdownList.style.width = width
  dropdownList.style.visibility = 'hidden'

  const popper = createPopper(component.$refs.toggle, dropdownList, {
    modifiers: [
      {
        name: 'offset',
        options: { offset: [0, -1] }
      },
      {
        name: 'preventOverflow',
        options: { padding: 1 }
      },
      {
        name: 'flip',
        options: { fallbackPlacements: ['top'] }
      }
    ]
  })

  requestAnimationFrame(() => {
    popper.update().then(() => {
      dropdownList.style.visibility = 'visible'
    })
  })

  return () => popper.destroy()
}
</script>

<template>
  <div class="common-select">
    <label v-if="label" class="text-primary mb-0 block font-medium">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <v-select
      @open="onOpen"
      @close="onClose"
      @option:selected="
        (selectedOption: TCommonSelectOptions<TOptionValue>) => emit('select', selectedOption)
      "
      :options="options"
      v-model="value"
      v-bind="otherProps"
      class="w-full"
      :class="{ 'is-invalid': !!(errorMessage || additionalErrorMessage) }"
      :searchable="searchable && !disabled"
      @search="handleSearch"
      :clearSearchOnSelect="true"
      :clearSearchOnBlur="() => true"
      :appendToBody="appendToBody"
      :calculate-position="withPopper"
      :multiple="multiple"
      :placeholder
      :clearable
      :disabled
      :closeOnSelect="!multiple"
    >
      <template #no-options>
        <div v-if="!isLoading" class="p-1">Không có dữ liệu</div>
        <div v-else class="h-0"></div>
      </template>
      <template #list-footer v-if="!!hasMore || isLoading">
        <div class="flex h-8 items-center justify-center" ref="loadMoreRef">
          <IcLoading />
        </div>
      </template>
    </v-select>

    <Message
      v-if="!!(additionalErrorMessage || errorMessage)"
      severity="error"
      size="small"
      variant="simple"
    >
      {{ errorMessage ?? additionalErrorMessage }}
    </Message>
  </div>
</template>

<style scoped>
::v-deep(.v-select.is-invalid .vs__dropdown-toggle) {
  border-color: var(--p-inputtext-invalid-border-color) !important;
}
::v-deep(.v-select.is-invalid .vs__dropdown-toggle:hover) {
  border-color: var(--p-inputtext-hover-border-color) !important;
}
::v-deep(.v-select .vs__dropdown-toggle:hover) {
  border-color: var(--p-inputtext-hover-border-color) !important;
}
::v-deep(.v-select.is-invalid .vs__dropdown-toggle:focus) {
  border-color: var(--p-inputtext-focus-border-color) !important;
}
::v-deep(.v-select.vs--open .vs__dropdown-toggle) {
  border-color: var(--p-inputtext-focus-border-color) !important;
}
::v-deep(.v-select .vs__selected-options) {
  display: flex;
  gap: 4px;
  align-items: center;
  padding-left: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-wrap: wrap;
}
::v-deep(.v-select) {
  background: var(--p-inputtext-background);
}
::v-deep(.v-select .vs__dropdown-toggle) {
  padding-block: var(--p-inputtext-padding-y);
  padding-inline: var(--p-inputtext-padding-x);
}
::v-deep(.v-select .vs__search) {
  margin: 0;
  padding: 0;
  line-height: normal;
}
::v-deep(.v-select .vs__selected) {
  margin: 0;
  line-height: normal;
  padding-left: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
::v-deep(.v-select.vs--multiple .vs__selected) {
  margin: 0;
  line-height: normal;
  padding-left: 0.25rem;
  border-radius: 4px;
  border: 0;
  background-color: var(--p-surface-200);
}
::v-deep(.v-select .vs__actions) {
  padding: 0;
}
</style>
