<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'

import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'

import { useDebounceFn } from '@vueuse/core'

import { computed, ref, useTemplateRef, watch } from 'vue'

import ModalDetailInDoc from '@/modules/indoc/components/ModalDetailInDoc.vue'
import ModalDetailInternalDoc from '@/modules/internalDocument/components/modals/ModalDetailInternalDoc.vue'
import ModalDetailOutDoc from '@/modules/outDocument/components/modals/ModalDetailOutDoc.vue'
import AppLongText from '@/shared/components/AppLongText.vue'
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import type { SearchDocumentVM } from '@/shared/services/api'
import { fetchMoreDocumentTypeOptions } from '@/shared/utils/clerical/adminDocTypes.shared'
import { cleanObject, safeParseJson, toastSucceed } from '@/shared/utils/common'
import { pick } from 'lodash-es'
import { DateTime } from 'luxon'
import { Button, type ColumnProps, type DataTableRowClickEvent } from 'primevue'
import { useRoute } from 'vue-router'
import { useExportDocSearch } from '../conposables/queries/useExportDocSearch'
import { useGetDocSearch } from '../conposables/queries/useGetDocSearch'

type TModalDetailOutDocRef = InstanceType<typeof ModalDetailOutDoc>
type TModalDetailInternalDocRef = InstanceType<typeof ModalDetailInternalDoc>
type TModalDetailInDocRef = InstanceType<typeof ModalDetailInDoc>

type TDocType = 'INCOMING' | 'OUTGOING' | 'INTERNAL' | 'ALL'
type TSource = {
  label: string
  value: TDocType
}

const typeList = [
  {
    label: 'Văn bản đến',
    value: 'INCOMING' as TDocType
  },
  {
    label: 'Văn bản đi',
    value: 'OUTGOING' as TDocType
  },
  {
    label: 'Văn bản nội bộ',
    value: 'INTERNAL' as TDocType
  },
  {
    label: 'Tất cả văn bản',
    value: 'ALL' as TDocType
  }
]

const modalDetailOutDocRef = useTemplateRef<TModalDetailOutDocRef>('modalDetailOutDocRef')
const modalDetailInternalDocRef = useTemplateRef<TModalDetailInternalDocRef>(
  'modalDetailInternalDocRef'
)
const modalDetailInDocRef = useTemplateRef<TModalDetailInDocRef>('modalDetailInDocRef')

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: SearchDocumentVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    header: 'Số ký hiệu',
    field: 'documentNumber',
    style: {
      minWidth: '100px'
    }
  },
  {
    field: 'summary',
    header: 'Trích yếu nội dung',
    customSlot: 'summarySlot',
    style: {
      width: '400px'
    },
    bodyClass: 'break-words'
  },
  {
    field: (item) =>
      item.issuedDate ? DateTime.fromISO(item.issuedDate).toFormat('dd/MM/yyyy') : '',
    header: 'Ngày ban hành',
    style: {
      minWidth: '100px'
    }
  }
]
const route = useRoute()

const isExpanded = ref<boolean>(false)

const docSource = ref<TSource>(typeList?.find((opt) => opt?.value === 'ALL')!)
const selectedYear = ref(new Date())

const searchValue = ref<string>('')
const debouncedSearchValue = ref<string>('')
const debounceSearchdFn = useDebounceFn((newVal) => {
  debouncedSearchValue.value = newVal
}, 500)

//adddition

const issuer = ref<string>()
const debouncedIssuerValue = ref<string>('')
const debounceIssuerdFn = useDebounceFn((newVal) => {
  debouncedIssuerValue.value = newVal
}, 500)

const creator = ref<string>()
const debouncedCreatorValue = ref<string>('')
const debounceCreatorFn = useDebounceFn((newVal) => {
  debouncedCreatorValue.value = newVal
}, 500)

const issueUnit = ref<string>()
const debouncedIssueUnitValue = ref<string>('')
const debounceIssueUnitFn = useDebounceFn((newVal) => {
  debouncedIssueUnitValue.value = newVal
}, 500)

const documentTypes = ref<TCommonSelectOptions<string>[]>()
const fromDate = ref<Date>()
const toDate = ref<Date>()
const memoParams = computed(() =>
  cleanObject({
    sourceType: docSource?.value,
    search: debouncedSearchValue?.value,
    year: selectedYear?.value?.getFullYear()?.toString(),
    issuer: debouncedIssuerValue?.value,
    creator: debouncedCreatorValue?.value,
    issueUnit: debouncedIssueUnitValue?.value,
    documentTypes: documentTypes?.value,
    fromDate: fromDate?.value ? DateTime.fromJSDate(fromDate?.value).toISODate() : undefined,
    toDate: toDate?.value ? DateTime.fromJSDate(toDate?.value).toISODate() : undefined
  })
)

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  isMemorizedPage: true,
  pageSize: 50,
  otherMemoParams: memoParams
})

const {
  data,
  isLoading: isGettingData,
  refetch
} = useGetDocSearch(() =>
  cleanObject({
    pageable: {
      size: tablePagination.value?.pageSize,
      page: tablePagination.value?.current,
      sort: []
    },
    sourceType: docSource?.value?.value,
    search: debouncedSearchValue?.value,
    year: selectedYear?.value?.getFullYear()?.toString(),
    signer: debouncedIssuerValue?.value,
    creator: debouncedCreatorValue?.value,
    issuingUnit: debouncedIssueUnitValue?.value,
    fromDate: fromDate?.value ? DateTime.fromJSDate(fromDate.value).toISODate()! : undefined,
    toDate: toDate?.value ? DateTime.fromJSDate(toDate.value).toISODate()! : undefined,
    documentTypeIds: documentTypes?.value?.map((type) => type?.value)
  })
)

const { mutate: exportData, isPending: isExportingData } = useExportDocSearch({
  onSuccess: (data) => {
    const fileURL = URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = fileURL
    link.setAttribute('download', 'Danh sách văn bản.xls')
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(fileURL)
    toastSucceed({ detail: 'Xuất dữ liệu thành công' })
  }
})
const getTypeOptList = () => ({
  options: typeList,
  hasMore: false
})

const handleExport = () => {
  exportData(
    cleanObject({
      sourceType: docSource?.value?.value,
      search: debouncedSearchValue?.value,
      year: selectedYear?.value?.getFullYear()?.toString(),
      signer: debouncedIssuerValue?.value,
      creator: debouncedCreatorValue?.value,
      issuingUnit: debouncedIssueUnitValue?.value,
      fromDate: fromDate?.value ? DateTime.fromJSDate(fromDate.value).toISODate()! : undefined,
      toDate: toDate?.value ? DateTime.fromJSDate(toDate.value).toISODate()! : undefined,
      documentTypeIds: documentTypes?.value?.map((type) => type?.value)
    })
  )
}

const handleRowClick = (event: DataTableRowClickEvent<SearchDocumentVM>) => {
  const docId = event?.data?.id
  const docType = event?.data?.type
  switch (docType) {
    case 'INCOMING':
      modalDetailInDocRef.value?.openModal(docId)
      break
    case 'INTERNAL':
      modalDetailInternalDocRef.value?.openModal(docId)
      break
    case 'OUTGOING':
      modalDetailOutDocRef.value?.openModal(docId)
  }
}

watch(searchValue, (newValue) => {
  debounceSearchdFn(newValue)
})
watch(issuer, (newValue) => {
  debounceIssuerdFn(newValue)
})
watch(creator, (newValue) => {
  debounceCreatorFn(newValue)
})
watch(issueUnit, (newValue) => {
  debounceIssueUnitFn(newValue)
})

watch(
  () => route.query,
  (query) => {
    if (query) {
      const queryValues = pick(route.query, [
        'search',
        'sourceType',
        'year',
        'issuer',
        'creator',
        'issueUnit',
        'documentTypes',
        'fromDate',
        'toDate'
      ])
      const parsedValue = {
        ...queryValues,
        sourceType: queryValues?.sourceType ? safeParseJson(queryValues?.sourceType) : undefined
      }
      console.log(parsedValue, 'parsedValue')
      searchValue.value = parsedValue?.search as string
      debouncedSearchValue.value = parsedValue?.search as string
      docSource.value = queryValues?.sourceType
        ? (safeParseJson(queryValues?.sourceType) as TSource)
        : typeList?.find((opt) => opt?.value === 'ALL')!
      selectedYear.value = parsedValue?.year
        ? DateTime.fromFormat(parsedValue?.year as string, 'yy').toJSDate()
        : new Date()
      issuer.value = parsedValue?.issuer as string
      debouncedIssuerValue.value = parsedValue?.issuer as string
      creator.value = parsedValue?.creator as string
      debouncedCreatorValue.value = parsedValue?.creator as string
      issueUnit.value = parsedValue?.issueUnit as string
      debouncedIssueUnitValue.value = parsedValue?.issueUnit as string
      ;((documentTypes.value = parsedValue?.documentTypes
        ? (safeParseJson(queryValues?.documentTypes) as TCommonSelectOptions<string>[])
        : undefined),
        (fromDate.value = parsedValue.fromDate
          ? new Date(parsedValue.fromDate as string)
          : undefined),
        (toDate.value = parsedValue.toDate ? new Date(parsedValue.toDate as string) : undefined))
    }
  },
  { deep: true, once: true, immediate: true, flush: 'sync' }
)
</script>
<template>
  <div>
    <div class="mb-10">
      <div class="mb-4 grid grid-cols-12 gap-4">
        <AppTextInput
          placeholder="Nhập từ khóa trong trích yếu hoặc nhập số hiệu văn bản..."
          label="Tìm theo Trích yếu/Số ký hiệu"
          name="ownerName"
          class="col-span-6"
          v-model="searchValue"
        />
        <AppSelect
          name="position"
          :fetch-options="getTypeOptList"
          label="Nguồn văn bản"
          isFetchOnInit
          class="col-span-4"
          v-model="docSource"
        />
        <AppDateInput
          class="col-span-2"
          name="date"
          label="Năm"
          v-model="selectedYear"
          placeholder="Chọn hạn dự kiến"
          date-format="yy"
          view="year"
          :append-to="'body'"
        />
      </div>
      <div class="flex w-full items-center justify-center">
        <Button
          variant="text"
          rounded
          size="small"
          severity="primary"
          class="rounded-full"
          @click="isExpanded = !isExpanded"
          :label="isExpanded ? 'Mở rộng' : 'Thu gọn'"
          :icon="`icon-[ic--round-expand-less] text-4xl transition- duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`"
        ></Button>
      </div>
      <Transition name="fade" mode="out-in">
        <div v-if="isExpanded" class="mb-4 grid grid-cols-12 gap-4">
          <AppTextInput
            placeholder="Nhập tên người ký ban hành"
            label="Người ký ban hành"
            name="issuer"
            class="col-span-6"
            v-model="issuer"
          />
          <AppTextInput
            placeholder="Nhập tên người soạn thảo"
            label="Người soạn thảo"
            name="creator"
            class="col-span-6"
            v-model="creator"
          />
          <AppTextInput
            placeholder="Nhập tên đơn vị ban hành"
            label="Đơn vị ban hành"
            name="issueUnit"
            class="col-span-6"
            v-model="issueUnit"
          />
          <AppSelect
            class="col-span-6"
            label="Loại văn bản"
            placeholder="Chọn loại văn bản"
            name="documentType"
            :multiple="true"
            v-model="documentTypes"
            :fetch-options="fetchMoreDocumentTypeOptions"
          ></AppSelect>
          <AppDateInput
            class="col-span-6"
            name="fromDate"
            label="Từ ngày"
            :date-format="'dd/mm/yy'"
            placeholder="Chọn ngày"
            v-model="fromDate"
          ></AppDateInput>
          <AppDateInput
            class="col-span-6"
            name="inDate"
            label="Đến ngày"
            :date-format="'dd/mm/yy'"
            placeholder="Chọn ngày"
            v-model="toDate"
          ></AppDateInput>
        </div>
      </Transition>
    </div>
    <div>
      <div class="mb-4 flex items-center justify-between gap-4">
        <span class="text-primary text-xl font-semibold">Kết quả</span>
        <Button
          class="whitespace-nowrap"
          label="Xuất excel"
          variant="contained"
          :loading="isExportingData"
          @click="handleExport"
        />
      </div>
      <div>
        <AppTable
          :loading="isGettingData"
          :empty="!isGettingData && data?.items?.length === 0"
          :columns="columns"
          :data="data?.items ?? []"
          paginator
          :always-show-paginator="true"
          :totalRecords="data?.totalItems"
          :lazy="true"
          :rows="tablePagination.pageSize"
          :rowsPerPageOptions="tablePagination.pageSizeOptions"
          @page="({ page, rows }) => updateCurrentPage(page, rows)"
          :first="tablePagination.current * tablePagination.pageSize"
          @update:rows="(pageSize) => updatePageSize(pageSize)"
          @row-click="handleRowClick"
          scrollable
        >
          <template #summarySlot="{ data }">
            <AppLongText :text="data.summary" :splice-length="230" /> </template
        ></AppTable>
      </div>
    </div>
    <ModalDetailInDoc
      v-if="docSource?.value === 'ALL' || docSource?.value === 'INCOMING'"
      ref="modalDetailInDocRef"
      :is-view-by-o-m="false"
      @docProcessed="refetch"
    />
    <ModalDetailOutDoc
      v-if="docSource?.value === 'ALL' || docSource?.value === 'OUTGOING'"
      ref="modalDetailOutDocRef"
      @processed-doc="refetch"
    />
    <ModalDetailInternalDoc
      v-if="docSource?.value === 'ALL' || docSource?.value === 'INTERNAL'"
      ref="modalDetailInternalDocRef"
      @processed-doc="refetch"
    />
  </div>
</template>
