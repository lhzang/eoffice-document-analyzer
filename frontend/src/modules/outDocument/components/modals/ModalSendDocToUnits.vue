<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { PDF_FILE_TYPE, URGENCY_LEVEL_LABELS } from '@/shared/constants/document'
import { MSG_PLEASE_SELECT, MSG_REQUIRED_FILE } from '@/shared/constants/message-text'
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import type { DetailDocumentVM } from '@/shared/services/api'
import {
  cleanObject,
  createFileFromUrl,
  getFileName,
  getFullFileUrl,
  toastSucceed
} from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'
import z from 'zod'
import { useSendToDestinations } from '../../composables/queries/useSendToDestinations'
const isVisible = ref(false)

type TProps = {
  detailDocument: DetailDocumentVM
}

const { detailDocument } = defineProps<TProps>()

const emit = defineEmits<{
  (e: 'sentUnits'): void
}>()

const schema = toTypedSchema(
  z.object({
    documentCode: requireStringSchema.refine(
      (value) => {
        const regex = /^[\p{L}0-9\/-]+$/u
        return regex.test(value)
      },
      {
        message: 'Số ký hiệu chỉ được gồm số, chữ hoa/in thường, ký tự / và -'
      }
    ),
    issueDate: z.date({ error: MSG_PLEASE_SELECT }),
    dueDate: z.date().optional().nullable(),
    subject: requireStringSchema,
    mainFile: z.file({ error: MSG_REQUIRED_FILE }),
    annexesFiles: z.array(z.file()).optional()
  })
)

const confirm = useConfirm()

const { mutate, isPending } = useSendToDestinations({
  onSuccess: () => {
    toastSucceed({ detail: 'Gửi đơn vị thành công' })
    emit('sentUnits')
    isVisible.value = false
    reset()
  }
})

const { handleSubmit, handleReset, setValues, setFieldValue, values } = useForm({
  validationSchema: schema
})

const reset = () => {
  isVisible.value = false
  handleReset()
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) reset()
}
const onSubmit = handleSubmit((values) => {
  confirm.require({
    group: 'sendDestination',
    message: 'Thầy/Cô có xác nhận gửi văn bản?',
    header: 'Gửi văn bản',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    },
    accept: () => {
      const [number, notation] = values?.documentCode?.split('/')
      mutate(
        cleanObject({
          documentId: detailDocument.id,
          mainFile: values.mainFile,
          annexes: values.annexesFiles,
          code: {
            notation,
            number
          },
          issueDate: values.issueDate
            ? DateTime.fromJSDate(values.issueDate).toISODate()!
            : undefined,
          subject: values.subject
        })
      )
    }
  })
})

const processBindValue = async (detailDocument: DetailDocumentVM) => {
  setValues({
    documentCode: detailDocument.documentCode,
    issueDate: new Date(detailDocument.issuedDate),
    subject: detailDocument.subject
  })
  const promiseMainFile = createFileFromUrl(
    getFullFileUrl(detailDocument?.documentFiles?.lastestSignedFile),
    getFileName(detailDocument?.documentFiles?.lastestSignedFile)
  )
    .then((file) => setFieldValue('mainFile', file))
    .catch(console.log)

  const promiseannexesFiles = Promise.allSettled(
    (detailDocument?.documentFiles?.annexes ?? []).map((p) =>
      createFileFromUrl(getFullFileUrl(p), getFileName(p))
    )
  ).then((results) => {
    const fulfilled = results.filter((r) => r.status === 'fulfilled')
    const rejected = results.filter((r) => r.status === 'rejected')
    if (rejected.length) console.log(rejected.map((r) => r.reason))
    setFieldValue(
      'annexesFiles',
      fulfilled.map((r) => r.value)
    )
  })

  // const promiseRelatedFiles = Promise.allSettled(
  //   (relatedUploadFiles ?? []).map((f) =>
  //     createFileFromUrl(getFullFileUrl(f?.path), getFileName(f?.path))
  //   )
  // ).then((results) => {
  //   const fulfilled = results.filter((r) => r.status === 'fulfilled')
  //   const rejected = results.filter((r) => r.status === 'rejected')
  //   if (rejected.length) console.log(rejected.map((r) => r.reason))

  //   setFieldValue('relatedFiles', {
  //     fromDoc: (relatedDocFiles ?? []).map((file) => ({
  //       type: 'fromDoc',
  //       id: file?.documentId,
  //       name: file?.subject,
  //       docType:
  //         file?.type === 'INDOC'
  //           ? APP_DOCUMENT_TYPES.inDoc
  //           : file?.type === 'OUTDOC'
  //             ? APP_DOCUMENT_TYPES.outDoc
  //             : APP_DOCUMENT_TYPES.internalDoc
  //     })),
  //     upload: fulfilled.map((r) => ({
  //       type: 'upload',
  //       file: r.value
  //     })),
  //     fromTask: (relatedWorkFiles ?? []).map((file) => ({
  //       type: 'fromTask',
  //       id: file?.workId,
  //       name: file?.title
  //     }))
  //   })
  // })
  await Promise.allSettled([promiseMainFile, promiseannexesFiles])
}

watch(
  () => detailDocument,
  () => {
    processBindValue(detailDocument)
  },
  { immediate: true }
)

defineExpose({
  openModal: () => {
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    v-on:update:visible="handleVisibleChange"
    :wrapper-style="{ width: '80%', height: '99%', maxHeight: '98%', overflow: 'hidden' }"
    :classContent="'!overflow-auto pt-0! p-2! lg:p-4! lg:pt-0! h-full  flex flex-col'"
    hideCloseButton
    title="Gửi đơn vị"
  >
    <div class="flex h-full flex-col justify-between overflow-auto">
      <form @submit="onSubmit" class="flex h-full flex-col justify-between gap-x-6">
        <div class="flex h-[calc(100%_-_50px)] gap-x-6">
          <div class="border-shadow relative h-full w-1/2 overflow-auto 2xl:w-3/5">
            <PdfViewer v-if="values?.mainFile" :src="values?.mainFile as File" />
            <div v-else class="h-full w-full"></div>
          </div>
          <div class="border-shadow flex h-full w-1/2 flex-col overflow-auto 2xl:w-2/5">
            <div class="grid grid-cols-2 gap-4 px-4 py-2">
              <AppTextInput required label="Số ký hiệu" name="documentCode" />
              <AppDateInput
                name="issueDate"
                label="Ngày ban hành"
                :clearable="true"
                required
                :append-to="'body'"
                :date-format="'dd/mm/yy'"
                auto-z-index
              ></AppDateInput>
              <AppTextarea
                name="subject"
                label="Trích yếu nội dung"
                required
                :limit-number="250"
                placeholder="Nhập trích yếu nội dung..."
                class="col-span-2"
              />
              <AppTextarea
                name="destinations"
                label="Nơi nhận"
                required
                :model-value="
                  (detailDocument?.destinations ?? [])
                    ?.map((destination) => destination.name)
                    .join('\n')
                "
                :has-limit-number="false"
                disabled
                class="col-span-2"
              />
              <AppTextInput
                :model-value="detailDocument?.majorSignerLeader?.name"
                label="Tên người ký"
                name="signerName"
              />
              <AppTextInput
                :model-value="detailDocument?.majorSignerLeader?.positionTitle"
                label="Chức vụ người ký"
                name="signerPosition"
              />
              <AppTextInput
                :model-value="URGENCY_LEVEL_LABELS?.[detailDocument?.priority]"
                label="Độ khẩn"
                name="priority"
              />
              <AppFileInput
                name="mainFile"
                class="col-span-2"
                :accept="`${PDF_FILE_TYPE}`"
                label="File văn bản"
                required
              />
              <AppFileInput
                name="annexesFiles"
                class="col-span-2"
                :multiple="true"
                label="File phụ lục đính kèm"
              />
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <div class="flex w-full justify-end gap-4">
            <Button label="Hủy" type="button" @click="isVisible = false" :disabled="isPending" />
            <Button label="Gửi đơn vị" type="submit" :loading="isPending" />
          </div>
        </div>
      </form>
      <ConfirmDialog group="sendDestination" />
    </div>
  </AppModal>
</template>
