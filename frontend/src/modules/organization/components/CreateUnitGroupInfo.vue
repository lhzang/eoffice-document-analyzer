<script setup lang="ts">
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { positiveNaturalNumberSchema, requireStringSchema } from '@/shared/schemas/commonSchema'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import z from 'zod'
import { useCreateUnitGroup } from '../composables/queries/group/useCreateUnitGroup'

const { parentUnitId } = defineProps<{
  parentUnitId: string
}>()

const emit = defineEmits<{
  (e: 'groupUnitCreated'): void
}>()

const confirm = useConfirm()

const schema = z.object({
  name: requireStringSchema,
  rank: positiveNaturalNumberSchema
})
const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema)
})

const { mutate: createGroup, isPending: isCreatingGroup } = useCreateUnitGroup({
  onSuccess: () => {
    toastSucceed({
      detail: 'Tạo mới khối đơn vị thành công'
    })
    emit('groupUnitCreated')
  }
})

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    group: 'createUnitGroupInfo',
    message: 'Thầy/Cô có xác nhận tạo mới khối đơn vị này?',
    header: 'Thêm mới khối đơn vị',
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
      createGroup({
        name: formValues?.name,
        rank: formValues?.rank,
        parentUnitId: parentUnitId
      })
    }
  })
})
</script>

<template>
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
      <Button
        type="submit"
        class="min-w-[100px]"
        label="Tạo"
        severity="primary"
        :loading="isCreatingGroup"
      />
    </div>
  </form>
  <ConfirmDialog group="createUnitGroupInfo" />
</template>
