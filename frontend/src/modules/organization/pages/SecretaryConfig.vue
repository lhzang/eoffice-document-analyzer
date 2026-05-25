<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import InternalStaffSelect from '@/shared/components/organization/unit/InternalStaffSelect.vue'
import { usePagination } from '@/shared/composables/usePagination'
import type { TStaffSelectValue } from '@/shared/models/organization/unit'
import type {
  ConfigureSecretaryRequestIndocSecretaryModeEnum,
  ConfigureSecretaryRequestOutdocSecretaryModeEnum,
  LeaderSecretariesVM
} from '@/shared/services/api'
import { toastSucceed } from '@/shared/utils/common'
import { Button, ConfirmDialog, useConfirm, type ColumnProps } from 'primevue'
import { ref } from 'vue'
import ModalAddSecretary from '../components/ModalAddSecretary.vue'
import { useConfigSecretary } from '../composables/queries/useConfigSecretary'
import { useDeleteConfigSecretary } from '../composables/queries/useDeleteConfigSecretary'
import { useGetListSecretaryConfig } from '../composables/queries/useGetListSecretaryConfig'
import {
  SECRETARY_APPROVE_CONFIG_LABELS,
  SECRETARY_VIEW_INDOC_CONFIG_LABELS,
  type TSecretaryApproveConfig,
  type TSecretaryViewIndocConfig
} from '../constants/secretaryConfig'
import { handleGenApproveOpts, handleGenViewOpts } from '../utils/secretaryConfig'

type TModalAddSecretary = InstanceType<typeof ModalAddSecretary>

const addSecretaryRef = ref<TModalAddSecretary | null>(null)

const confirm = useConfirm()

const { mutate: addConfig, isPending: isAddingConfig } = useConfigSecretary({
  onSuccess: () => {
    toastSucceed({ detail: 'Cấu hình thư ký lãnh đạo thành công' })
    refetch()
  }
})

const { mutate: deleteConfig, isPending: isDeletingConfig } = useDeleteConfigSecretary({
  onSuccess: () => {
    toastSucceed({ detail: 'Xoá cấu hình thư ký lãnh đạo thành công' })
    refetch()
  }
})

const { tablePagination, updateCurrentPage } = usePagination({
  isMemorizedPage: true,
  pageSize: 50
})

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: LeaderSecretariesVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    header: 'Tên lãnh đạo',
    field: (data) => `${data?.leader?.positions?.[0]?.titleAbbr} ${data?.leader?.fullName}`,
    style: {
      width: '200px'
    }
  },
  {
    header: 'Thư ký',
    field: 'secretaries',
    customSlot: 'secretariesSlot',
    style: {
      width: '400px',
      maxWidth: '400px'
    }
  },
  {
    header: 'Quyền duyệt',
    field: 'approveConfig',
    customSlot: 'approveConfigSlot',
    style: {
      width: '250px'
    }
  },
  {
    header: 'Quyền xem văn bản',
    field: 'viewConfig',
    customSlot: 'viewConfigSlot',
    style: {
      width: '250px'
    }
  },
  {
    field: 'action',
    customSlot: 'actionSlot',
    style: {
      width: '100px'
    }
  }
]

const {
  data: listSecretaryConfig,
  isLoading: isGettingConfigList,
  refetch
} = useGetListSecretaryConfig(() => ({
  page: tablePagination?.value?.current,
  size: tablePagination?.value?.pageSize,
  sort: []
}))

const extractSecretariesData = (secretaryConfig: LeaderSecretariesVM): TStaffSelectValue[] => {
  return secretaryConfig?.secretaries?.map((secretary) => ({
    positionId: secretary?.positions?.[0]?.id,
    displayName: `${secretary?.positions?.[0]?.titleAbbr} ${secretary?.fullName}`
  }))
}

const confirmDeleteSecretaryConfig = (leaderId: string) => {
  confirm.require({
    message: 'Thầy/Cô có xoá cấu hình thư ký - lãnh đạo?',
    group: 'addSecretary',
    header: 'Xoá cấu hình',
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
      deleteConfig(leaderId)
    }
  })
}
</script>

<template>
  <div>
    <div class="card">
      <div class="flex items-center justify-between gap-4">
        <span class="text-xl font-semibold">Danh sách thư ký - lãnh đạo</span>
        <Button
          type="button"
          :label="'Thêm mới'"
          class="text-primary mb-4 inline-flex items-center gap-2 font-semibold"
          @click="addSecretaryRef?.openModal()"
        >
          <span class="icon-[gravity-ui--circle-plus-fill]"></span> Thêm mới
        </Button>
      </div>
      <AppTable
        class="mt-10"
        :data="listSecretaryConfig?.items ?? []"
        :columns="columns"
        :loading="isGettingConfigList"
        paginator
        :always-show-paginator="true"
        :totalRecords="listSecretaryConfig?.totalItems"
        :lazy="true"
        :rows="tablePagination.pageSize"
        @page="({ page, rows }) => updateCurrentPage(page, rows)"
        :first="tablePagination.current * tablePagination.pageSize"
      >
        <template #secretariesSlot="{ data }">
          <InternalStaffSelect
            type="FULL"
            hide-label
            class="max-w-full"
            :is-select-multiple="true"
            :disabled="isAddingConfig"
            placeholder="Chọn thư ký"
            :check-if-staff-disabled="
              (staff) => staff?.positionId === data?.leader?.positions?.[0]?.id
            "
            :model-value="extractSecretariesData(data)"
            @submit="
              (staffList) =>
                addConfig({
                  leaderId: data?.leader?.positions?.[0]?.id,
                  secretaryIds: staffList?.map((secretary) => secretary?.positionId) ?? [],
                  indocSecretaryMode:
                    data?.indocSecretaryMode as ConfigureSecretaryRequestIndocSecretaryModeEnum,
                  outdocSecretaryMode:
                    data?.outdocSecretaryMode as ConfigureSecretaryRequestOutdocSecretaryModeEnum
                })
            "
          />
        </template>
        <template #approveConfigSlot="{ data }">
          <AppSelect
            :name="`approveConfig_${data?.leader?.positions?.[0]?.id}`"
            :fetch-options="handleGenApproveOpts"
            :model-value="{
              label:
                SECRETARY_APPROVE_CONFIG_LABELS?.[
                  data?.outdocSecretaryMode as TSecretaryApproveConfig
                ],
              value: data?.outdocSecretaryMode
            }"
            :disabled="isAddingConfig"
            @select="
              (approveConfig) =>
                addConfig({
                  leaderId: data?.leader?.positions?.[0]?.id,
                  secretaryIds: data?.secretaries?.map(
                    (secretary) => secretary?.positions?.[0]?.id
                  ),
                  indocSecretaryMode:
                    data?.indocSecretaryMode as ConfigureSecretaryRequestIndocSecretaryModeEnum,
                  outdocSecretaryMode:
                    approveConfig?.value as ConfigureSecretaryRequestOutdocSecretaryModeEnum
                })
            "
          />
        </template>
        <template #viewConfigSlot="{ data }">
          <AppSelect
            :name="`viewConfigSlot_${data?.leader?.positions?.[0]?.id}`"
            :fetch-options="handleGenViewOpts"
            :disabled="isAddingConfig"
            :model-value="{
              label:
                SECRETARY_VIEW_INDOC_CONFIG_LABELS?.[
                  data?.indocSecretaryMode as TSecretaryViewIndocConfig
                ],
              value: data?.indocSecretaryMode
            }"
            @select="
              (viewConfig) =>
                addConfig({
                  leaderId: data?.leader?.positions?.[0]?.id,
                  secretaryIds: data?.secretaries?.map(
                    (secretary) => secretary?.positions?.[0]?.id
                  ),
                  indocSecretaryMode:
                    viewConfig?.value as ConfigureSecretaryRequestIndocSecretaryModeEnum,
                  outdocSecretaryMode:
                    data?.outdocSecretaryMode as ConfigureSecretaryRequestOutdocSecretaryModeEnum
                })
            "
          />
        </template>
        <template #actionSlot="{ data }">
          <div class="flex items-center gap-2">
            <Button
              @click="() => confirmDeleteSecretaryConfig(data?.leader?.positions?.[0]?.id)"
              severity="danger"
              variant="outlined"
              class="flex items-center gap-2"
              :disabled="isAddingConfig"
              :loading="isDeletingConfig"
            >
              <span class="icon-[streamline--recycle-bin-2-remix]"></span>
            </Button>
          </div>
        </template>
      </AppTable>
    </div>
    <ModalAddSecretary ref="addSecretaryRef" @add-secreatary-config="refetch" />
    <ConfirmDialog group="addSecretary" />
  </div>
</template>
