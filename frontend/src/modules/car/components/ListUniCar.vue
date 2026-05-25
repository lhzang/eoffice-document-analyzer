<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import type { ListUniversityCarVM } from '@/shared/services/api'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { Button, ConfirmDialog, useConfirm, type DataTableRowClickEvent } from 'primevue'
import { computed, ref } from 'vue'
import { useDeleteCar } from '../composables/queries/carActions/useDeleteCar'
import { useGetUniCarList } from '../composables/queries/carList/useGetUniCarList'
import type { TCarType } from '../models/common'
import ModalDetailCar from './ModalDetailCar.vue'

type TProps = {
  activeTab: TCarType
  searchValue: string
}
type TDetailCarModalRef = InstanceType<typeof ModalDetailCar>

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
    header: 'Biển số xe',
    field: 'licensePlate'
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

const { activeTab, searchValue } = defineProps<TProps>()

const modalDetailCarModalRef = ref<TDetailCarModalRef | null>(null)

const tabIncludedFilterParams = computed(() =>
  cleanObject({
    search: searchValue,
    tab: activeTab
  })
)

const { tablePagination, updateCurrentPage } = usePagination({
  isMemorizedPage: true,
  pageSize: 50,
  otherMemoParams: tabIncludedFilterParams
})

const queryClient = useQueryClient()
const confirm = useConfirm()
const { data, isLoading } = useGetUniCarList(
  () =>
    cleanObject({
      size: tablePagination.value.pageSize,
      page: tablePagination.value.current,
      sort: ['id,desc']
    }),
  () => (searchValue?.trim() ? searchValue : '')
)

const { mutate: deleteUniCar, isPending: isDeletingCar } = useDeleteCar({
  onSuccess: () => {
    toastSucceed({ detail: 'Xoá đăng ký xe thành công' })
    queryClient.invalidateQueries({ queryKey: ['getUniCarList'] })
  }
})

const confirmDeleteUniCar = (car: ListUniversityCarVM) => {
  confirm.require({
    group: 'confirmDeleteInListUniCar',
    message: `Sau khi xóa, xe sẽ không thể ra vào Đại học. Thầy/Cô có chắc chắn muốn xóa?`,
    header: 'Xóa đăng ký xe',
    data: car,
    accept: () => {
      deleteUniCar(car?.id)
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

const handleRowClick = (event: DataTableRowClickEvent<ListUniversityCarVM>) => {
  modalDetailCarModalRef?.value?.openModal(event.data.id, 'UNIVERSITY')
}
</script>

<template>
  <AppTable
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
    @row-click="handleRowClick"
  >
    <template #order="{ index }">
      <span>{{
        (data?.page ?? 0) * (data?.pageSize ?? tablePagination.pageSize) + index + 1
      }}</span>
    </template>
    <template #tableAction="{ data }">
      <div class="flex items-center justify-end gap-2" v-if="data.canDelete">
        <Button
          variant="contained"
          @click="() => confirmDeleteUniCar(data)"
          severity="danger"
          class="flex items-center gap-2"
          :loading="isDeletingCar"
        >
          Xoá
          <span class="icon-[streamline--recycle-bin-2-remix]"></span>
        </Button>
      </div>
    </template>
  </AppTable>
  <ConfirmDialog group="confirmDeleteInListUniCar" class="w-[300px]">
    <template #message="{ message }">
      <div>
        <div class="mb-4 text-lg font-semibold text-red-500">{{ message?.message }}</div>
        <div>
          <span class="text-primary font-semibold">Biển số xe : </span
          >{{ (message?.data as ListUniversityCarVM)?.licensePlate }}
        </div>
      </div>
    </template>
  </ConfirmDialog>
  <ModalDetailCar ref="modalDetailCarModalRef" />
</template>
