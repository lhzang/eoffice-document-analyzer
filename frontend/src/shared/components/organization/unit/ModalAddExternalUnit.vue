<script setup lang="ts">
import { useAddExternalUnit } from '@/shared/composables/queries/organization/unit/useAddNewExternalUnit'
import { MSG_PLEASE_SELECT, MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import { notifyError, toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Dialog } from 'primevue'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { z } from 'zod'
import AppTextInput from '../../form-elements/AppTextInput.vue'

const zodSchema = z.object({
  orgName: z.string().min(1, MSG_REQUIRED_FIELD),
  orgShortName: z.string().min(1, MSG_REQUIRED_FIELD)
})

type TFormData = z.infer<typeof zodSchema>

const schema = toTypedSchema(zodSchema)

const visible = ref(false)

const { defineField, handleSubmit, resetForm, errors } = useForm<TFormData>({
  validationSchema: schema,
  initialValues: {
    orgName: '',
    orgShortName: ''
  }
})

const [orgName] = defineField('orgName')
const [orgShortName] = defineField('orgShortName')

const { mutate: addExternalUnit, isPending } = useAddExternalUnit({
  onSuccess: () => {
    toastSucceed({ summary: 'Thêm cơ quan bên ngoài thành công' })
    closeModal()
  },
  onError: (error) => {
    notifyError(error, 'Thêm cơ quan bên ngoài thất bại')
  }
})

const openModal = () => {
  visible.value = true
}

const closeModal = async () => {
  visible.value = false
  resetForm()
}

const onSubmit = handleSubmit((data: TFormData) => {
  addExternalUnit({
    name: data.orgName,
    shortName: data.orgShortName,
    xroad: null
  })
})

defineExpose({
  openModal,
  closeModal
})
</script>
<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Thêm mới cơ quan bên ngoài"
    :dismissableMask="true"
    :style="{ width: '400px' }"
    :breakpoints="{ '480px': '90vw' }"
    :blockScroll="false"
    @hide="resetForm"
    :pt="{
      title: {
        class: 'text-primary'
      }
    }"
  >
    <form @submit="onSubmit">
      <AppTextInput
        class="mb-2"
        name="orgName"
        v-model="orgName"
        label="Tên cơ quan"
        required
        :error-message="errors.orgName"
        :placeholder="MSG_PLEASE_SELECT"
      />
      <AppTextInput
        class="mb-2"
        :placeholder="MSG_PLEASE_SELECT"
        name="orgShortName"
        v-model="orgShortName"
        label="Tên viết tắt"
        required
        :error-message="errors.orgShortName"
      />
      <div class="mt-4 flex w-full items-center justify-end gap-5">
        <Button
          label="Huỷ"
          outlined
          severity="secondary"
          @click="closeModal"
          :disabled="isPending"
        />
        <Button
          label="Xác nhận"
          contained
          severity="primary"
          type="submit"
          :disabled="isPending"
          :loading="isPending"
        />
      </div>
    </form>
  </Dialog>
</template>
