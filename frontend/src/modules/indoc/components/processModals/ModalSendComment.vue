<script setup lang="ts">
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_TEXTAREA_LARGE_ROW } from '@/shared/constants/common'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { z } from 'zod'
import { useCommentInDoc } from '../../composables/queries/useCommentInDoc'

type TProps = {
  documentId: string
}

const emit = defineEmits<{
  (e: 'commentSuccess'): void
}>()

const { documentId } = defineProps<TProps>()

const isVisible = ref<boolean>(false)
const confirm = useConfirm()

const schema = z.object({
  message: z.string()
})

type CommentFormValues = z.infer<typeof schema>

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    message: ''
  }
})

const { mutate: commentInDoc, isPending } = useCommentInDoc({
  onSuccess: () => {
    toastSucceed({
      detail: 'Gửi ý kiến thành công'
    })
    emit('commentSuccess')
    isVisible.value = false
  }
})

const confirmComment = (values: CommentFormValues) => {
  confirm.require({
    group: 'comment',
    message: `Thầy/Cô chắc chắn muốn cho ý kiến?`,
    header: 'Cho ý kiến',
    accept: () => {
      commentInDoc({
        id: documentId,
        body: {
          message: values?.message
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
  confirmComment(values)
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
  <AppModal
    title="Cho ý kiến văn bản"
    v-model:visible="isVisible"
    :wrapper-style="{ width: '480px' }"
  >
    <form @submit="onSubmit">
      <AppTextarea
        class="col-span-2"
        name="message"
        label="Nội dung cho ý kiến"
        :rows="APP_TEXTAREA_LARGE_ROW"
        :limitNumber="250"
        required
        :placeholder="`Nhập nội dung cho ý kiến`"
      />
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
    <ConfirmDialog group="comment" />
  </AppModal>
</template>
