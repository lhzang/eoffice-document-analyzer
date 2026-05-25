<script setup lang="ts">
import AppSearch from '@/shared/components/AppSearch.vue'
import AppTable from '@/shared/components/AppTable.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useGetRegisterNumber } from '@/shared/composables/queries/clerical/useGetRegisterNumber'
import { usePagination } from '@/shared/composables/usePagination'
import type { ListRegisteredKeepNumberVM } from '@/shared/services/api'
import { cleanObject } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { useDebounceFn } from '@vueuse/core'
import { Button, Message, type ColumnProps } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import z from 'zod'

const documentBookId = ref<string | null>(null)

const schema = z.object({
  outOrdinal: z.number().optional().nullable()
})

const { setFieldValue, values, handleReset, errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema)
})

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: ListRegisteredKeepNumberVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  { field: 'keepNumber', header: 'Số' },
  { field: 'reason', header: 'Lý do của việc đăng ký' },
  {
    field: (item) => (item?.title ? item?.title : '--'),
    header: 'Tiêu đề của văn bản sử dụng số giữ'
  }
]

const emit = defineEmits<{
  (e: 'numberSelect', number: number): void
}>()

const isVisible = ref(false)
const searchValue = ref<string>('')
const debouncedSearchValue = ref<string>('')

const handleSearch = (searchString: string) => {
  searchValue.value = searchString
}

const debouncedFn = useDebounceFn((newVal) => {
  debouncedSearchValue.value = newVal
}, 300)

watch(searchValue, (newValue) => {
  debouncedFn(newValue)
})

const handleVisibleChange = (value: boolean) => {
  if (!value) {
    reset()
  }
}

const { tablePagination, updateCurrentPage } = usePagination({
  pageSize: 10,
  isMemorizedPage: false,
  otherMemoParams: computed(() => ({
    search: debouncedSearchValue.value
  }))
})

const {
  data: listRegisteredNums,
  isLoading: isGettingRegisteredNums,
  isSuccess: isGetRegisteredNumSuccess
} = useGetRegisterNumber(
  () =>
    cleanObject({
      page: tablePagination.value.current,
      size: tablePagination.value.pageSize,
      sort: [],
      status: 'UNUSED',
      documentBookId: documentBookId.value!,
      search: debouncedSearchValue?.value
    }),
  { enabled: () => !!documentBookId.value }
)

const reset = () => {
  handleReset()
  documentBookId.value = null
  searchValue.value = ''
  debouncedSearchValue.value = ''
}

watch([listRegisteredNums, isGetRegisteredNumSuccess], ([listRegisteredNumsValue, isSuccess]) => {
  if (isSuccess) {
    if (listRegisteredNumsValue?.items?.length) {
      isVisible.value = true
      return
    }
  }
  handleCloseModal()
})

const handleStartCheck = (bookId: string) => {
  documentBookId.value = bookId
  // isVisible.value = true
}

const handleCloseModal = () => {
  isVisible.value = false
  reset()
}

const onSubmit = handleSubmit((values) => {
  if (values?.outOrdinal) {
    emit('numberSelect', values?.outOrdinal)
  }
  isVisible.value = false
})

defineExpose({
  startCheck: handleStartCheck,
  closeModal: handleCloseModal
})
</script>

<template>
  <AppModal
    v-model:visible="isVisible"
    @update:visible="handleVisibleChange"
    :footer="false"
    :wrapper-style="{ width: '640px', overflow: 'hidden' }"
    title="Danh sách số đã giữ"
  >
    <AppSearch
      class="border-surface-300 inline-flex h-10 w-full items-center rounded-none! rounded-l-sm! border bg-white px-2 py-1"
      placeholder="Tìm kiếm số đã giữ"
      @search="handleSearch"
    />
    <form @submit="onSubmit" class="mt-8">
      <AppTable
        :loading="isGettingRegisteredNums"
        :empty="!isGettingRegisteredNums && listRegisteredNums?.items.length === 0"
        :columns="columns"
        :data="listRegisteredNums?.items ?? []"
        paginator
        :always-show-paginator="false"
        :totalRecords="listRegisteredNums?.totalItems"
        :lazy="true"
        selectionMode="single"
        @row-select="(event) => setFieldValue('outOrdinal', event?.data?.keepNumber)"
        :model-value="values?.outOrdinal"
        :rows="tablePagination.pageSize"
        :first="tablePagination.current * tablePagination.pageSize"
        @page="({ page, rows }) => updateCurrentPage(page, rows)"
      />
      <Message v-if="!!errors?.outOrdinal" severity="error" size="small" variant="simple">
        {{ errors?.outOrdinal }}
      </Message>
      <div class="mt-2 flex h-10 items-center justify-end gap-2">
        <Button
          class="min-w-[100px]"
          label="Huỷ"
          severity="secondary"
          variant="outlined"
          @click="isVisible = false"
        />
        <Button type="submit" class="min-w-[100px]" label="Xác nhận" severity="primary" />
      </div>
    </form>
  </AppModal>
</template>
