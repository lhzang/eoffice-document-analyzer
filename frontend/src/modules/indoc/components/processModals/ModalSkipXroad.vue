<script setup lang="ts">
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_TEXTAREA_EXTRA_LARGE_ROW } from '@/shared/constants/common'
import { optionalStringSchema } from '@/shared/schemas/commonSchema'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { z } from 'zod'
import { useSkipXroad } from '../../composables/queries/useSkipXroad'

type TProps = {
  documentId: string
}

const emit = defineEmits<{
  (e: 'skipXroad'): void
}>()

const { documentId } = defineProps<TProps>()

const isVisible = ref<boolean>(false)
const confirm = useConfirm()

const schema = z.object({
  message: optionalStringSchema
  // files: z.array(z.instanceof(File))
})

type FinishFormValues = z.infer<typeof schema>

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    message: ''
    // files: []
  }
})

const { mutate: returnID, isPending } = useSkipXroad({
  onSuccess: () => {
    toastSucceed({
      detail: 'Bỏ qua văn bản thành công'
    })
    emit('skipXroad')
    isVisible.value = false
  }
})

const confirmReturn = (values: FinishFormValues) => {
  confirm.require({
    group: 'skipXroad',
    message: `Thầy/Cô chắc chắn muốn Bỏ qua văn bản?`,
    header: 'Bỏ qua văn bản',
    accept: () => {
      returnID({
        id: documentId,
        reason: values?.message
      })
    },
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    }
  })
}

const onSubmit = handleSubmit((values) => {
  confirmReturn(values)
})

defineExpose({
  openModal: () => {
    resetForm({ values: { message: '' } })
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal title="Bỏ qua văn bản" v-model:visible="isVisible" :wrapper-style="{ width: '480px' }">
    <form @submit="onSubmit">
      <AppTextarea
        class="col-span-2"
        name="message"
        label="Lý do bỏ qua"
        :rows="APP_TEXTAREA_EXTRA_LARGE_ROW"
        :limitNumber="500"
        :placeholder="`Nhập lý do bỏ qua văn bản (nếu có)`"
      />
      <!-- <AppFileInput
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
      </AppFileInput> -->
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
    <ConfirmDialog group="skipXroad" />
  </AppModal>
</template>
