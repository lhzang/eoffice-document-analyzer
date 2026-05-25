<script setup lang="ts">
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTable from '@/shared/components/AppTable.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import { useGetListRelatedID } from '@/shared/composables/queries/indoc/useGetListRelatedID'
import { useGetListRelatedInternalDoc } from '@/shared/composables/queries/internaldoc/useGetListRelatedInternalDoc'
import { useGetListRelatedOD } from '@/shared/composables/queries/outdoc/useGetListRelatedOD'
import { usePagination } from '@/shared/composables/usePagination'
import {
  APP_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LIST,
  type TDocumentType
} from '@/shared/constants/document'
import type { TDocFiles, TResponseRelatedDoc } from '@/shared/models/document'
import sharedAdminDocumentTypeService from '@/shared/services/clerical/adminDocumentTypeServices'
import { cleanObject } from '@/shared/utils/common'
import { differenceBy, uniqBy } from 'lodash-es'
import type { DataTableSelectAllChangeEvent } from 'primevue'
import Calendar from 'primevue/calendar'
import Select from 'primevue/select'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import AppLongText from '../../AppLongText.vue'

const route = useRoute()

const baseColumns = [
  { header: 'Ký hiệu', field: 'documentCode' },
  { header: 'Trích yếu', field: 'subject', customSlot: 'subjectSlot' },
  { header: 'Người soạn thảo', field: 'creatorName', width: '200px' },
  { header: 'Ngày ban hành', field: 'issueDate' }
]

const columns = computed(() => baseColumns)

const props = defineProps<{
  files: TDocFiles[]
}>()

const emit = defineEmits<{
  (e: 'update:files', value: TDocFiles[]): void
}>()

const searchValue = ref<string>((route.query.search as string) || '')
const expectedDueDate = ref(new Date())
const selectedSource = ref<TDocumentType>(APP_DOCUMENT_TYPES.inDoc)
const selectedDocumentTypes = ref<TCommonSelectOptions<string>[]>([])

const tabIncludedFilterParams = computed(() => {
  const filters: Record<string, unknown> = { search: searchValue.value }
  if (selectedDocumentTypes.value.length > 0) {
    filters.documentTypes = selectedDocumentTypes.value.map((item) => item.value)
  }
  if (expectedDueDate.value) {
    filters.year = expectedDueDate.value.getFullYear()
  }
  return cleanObject(filters)
})

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: 5,
  otherMemoParams: tabIncludedFilterParams,
  isMemorizedPage: false
})

const { data: indocData, isLoading: loadIndocData } = useGetListRelatedID(
  () => ({
    page: tablePagination.value.current,
    size: tablePagination.value.pageSize,
    sort: []
  }),
  () => ({
    search: searchValue?.value,
    documentTypes: selectedDocumentTypes.value?.map((selectedOpts) => selectedOpts?.value),
    year: expectedDueDate.value?.getFullYear?.() ?? undefined
  }),
  { enabled: () => selectedSource.value === APP_DOCUMENT_TYPES.inDoc }
)

const { data: outdocData, isLoading: loatOutdocData } = useGetListRelatedOD(
  () => ({
    page: tablePagination.value.current,
    size: tablePagination.value.pageSize,
    sort: []
  }),
  () => ({
    search: searchValue?.value,
    documentTypes: selectedDocumentTypes.value?.map((selectedOpts) => selectedOpts?.value),
    year: expectedDueDate.value?.getFullYear?.() ?? undefined
  }),
  { enabled: () => selectedSource.value === APP_DOCUMENT_TYPES.outDoc }
)

const { data: internalData, isLoading: loadInternalData } = useGetListRelatedInternalDoc(
  () => ({
    page: tablePagination.value.current,
    size: tablePagination.value.pageSize,
    sort: []
  }),
  () =>
    cleanObject({
      search: searchValue?.value,
      documentTypes: selectedDocumentTypes.value?.map((selectedOpts) => selectedOpts?.value),
      year: expectedDueDate.value?.getFullYear?.() ?? undefined
    }),
  { enabled: () => selectedSource.value === APP_DOCUMENT_TYPES.internalDoc }
)

const selectedSourceState = computed(() => {
  switch (selectedSource.value) {
    case APP_DOCUMENT_TYPES.inDoc:
      return {
        data: indocData.value,
        isLoading: loadIndocData.value
      }
    case APP_DOCUMENT_TYPES.outDoc:
      return {
        data: outdocData.value,
        isLoading: loatOutdocData.value
      }
    case APP_DOCUMENT_TYPES.internalDoc:
      return {
        data: internalData.value,
        isLoading: loadInternalData.value
      }
    default:
      return {
        data: null,
        isLoading: false
      }
  }
})

const data = computed(() => selectedSourceState.value.data)
const isLoading = computed(() => selectedSourceState.value.isLoading)

const selectedRows = computed(() => {
  const docs = data.value?.docs ?? []
  if (!docs.length) return []
  const selectedSet = new Set(props.files.map((f) => f.id))
  return docs.filter((doc) => selectedSet.has(doc.id))
})
watchEffect(() => {
  console.log(selectedSourceState.value.data, 'selectedSourceState.value.data')
})
const selectionBinding = computed<TResponseRelatedDoc[]>({
  get: () => selectedRows.value,
  set: (val) => onSelectionChange(val)
})
const handleFetchDocumentTypeList = async (search: string, page: number) => {
  const result = await sharedAdminDocumentTypeService.getListTypes(
    cleanObject({
      page,
      size: 20,
      search
    })
  )
  return {
    options: result?.docs?.map((book) => ({
      label: book.name ?? '',
      value: book.id
    })),
    hasMore: page < result?.pageCount
  }
}

const handleSearch = (val?: string) => {
  searchValue.value = val || ''
}

const handleChange = (vals: TCommonSelectOptions<string | undefined>[]) => {
  selectedDocumentTypes.value = (vals ?? []).filter(
    (v): v is TCommonSelectOptions<string> => v.value !== undefined
  )
}

function onSelectionChange(newSelection: TResponseRelatedDoc[]) {
  console.log(newSelection, 'newSelection')
  const newFromDocFiles: TDocFiles[] = newSelection.map((row) => ({
    type: 'fromDoc',
    id: row.id,
    name: row.documentCode,
    docType: row?.documentType
  }))

  const prevFromDocFiles = props.files
  const visibleIds = new Set((data.value?.docs ?? []).map((d) => d.id))

  const keepOutsidePage = prevFromDocFiles.filter((file) => !visibleIds.has(file.id))
  const merged = [...keepOutsidePage, ...newFromDocFiles]
  emit('update:files', merged)
}

const handleSelectAllDocumentInPage = (e: DataTableSelectAllChangeEvent) => {
  const visible = data?.value?.docs ?? []
  if (e.checked) {
    selectionBinding.value = uniqBy(
      [...(selectionBinding.value ?? []), ...visible],
      (item) => `${item.id}_${item?.documentType}_doc`
    )
  } else {
    selectionBinding.value = differenceBy(selectionBinding.value ?? [], visible, 'id')
  }
}
</script>

<template>
  <div class="mt-5 w-full">
    <div class="mx-5 grid grid-cols-4 gap-4 lg:grid-cols-5">
      <div class="col-span-2">
        <label class="text-primary block font-medium">Nguồn văn bản</label>
        <Select
          v-model="selectedSource"
          :options="DOCUMENT_TYPE_LIST"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn nguồn văn bản"
          class="w-full"
        />
      </div>

      <AppSelect
        name="documentTypes"
        class="col-span-2"
        multiple
        :fetch-options="handleFetchDocumentTypeList"
        label="Loại văn bản"
        placeholder="Tất cả"
        searchable
        @change="handleChange"
      />
      <div class="w-full">
        <label class="text-primary block font-medium">Năm</label>
        <Calendar
          v-model="expectedDueDate"
          view="year"
          dateFormat="yy"
          :manualInput="false"
          class="inline-block w-full"
          :input-class="'w-full'"
        />
      </div>
      <div class="col-span-3 flex w-full justify-end lg:col-span-5">
        <AppFilterBarWithSearch
          class="flex w-full items-end justify-end gap-2"
          placeholder="Tìm kiếm theo tên từ khóa"
          :search-string="searchValue"
          @search="handleSearch"
        >
        </AppFilterBarWithSearch>
      </div>
    </div>

    <div class="mt-5 px-5">
      <AppTable
        class="mt-10"
        :data="data?.docs ?? []"
        selection-mode="multiple"
        :columns="columns"
        :loading="isLoading"
        :empty="data?.docs.length === 0"
        paginator
        :always-show-paginator="true"
        :totalRecords="data?.docCount"
        :lazy="true"
        :rows="tablePagination.pageSize"
        :rowsPerPageOptions="tablePagination.pageSizeOptions"
        :first="tablePagination.current * tablePagination.pageSize"
        v-model:selection="selectionBinding"
        @page="({ page, rows }) => updateCurrentPage(page, rows)"
        @update:rows="updatePageSize"
        @update:selection="(val) => onSelectionChange(Array.isArray(val) ? val : [])"
        :select-all="
          !!data?.docs?.length &&
          data?.docs?.every((doc) =>
            (selectionBinding ?? [])?.some((selected) => selected?.id === doc.id)
          )
        "
        @select-all-change="handleSelectAllDocumentInPage"
      >
        <template #indexCustom="{ index }">
          <span>{{ index + tablePagination.current * tablePagination.pageSize + 1 }}</span>
        </template>
        <template #subjectSlot="{ data }">
          <AppLongText :text="data.subject" :splice-length="230" />
        </template>
        <!-- <template #isInternalOrgIndoc="{ data }" v-if="selectedSource === APP_DOCUMENT_TYPES.inDoc">
          <Tippy v-if="!data.isInternalOrgIndoc" content="Văn bản đến trong nội bộ tổ chức">
            <div class="flex items-center justify-center">
              <img
                class="max-w-8"
                src="https://i.pinimg.com/736x/ee/fb/ef/eefbef3b5c4823a26374a64a91c1df25.jpg"
              />
            </div>
          </Tippy>
        </template> -->
      </AppTable>
    </div>
  </div>
</template>
