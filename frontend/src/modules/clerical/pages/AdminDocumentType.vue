<script setup lang="ts">
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import type { DocumentType } from '@/shared/services/api'
import { cleanObject, notifyError } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { Button, ConfirmDialog, useConfirm, useToast } from 'primevue'
import { computed, ref, useTemplateRef } from 'vue'
import AddNewAdminDocumentTypeModal from '../components/adminDocumentType/AddNewAdminDocumentTypeModal.vue'
import EditAdminDocTypeModal from '../components/adminDocumentType/EditAdminDocTypeModal.vue'
import { useDeleteAdminDocType } from '../composables/adminDocumentType/queries/useDeleteAdminDocType'
import { useGetListAdminDocTypes } from '../composables/adminDocumentType/queries/useGetListAdminDocTypes'

type TAddModalRef = InstanceType<typeof AddNewAdminDocumentTypeModal>
type TEditModalRef = InstanceType<typeof EditAdminDocTypeModal>

const searchValue = ref<string>()
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
    header: 'Tên loại văn bản',
    field: 'name'
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

const confirm = useConfirm()
const toast = useToast()

const queryClient = useQueryClient()

const modalAddNewTypeRef = useTemplateRef<TAddModalRef | null>('modalAddNewTypeRef')
const modalEditTypeRef = useTemplateRef<TEditModalRef | null>('modalEditTypeRef')

const { tablePagination, updateCurrentPage } = usePagination({
  isMemorizedPage: true,
  pageSize: 50,
  otherMemoParams: computed(() => cleanObject({ search: searchValue.value }))
})

const { data, isLoading, error } = useGetListAdminDocTypes(() =>
  cleanObject({
    size: tablePagination.value.pageSize,
    page: tablePagination.value.current,
    name: searchValue.value
  })
)

if (error?.value) {
  notifyError(error?.value, 'Có lỗi xảy ra khi lấy dữ liệu loại văn bản')
}

const { mutate, isPending: isDelettingType } = useDeleteAdminDocType({
  onSuccess: () => {
    toast.add({
      severity: 'success',
      life: APP_NOTI_TIME,
      summary: 'Xóa loại văn bản thành công'
    })
    queryClient.invalidateQueries()
  }
})

const handleOpenAddModal = () => {
  modalAddNewTypeRef?.value?.openModal()
}

const handleSearch = (val?: string) => {
  searchValue.value = val
}

const confirmDeleteDocType = (documentType: DocumentType) => {
  confirm.require({
    group: 'confirmDeleteDocumentType',
    message: `Thầy/Cô chắc chắn muốn xóa ${documentType?.name}?`,
    header: 'Xóa loại văn bản',
    accept: () => {
      if (documentType?.id) mutate(documentType?.id)
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

// watch(
//   () => route?.query?.search,
//   (searchParam) => {
//     searchValue.value = (searchParam as string) ?? ''
//     debouncedSearchValue.value = (searchParam as string) ?? ''
//   },
//   { immediate: true }
// )
</script>
<template>
  <div>
    <div>
      <div class="flex items-center justify-end">
        <AppFilterBarWithSearch
          class="flex items-center justify-end gap-2"
          placeholder="Tìm kiếm theo tên loại văn bản"
          :search-string="searchValue"
          @search="handleSearch"
        >
          <template #postAdditionalSlot>
            <Button label="Thêm mới" variant="contained" @click="handleOpenAddModal" />
          </template>
        </AppFilterBarWithSearch>
      </div>
    </div>
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
      <template #tableAction="{ data }">
        <div class="flex items-center justify-end gap-2">
          <Button
            variant="contained"
            @click="() => confirmDeleteDocType(data)"
            severity="danger"
            class="flex items-center gap-2"
            :loading="isDelettingType"
            :disabled="isDelettingType"
          >
            Xóa
            <span class="icon-[solar--trash-bin-minimalistic-outline]"></span>
          </Button>
          <Button
            variant="contained"
            severity="primary"
            class="flex items-center gap-2"
            @click="() => modalEditTypeRef?.openModal(data)"
          >
            Sửa
            <span class="icon-[eva--edit-2-outline]"></span
          ></Button>
        </div>
      </template>
    </AppTable>
    <AddNewAdminDocumentTypeModal ref="modalAddNewTypeRef" />
    <EditAdminDocTypeModal ref="modalEditTypeRef" />
    <ConfirmDialog group="confirmDeleteDocumentType" />
  </div>
</template>
