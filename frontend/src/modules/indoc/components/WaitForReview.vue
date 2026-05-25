<script setup lang="ts">
import {
  Button,
  ConfirmDialog,
  useConfirm,
  type ColumnProps,
  type DataTableRowClickEvent,
  type DataTableSelectAllChangeEvent,
  type DataTableSortEvent
} from 'primevue'
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue'

import ModalDetailInDoc from '@/modules/indoc/components/ModalDetailInDoc.vue'
import { useCompleteManyInDoc } from '@/modules/indoc/composables/queries/useCompleteManyInDoc'
import { useGetToProcessInDoc } from '@/modules/indoc/composables/queries/useGetToProcessInDoc'
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'

import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import { DOCUMENT_PROCESS_ROLES_LABELS } from '@/shared/constants/document'
import type { InDocDocumentVM } from '@/shared/services/api'
import {
  getNumberSortOrderValue,
  getStringSortOrderValue,
  notifyError,
  toastSucceed,
  toastWarning
} from '@/shared/utils/common'
import { differenceBy, uniqBy } from 'lodash-es'
import { DateTime } from 'luxon'
import { useRoute } from 'vue-router'
import type { TCommonIndocFilter, TIDNeedHandleStatus } from '../models/types'
import DocumentSourceIcon from './DocumentSourceIcon.vue'
import ModalBulkDistribute from './processModals/ModalBulkDistribute.vue'

// ==== IMPORT THÊM CHO AI DEMO ====
import axios from 'axios'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
// =================================

type TModalRef = InstanceType<typeof ModalDetailInDoc>
type TModalBulkDistributeRef = InstanceType<typeof ModalBulkDistribute>

const confirm = useConfirm()
const route = useRoute()

const selectedDocuments = ref<InDocDocumentVM[]>([])
const modalRef = useTemplateRef<TModalRef>('modalRef')
const modalBulkDistribute = useTemplateRef<TModalBulkDistributeRef>('modalBulkDistribute')

const sortString = ref<string | undefined>(route.query?.sort as string | undefined)

// ====== ĐOẠN CODE XỬ LÝ AI ======
const userProfileStore = useUserProfileStore()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingAI = ref(false)
const mockUploadedDocs = ref<any[]>([])

const getPriorityLabel = (item: any) => {
  if (item.uu_tien_label_ai) return item.uu_tien_label_ai
  const r = (item.role || '').toUpperCase()
  if (r.includes('CHỦ TRÌ') || r.includes('CHỦ ĐẠO') || r.includes('OWNER')) return 'CAO'
  if (r.includes('PHỐI HỢP') || r.includes('COORDINATOR')) return 'TRUNG BÌNH'
  return 'THẤP'
}

const displayDocs = computed(() => {
  const docs = [...mockUploadedDocs.value, ...(data?.value?.docs ?? [])]
  return docs.sort((a: any, b: any) => {
    const scoreA = a.priority_score_ai ?? (getPriorityLabel(a) === 'CAO' ? 0.5 : getPriorityLabel(a) === 'TRUNG BÌNH' ? 0.3 : 0.1)
    const scoreB = b.priority_score_ai ?? (getPriorityLabel(b) === 'CAO' ? 0.5 : getPriorityLabel(b) === 'TRUNG BÌNH' ? 0.3 : 0.1)
    return scoreB - scoreA
  })
})

const triggerUpload = () => {
  fileInputRef.value?.click()
}

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploadingAI.value = true;
  try {
    const formData = new FormData();
    const currentUser = userProfileStore.user;
    let targetName = 'Chưa xác định'; 
    
    if (currentUser && currentUser.currentPosition) {
      const title = currentUser.currentPosition.title || '';
      if (title.toLowerCase().includes('giảng viên')) {
        targetName = currentUser.fullName || 'Đỗ Bá Lâm';
      } else {
        targetName = title;
      }
    } else if (currentUser && currentUser.fullName) {
      targetName = currentUser.fullName;
    }
    
    formData.append('target_name', targetName);
    formData.append('file', file);

    const res = await axios.post('http://localhost:8000/analyze', formData);
    
    const roleMap: Record<string, string> = {
      'A': 'Chủ trì',
      'B': 'Phối hợp',
      'C': 'Xem để biết'
    };

    const newDoc = {
      documentId: 'demo-' + Date.now(),
      inOrdinal: 'MỚI TẢI LÊN',
      documentCode: res.data.so_hieu?.replace(/^Số:\s*/i, '') || file.name,
      subject: res.data.trich_yeu || res.data.reason || '',
      role: roleMap[res.data.phan_loai] || res.data.phan_loai,
      hanh_dong_ai: res.data.action?.suggested,
      arrivalDate: new Date().toISOString(),
      dueDate: res.data.action?.deadline,
      uu_tien_label_ai: res.data.priority_label,
      priority_score_ai: res.data.priority_score
    };

    mockUploadedDocs.value.unshift(newDoc);
    toastSucceed({ summary: 'Thành công', detail: `AI đã trích xuất hành động!` });

  } catch (error: any) {
    notifyError(error.message, 'Lỗi kết nối tới AI Python');
  } finally {
    isUploadingAI.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}
// ==================================

const { mutate: completeManyDoc, isPending: isCompletingManyDoc } = useCompleteManyInDoc({
  onSuccess: (response) => {
    const failDocNumer = Object.keys(response?.failedDocIds).length
    if (failDocNumer) {
      toastWarning({
        summary: 'Hoàn thành văn bản',
        detail: `Có ${failDocNumer}/${selectedDocuments.value.length} văn bản không thể hoàn thành!. Vui lòng kiểm tra lại`
      })
    } else {
      toastSucceed({
        summary: 'Hoàn thành văn bản',
        detail: 'Hoàn thành tất cả văn bản thành công'
      })
    }
    selectedDocuments.value = []
    refetch()
  }
})

const props = defineProps<{
  activeTab: TIDNeedHandleStatus
  filterParams: TCommonIndocFilter
}>()
const memoParams = computed(() => ({
  ...props.filterParams,
  tab: props.activeTab,
  sort: sortString.value
}))

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: DEFAULT_PAGE_SIZE,
  isMemorizedPage: true,
  otherMemoParams: memoParams
})

const { data, isLoading, isError, error, refetch } = useGetToProcessInDoc(
  () => props.activeTab,
  () => ({
    ...props.filterParams,
    urgentLevels: props.filterParams.urgentLevels?.map((option) => option.value),
    documentTypes: props.filterParams.documentTypes?.map((option) => option.value),
    page: tablePagination.value.current,
    size: tablePagination.value.pageSize,
    sort: sortString.value ? [sortString.value] : []
  })
)
watchEffect(() => {
  if (isError.value && error?.value) {
    notifyError(error.value, 'Có lỗi khi lấy danh sách văn bản')
  }
})

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: InDocDocumentVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    field: 'icon',
    customSlot: 'documentIconCustom',
    style: { width: '40px' }
  },
  {
    field: 'documentCode',
    header: 'Số ký hiệu'
  },
  {
    field: (item: any) => (item.role ? DOCUMENT_PROCESS_ROLES_LABELS?.[item.role as keyof typeof DOCUMENT_PROCESS_ROLES_LABELS] || item.role : ''),
    header: 'Vai trò',
    sortField: 'role',
    sortable: true
  },
  {
    field: 'subject',
    header: 'Trích yếu nội dung',
    customSlot: 'subjectSlot',
    style: {
      width: '400px'
    },
    bodyClass: 'break-words'
  },
  {
    field: 'hanh_dong_ai',
    header: 'Gợi ý hành động',
    customSlot: 'aiActionSlot',
    style: { width: '250px' }
  },
  {
    field: (item) =>
      item.arrivalDate ? DateTime.fromISO(item.arrivalDate).toFormat('dd/MM/yyyy') : '',
    header: 'Ngày đến',
    sortField: 'arrival_date',
    sortable: true
  },
  {
    field: (item) => {
      if (!item?.dueDate) return '';
      const dt = DateTime.fromISO(item.dueDate);
      return dt.isValid ? dt.toFormat('dd/MM/yyyy') : item.dueDate;
    },
    header: 'Hạn trả lời'
  },
  {
    field: 'issuedUnit',
    header: 'Nơi gửi',
    style: {
      width: '150px',
      minWidth: '150px'
    },
    bodyClass: 'break-words'
  },
  {
    field: 'uu_tien_ai',
    header: 'Ưu tiên',
    customSlot: 'prioritySlot',
    style: {
      width: '140px',
      minWidth: '140px'
    }
  }
]

const handleRowClick = (data: InDocDocumentVM) => {
  modalRef.value?.openModal(data?.documentId)
}

const confirmModal = () => {
  confirm.require({
    group: 'confirmBulkComplete',
    message: 'Xác nhận hoàn thành các văn bản này?',
    header: 'Hoàn thành văn bản',
    icon: 'icon-[carbon--task-complete]',
    rejectProps: {
      label: 'Hủy bỏ',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận'
    },
    accept: () => completeManyDoc(selectedDocuments.value?.map((doc) => doc?.documentId))
  })
}

const handleUpdateSortData = (e: DataTableSortEvent) => {
  if (!e.sortOrder) return (sortString.value = undefined)
  sortString.value = `${e.sortField},${getStringSortOrderValue(e.sortOrder)}`
}

const handleSelectAllDocumentInPage = (e: DataTableSelectAllChangeEvent) => {
  if (e.checked) {
    selectedDocuments.value = uniqBy(
      [...selectedDocuments.value, ...(data?.value?.docs ?? [])],
      'documentId'
    )
  } else {
    selectedDocuments.value = differenceBy(
      selectedDocuments.value,
      data?.value?.docs ?? [],
      'documentId'
    )
  }
}

watch(
  [() => props.activeTab, sortString, () => props.filterParams],
  () => (selectedDocuments.value = [])
)

watch(
  () => props.activeTab,
  () => {
    sortString.value = undefined
  },
  { flush: 'sync' }
)
</script>

<template>
  <AppTable
    :loading="isLoading || isUploadingAI"
    :empty="!isLoading && displayDocs.length === 0"
    :columns="columns"
    :data="displayDocs"
    :selection-mode="props.activeTab === 'PROCESSED' ? undefined : 'multiple'"
    paginator
    :always-show-paginator="true"
    :totalRecords="data?.docCount"
    :lazy="true"
    :rows="tablePagination.pageSize"
    :rowsPerPageOptions="tablePagination.pageSizeOptions"
    :sort-field="sortString?.split(',')?.[0]"
    :sort-order="getNumberSortOrderValue(sortString?.split(',')?.[1])"
    :first="tablePagination.current * tablePagination.pageSize"
    removableSort
    v-model:selection="selectedDocuments"
    :select-all="
      !!data?.docs?.length &&
      data?.docs?.every((doc) =>
        selectedDocuments?.some((selectedDoc) => selectedDoc?.documentId === doc.documentId)
      )
    "
    :striped-rows="false"
    @select-all-change="handleSelectAllDocumentInPage"
    @page="({ page, rows }) => updateCurrentPage(page, rows)"
    @update:rows="updatePageSize"
    @row-click="(event: DataTableRowClickEvent<InDocDocumentVM>) => handleRowClick(event.data)"
    @sort="handleUpdateSortData"
    :row-class="
      (data: InDocDocumentVM) =>
        data?.isRead ? '!bg-[var(--p-content-hover-background)]' : undefined
    "
  >
    <template v-if="props.activeTab !== 'PROCESSED'" #header>
      <div class="flex items-center justify-between">
        <div class="text-lg font-semibold">
          {{ selectedDocuments?.length ? `Đã chọn ${selectedDocuments?.length} văn bản` : '' }}
        </div>
        <div class="item-center flex justify-end gap-2">
          
          <!-- NÚT PHÂN TÍCH AI -->
          <Button
            v-if="props.activeTab === 'WAIT_FOR_PROCESSING'"
            severity="success"
            label="Phân tích AI từ file"
            v-tippy="'Tải văn bản lên để AI phân tích ngay'"
            variant="outlined"
            icon="icon-[mdi--robot-outline]"
            @click="triggerUpload"
            :loading="isUploadingAI"
          />
          <input type="file" ref="fileInputRef" style="display: none" @change="onFileSelected" accept=".txt,.pdf" />

          <Button
            severity="primary"
            label="Hoàn thành"
            :loading="isCompletingManyDoc"
            v-tippy="'Hoàn thành văn bản đã chọn'"
            variant="outlined"
            @click="confirmModal"
            icon="icon-[charm--square-tick]"
            :disabled="!selectedDocuments?.length"
          >
          </Button>
          <Button
            v-if="props.activeTab === 'WAIT_FOR_PROCESSING'"
            severity="primary"
            label="Phân phối hàng loạt"
            v-tippy="'Lựa chọn các văn bản theo đơn vị để phân phối/đề xuất đồng thời'"
            variant="outlined"
            icon="icon-[hugeicons--hierarchy-square-07]"
            @click="modalBulkDistribute?.openModal()"
          >
          </Button>
        </div>
      </div>
    </template>
    
    <template #documentIconCustom="{ data }">
      <DocumentSourceIcon :document="data" />
    </template>
    <template #subjectSlot="{ data }">
      <DocumentSubject :subject="data.subject" :urgentLevel="data.priority" />
    </template>

    <!-- CỘT HIỂN THỊ HÀNH ĐỘNG AI -->
     <template #aiActionSlot="{ data }">
      <span v-if="(data as any).hanh_dong_ai" class="text-green-600 font-semibold break-words">
        {{ (data as any).hanh_dong_ai }}
      </span>
      <span v-else class="text-gray-400 text-sm">---</span>
    </template>

    <!-- CỘT HIỂN THỊ ĐỘ ƯU TIÊN AI -->
    <template #prioritySlot="{ data }">
      <span v-if="getPriorityLabel(data) === 'CAO'" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        CAO
      </span>
      <span v-else-if="getPriorityLabel(data) === 'TRUNG BÌNH'" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
        TRUNG BÌNH
      </span>
      <span v-else-if="getPriorityLabel(data) === 'THẤP'" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        THẤP
      </span>
      <span v-else class="text-gray-400 text-sm">---</span>
    </template>

  </AppTable>
  <ConfirmDialog group="confirmBulkComplete" />
  <ModalDetailInDoc ref="modalRef" :is-view-by-o-m="false" @docProcessed="refetch" />
  <ModalBulkDistribute ref="modalBulkDistribute" @distribute-sucess="refetch" />
</template>
