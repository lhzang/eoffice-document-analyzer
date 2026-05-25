<script setup lang="ts">
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useUpdateExternalUnit } from '@/shared/composables/queries/organization/unit/useUpdateExternalUnit'
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import type { ExternalUnitVM } from '@/shared/services/api'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from 'primevue'
import { useForm } from 'vee-validate'
import { ref, useTemplateRef } from 'vue'
import { z } from 'zod'

type ModalType = InstanceType<typeof AppModal>

const schema = toTypedSchema(
  z.object({
    typeName: requireStringSchema,
    shortName: requireStringSchema
  })
)
const externalUnit = ref<ExternalUnitVM | null>(null)

const { defineField, handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    typeName: '',
    shortName: ''
  }
})

const [typeName] = defineField('typeName')
const [shortName] = defineField('shortName')

const modalRef = useTemplateRef<ModalType | null>('modalRef')

const { mutate: updateExternalUnit, isPending } = useUpdateExternalUnit({
  onSuccess: () => {
    toastSucceed({ summary: 'Cập nhật thành công' })
    modalRef.value?.closeModal()
  }
})

const onSubmit = handleSubmit((values) => {
  if (externalUnit.value?.id)
    updateExternalUnit({
      id: externalUnit.value?.id,
      data: {
        name: values.typeName,
        shortName: values.shortName
      }
    })
})

const handleChangeModalVisible = (visible: boolean) => {
  if (!visible) {
    externalUnit.value = null
    resetForm()
  }
}

const openModal = (data: ExternalUnitVM) => {
  externalUnit.value = data
  setValues({
    typeName: data?.name,
    shortName: data?.shortName
  })
  modalRef.value?.openModal()
}

const closeModal = async () => {
  modalRef.value?.closeModal()
}

defineExpose({
  openModal,
  closeModal
})
</script>
<template>
  <AppModal ref="modalRef" title="Sửa" @update:visible="handleChangeModalVisible">
    <form @submit="onSubmit">
      <div class="grid grid-cols-2 gap-y-2">
        <AppTextInput
          class="col-span-full"
          v-model="typeName"
          name="typeName"
          label="Tên cơ quan"
          required
          placeholder="Nhập tên cơ quan..."
          :error-message="errors?.typeName"
        ></AppTextInput>
        <AppTextInput
          class="col-span-full"
          v-model="shortName"
          name="shortName"
          label="Tên viết tắt"
          placeholder="Nhập tên viết tắt..."
          required
          :error-message="errors?.shortName"
        ></AppTextInput>
      </div>
      <slot name="footer">
        <div class="mt-4 flex w-full items-center justify-end gap-5">
          <Button
            label="Huỷ"
            outlined
            severity="secondary"
            @click="closeModal"
            :disabled="isPending"
          />
          <Button label="Xác nhận" type="submit" :loading="isPending" />
        </div>
      </slot>
    </form>
  </AppModal>
</template>
