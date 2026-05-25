<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_TEXTAREA_LARGE_ROW } from '@/shared/constants/common'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { z } from 'zod'
import { useFinishDocument } from '../../composables/queries/useFinishDocument'

type TProps = {
  documentId: string
}

const emit = defineEmits<{
  (e: 'finishSuccess'): void
}>()

const { documentId } = defineProps<TProps>()

const isVisible = ref<boolean>(false)
const confirm = useConfirm()

const schema = z.object({
  message: z.string(),
  files: z.array(z.instanceof(File))
})

type FinishFormValues = z.infer<typeof schema>

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    message: '',
    files: []
  }
})

const { mutate: finishDocument, isPending } = useFinishDocument({
  onSuccess: () => {
    toastSucceed({
      detail: 'Kết thúc văn bản thành công'
    })
    emit('finishSuccess')
    isVisible.value = false
  }
})

const confirmReport = (values: FinishFormValues) => {
  confirm.require({
    group: 'finish',
    message: `Thầy/Cô chắc chắn muốn kết thúc văn bản?`,
    header: 'Kết thúc văn bản',
    accept: () => {
      finishDocument({
        id: documentId,
        body: {
          message: values?.message,
          files: values?.files
        }
      })
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
}

const onSubmit = handleSubmit((values) => {
  confirmReport(values)
})

defineExpose({
  openModal: () => {
    resetForm({ values: { message: '', files: [] } })
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    title="Kết thúc văn bản"
    v-model:visible="isVisible"
    :wrapper-style="{ width: '480px' }"
  >
    <form @submit="onSubmit">
      <AppTextarea
        class="col-span-2"
        name="message"
        label="Ý kiến"
        :rows="APP_TEXTAREA_LARGE_ROW"
        :limitNumber="250"
        :placeholder="`Nhập ý kiến khi kết thúc văn bản (nếu có)`"
      />
      <AppFileInput
        name="files"
        :multiple="true"
        accept="application/pdf,application/msword,
      application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      >
        <template #trigger-element="{ triggerFunction }">
          <div class="inline-flex cursor-pointer items-center gap-1" @click="triggerFunction">
            <span class="icon-[icon-park-outline--upload-logs] text-lg text-[#9DA2AE]"></span>
            <span class="text-secondary font-semibold underline"> File báo cáo (nếu có) </span>
          </div>
        </template>
      </AppFileInput>
      <div class="mt-2 flex h-10 items-center justify-end gap-2">
        <Button
          class="min-w-[100px]"
          label="Huỷ"
          severity="secondary"
          variant="outlined"
          :disabled="isPending"
          @click="isVisible = false"
        />
        <Button
          type="submit"
          class="min-w-[100px]"
          label="Xác nhận"
          severity="primary"
          :loading="isPending"
        />
      </div>
    </form>
    <ConfirmDialog group="finish" />
  </AppModal>
</template>
