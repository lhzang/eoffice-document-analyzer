<script setup lang="ts">
import AppLongText from '@/shared/components/AppLongText.vue'
import AppTable from '@/shared/components/AppTable.vue'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import { useGetAffectUnitBySelfPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitBySelfPermission'
import { useGetDetailDocumentBook } from '@/shared/composables/queries/clerical/useGetDetailDocumentBook'
import { usePagination } from '@/shared/composables/usePagination'
import { DOCUMENT_BOOK_STATUS } from '@/shared/constants/clerical/documentBook.shared'
import { APP_DOCUMENT_TYPES } from '@/shared/constants/document'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type { TTreeUnitWithStaffNode, TUnitSelectValue } from '@/shared/models/organization/unit'
import type { DocumentTypeVM, ListDocumentBooksVM } from '@/shared/services/api'
import { fetchMoreDocumentBookOptions } from '@/shared/utils/clerical/getDocBookOption'
import { cleanObject, safeParseJson, toastError, toastSucceed } from '@/shared/utils/common'
import { pick } from 'lodash-es'
import { DateTime } from 'luxon'
import { Button, type ColumnProps } from 'primevue'
import { computed, ref, watch, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { type DocumentBookReportVM } from '../../../shared/services/api/api'
import { useExportReportDocumentBook } from '../composables/documentBook/queries/useExportReportDocumentBook'
import { useGetReportDocumenBook } from '../composables/documentBook/queries/useGetReportDocumenBook'

const selectedUnit = ref<TUnitSelectValue | null>(null)
const documentBook = ref<TCommonSelectOptions<ListDocumentBooksVM>>()
const documentTypes = ref<TCommonSelectOptions<DocumentTypeVM>[]>()
const arrivalDate = ref<Date[] | (Date | null)[] | undefined>()
const {
  data: hasRoleUnits,
  isLoading: isGetttingHasRoleUnits,
  isError
} = useGetAffectUnitBySelfPermission(() => APP_PERMISSION_VALUES.manageDocumentBook)

const route = useRoute()

const memoParams = computed(() =>
  cleanObject({
    selectedUnit: selectedUnit?.value,
    documentBook: documentBook?.value,
    documentTypes: documentTypes?.value,
    arrivalDate: Array?.isArray(arrivalDate?.value)
      ? arrivalDate?.value?.[0] && arrivalDate?.value?.[1]
        ? arrivalDate?.value?.map((date) => DateTime.fromJSDate(date!).toISODate())
        : arrivalDate?.value?.[0]
          ? [DateTime.fromJSDate(arrivalDate?.value?.[0]!).toISODate()]
          : undefined
      : undefined
  })
)

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  isMemorizedPage: true,
  pageSize: 50,
  otherMemoParams: memoParams
})

const collumnByType: ComputedRef<
  (Omit<ColumnProps, 'field'> & {
    field?: string | ((item: DocumentBookReportVM) => string)
    customSlot?: string
    customHeaderSlot?: string
  })[]
> = computed(() => {
  switch (documentBook?.value?.value?.type) {
    case APP_DOCUMENT_TYPES?.internalDoc:
      return [
        {
          field: 'documentBook',
          header: 'Sổ văn bản',
          style: {
            minWidth: '100px'
          },
          customSlot: 'documentBookSlot'
        },
        {
          field: 'documentCode',
          header: 'Số/Ký hiệu văn bản',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'signer',
          header: 'Người ký ban hành',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'documentTypeName',
          header: 'Loại văn bản',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'subject',
          header: 'Trích yếu nội dung',
          style: {
            width: '400px'
          },
          bodyClass: 'break-words',
          customSlot: 'subjectSlot'
        }
      ]
    case APP_DOCUMENT_TYPES?.outDoc:
      return [
        {
          field: 'documentBook',
          header: 'Sổ văn bản',
          style: {
            minWidth: '100px'
          },
          customSlot: 'documentBookSlot'
        },
        {
          field: 'documentCode',
          header: 'Số/Ký hiệu văn bản',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: (document) =>
            document?.docDate ? DateTime.fromISO(document?.docDate).toFormat('dd/MM/yyyy') : '--',
          header: 'Ngày tháng văn bản',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'documentTypeName',
          header: 'Tên loại văn bản',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'subject',
          header: 'Trích yếu nội dung',
          style: {
            width: '300px',
            minWidth: '300px'
          },
          bodyClass: 'break-words',
          customSlot: 'subjectSlot'
        },
        {
          field: 'signer',
          header: 'Người ký',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'receivers',
          header: 'Nơi nhận',
          style: {
            minWidth: '100px'
          },
          customSlot: 'receiversSlot'
        },
        {
          field: (document) =>
            document?.sentDate ? DateTime.fromISO(document?.sentDate).toFormat('dd/MM/yyyy') : '--',
          header: 'Ngày gửi',
          style: {
            minWidth: '100px'
          }
        }
      ]
    default:
      return [
        {
          field: 'documentBook',
          header: 'Sổ văn bản',
          style: {
            minWidth: '100px'
          },
          customSlot: 'documentBookSlot'
        },
        {
          field: 'ordinal',
          header: 'Số đến',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'orgName',
          header: 'Tác giả',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'documentCode',
          header: 'Số/Ký hiệu văn bản',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: (document) =>
            document?.docDate ? DateTime.fromISO(document?.docDate).toFormat('dd/MM/yyyy') : '--',
          header: 'Ngày tháng văn bản',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'documentTypeName',
          header: 'Tên loại văn bản',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: 'subject',
          header: 'Trích yếu nội dung',
          style: {
            width: '300px',
            minWidth: '300px'
          },
          bodyClass: 'break-words',
          customSlot: 'subjectSlot'
        },
        {
          field: 'receiver',
          header: 'Người nhận',
          style: {
            minWidth: '100px'
          }
        },
        {
          field: (document) =>
            document?.sentDate ? DateTime.fromISO(document?.sentDate).toFormat('dd/MM/yyyy') : '--',
          header: 'Ngày chuyển',
          style: {
            minWidth: '100px'
          }
        }
      ]
  }
})

const {
  data: detailDocumentBook,
  isLoading: isGettingDetailBook
  // isSuccess: isGetDetailBoolSuccess
} = useGetDetailDocumentBook(() => documentBook?.value?.value?.id!, {
  enabled: () => !!documentBook?.value?.value?.id
})

const { mutate: exportData, isPending: isExportingData } = useExportReportDocumentBook({
  onSuccess: (data) => {
    const fileURL = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = fileURL
    link.setAttribute('download', `Báo cáo in sổ - ${documentBook?.value?.value?.name}.xlsx`)
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(fileURL)
    toastSucceed({ detail: 'Xuất báo cáo in sổ thành công' })
  }
})

const { data: reportData, isLoading: isGettingReportData } = useGetReportDocumenBook(
  () => documentBook?.value?.value?.id!,
  () =>
    cleanObject({
      pageable: {
        page: tablePagination?.value?.current,
        size: tablePagination?.value?.pageSize,
        sort: []
      },
      documentTypeIds: documentTypes?.value?.map((type) => type?.value?.id),
      fromDate:
        arrivalDate?.value && arrivalDate?.value?.[0]
          ? DateTime.fromJSDate(arrivalDate?.value?.[0]).toISODate()!
          : undefined,
      toDate:
        arrivalDate?.value && arrivalDate?.value?.[1]
          ? DateTime.fromJSDate(arrivalDate?.value?.[1]).toISODate()!
          : undefined
    }),
  { enabled: () => !!documentBook?.value?.value?.id }
)

const filterDisableUnit = (unit: TTreeUnitWithStaffNode) => {
  if (
    isError.value ||
    isGetttingHasRoleUnits.value ||
    !hasRoleUnits?.value?.some((hasRoleUnit) => hasRoleUnit?.id === unit?.id)
  )
    return true
  return false
}

const handleSelectConfigUnit = (value: TUnitSelectValue | null) => {
  selectedUnit.value = value
  documentTypes.value = undefined
  arrivalDate.value = undefined
}
const handleSelectDocumentBook = () => {
  documentTypes.value = undefined
  arrivalDate.value = undefined
}

const handleGenBookOpts = (search: string, page: number) => {
  if (selectedUnit?.value?.id) {
    return fetchMoreDocumentBookOptions(
      search,
      page,
      selectedUnit?.value?.id,
      ['INCOMING_DOCUMENT', 'INTERNAL_DOCUMENT', 'OUTGOING_DOCUMENT'],
      DOCUMENT_BOOK_STATUS.OPEN
    )
  } else
    return {
      options: [],
      hasMore: false
    }
}

const fetchMoreDocumentTypeOptions = async (search: string) => {
  const filteredType = (detailDocumentBook?.value?.documentTypeVMList ?? [])?.filter((type) =>
    type?.name?.toLowerCase()?.includes(search?.toLowerCase())
  )

  return {
    options: filteredType.map((doc) => ({ value: doc, label: doc.name })),
    hasMore: false
  }
}

const handleSelectDateRange = (e: Date | Date[] | (Date | null)[] | null | undefined) => {
  if (!Array.isArray(e) || !e.length) {
    arrivalDate.value = undefined
    return
  }

  const [start, end] = e

  if (!start) {
    arrivalDate.value = undefined
    return
  }

  if (!end || start.getTime() === end.getTime()) {
    arrivalDate.value = [start, null]
    return
  }

  arrivalDate.value = [start, end]
}

const handleClearDate = () => {
  arrivalDate.value = undefined
}

const handleExportData = () => {
  if (documentBook?.value?.value.id) {
    exportData({
      id: documentBook?.value?.value?.id,
      payload: {
        documentTypeIds: documentTypes?.value?.map((type) => type?.value?.id),
        fromDate:
          arrivalDate?.value && arrivalDate?.value?.[0]
            ? DateTime.fromJSDate(arrivalDate?.value?.[0]).toISODate()!
            : undefined,
        toDate:
          arrivalDate?.value && arrivalDate?.value?.[1]
            ? DateTime.fromJSDate(arrivalDate?.value?.[1]).toISODate()!
            : undefined
      }
    })
  } else toastError({ detail: 'Vui lòng chọn sổ văn bản trước khi xuất báo cáo' })
}

watch(
  () => route.query,
  (query) => {
    if (query) {
      const queryValues = pick(route.query, [
        'selectedUnit',
        'documentBook',
        'documentTypes',
        'arrivalDate'
      ])
      const parsedValue = {
        ...queryValues,
        selectedUnit: queryValues?.selectedUnit
          ? safeParseJson(queryValues?.selectedUnit)
          : undefined,
        documentBook: queryValues?.documentBook
          ? safeParseJson(queryValues?.documentBook)
          : undefined,
        documentTypes: queryValues?.documentTypes
          ? safeParseJson(queryValues?.documentTypes)
          : undefined,
        arrivalDate: queryValues?.arrivalDate ? safeParseJson(queryValues?.arrivalDate) : undefined
      }
      console.log(parsedValue, 'parsedValue')
      selectedUnit.value = parsedValue?.selectedUnit as TUnitSelectValue | null
      documentBook.value = parsedValue?.documentBook as TCommonSelectOptions<ListDocumentBooksVM>
      documentTypes.value = parsedValue?.documentTypes as TCommonSelectOptions<DocumentTypeVM>[]
      if (Array.isArray(parsedValue?.arrivalDate)) {
        const [start, end] = parsedValue?.arrivalDate as string[]
        if (start && end) {
          arrivalDate.value = [new Date(start), new Date(end)]
        } else if (start) {
          arrivalDate.value = [new Date(start)]
        }
      } else arrivalDate.value = undefined
    }
  },
  { deep: true, once: true, immediate: true, flush: 'sync' }
)
</script>
<template>
  <div>
    <div class="mb-10 grid grid-cols-12 gap-4">
      <InternalUnitSelect
        class="col-span-6 lg:col-span-3"
        :default-value="null"
        label="Chọn đơn vị"
        required
        modalLabel="Chọn đơn vị"
        :is-select-multiple="false"
        type="FULL"
        :disabled="isGetttingHasRoleUnits"
        :model-value="selectedUnit"
        @submit="handleSelectConfigUnit"
        :check-if-unit-disabled="filterDisableUnit"
      />
      <AppSelect
        class="col-span-6 lg:col-span-3"
        label="Sổ văn bản"
        required
        :disabled="!selectedUnit?.id || isGetttingHasRoleUnits"
        :placeholder="MSG_PLEASE_SELECT"
        name="documentBook"
        searchable
        :cacheUniqs="[selectedUnit?.id || '']"
        :fetch-options="handleGenBookOpts"
        v-model="documentBook"
        @select="handleSelectDocumentBook"
        :multiple="false"
      ></AppSelect>
      <AppSelect
        class="col-span-6 lg:col-span-3"
        name="documentTypes"
        :fetch-options="fetchMoreDocumentTypeOptions"
        :disabled="!documentBook?.value || isGettingDetailBook"
        :multiple="true"
        label="Loại văn bản"
        v-model="documentTypes"
        :placeholder="MSG_PLEASE_SELECT"
        :searchable="true"
        :append-to-body="true"
      />
      <AppDateInput
        class="col-span-6 lg:col-span-3"
        name="time"
        :disabled="!documentBook?.value || isGettingDetailBook"
        selectionMode="range"
        label="Ngày đến"
        placeholder="Từ ngày - Đến ngày"
        :date-format="'dd/mm/yy'"
        @clear="handleClearDate"
        :model-value="arrivalDate"
        @hide="handleSelectDateRange"
        hide-on-range-selection
      />
    </div>
    <div>
      <div class="mb-4 flex items-center justify-between gap-4">
        <span class="text-primary text-xl font-semibold">Kết quả</span>
        <Button
          class="whitespace-nowrap"
          label="Xuất excel"
          variant="contained"
          :disabled="!documentBook?.value || isGettingDetailBook"
          :loading="isExportingData"
          @click="handleExportData"
        />
      </div>
      <AppTable
        :loading="isGettingReportData"
        :empty="!isGettingReportData && reportData?.items.length === 0"
        :columns="collumnByType"
        :data="reportData?.items ?? []"
        paginator
        :always-show-paginator="true"
        :totalRecords="reportData?.totalItems"
        :lazy="true"
        :rows="tablePagination.pageSize"
        :rowsPerPageOptions="tablePagination.pageSizeOptions"
        :first="tablePagination.current * tablePagination.pageSize"
        removableSort
        @page="({ page, rows }) => updateCurrentPage(page, rows)"
        @update:rows="updatePageSize"
      >
        <template #documentBookSlot>
          <span>{{ documentBook?.value?.name }}</span>
        </template>
        <template #subjectSlot="{ data }">
          <!-- <DocumentSubject :subject="data.subject" :urgentLevel="data." /> -->
          <AppLongText :text="data.subject" :splice-length="230" />
        </template>
        <template #receiversSlot="{ data }">
          <AppLongText :text="data.receivers ?? ''" :splice-length="230" />
        </template>
      </AppTable>
    </div>
  </div>
</template>
