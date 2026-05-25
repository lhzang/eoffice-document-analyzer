<script setup lang="ts">
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import type { StaffVM, UnitInfoVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { cleanObject } from '@/shared/utils/common'
import { Button } from 'primevue'
import { computed, ref } from 'vue'
import { useGetListAllAccounts } from '../composables/queries/useGetListAllAccounts'
import AddStaffInUnitItem from './AddStaffInUnitItem.vue'
import ModalAddNewStaffIntoUnit from './ModalAddNewStaffIntoUnit.vue'

type TModalAddStaffRef = InstanceType<typeof ModalAddNewStaffIntoUnit>

type TProps = {
  parentUnitId: string
  unitDetails: UnitInfoVM
  unitTreeData: TTreeUnitWithStaffNode
}

const emit = defineEmits<{
  (e: 'addedUser'): void
}>()

const { parentUnitId, unitDetails, createPositionPermission } = defineProps<TProps>()
const userPermission = useUserProfileStore().user?.currentPermission
const modalAddStaffRef = ref<TModalAddStaffRef | null>(null)
const search = ref<string>('')
const editingStaffId = ref<string>()
const handleSearch = (searchString: string) => {
  search.value = searchString
}

const columns = [
  {
    field: 'display',
    customSlot: 'displaySlot'
  }
]

const filterParams = computed(() =>
  cleanObject({
    search: search
  })
)

const { tablePagination, updateCurrentPage } = usePagination({
  pageSize: 50,
  otherMemoParams: filterParams
})

const { data, isLoading, refetch } = useGetListAllAccounts(() =>
  cleanObject({
    size: tablePagination.value.pageSize,
    page: tablePagination.value.current,
    sort: [],
    search: search?.value?.trim() || undefined
  })
)

const handleToggleStaffClick = (staff: StaffVM) => {
  // if (staff?.positions?.some((position) => position?.unitId === parentUnitId))
  //   return toastWarning({ detail: 'Nhân sự đã thuộc đơn vị' })
  if (staff?.id && staff?.id !== editingStaffId?.value) {
    editingStaffId.value = staff?.id
  } else {
    editingStaffId.value = undefined
  }
}

const handleWhenAddedUser = () => {
  emit('addedUser')
}
const handleOpenAddModal = () => {
  modalAddStaffRef?.value?.openModal({ id: parentUnitId, name: unitDetails?.name })
}
</script>
<template>
  <div>
    <!-- search -->
    <div class="item-center flex w-full! justify-between gap-4">
      <AppFilterBarWithSearch
        class="flex flex-1 items-center justify-end gap-2"
        placeholder="Tìm kiếm cán bộ"
        :search-bar-class="'w-full flex-1'"
        @search="handleSearch"
      >
        <template #postAdditionalSlot>
          <Button
            v-if="userPermission?.includes(APP_PERMISSION_VALUES.manageAccount)"
            label="Thêm mới"
            variant="contained"
            @click="handleOpenAddModal"
          />
        </template>
      </AppFilterBarWithSearch>
    </div>
    <!--table-->
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
      :pt="{
        thead: {
          class: 'hidden!'
        }
      }"
    >
      <template #displaySlot="{ data }">
        <AddStaffInUnitItem
          @staff-click="handleToggleStaffClick"
          :staff="data"
          :editing-staff-id="editingStaffId"
          :unitTreeData
          :parent-unit-id="parentUnitId"
          @addedUser="handleWhenAddedUser"
        />
      </template>
    </AppTable>
    <ModalAddNewStaffIntoUnit ref="modalAddStaffRef" @create-staff="handleWhenAddedUser" />
  </div>
</template>
