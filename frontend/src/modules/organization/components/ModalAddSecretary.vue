<script setup lang="ts">
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import InternalStaffSelect from '@/shared/components/organization/unit/InternalStaffSelect.vue'
import type { TStaffSelectValue } from '@/shared/models/organization/unit'
import { staffSchema, staffsSchema } from '@/shared/schemas/commonSchema'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { ref } from 'vue'
import z from 'zod'
import { useAddConfigSecretary } from '../composables/queries/useAddConfigSecretary'
import {
  SECRETARY_APPROVE_CONFIG_LABELS,
  SECRETARY_APPROVE_CONFIG_VALUES,
  SECRETARY_VIEW_INDOC_CONFIG_LABELS,
  SECRETARY_VIEW_INDOC_CONFIG_VALUES,
  type TSecretaryApproveConfig,
  type TSecretaryViewIndocConfig
} from '../constants/secretaryConfig'
import { handleGenApproveOpts, handleGenViewOpts } from '../utils/secretaryConfig'

const emit = defineEmits<{
  (e: 'addSecreataryConfig'): void
}>()

const isVisible = ref(false)

const confirm = useConfirm()

const { mutate: addConfig, isPending: isAddingConfig } = useAddConfigSecretary({
  onSuccess: () => {
    handleCloseModal()
    toastSucceed({ detail: 'Thêm cấu hình thư ký lãnh đạo thành công' })
    emit('addSecreataryConfig')
  }
})

const handleOpendModal = () => {
  resetForm({ values: initValues })
  isVisible.value = true
}

const handleCloseModal = () => {
  isVisible.value = false
}

const schema = z.object({
  leader: staffSchema,
  secretaries: staffsSchema,
  approveConfig: z.custom<TCommonSelectOptions<TSecretaryApproveConfig>>(),
  viewConfig: z.custom<TCommonSelectOptions<TSecretaryViewIndocConfig>>()
})

const initValues = {
  approveConfig: {
    label: SECRETARY_APPROVE_CONFIG_LABELS.OPTIONAL,
    value: SECRETARY_APPROVE_CONFIG_VALUES.optional
  },
  viewConfig: {
    label: SECRETARY_VIEW_INDOC_CONFIG_LABELS.DISABLED,
    value: SECRETARY_VIEW_INDOC_CONFIG_VALUES.disabled
  }
}
const { values, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: initValues
})

const { setValue: setLeader, errorMessage: errorLeaderMsg } = useField('leader')
const { setValue: setSecretaries, errorMessage: errorSecretariesMsg } = useField('secretaries')

const handleSubmitSelectLeader = (leader: TStaffSelectValue | null) => {
  setLeader(leader)
  setSecretaries([], false)
}
const handleSubmitSelectSecretaries = (secretaries: TStaffSelectValue[] | null) => {
  setSecretaries(secretaries)
}

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    group: 'modalAddSecretary',
    message: 'Thầy/Cô có xác nhận thêm mới cấu hình thư ký - lãnh đạo?',
    header: 'Cấu hình thư ký - lãnh đạo',
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
      if (!formValues?.leader?.positionId) return
      addConfig({
        leaderId: formValues?.leader?.positionId,
        secretaryIds: formValues?.secretaries?.map((secretary) => secretary?.positionId) ?? [],
        indocSecretaryMode: formValues?.viewConfig?.value,
        outdocSecretaryMode: formValues?.approveConfig?.value
      })
    }
  })
})

defineExpose({
  openModal: handleOpendModal,
  closeModal: handleCloseModal
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    :footer="false"
    :wrapper-style="{ width: '600px', overflow: 'hidden' }"
    :classContent="'!overflow-hidden !pt-0 !p-0 h-full'"
    title="Thêm cấu hình thư ký - lãnh đạo"
  >
    <div class="relative h-full p-4">
      <form @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <InternalStaffSelect
            type="FULL"
            filter-leader-mode="DIRECTOR_AND_VICE"
            label="Chọn lãnh đạo"
            required
            :is-select-multiple="false"
            :error-message="errorLeaderMsg"
            @submit="handleSubmitSelectLeader"
          />
          <InternalStaffSelect
            type="FULL"
            required
            :disabled="!values?.leader"
            label="Chọn thư ký"
            :is-select-multiple="true"
            :error-message="errorSecretariesMsg"
            :model-value="values?.secretaries ?? []"
            :check-if-staff-disabled="(staff) => staff?.positionId === values?.leader?.positionId"
            @submit="handleSubmitSelectSecretaries"
          />
          <AppSelect
            name="approveConfig"
            label="Chọn quyền duyệt"
            required
            :fetch-options="handleGenApproveOpts"
          />
          <AppSelect
            name="viewConfig"
            label="Chọn quyền xem văn bản"
            required
            :fetch-options="handleGenViewOpts"
          />
        </div>
        <div class="mt-10 flex items-center justify-end gap-2">
          <Button
            class="min-w-[100px]"
            :disabled="isAddingConfig"
            label="Huỷ"
            severity="secondary"
            variant="outlined"
          />
          <Button
            type="submit"
            class="min-w-[100px]"
            label="Xác nhận"
            :loading="isAddingConfig"
            severity="primary"
          />
        </div>
      </form>
    </div>
    <ConfirmDialog group="modalAddSecretary" />
  </AppModal>
</template>
