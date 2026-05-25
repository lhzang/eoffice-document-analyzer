script
<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { PDF_FILE_TYPE } from '@/shared/constants/document'
import { MSG_FILE_WRONG_FORMAT, MSG_REQUIRED_FILE } from '@/shared/constants/message-text'
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import type { ListDocumentVM } from '@/shared/services/api'
import {
  createFileFromUrl,
  getFileName,
  getFullFileUrl,
  toastError,
  toastSucceed
} from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { useDropZone } from '@vueuse/core'
import { Button, ConfirmDialog, Message, RadioButton, useConfirm } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { ref, watch } from 'vue'
import z from 'zod'
import { useRevokeIssuedOD } from '../../composables/queries/useRevokeIssuedOD'
import AllocatedDocForReplacement from '../AllocatedDocForReplacement.vue'

type TProps = {
  documentId: string
}

const emit = defineEmits<{
  (e: 'revokedDoc'): void
}>()

const confirm = useConfirm()

const { documentId } = defineProps<TProps>()

const { mutate: revokeDoc, isPending: isRevokingDoc } = useRevokeIssuedOD({
  onSuccess: () => {
    toastSucceed({
      detail: 'Thu hồi văn bản thành công'
    })
    emit('revokedDoc')
  }
})

const uploadSchema = z.object({
  message: requireStringSchema,
  type: z.literal('upload'),
  uploadFile: z
    .file({ error: MSG_REQUIRED_FILE })
    .mime([PDF_FILE_TYPE], { error: MSG_FILE_WRONG_FORMAT })
})
const systemSchema = z.object({
  message: requireStringSchema,
  type: z.literal('system'),
  document: z.custom<ListDocumentVM>((val) => val, {
    message: 'Vui lòng chọn văn bản'
  })
})

const schema = z.discriminatedUnion('type', [uploadSchema, systemSchema])

const isVisible = ref(false)
const dropZoneRef = ref<HTMLDivElement>()

const { handleSubmit, values, errors, setFieldValue, resetField, handleReset } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    type: 'upload'
  }
})

const { value: fileSelectMode } = useField<'system' | 'upload'>('type', undefined)

watch(fileSelectMode, () => {
  resetField('uploadFile')
  resetField('document')
})

const handleImportDocument = (files: File[] | null) => {
  const dropFile = files?.[0]
  if (!dropFile) {
    return
  }
  setFieldValue('uploadFile', dropFile)
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: handleImportDocument,
  // specify the types of data to be received.
  dataTypes: [PDF_FILE_TYPE],
  // control multi-file drop
  multiple: false,
  // whether to prevent default behavior for unhandled events
  preventDefaultForUnhandled: false
})

const handleRevokeDoc = async (values: z.infer<typeof schema>) => {
  if (values?.type === 'system') {
    const fetchedFile = await createFileFromUrl(
      getFullFileUrl(values?.document?.documentFiles?.lastestSignedFile),
      getFileName(values?.document?.documentFiles?.lastestSignedFile) ?? 'File_van_ban.pdf'
    )
    revokeDoc({
      id: documentId,
      file: fetchedFile,
      reason: values?.message
    })
  } else {
    revokeDoc({
      id: documentId,
      file: values?.uploadFile,
      reason: values?.message
    })
  }
}

const onSubmit = handleSubmit((values) => {
  if (values?.type === 'system' && values?.document?.id === documentId) {
    return toastError({
      detail: 'Văn bản dùng để thay thế phải khác văn bản hiện tại'
    })
  }
  confirm.require({
    group: 'revokeDoc',
    message: 'Thầy/Cô có xác nhận thu hồi văn bản?',
    header: 'Thu hồi',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      handleRevokeDoc(values)
    }
  })
})

const reset = () => {
  handleReset()
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) reset()
}

const processCloseModal = () => {
  isVisible.value = false
  reset()
}

defineExpose({
  openModal: () => (isVisible.value = true),
  closeModal: processCloseModal
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    @update:visible="handleVisibleChange"
    :footer="false"
    :wrapper-style="{ width: '640px', overflow: 'hidden' }"
    title="Thu hồi văn bản đi"
  >
    <form @submit="onSubmit">
      <AppTextarea class="mb-4" name="message" label="Lý do thu hồi" required />
      <div class="mb-6">
        <span>
          <label :class="'text-primary font-semibold'"
            >Văn bản quyết định thu hồi <span class="text-red-500">*</span></label
          >
        </span>
        <div class="flex items-center gap-2">
          <RadioButton v-model="fileSelectMode" inputId="upload" name="type" value="upload" />
          <label for="upload">Tải file từ máy</label>
        </div>
        <div class="flex items-center gap-2">
          <RadioButton v-model="fileSelectMode" inputId="system" name="type" value="system" />
          <label for="system">Chọn văn bản từ hệ thống</label>
        </div>
      </div>
      <div v-if="values?.type === 'upload'">
        <KeepAlive>
          <AppFileInput name="uploadFile" :accept="PDF_FILE_TYPE"
            ><template #trigger-element="{ triggerFunction }">
              <div
                class="hover:border-primary flex h-[120px] w-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-all"
                :class="{
                  'border-primary': isOverDropZone
                }"
                ref="dropZoneRef"
                @click="triggerFunction"
              >
                <span v-if="!values?.uploadFile" class="text-primary"
                  >Kéo thả hoặc bấm để chọn file văn bản tải lên</span
                >
                <span v-else class="text-primary">{{ values?.uploadFile?.name }}</span>
              </div>
            </template>
          </AppFileInput>
        </KeepAlive>
      </div>
      <div v-if="values?.type === 'system'">
        <AllocatedDocForReplacement
          @document-select="(document) => setFieldValue('document', document)"
        />
        <Message v-if="errors?.document" severity="error" size="small" variant="simple">
          {{ errors?.document }}
        </Message>
      </div>
      <div class="mt-4 flex h-10 items-center justify-end gap-2">
        <Button
          label="Huỷ"
          severity="secondary"
          variant="outlined"
          :disabled="isRevokingDoc"
          @click="isVisible = false"
        />
        <Button type="submit" label="Xác nhận" severity="primary" :loading="isRevokingDoc" />
      </div>
    </form>

    <ConfirmDialog group="revokeDoc" />
  </AppModal>
</template>
