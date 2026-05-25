<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { cleanObject, notifyError } from '@/shared/utils/common'
import { Button, ConfirmDialog } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref, useTemplateRef } from 'vue'
import AddNewRecordsCategory from '../components/AddNewRecordsCategory.vue'
import { useGetRecordCategoryList } from '../composables/useGetListRecordCategory'

type TAddModalRef = InstanceType<typeof AddNewRecordsCategory>
const searchValue = ref<string>()
const columns = [
  {
    header: 'Đơn vị lập',
    field: 'name'
  },
  {
    header: 'Tên đề mục',
    field: 'name'
  },
  {
    header: 'Tên đề mục lớn',
    field: 'name'
  },
  {
    header: 'Năm tạo',
    field: 'shortName'
  },
  {
    header: 'Nơi bảo quản',
    field: 'name'
  },
  {
    header: 'Thời gian bảo quản',
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

const modalAddNewTypeRef = useTemplateRef<TAddModalRef | null>('modalAddNewTypeRef')
const { values } = useForm({
  initialValues: {
    year: new Date()
  }
})
const { tablePagination, updateCurrentPage } = usePagination({
  isMemorizedPage: true,
  pageSize: 50,
  otherMemoParams: computed(() => cleanObject({ search: searchValue.value }))
})

const { data, isLoading, error } = useGetRecordCategoryList(() => ({
  query: cleanObject({
    searchText: searchValue.value,
    creationYear: values.year ? values.year.getFullYear() : undefined
  }),
  page: tablePagination.value.current,
  size: tablePagination.value.pageSize
}))

if (error?.value) {
  notifyError(error?.value, 'Có lỗi xảy ra khi lấy dữ danh mục hồ sơ')
}

const handleOpenAddModal = () => {
  modalAddNewTypeRef?.value?.openModal()
}
</script>
<template>
  <div>
    <div class="flex items-center justify-end"></div>
  </div>
  <AppTable
    class="mt-10"
    :data="data?.items ?? []"
    :columns="columns"
    :loading="isLoading"
    paginator
    :always-show-paginator="true"
    :totalRecords="data?.total ?? 0"
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
      <div class="flex justify-between">
        <AppDateInput
          placeholder="Chọn năm"
          name="year"
          label=""
          view="year"
          dateFormat="yy"
          :pt="{
            pcInputText: {
              root: 'w-20 text-center'
            }
          }"
        />
        <Button label="Thêm mới" variant="contained" @click="handleOpenAddModal" />
      </div>
    </template>
    <template #tableAction="{ data }">
      <div class="flex items-center justify-end gap-2"></div>
    </template>
  </AppTable>
  <AddNewRecordsCategory ref="modalAddNewTypeRef" />
  <ConfirmDialog />
</template>
