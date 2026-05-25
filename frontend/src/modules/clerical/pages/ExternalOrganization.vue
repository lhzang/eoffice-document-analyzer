<script setup lang="ts">
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTable from '@/shared/components/AppTable.vue'
import EditExternalOrganizationModal from '@/shared/components/organization/unit/EditExternalOrganizationModal.vue'
import ModalAddExternalUnit from '@/shared/components/organization/unit/ModalAddExternalUnit.vue'
import { useGetListExternalUnit } from '@/shared/composables/queries/organization/unit/useGetListExternalUnits'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import { cleanObject, notifyError } from '@/shared/utils/common'
import { Button } from 'primevue'
import { computed, ref, useTemplateRef } from 'vue'

type TAddModalRef = InstanceType<typeof ModalAddExternalUnit>
type TEditModalRef = InstanceType<typeof EditExternalOrganizationModal>

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
    header: 'Tên cơ quan bên ngoài',
    field: 'name'
  },
  {
    header: 'Mã định danh',
    field: 'axisOrgId'
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

const modalAddNewTypeRef = useTemplateRef<TAddModalRef | null>('modalAddNewTypeRef')
const modalEditTypeRef = useTemplateRef<TEditModalRef | null>('modalEditTypeRef')

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  isMemorizedPage: true,
  pageSize: DEFAULT_PAGE_SIZE,
  otherMemoParams: computed(() => cleanObject({ search: searchValue.value }))
})

const isSortByName = ref(true)
const payload = computed(() =>
  cleanObject({
    page: tablePagination.value.current,
    size: tablePagination.value.pageSize,
    name: searchValue.value
  })
)

const { data, isLoading, error } = useGetListExternalUnit(payload, isSortByName)

if (error?.value) {
  notifyError(error?.value, 'Có lỗi xảy ra khi lấy dữ liệu loại văn bản')
}

const handleOpenAddModal = () => {
  modalAddNewTypeRef?.value?.openModal()
}

const handleSearch = (val?: string) => {
  searchValue.value = val
}
</script>
<template>
  <div>
    <div>
      <div class="flex items-center justify-end">
        <AppFilterBarWithSearch
          class="flex items-center justify-end gap-2"
          placeholder="Tìm kiếm theo tên cơ quan"
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
      :rowsPerPageOptions="tablePagination.pageSizeOptions"
      @update:rows="updatePageSize"
    >
      <template #order="{ index }">
        <span>{{
          (data?.pageNumber ?? 0) * (data?.pageSize ?? tablePagination.pageSize) + index + 1
        }}</span>
      </template>
      <template #tableAction="{ data }">
        <div v-if="data?.axisOrgId == null" class="flex items-center justify-end gap-2">
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
    <ModalAddExternalUnit ref="modalAddNewTypeRef" />
    <EditExternalOrganizationModal ref="modalEditTypeRef" />
  </div>
</template>
