<script setup lang="ts">
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import type { DocumentType } from '@/shared/services/api'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, useToast } from 'primevue'
import { useForm } from 'vee-validate'
import { ref, useTemplateRef } from 'vue'
import { z } from 'zod'
import { useUpdateAdminDocType } from '../../composables/adminDocumentType/queries/useUpdateAdminDocType'

type ModalType = InstanceType<typeof AppModal>

const schema = z.object({
  typeName: requireStringSchema,
  shortName: requireStringSchema
})

const documentType = ref<DocumentType | null>(null)

const { defineField, handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    typeName: '',
    shortName: ''
  }
})

const [typeName] = defineField('typeName')
const [shortName] = defineField('shortName')

const modalRef = useTemplateRef<ModalType | null>('modalRef')

const toast = useToast()

const queryClient = useQueryClient()

const { mutate: updateAdminDocType, isPending } = useUpdateAdminDocType({
  onSuccess: () => {
    toast.add({
      severity: 'success',
      life: APP_NOTI_TIME,
      summary: 'Cập nhật loại văn bản thành công'
    })
    queryClient.invalidateQueries({ queryKey: ['getListAdminDocTypes'] })
    modalRef.value?.closeModal()
  }
})

const onSubmit = handleSubmit((values) => {
  if (documentType.value?.id)
    updateAdminDocType({
      id: documentType.value?.id,
      data: {
        name: values.typeName,
        shortName: values.shortName
      }
    })
})

const handleChangeModalVisible = (visible: boolean) => {
  if (!visible) {
    documentType.value = null
    resetForm()
  }
}

defineExpose({
  openModal: (data: DocumentType) => {
    documentType.value = data
    setValues({
      typeName: data?.name,
      shortName: data?.shortName
    })
    modalRef.value?.openModal()
  },
  closeModal: () => modalRef.value?.closeModal()
})
</script>
<template>
  <AppModal ref="modalRef" title="Thêm mới loại văn bản" @update:visible="handleChangeModalVisible">
    <form @submit="onSubmit">
      <div class="grid grid-cols-2 gap-y-2">
        <AppTextInput
          class="col-span-full"
          v-model="typeName"
          name="typeName"
          label="Tên loại văn bản"
          required
          placeholder="Nhập tên loại văn bản..."
          :error-message="errors?.typeName"
        ></AppTextInput>
        <AppTextInput
          class="col-span-full"
          v-model="shortName"
          name="shortName"
          label="Ký hiệu"
          placeholder="Nhập..."
          required
          :error-message="errors?.shortName"
        ></AppTextInput>
      </div>
      <slot name="footer">
        <div class="mt-6 flex w-full justify-end">
          <Button label="Xác nhận" type="submit" :disabled="isPending" :loading="isPending" />
        </div>
      </slot>
    </form>
  </AppModal>
</template>
