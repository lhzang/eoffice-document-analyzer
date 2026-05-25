<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type { StaffVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { Button, ConfirmDialog, useConfirm, type DataTableRowClickEvent } from 'primevue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDeleteStaff } from '../composables/queries/useDeleteStaff'
import { useGetListAccount } from '../composables/queries/useGetListAccount'

type TProps = {
  searchValue: string
}

const emit = defineEmits<{
  (e: 'staffDeleted'): void
}>()

const { searchValue } = defineProps<TProps>()
const router = useRouter()

const currentUserPermission = useUserProfileStore().user?.currentPermission

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
    header: 'Họ tên',
    field: 'fullName'
  },
  {
    header: 'Vị trí',
    field: 'postions',
    customSlot: 'postionsSlot'
  },
  {
    header: 'Đơn vị',
    field: 'units',
    customSlot: 'unitsSlot'
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

const filterParams = computed(() =>
  cleanObject({
    search: searchValue
  })
)
const confirm = useConfirm()

const { tablePagination, updateCurrentPage } = usePagination({
  isMemorizedPage: true,
  pageSize: 50,
  otherMemoParams: filterParams
})
const { data, isLoading } = useGetListAccount(() =>
  cleanObject({
    size: tablePagination.value.pageSize,
    page: tablePagination.value.current,
    sort: [],
    search: searchValue?.trim() || undefined
  })
)

const { mutate: deleteStaff, isPending: isDeleting } = useDeleteStaff({
  onSuccess: () => {
    toastSucceed({
      detail: 'Xóa nhân sự thành công'
    })
    emit('staffDeleted')
  }
})

const confirmDeleteStaff = (staff: StaffVM) => {
  confirm.require({
    group: 'confirmDeleteStaff',
    header: 'Xoá nhân sự',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    data: staff,
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      deleteStaff(staff?.id)
    }
  })
}

const handleRowClick = (event: DataTableRowClickEvent<StaffVM>) => {
  router.push(`/organization/staff-manage/${event?.data?.id}`)
}
</script>
<template>
  <AppTable
    class="mt-10"
    :data="data?.items ?? []"
    :columns="columns"
    :loading="isLoading"
    paginator
    :always-show-paginator="true"
    :totalRecords="data?.totalItems"
    :lazy="true"
    :rows="tablePagination.pageSize"
    @page="({ page, rows }) => updateCurrentPage(page, rows)"
    :first="tablePagination.current * tablePagination.pageSize"
    @row-click="handleRowClick"
  >
    <template #order="{ index }">
      <span>{{
        (data?.pageNumber ?? 0) * (data?.pageSize ?? tablePagination.pageSize) + index + 1
      }}</span>
    </template>
    <template #postionsSlot="{ data }">
      <div class="font-semibold" v-for="(position, idx) in data?.positions" :key="idx">
        <span class="text-primary">{{ position?.title }}</span>
        <span v-if="position?.end && new Date(position?.end) < new Date()" class="text-red-500">
          (Đã hết nhiệm kỳ)</span
        >
      </div>
    </template>
    <template #unitsSlot="{ data }">
      <div class="font-semibold" v-for="(position, idx) in data?.positions" :key="idx">
        <span>{{ position?.unitName }}</span>
      </div>
    </template>
    <template #tableAction="{ data }">
      <div class="flex items-center justify-end gap-2">
        <Button
          variant="outlined"
          @click="router.push(`/organization/staff-manage/${data?.id}`)"
          severity="primary"
          class="flex items-center gap-2"
          :loading="isDeleting"
          v-if="
            checkIfUserHasPermission(
              currentUserPermission ?? [],
              APP_PERMISSION_VALUES.manageAccount
            )
          "
        >
          <span class="icon-[bx--edit]"></span>
        </Button>

        <Button
          @click="() => confirmDeleteStaff(data)"
          severity="danger"
          variant="outlined"
          class="flex items-center gap-2"
          :loading="isDeleting"
          v-if="
            checkIfUserHasPermission(
              currentUserPermission ?? [],
              APP_PERMISSION_VALUES.manageAccount
            )
          "
        >
          <span class="icon-[streamline--recycle-bin-2-remix]"></span>
        </Button>
      </div>
    </template>
  </AppTable>
  <ConfirmDialog group="confirmDeleteStaff" class="max-w-[540px]">
    <template #message="{ message }">
      <div>
        <div class="mb-4 text-center text-lg font-semibold text-red-500">
          Việc xoá nhân sự/nhiệm kỳ nhân sự sẽ gây lỗi đến các văn bản, công việc… liên quan tới
          nhân sự bị xoá!
        </div>
        <div class="mb-4 text-center text-lg font-semibold text-red-500">
          Thầy/Cô có chắc chắn muốn xóa nhân sự
          <span class="font-bold">{{ (message?.data as StaffVM)?.fullName || '' }}</span>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>
