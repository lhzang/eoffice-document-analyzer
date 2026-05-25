<script setup lang="ts">
import { exceptionSchema } from '@/modules/exception/schemas/updateIssuedDocSchema'
import { useGetDetailOutDoc } from '@/modules/outDocument/composables/queries/useGetDetailOutDoc'
import AppTable from '@/shared/components/AppTable.vue'
import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import type { ListDocumentVM } from '@/shared/services/api'
import { cleanObject, getFullFileUrl, toastSucceed } from '@/shared/utils/common'
import { formatDateForOutDocTable } from '@/shared/utils/outDoc/common'
import { toTypedSchema } from '@vee-validate/zod'
import { useDebounceFn } from '@vueuse/core'
import type { ColumnProps, DataTableRowClickEvent } from 'primevue'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import z from 'zod'
import FormReplaceMainFile from '../components/FormReplaceMainFile.vue'
import FormUpdateAnnexes from '../components/FormUpdateAnnexes.vue'
import FormUpdateIssuedDoc from '../components/FormUpdateIssuedDoc.vue'
import { useCancelIssuedDocument } from '../composables/queries/useCancelIssuedDoc'
import { useGetExceptionDoc } from '../composables/queries/useGetExceptionDoc'
import { useReplaceMainFile } from '../composables/queries/useReplaceMainFile'
import { useUpdateAnnexes } from '../composables/queries/useUpdateAnnexes'
import { useUpdateIssuedDate } from '../composables/queries/useUpdateIssuedDate'
import { DOCUMENT_SOURCES, EDIT_TYPES, EditTypesEnum } from '../constants/updateIssuedDoc'
import type { TExceptionDocuments, TTypeDocuments } from '../models/updateIssuedDoc'

type TFormData = z.infer<typeof exceptionSchema>

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: ListDocumentVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    header: 'Số kí hiệu',
    field: 'id'
  },
  {
    header: 'Trích yếu nội dung',
    field: 'subject',
    customSlot: 'subjectSlot',
    style: {
      width: '400px'
    },
    bodyClass: 'break-words'
  },
  {
    header: 'Loại văn bản',
    field: 'documentType'
  },
  {
    header: 'Ngày ban hành',
    field: (data) => (data?.issuedDate ? formatDateForOutDocTable(data?.issuedDate) : '--')
  },
  {
    header: 'Xem văn bản',
    field: 'viewDocument',
    customSlot: 'seeDocument',
    style: {
      minWidth: '24px',
      width: 'fit-content'
    }
  }
]

const confirm = useConfirm()
const selectedDoc = ref<ListDocumentVM | undefined>(undefined)
const previewDocId = ref<string | null>(null)
const selectedFileForPreview = ref(false)
const filetoPreview = ref<string | null>(null)
const removedAnnexes = ref<string[]>([])
const searchValue = ref<string>('')
const inputSearchValue = ref(searchValue.value)

const editTypeOptions = EDIT_TYPES.map((type) => ({
  label: type.title,
  value: type.value
}))

const docSourceOptions = DOCUMENT_SOURCES.map((src) => ({
  label: src.title,
  value: src.value
}))

const defaultEditType = editTypeOptions[0]
const defaultDocSource = docSourceOptions[0]

const getEditTypeSelectData = async () => {
  return {
    options: editTypeOptions,
    hasMore: false
  }
}

const getDocumentSourceData = async () => {
  return {
    options: docSourceOptions,
    hasMore: false
  }
}

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: DEFAULT_PAGE_SIZE,
  isMemorizedPage: true
})

const { handleSubmit, values, resetForm } = useForm({
  validationSchema: toTypedSchema(exceptionSchema),
  initialValues: {
    exceptionType: defaultEditType?.value,
    exceptionSource: defaultDocSource?.value
  }
})

const { mutate: cancelIssuedDocument, isPending: isCancelling } = useCancelIssuedDocument()
const { mutate: updateIssuedDate, isPending: isUpdatingIssuedDate } = useUpdateIssuedDate()
const { mutate: replaceMainFile, isPending: isReplacingMainFile } = useReplaceMainFile()
const { mutate: updateAnnexes, isPending: isUpdatingAnnexes } = useUpdateAnnexes()

const { data: detailOutDoc, refetch } = useGetDetailOutDoc(() => previewDocId.value!, {
  enabled: () => !!previewDocId.value
})

const exceptionDocPayload = computed(() =>
  cleanObject({
    page: tablePagination.value.current,
    pageSize: tablePagination.value.pageSize,
    search: searchValue.value?.trim() || undefined,
    exceptionType: values.exceptionType as TExceptionDocuments,
    type: values.exceptionSource as TTypeDocuments
  })
)
const { data, isLoading } = useGetExceptionDoc(exceptionDocPayload)

const updateIssuedDoc = (formValues: TFormData) => {
  if (!selectedDoc.value?.id) return
  const exceptionType = formValues.exceptionType

  if (exceptionType === EditTypesEnum.CANCEL_ISSUE_DOCUMENT) {
    cancelIssuedDocument(
      {
        docId: selectedDoc.value?.id,
        reason: formValues.reason,
        relatedFile: formValues.relatedFile
      },
      {
        onSuccess: () => {
          handleResetForm()
          toastSucceed({
            detail: 'Cập nhật thành công'
          })
        }
      }
    )
  } else if (exceptionType === EditTypesEnum.UPDATE_ISSUE_DATE) {
    updateIssuedDate(
      {
        docId: selectedDoc.value?.id,
        reason: formValues.reason,
        relatedFile: formValues.relatedFile
      },
      {
        onSuccess: () => {
          handleResetForm()
          toastSucceed({
            detail: 'Cập nhật thành công'
          })
        }
      }
    )
  } else if (exceptionType === EditTypesEnum.REPLACE_MAIN_FILE) {
    replaceMainFile(
      {
        docId: selectedDoc.value?.id,
        newMainFile: formValues.newMainFile,
        reason: formValues.reason,
        relatedFile: formValues.relatedFile
      },
      {
        onSuccess: () => {
          handleResetForm()
          toastSucceed({
            detail: 'Cập nhật thành công'
          })
        }
      }
    )
  } else if (exceptionType === EditTypesEnum.UPDATE_ANNEXES) {
    updateAnnexes(
      {
        docId: selectedDoc.value?.id,
        reason: formValues.reason,
        relatedFile: formValues.relatedFile,
        removeAnnexes: removedAnnexes.value,
        addAnnexes: formValues.addAnnexes
      },
      {
        onSuccess: () => {
          handleResetForm()
          toastSucceed({
            detail: 'Cập nhật thành công'
          })
        }
      }
    )
  }
}

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    group: 'confirmUpdateIssuedDoc',
    message: `Thầy/Cô chắc chắn muốn cập nhật thay đổi?`,
    header: 'Xác nhận thay đổi',
    accept: () => {
      updateIssuedDoc(formValues)
    },
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    }
  })
})

const handlePreviewFile = async (id: string) => {
  if (!id) return
  previewDocId.value = id
  await refetch()
  if (!detailOutDoc.value) return
  filetoPreview.value = detailOutDoc.value.documentFiles.mainFile
  selectedFileForPreview.value = true
}

const debouncedEmitSearch = useDebounceFn(() => {
  searchValue.value = inputSearchValue.value
}, 500)

const handleInput = () => {
  if (inputSearchValue.value?.length && !inputSearchValue.value.trim().length) return
  debouncedEmitSearch()
}

const handleRowSelect = (event: DataTableRowClickEvent<ListDocumentVM>) => {
  selectedDoc.value = event.data
}

const handleRemoveAnnexes = (list: string[]) => {
  removedAnnexes.value = list
}

const handleResetForm = () => {
  resetForm({
    values: {
      exceptionType: values.exceptionType,
      exceptionSource: values.exceptionSource
    }
  })
  searchValue.value = ''
  inputSearchValue.value = ''
  selectedDoc.value = undefined
}

const handleReset = () => {
  resetForm({
    values: {
      exceptionType: defaultEditType?.value,
      exceptionSource: defaultDocSource?.value
    }
  })
  searchValue.value = ''
  inputSearchValue.value = ''
  selectedDoc.value = undefined
}

watch(
  () => selectedDoc.value?.id,
  (id) => {
    if (!id) return
    if (values.exceptionType === EditTypesEnum.UPDATE_ANNEXES) {
      previewDocId.value = id
    }
  }
)
</script>

<template>
  <form class="pb-8" @submit="onSubmit">
    <div class="flex-start mt-4 mb-8 grid grid-cols-3 items-end gap-4">
      <AppSelect
        name="exceptionType"
        :fetch-options="getEditTypeSelectData"
        label="Loại hình chỉnh sửa"
        placeholder="Loại hình chỉnh sửa"
        :reduce="(option: any) => option.value"
        :is-fetch-on-init="true"
        :searchable="false"
        :append-to-body="true"
        @select="handleResetForm"
      />
      <AppSelect
        name="exceptionSource"
        :fetch-options="getDocumentSourceData"
        label="Nguồn văn bản"
        placeholder="Nguồn văn bản"
        :reduce="(option: any) => option.value"
        :is-fetch-on-init="true"
        :searchable="false"
        :append-to-body="true"
        @select="handleResetForm"
      />
      <div class="flex flex-col items-start justify-center">
        <span class="text-primary font-semibold">Tìm kiếm theo số hiệu văn bản</span>
        <div
          class="custom-input border-surface-300 inline-flex h-10 w-full items-center rounded-sm border bg-white px-2 py-1"
        >
          <span
            class="custom-input--icon__search shrink-0 pl-2 text-2xl text-gray-500"
            :class="'icon-[line-md--search]'"
          />
          <input
            ref="searchInputRef"
            class="w-full border-none px-2 py-1 outline-none"
            placeholder="Tìm kiếm"
            v-model="inputSearchValue"
            @input="handleInput"
          />
          <span
            v-if="inputSearchValue"
            class="mr-1 text-xl text-gray-400 hover:cursor-pointer active:text-gray-500"
            :class="'icon-[line-md--close-circle-filled]'"
            @click="
              () => {
                inputSearchValue = ''
                searchValue = ''
              }
            "
          />
        </div>
      </div>
    </div>

    <AppTable
      :loading="isLoading"
      :empty="!isLoading && data?.items.length === 0"
      :columns="columns"
      :data="data?.items ?? []"
      selection-mode="single"
      v-model:selection="selectedDoc"
      paginator
      :always-show-paginator="true"
      :totalRecords="data?.totalItems"
      :lazy="true"
      :rows="tablePagination.pageSize"
      :rowsPerPageOptions="tablePagination.pageSizeOptions"
      :first="tablePagination.current * tablePagination.pageSize"
      @page="({ page, rows }) => updateCurrentPage(page, rows)"
      @update:rows="updatePageSize"
      @row-select="handleRowSelect"
    >
      <template #seeDocument="{ data }">
        <span
          class="icon-[mdi--eye] text-primary text-xl"
          @click="handlePreviewFile(data.id)"
        ></span>
      </template>
      <template #subjectSlot="{ data }">
        <DocumentSubject :subject="data.subject" :urgentLevel="data.priority" />
      </template>
    </AppTable>

    <FormUpdateIssuedDoc
      v-if="
        values.exceptionType === EditTypesEnum.CANCEL_ISSUE_DOCUMENT ||
        values.exceptionType === EditTypesEnum.UPDATE_ISSUE_DATE
      "
    />

    <FormReplaceMainFile
      v-else-if="values.exceptionType === EditTypesEnum.REPLACE_MAIN_FILE"
      :selectedDoc="selectedDoc?.id"
    />

    <FormUpdateAnnexes
      v-else-if="values.exceptionType === EditTypesEnum.UPDATE_ANNEXES"
      :detailOutDoc="detailOutDoc"
      :selectedDoc="selectedDoc?.id"
      @removeAnnexes="handleRemoveAnnexes"
    />

    <div class="mt-2 flex items-center justify-end gap-2">
      <Button
        class="min-w-[100px]"
        label="Đặt lại"
        severity="secondary"
        variant="outlined"
        @click="handleReset"
      />
      <Button
        class="min-w-[100px]"
        :disabled="!selectedDoc"
        :loading="isCancelling || isUpdatingIssuedDate || isReplacingMainFile || isUpdatingAnnexes"
        label="Xác nhận"
        severity="primary"
        type="submit"
      />
    </div>
    <ConfirmDialog class="w-[600px]" group="confirmUpdateIssuedDoc" />
  </form>
  <!-- PDF Preview Modal -->
  <AppModal
    v-model:visible="selectedFileForPreview"
    :wrapper-style="{ width: '60%' }"
    title="File văn bản"
    @close="
      () => {
        selectedFileForPreview = false
        filetoPreview = null
      }
    "
  >
    <PdfViewer
      v-if="filetoPreview"
      :src="getFullFileUrl(filetoPreview)"
      :container-class="'h-full'"
    />
  </AppModal>
</template>
