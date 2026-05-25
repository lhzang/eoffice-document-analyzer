<script setup lang="ts">
import AppSearch from '@/shared/components/AppSearch.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import InternalStaffSelect from '@/shared/components/organization/unit/InternalStaffSelect.vue'
import type { TStaffSelectValue } from '@/shared/models/organization/unit'
import { toastSucceed } from '@/shared/utils/common'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { computed, ref } from 'vue'
import { useGrantGlobalRegisterAndApproveCarPermission } from '../composables/queries/carDelagation/useGrantGlobalRegisterAndApproveCarPermission'
import { useRevokeGlobalRegisterAndApproveCarPermission } from '../composables/queries/carDelagation/useRevokeGlobalRegisterAndApproveCarPermission'
import { APPROVE_AND_REGISTER_PERMISSIONS } from '../constants/carDelagation'
import { CAR_TYPES } from '../constants/carType'
import type {
  TCarConfigRegisterAndApprovePermissions,
  TCarGlobalApproveAndRegister,
  TCarPermissionUser
} from '../models/carDelagation'

type TProps = {
  registerAndApproveStaffsData: TCarConfigRegisterAndApprovePermissions[]
}
const props = defineProps<TProps>()

const emit = defineEmits<{
  (e: 'updatedConfig'): void
}>()
const isVisible = ref(false)

const carType = ref<TCarGlobalApproveAndRegister | null>(null)
const search = ref<string>('')
const unitId = ref<string | null>(null)
const handleSearch = (searchString: string) => {
  search.value = searchString
}

const confirm = useConfirm()

const carLabel = computed(() => {
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.approveStaff) return 'Duyệt xe cán bộ'
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.approveGuest) return 'Duyệt xe khách'
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.registerCollaborator)
    return 'Đăng ký xe thỉnh giảng/CTV'
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.registerUni) return 'Đăng ký xe đại học'
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.registerStudent)
    return 'Đăng ký xe người học'
  return ''
})

const convertedCarType = computed(() => {
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.approveStaff) return CAR_TYPES.staff
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.approveGuest) return CAR_TYPES.guest
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.registerCollaborator)
    return CAR_TYPES.collaborator
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.registerUni) return CAR_TYPES.university
  if (carType.value === APPROVE_AND_REGISTER_PERMISSIONS.registerStudent) return CAR_TYPES.student
  return null
})

const { mutate: updatePermissionConfig, isPending: isUpdatingConfig } =
  useGrantGlobalRegisterAndApproveCarPermission({
    onSuccess: () => {
      toastSucceed({ detail: 'Phân quyền duyệt và đăng ký thành công' })
      emit('updatedConfig')
    }
  })
const { mutate: revokePermission, isPending: isRevokingPermission } =
  useRevokeGlobalRegisterAndApproveCarPermission({
    onSuccess: () => {
      toastSucceed({ detail: 'Thu hồi quyền duyệt và đăng ký thành công' })
      emit('updatedConfig')
    }
  })

const displayCurrentPermissionStaffs = computed(() => {
  return (
    props?.registerAndApproveStaffsData?.find(
      (permisison) => permisison?.permission?.value === carType?.value
    )?.users ?? []
  )
})

const filterDisplayCurrentPermissionStaffs = computed(() =>
  displayCurrentPermissionStaffs?.value?.filter((staff) =>
    staff?.displayName.toLowerCase()?.includes(search?.value?.trim().toLowerCase())
  )
)

const handleOpendModal = (selectedType: TCarGlobalApproveAndRegister, selectedUnit: string) => {
  isVisible.value = true
  unitId.value = selectedUnit
  carType.value = selectedType
}

const handleCloseModal = () => {
  isVisible.value = false
  unitId.value = null
}

const handleSubmitAddStaff = (submitValue: TStaffSelectValue[] | null) => {
  const newStaffIds = (submitValue ?? [])
    ?.map((staff) => staff?.positionId)
    ?.filter(
      (staff) =>
        !displayCurrentPermissionStaffs?.value?.some((oldStaff) => oldStaff?.positionId === staff)
    )
  if (!newStaffIds?.length) return
  handelShowConfirmUpdateConfig(newStaffIds)
}

const handelShowConfirmUpdateConfig = (newStaffIds: string[]) => {
  confirm.require({
    group: 'configPermission',
    message: `Thầy/Cô có xác nhận cập nhật danh sách cán bộ ${carLabel.value?.toLowerCase()}?`,
    header: 'Cập nhật quyền',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    },
    accept: () => {
      if (!convertedCarType.value || !unitId.value) return
      // const oldValues = displayCurrentPermissionStaffs?.value?.map((staff) => staff?.positionId)
      updatePermissionConfig({
        unitId: unitId.value,
        carType: convertedCarType.value,
        staffIds: newStaffIds
      })
    }
  })
}
const handelShowConfirmRevokeStaffPermission = (removedStaff: TCarPermissionUser) => {
  confirm.require({
    group: 'configPermission',
    message: `Thầy/Cô có xác nhận thu hồi quyền ${carLabel.value?.toLowerCase()} của cán bộ ${removedStaff.displayName}?`,
    header: 'Thu hồi quyền',
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
      if (!convertedCarType.value || !unitId.value) return
      revokePermission({
        staffId: removedStaff?.positionId,
        unitId: unitId.value,
        carType: convertedCarType.value
      })
    }
  })
}

defineExpose({
  openModal: handleOpendModal,
  closeModal: handleCloseModal
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    :footer="false"
    :wrapper-style="{ width: '600px', overflow: 'hidden' }"
    :classContent="'!overflow-hidden !pt-0 !p-0 h-full'"
    :title="`${carLabel}`"
  >
    <div class="relative h-full p-4">
      <div class="mb-4 flex items-center justify-between">
        <AppSearch
          class="border-surface-300 inline-flex h-10 w-full items-center rounded-none! rounded-l-sm! border bg-white px-2 py-1"
          placeholder="Tìm kiếm cán bộ theo tên"
          @search="handleSearch"
        />
        <InternalStaffSelect
          v-if="!!unitId"
          hide-label
          :is-select-multiple="true"
          type="DECENDANT"
          :root-unit-id="unitId"
          :default-value="displayCurrentPermissionStaffs"
          :check-if-staff-disabled="
            (staff) =>
              displayCurrentPermissionStaffs?.some(
                (oldStaff) => oldStaff?.positionId === staff?.positionId
              )
          "
          @submit="handleSubmitAddStaff"
        >
          <template #triggerElement="{ onClick }">
            <Button
              @click="onClick"
              :loading="isUpdatingConfig"
              class="h-10 shrink-0 rounded-none! rounded-r-md!"
              >Thêm mới</Button
            >
          </template>
        </InternalStaffSelect>
      </div>
      <div class="mt-6 flex h-[300px] w-full flex-col gap-2 overflow-auto">
        <tepmplate v-if="filterDisplayCurrentPermissionStaffs?.length">
          <div
            v-for="(staff, idx) in filterDisplayCurrentPermissionStaffs"
            :key="idx"
            class="flex w-full items-center justify-between gap-4 rounded-md border border-slate-500/20 bg-white p-2 inset-shadow-sm"
          >
            <span class="text-primary font-semibold">{{ staff?.displayName }}</span>
            <Button
              variant="outlined"
              severity="danger"
              :loading="isRevokingPermission"
              @click="handelShowConfirmRevokeStaffPermission(staff)"
            >
              <span class="icon-[streamline--recycle-bin-2-remix]"></span>
            </Button>
          </div>
        </tepmplate>
        <div v-else class="flex h-full w-full items-center justify-center font-semibold">
          Chưa có dữ liệu
        </div>
      </div>
    </div>
    <ConfirmDialog group="configPermission" />
  </AppModal>
</template>
