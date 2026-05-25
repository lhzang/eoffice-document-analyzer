<script setup lang="ts">
import EditAdminDocTypeModal from '@/modules/clerical/components/adminDocumentType/EditAdminDocTypeModal.vue'
import { useDeleteAdminDocType } from '@/modules/clerical/composables/adminDocumentType/queries/useDeleteAdminDocType'
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import type { DocumentType } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { cleanObject, notifyError } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { ConfirmDialog, useConfirm, useToast } from 'primevue'
import { computed, ref, useTemplateRef } from 'vue'
import AddNewRecordsCategory from '../components/AddNewRecordsCategory.vue'
import { useGetListRecords } from '../composables/useGetListRecords'

type TAddModalRef = InstanceType<typeof AddNewRecordsCategory>
type TEditModalRef = InstanceType<typeof EditAdminDocTypeModal>
const profileStore = useUserProfileStore()
console.log('profileStore: ', profileStore?.user)
const searchValue = ref<string>()
const columns = [
  {
    header: 'Đơn vị lập',
    field: 'name'
  },
  {
    header: 'Số hiệu hồ sơ',
    field: 'name'
  },
  {
    header: 'Tên đề hồ sơ',
    field: 'name'
  },
  {
    header: 'Tên đề mục',
    field: 'name'
  },
  {
    header: 'Người tạo',
    field: 'shortName'
  },
  {
    header: 'Lãnh đạo duyệt',
    field: 'name'
  },

  {
    header: 'Trạng thái',
    field: 'name'
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

// const { data, isLoading, error } = useGetListAdminDocTypes(() =>
//   cleanObject({
//     size: tablePagination.value.pageSize,
//     page: tablePagination.value.current,
//     name: searchValue.value
//   })
// )
const { data, isLoading, error } = useGetListRecords(() =>
  cleanObject({
    size: tablePagination.value.pageSize,
    page: tablePagination.value.current,
    name: searchValue.value
  })
)

if (error?.value) {
  notifyError(error?.value, 'Có lỗi xảy ra khi lấy dữ danh mục hồ sơ')
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
</script>
<template>
  <div>
    <div class="flex items-center justify-end"></div>
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
    <template #header>
      <div></div>
    </template>
  </AppTable>
  <AddNewRecordsCategory ref="modalAddNewTypeRef" />
  <EditAdminDocTypeModal ref="modalEditTypeRef" />
  <ConfirmDialog />
</template>
