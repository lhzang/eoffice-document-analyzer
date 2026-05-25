<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import { DOCUMENT_TYPES } from '@/shared/constants/document'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type { FlowSignTemplateVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { toastSucceed } from '@/shared/utils/common'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import {
  Button,
  ConfirmDialog,
  useConfirm,
  type ColumnProps,
  type DataTableRowClickEvent
} from 'primevue'
import { ref } from 'vue'
import ModalAddSignFlowConfig from '../components/ModalAddSignFlowConfig.vue'
import ModalEditSignFlowConfig from '../components/ModalEditSignFlowConfig.vue'
import { useDeleteSignFlowTemplate } from '../composables/queries/signFlow/useDeleteSignFlowTemplate'
import { useGetListAllSignTemplate } from '../composables/queries/signFlow/useGetListAllSignTemplate'

type TModalAddSignFlowConfigRef = InstanceType<typeof ModalAddSignFlowConfig>
type TModalEditSignFlowConfigRef = InstanceType<typeof ModalEditSignFlowConfig>

const modalAddSignFlowConfigRef = ref<TModalAddSignFlowConfigRef | null>(null)
const modalEditSignFlowConfigRef = ref<TModalEditSignFlowConfigRef | null>(null)

const confirm = useConfirm()
const userPermissions = useUserProfileStore().user?.currentPermission
const isAdmin = checkIfUserHasPermission(userPermissions ?? [], APP_PERMISSION_VALUES.systemManage)
const { data, isLoading, refetch } = useGetListAllSignTemplate()

const { mutate: deleteTemplate, isPending: isDeletingTemplate } = useDeleteSignFlowTemplate({
  onSuccess: () => {
    toastSucceed({ detail: 'Xóa mẫu trình tự ký thành công' })
    refetch()
  }
})

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: FlowSignTemplateVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    header: 'STT',
    field: 'order',
    customSlot: 'order',
    style: {
      width: '80px'
    }
  },
  {
    header: 'Tên mẫu',
    field: 'name'
  },
  {
    header: 'Số bước',
    field: (template) => (template?.stepsCount).toString()
  },
  {
    header: 'Loại trình tự ký',
    field: (template) =>
      template?.type === DOCUMENT_TYPES.internalDoc ? 'Văn bản nội bộ' : 'Văn bản đi'
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

const handleRowClick = (event: DataTableRowClickEvent<FlowSignTemplateVM>) => {
  modalEditSignFlowConfigRef?.value?.openModal(event.data)
}

const confirmDeleteTemplate = (template: FlowSignTemplateVM) => {
  confirm.require({
    group: 'confirmDeleteSignTemplate',
    header: 'Xoá mẫu trình tự ký',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    data: template,
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      deleteTemplate(template?.id)
    }
  })
}
</script>
<template>
  <div>
    <div class="card">
      <div class="flex items-center justify-between gap-4">
        <span class="text-xl font-semibold">Danh sách mẫu trình tự ký</span>
        <Button
          v-if="isAdmin"
          type="button"
          @click="modalAddSignFlowConfigRef?.openModal()"
          class="text-primary mb-4 inline-flex items-center gap-2 font-semibold"
        >
          Thêm mới
        </Button>
        <!-- placeholder for button -->
        <span v-else></span>
      </div>
      <AppTable
        class="mt-10"
        :data="data ?? []"
        :columns="columns"
        :loading="isLoading"
        :always-show-paginator="true"
        :totalRecords="data?.length"
        :lazy="true"
        :pt="{}"
        @row-click="handleRowClick"
      >
        <template #order="{ index }">
          <span>{{ index + 1 }}</span>
        </template>
        <template #tableAction="{ data }">
          <div v-if="isAdmin" class="flex items-center justify-end gap-2">
            <Button
              @click.stop="() => confirmDeleteTemplate(data)"
              severity="danger"
              variant="outlined"
              class="flex items-center gap-2"
              :loading="isDeletingTemplate"
            >
              <span class="icon-[streamline--recycle-bin-2-remix]"></span>
            </Button>
          </div>
        </template>
      </AppTable>
      <ModalAddSignFlowConfig ref="modalAddSignFlowConfigRef" @create-config="refetch" />
      <ModalEditSignFlowConfig ref="modalEditSignFlowConfigRef" />
      <ConfirmDialog group="confirmDeleteSignTemplate" class="max-w-[540px]">
        <template #message="{ message }">
          <div>
            <div class="mb-4 text-center text-lg font-semibold text-red-500">
              Thầy/Cô có chắc chắn muốn xóa
              <span class="font-bold">{{ (message?.data as FlowSignTemplateVM)?.name || '' }}</span>
            </div>
          </div>
        </template>
      </ConfirmDialog>
    </div>
  </div>
</template>
