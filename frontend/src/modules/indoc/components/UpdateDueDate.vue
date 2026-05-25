<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from 'primevue'
import { useForm } from 'vee-validate'
import { toRef, useTemplateRef, watchEffect } from 'vue'
import { z } from 'zod'

import { useUpdateDueDate } from '@/modules/indoc/composables/queries/useUpdateDueDate'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'

import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { DocumentDTO } from '@/shared/services/api'

type TMethodsModal = InstanceType<typeof AppModal>

const modalRef = useTemplateRef<TMethodsModal | null>('modalRef')

const updateDueDateSchema = z.object({
  dueDate: z.date({ error: MSG_PLEASE_SELECT }),
  oldDueDate: z.date().optional().nullable()
})

type TFormUpdateDueDateSchema = z.infer<typeof updateDueDateSchema>

const updateDueDateValidation = toTypedSchema(updateDueDateSchema)

const { isSuccess, mutate } = useUpdateDueDate()

const { hasDueDate = true, documentDetail } = defineProps<{
  hasDueDate?: boolean
  documentDetail: DocumentDTO | null
}>()

const defaultValues = toRef({ documentDetail })

const { defineField, handleSubmit, resetForm, errors } = useForm<TFormUpdateDueDateSchema>({
  validationSchema: updateDueDateValidation,
  initialValues: {
    dueDate: undefined,
    oldDueDate: defaultValues?.value?.documentDetail?.dueDate
      ? new Date(defaultValues.value?.documentDetail?.dueDate)
      : null
  }
})

const [dueDate] = defineField('dueDate')
const [oldDueDate] = defineField('oldDueDate')

const onSubmit = handleSubmit((formData: TFormUpdateDueDateSchema) => {
  mutate({ documentId: documentDetail?.id ?? '', dueDate: formData.dueDate.getTime() })
})

const onVisibleChange = (visible: boolean) => {
  if (!visible) {
    resetForm()
  }
}

watchEffect(() => {
  if (isSuccess.value) {
    setTimeout(() => {
      modalRef.value?.closeModal()
    }, 100)
  }
})
</script>
<template>
  <div>
    <Button class="h-6 outline" @click="modalRef?.openModal()">Sửa</Button>
    <AppModal
      ref="modalRef"
      :wrapper-style="{
        width: hasDueDate ? '762px' : '600px',
        maxHeight: '98%',
        overflow: 'hidden'
      }"
      @update:visible="onVisibleChange"
      title="Cập nhật hạn trả lời văn bản"
    >
      <form @submit="onSubmit">
        <div class="flex flex-row gap-4">
          <AppDateInput
            v-if="hasDueDate"
            name="oldDueDate"
            v-model="oldDueDate"
            label="Hạn trả lời hiện tại"
            placeholder="Hạn trả lời hiện tại"
            :date-format="'dd/mm/yy'"
            class="flex-1"
            disabled
          />

          <AppDateInput
            v-model="dueDate"
            required
            name="dueDate"
            label="Hạn trả lời cập nhật"
            placeholder="Hạn trả lời cập nhật"
            :date-format="'dd/mm/yy'"
            :min-date="new Date()"
            class="flex-1"
            :error-message="errors.dueDate && 'Vui lòng chọn hạn trả lời'"
          />
        </div>
        <div class="mt-5 flex items-center justify-end gap-2">
          <Button
            type="submit"
            class="min-w-[100px]"
            label="Cập nhật"
            outlined
            severity="primary"
          />
        </div>
      </form>
    </AppModal>
  </div>
</template>

<style scoped></style>
