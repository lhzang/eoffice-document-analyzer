<script setup lang="ts">
import AppSearch from '@/shared/components/AppSearch.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import InternalStaffSelect from '@/shared/components/organization/unit/InternalStaffSelect.vue'
import type { TStaffSelectValue } from '@/shared/models/organization/unit'
import { toastSucceed } from '@/shared/utils/common'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { computed, ref } from 'vue'
import { useGrantGlobalViewCarPermission } from '../composables/queries/carDelagation/useGrantGlobalViewCarPermission'
import { useRevokeGlobalViewCarPermission } from '../composables/queries/carDelagation/useRevokeGlobalViewCarPermission'
import { CAR_TYPES } from '../constants/carType'
import type {
  TCarConfigViewAndDeletePermissions,
  TCarPermissionUser
} from '../models/carDelagation'
import type { TCarType } from '../models/common'

type TProps = {
  viewCarStaffsData: TCarConfigViewAndDeletePermissions[]
}

const props = defineProps<TProps>()

const emit = defineEmits<{
  (e: 'updatedConfig'): void
}>()
const isVisible = ref(false)
const carType = ref<TCarType | null>(null)
const search = ref<string>('')
const handleSearch = (searchString: string) => {
  search.value = searchString
}

const confirm = useConfirm()

const { mutate: updatePermissionConfig, isPending: isUpdatingConfig } =
  useGrantGlobalViewCarPermission({
    onSuccess: () => {
      toastSucceed({ detail: 'Phân quyền xem xe toàn hệ thống thành công' })
      emit('updatedConfig')
    }
  })
const { mutate: revokePermission, isPending: isRevokingPermission } =
  useRevokeGlobalViewCarPermission({
    onSuccess: () => {
      toastSucceed({ detail: 'Thu hồi quyền xem xe toàn hệ thống thành công' })
      emit('updatedConfig')
    }
  })

const displayCurrentPermissionStaffs = computed(() => {
  return (
    props?.viewCarStaffsData?.find((permisison) => permisison?.permission?.value === carType?.value)
      ?.users ?? []
  )
})

const filterDisplayCurrentPermissionStaffs = computed(() =>
  displayCurrentPermissionStaffs?.value?.filter((staff) =>
    staff?.displayName.toLowerCase()?.includes(search?.value?.trim().toLowerCase())
  )
)

const carLabel = computed(() => {
  if (carType.value === CAR_TYPES.staff) return 'cán bộ'
  if (carType.value === CAR_TYPES.guest) return 'khách'
  if (carType.value === CAR_TYPES.collaborator) return 'thỉnh giảng/CTV'
  if (carType.value === CAR_TYPES.university) return 'đại học'
  if (carType.value === CAR_TYPES.student) return 'người học'
  return ''
})

const handleOpendModal = (selectedType: TCarType) => {
  isVisible.value = true
  carType.value = selectedType
}

const handleCloseModal = () => {
  isVisible.value = false
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
    group: 'configViewPermissionOrgCar',
    message: 'Thầy/Cô có xác nhận cập nhật danh sách cán bộ xem xe toàn tổ chức?',
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
      if (!carType.value) return
      updatePermissionConfig({
        carType: carType.value,
        staffIds: newStaffIds
      })
    }
  })
}
const handelShowConfirmRevokeStaffPermission = (removedStaff: TCarPermissionUser) => {
  confirm.require({
    group: 'configViewPermissionOrgCar',
    message: `Thầy/Cô có xác nhận thu hồi quyền xem xe toàn tổ chức của cán bộ ${removedStaff.displayName}?`,
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
      if (!carType?.value) return
      revokePermission({
        staffId: removedStaff?.positionId,
        carType: carType.value
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
    :title="`Xem xe ${carLabel}`"
  >
    <div class="relative h-full p-4">
      <div class="mb-4 flex items-center justify-between">
        <AppSearch
          class="border-surface-300 inline-flex h-10 w-full items-center rounded-none! rounded-l-sm! border bg-white px-2 py-1"
          placeholder="Tìm kiếm cán bộ theo tên"
          @search="handleSearch"
        />
        <InternalStaffSelect
          hide-label
          :is-select-multiple="true"
          type="FULL"
          @submit="handleSubmitAddStaff"
          :default-value="displayCurrentPermissionStaffs"
          :check-if-staff-disabled="
            (staff) =>
              displayCurrentPermissionStaffs?.some(
                (oldStaff) => oldStaff?.positionId === staff?.positionId
              )
          "
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
      <div
        v-if="filterDisplayCurrentPermissionStaffs?.length"
        class="mt-6 flex h-[300px] w-full flex-col gap-2 overflow-auto"
      >
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
      </div>
    </div>
    <ConfirmDialog group="configViewPermissionOrgCar" />
  </AppModal>
</template>
