<script setup lang="ts">
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, useToast } from 'primevue'
import { useForm } from 'vee-validate'
import { useTemplateRef } from 'vue'
import { z } from 'zod'
import { useAddNewAdminDocType } from '../../composables/adminDocumentType/queries/useAddNewAdminDocType'

type ModalType = InstanceType<typeof AppModal>

const schema = toTypedSchema(
  z.object({
    typeName: requireStringSchema,
    shortName: requireStringSchema
  })
)

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    typeName: '',
    shortName: ''
  }
})

const modalRef = useTemplateRef<ModalType | null>('modalRef')

const toast = useToast()

const queryClient = useQueryClient()

const { mutate: addNewType, isPending } = useAddNewAdminDocType({
  onSuccess: () => {
    toast.add({
      severity: 'success',
      life: APP_NOTI_TIME,
      summary: 'Thêm mới loại văn bản thành công'
    })
    queryClient.invalidateQueries({ queryKey: ['getListAdminDocTypes'] })
    modalRef.value?.closeModal()
  }
})

const onSubmit = handleSubmit((values) => {
  addNewType({
    name: values.typeName,
    shortName: values.shortName
  })
})

const handleChangeModalVisible = (visible: boolean) => {
  if (!visible) resetForm()
}

defineExpose({
  openModal: () => modalRef.value?.openModal(),
  closeModal: () => modalRef.value?.closeModal()
})
</script>
<template>
  <AppModal ref="modalRef" title="Thêm mới loại văn bản" @update:visible="handleChangeModalVisible">
    <form @submit="onSubmit">
      <div class="grid grid-cols-2 gap-y-2">
        <AppTextInput
          class="col-span-full"
          name="typeName"
          label="Tên loại văn bản"
          required
          placeholder="Nhập tên loại văn bản..."
          :error-message="errors?.typeName"
        ></AppTextInput>
        <AppTextInput
          class="col-span-full"
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
