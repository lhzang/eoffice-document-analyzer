<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { DOCUMENT_TYPE_LIST } from '@/shared/constants/document'
import type { TUnitSelectValue } from '@/shared/models/organization/unit'
import type { ListDocumentBooksVM } from '@/shared/services/api'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { computed, useTemplateRef } from 'vue'
import { useGetDocumentBooks } from '../../composables/documentBook/queries/useGetDocumentBooks'
import { useUnLockDocumentBook } from '../../composables/documentBook/queries/useUnLockDocumentBook'
import type { TDocumentBookStatus } from '../../model/documentBookType'
import ModalListDocInBook from './ModalListDocInBook.vue'

type TProps = {
  activeTab: TDocumentBookStatus
  searchValue?: string
  hasUnLockPerm: boolean
  selectedUnit: TUnitSelectValue
  hasViewDocPerm: boolean
}

type TModalListDocInBook = InstanceType<typeof ModalListDocInBook>

const columns = [
  {
    header: 'STT',
    field: 'order',
    customSlot: 'order',
    style: {
      width: '80px'
    }
  },
  {
    header: 'Tên sổ văn bản',
    field: 'name'
  },
  {
    header: 'Loại sổ văn bản',
    field: 'type',
    customSlot: 'type'
  },
  {
    header: 'Ký hiệu',
    field: 'shortName'
  },
  {
    field: 'action',
    customSlot: 'tableAction',
    style: {
      whiteSpace: 'nowrap',
      width: '1%'
    }
  }
]

const props = defineProps<TProps>()

const modalListDocInBookRef = useTemplateRef<TModalListDocInBook | null>('modalListDocInBookRef')

const confirm = useConfirm()
const queryClient = useQueryClient()

const tabIncludedFilterParams = computed(() =>
  cleanObject({
    search: props.searchValue,
    tab: props.activeTab,
    selectedUnit: props?.selectedUnit
  })
)

const { tablePagination, updateCurrentPage } = usePagination({
  isMemorizedPage: true,
  pageSize: 50,
  otherMemoParams: tabIncludedFilterParams
})
const { data, isLoading } = useGetDocumentBooks(
  () =>
    cleanObject({
      size: tablePagination.value.pageSize,
      page: tablePagination.value.current,
      search: props.searchValue,
      sort: []
    }),
  () => ({ unitId: props?.selectedUnit?.id, status: props.activeTab })
)

const { mutate: unLockBook, isPending: isUnLockingBook } = useUnLockDocumentBook({
  onSuccess: () => {
    toastSucceed({
      detail: 'Mở khoá sổ văn bản thành công'
    })
    queryClient.invalidateQueries({
      queryKey: ['getDocumentBooks']
    })
  }
})

const confirmUnLockDocBook = (documentBook: ListDocumentBooksVM) => {
  confirm.require({
    group: 'confirmProcessLockedDocumentBook',
    message: `Thầy/Cô chắc chắn muốn khóa sổ văn bản ${documentBook?.name}?`,
    header: 'Khóa sổ văn bản',
    accept: () => {
      if (documentBook?.id) unLockBook(documentBook?.id)
    },
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    }
  })
}
</script>

<template>
  <AppTable
    class="mt-10"
    :data="data?.docs ?? []"
    :columns="columns"
    :loading="isLoading"
    paginator
    :always-show-paginator="true"
    :totalRecords="data?.docCount"
    :lazy="true"
    :rows="tablePagination.pageSize"
    @page="({ page, rows }) => updateCurrentPage(page, rows)"
    :first="tablePagination.current * tablePagination.pageSize"
  >
    <template #order="{ index }">
      <span>{{
        (data?.page ?? 0) * (data?.pageSize ?? tablePagination.pageSize) + index + 1
      }}</span>
    </template>
    <template #type="{ data }">
      {{ DOCUMENT_TYPE_LIST?.find((type) => type.value === data?.type)?.label }}
    </template>
    <template #tableAction="{ data }">
      <div class="flex items-center justify-end gap-2">
        <Button
          v-if="props.hasViewDocPerm"
          variant="outlined"
          @click="() => modalListDocInBookRef?.openModal(data)"
          severity="primary"
          class="flex items-center gap-2"
          icon="icon-[mdi--eye]"
          label="Xem VB"
        >
        </Button>
        <Button
          v-if="props.hasUnLockPerm"
          variant="contained"
          @click="() => confirmUnLockDocBook(data)"
          severity="danger"
          class="flex items-center gap-2"
          :loading="isUnLockingBook"
          label="Mở khoá"
          icon="icon-[tabler--lock]"
        >
        </Button>
      </div>
    </template>
  </AppTable>
  <ConfirmDialog group="confirmProcessLockedDocumentBook" />
  <ModalListDocInBook ref="modalListDocInBookRef" v-if="props?.hasViewDocPerm" />
</template>
