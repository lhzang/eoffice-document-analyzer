<script setup lang="ts">
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import { positiveNaturalNumberSchema, requireStringSchema } from '@/shared/schemas/commonSchema'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { watch } from 'vue'
import z from 'zod'
import { useDeleteUnitGroup } from '../composables/queries/group/useDeleteUnitGroup'
import { useUpdateUnitGroup } from '../composables/queries/group/useUpdateUnitGroup'

const { unitDetails, hasDeleteGroupPermission, hasUpdateGroupPermission } = defineProps<{
  unitDetails: TTreeUnitWithStaffNode
  hasDeleteGroupPermission: boolean
  hasUpdateGroupPermission: boolean
}>()

const emit = defineEmits<{
  (e: 'groupUnitHandled'): void
}>()

const confirm = useConfirm()

const schema = z.object({
  name: requireStringSchema,
  rank: positiveNaturalNumberSchema
})
const { setValues, handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema)
})

const { mutate: updateGroup, isPending: isUpdatingGroup } = useUpdateUnitGroup({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật khối đơn vị thành công'
    })
    emit('groupUnitHandled')
  }
})
const { mutate: deleteGroup, isPending: isDeletingGroup } = useDeleteUnitGroup({
  onSuccess: () => {
    toastSucceed({
      detail: 'Xóa khối đơn vị thành công'
    })
    emit('groupUnitHandled')
  }
})

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    group: 'confirmUpdateUnit',
    message: 'Thầy/Cô có xác nhận cập nhật khối đơn vị này?',
    header: 'Cập nhật khối đơn vị',
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
      updateGroup({
        id: unitDetails?.id,
        body: {
          name: formValues?.name,
          rank: formValues?.rank
        }
      })
    }
  })
})
const handleDeleteGroup = () => {
  confirm.require({
    group: 'confirmUpdateUnit',
    message: 'Thầy/Cô có xác nhận xóa khối đơn vị này?',
    header: 'Xóa khối đơn vị',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      deleteGroup(unitDetails?.id)
    }
  })
}

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
    v-if="hasDeleteGroupPermission"
    :fluid="false"
    class="mb-4 w-fit min-w-[100px]"
    label="Xóa khối đơn vị"
    severity="danger"
    @click="handleDeleteGroup"
    :loading="isDeletingGroup"
    :disabled="isUpdatingGroup"
  />
  <form @submit="onSubmit">
    <div>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <AppTextInput
            :disabled="!hasUpdateGroupPermission"
            name="name"
            label="Tên khối đơn vị"
            placeholder="Nhập tên khối đơn vị"
            required
          />
          <AppNumberInput
            :disabled="!hasUpdateGroupPermission"
            name="rank"
            required
            label="STT"
            placeholder="Nhập số thứ tự"
          />
        </div>
      </div>
    </div>
    <div class="item-center mt-4 flex justify-end">
      <Button
        v-if="hasUpdateGroupPermission"
        type="submit"
        class="min-w-[100px]"
        label="Cập nhật"
        severity="primary"
        :loading="isUpdatingGroup"
        :disabled="isDeletingGroup"
      />
    </div>
  </form>
  <ConfirmDialog group="confirmUpdateUnit" />
</template>
