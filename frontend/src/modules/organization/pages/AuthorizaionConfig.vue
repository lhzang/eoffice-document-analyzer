<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useTemplateRef } from 'vue'
import ModalAddAuthorization from '../components/ModalAddAuthorization.vue'
import ModalEditAuthorization from '../components/ModalEditAuthorization.vue'
import { useDeleteRole } from '../composables/queries/useDeleteRole'
import { useGetListRoles } from '../composables/queries/useGetListRoles'

type TAddModalRef = InstanceType<typeof ModalAddAuthorization>
type TEditModalRef = InstanceType<typeof ModalEditAuthorization>

const addModalRef = useTemplateRef<TAddModalRef | null>('addModalRef')
const editModalRef = useTemplateRef<TEditModalRef | null>('editModalRef')

const confirm = useConfirm()

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
    header: 'Vai trò',
    field: 'title',
    customSlot: 'titleSlot'
  },
  {
    header: 'Mô tả',
    field: 'description'
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

const { tablePagination, updateCurrentPage } = usePagination({
  isMemorizedPage: true,
  pageSize: 50
})

const { mutate: deleteRole, isPending: isDeletingRole } = useDeleteRole({
  onSuccess: () => {
    toastSucceed({
      detail: 'Xóa vai trò thành công'
    })
    refetch()
  }
})

const { data, isLoading, refetch } = useGetListRoles(() =>
  cleanObject({
    size: tablePagination.value.pageSize,
    page: tablePagination.value.current,
    sort: []
  })
)

const handleOpenEditModal = (id: string) => {
  editModalRef?.value?.openModal(id)
}

const handleDeleteRole = (id: string) => {
  confirm.require({
    group: 'deleteRole',
    message: 'Thầy/Cô có xác nhận xóa vai trò?',
    header: 'Xóa vai trò',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      deleteRole(id)
    }
  })
}
</script>
<template>
  <div>
    <div class="card">
      <div class="flex flex-col items-end">
        <Button severity="primary" variant="contained" @click="addModalRef?.openModal()"
          >Thêm vai trò</Button
        >
        <div class="mt-10 italic">
          <span class="text-red-500">*</span> Các vai trò không thể xóa
        </div>
      </div>
      <AppTable
        class="mt-2"
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
        <template #titleSlot="{ data }">
          <span
            >{{ data?.title
            }}<span v-if="data?.type !== 'CUSTOM'"
              >(<span class="font-bold text-red-500">*</span>)</span
            ></span
          >
        </template>
        <template #tableAction="{ data }">
          <div class="item flex items-center justify-end gap-2">
            <Button
              v-tippy="'Sửa vai trò'"
              class="flex items-center gap-2"
              @click="handleOpenEditModal(data?.id)"
              variant="outlined"
              severity="info"
              :disabled="isDeletingRole"
              icon="icon-[bx--edit]"
            >
            </Button>
            <Button
              v-tippy="'Xoá vai trò'"
              class="flex items-center gap-2"
              variant="outlined"
              severity="danger"
              @click="handleDeleteRole(data?.id)"
              :disabled="isDeletingRole"
              icon="icon-[streamline--recycle-bin-2-remix]"
            >
            </Button>
          </div>
        </template>
      </AppTable>
      <ModalAddAuthorization ref="addModalRef" @created-role="refetch" />
      <ModalEditAuthorization ref="editModalRef" @updated-role="refetch" />
      <ConfirmDialog group="deleteRole" />
    </div>
  </div>
</template>
