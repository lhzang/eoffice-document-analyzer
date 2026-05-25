<script setup lang="ts">
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { IMG_FILE_TYPE } from '@/shared/constants/document'
import { MSG_FILE_WRONG_FORMAT, MSG_REQUIRED_FILE } from '@/shared/constants/message-text'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import {
  optionalStringSchema,
  positiveNaturalNumberSchema,
  requireStringSchema,
  unitSchema
} from '@/shared/schemas/commonSchema'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { watch } from 'vue'
import z from 'zod'

const { unitDetails } = defineProps<{
  unitDetails: TTreeUnitWithStaffNode
}>()

const emit = defineEmits<{
  (e: 'unitCreated'): void
}>()

const confirm = useConfirm()

const schema = z.object({
  name: requireStringSchema,
  abbr: requireStringSchema,
  address: optionalStringSchema,
  axisOrgId: optionalStringSchema,
  parentId: optionalStringSchema,
  phone: optionalStringSchema,
  email: optionalStringSchema,
  rank: positiveNaturalNumberSchema,
  logo: z
    .file({ error: MSG_REQUIRED_FILE })
    .mime([IMG_FILE_TYPE], { error: MSG_FILE_WRONG_FORMAT }),
  stampImg: z
    .file({ error: MSG_REQUIRED_FILE })
    .mime([IMG_FILE_TYPE], { error: MSG_FILE_WRONG_FORMAT }),
  clericalUnit: unitSchema
})

const { setValues, handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema)
})

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    group: 'updateGroupUnit',
    message: 'Thầy/Cô có xác nhận thêm mới đơn vị này?',
    header: 'Thêm mới đơn vị',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    },
    accept: () => {}
  })
})

// Fetch unit details and set form data
watch(
  () => unitDetails,
  (data) => {
    setValues({
      name: data?.name,
      rank: data?.rank
    })
  },
  { immediate: true }
)
</script>

<template>
  <Button
    :fluid="false"
    class="mb-4 w-fit min-w-[100px]"
    label="Xóa khối đơn vị"
    severity="danger"
  />
  <form @submit="onSubmit">
    <div>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <AppTextInput
            name="name"
            label="Tên khối đơn vị"
            placeholder="Nhập tên khối đơn vị"
            required
          />
          <AppNumberInput name="rank" required label="STT" placeholder="Nhập số thứ tự" />
        </div>
      </div>
    </div>
    <div class="item-center mt-4 flex justify-end">
      <Button type="submit" class="min-w-[100px]" label="Cập nhật" severity="primary" />
    </div>
  </form>
  <ConfirmDialog group="updateGroupUnit" />
</template>
