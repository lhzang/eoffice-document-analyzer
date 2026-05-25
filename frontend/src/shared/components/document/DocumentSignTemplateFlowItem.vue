<script setup lang="ts">
import type {
  createSignFlowConfigSchema,
  signFlowSchema
} from '@/modules/organization/schemas/signFlowTemplateSchmema'
import type { TDocumentTypeForSign } from '@/shared/constants/document'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import {
  OD_EXTERNAl_SIGN_TYPE_OPTS,
  OD_INTERNAL_DOC_SIGN_TYPE_OPTS,
  OD_SIGN_TYPES,
  type TODSignTypes
} from '@/shared/constants/sign'
import type { TStaffSelectValue } from '@/shared/models/organization/unit'
import AppSelect, { type TCommonSelectOptions } from '@form-element/AppSelect.vue'
import { useField, useFormContext } from 'vee-validate'
import { computed } from 'vue'
import z from 'zod'
import InternalStaffSelect from '../organization/unit/InternalStaffSelect.vue'

type TSignFlow = z.infer<typeof signFlowSchema>

type TProps = {
  formName: string
  documentType: TDocumentTypeForSign
  index: number
  disabled?: boolean
  isSelectTypeDisabled?: boolean
}
// add typ when update tree done
const {
  formName,
  index,
  documentType,
  isSelectTypeDisabled = false,
  disabled = false
} = defineProps<TProps>()
const emit = defineEmits<{
  delete: [idx: number]
  // update: [idx: number, newValue: T]
}>()

const { values } = useFormContext<z.infer<typeof createSignFlowConfigSchema>>()

const { setValue: setSignersValue } = useField<TStaffSelectValue[] | null>(
  () => `${formName}.${index}.staffs`
)

const filterLeaderMode = computed(() =>
  values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES?.leaderUnitSigner ||
  values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES?.leaderCollaborator ||
  values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES?.leaderFormatSigner ||
  values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES?.majorSigner ||
  values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES?.minorSigner
    ? 'DIRECTOR_AND_VICE'
    : undefined
)

const permissionFilter = computed(() => {
  if (values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES?.evaluator)
    return APP_PERMISSION_VALUES.evaluateOutDoc
  if (
    values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES?.formatSigner ||
    values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES?.leaderFormatSigner
  )
    return APP_PERMISSION_VALUES.outdocFormatSign

  if (values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES?.majorSigner)
    return APP_PERMISSION_VALUES.useStamp

  return undefined
})

const allSignTypes = computed<TODSignTypes[]>(
  () => values?.signFlow.map((field: TSignFlow) => field.signType?.value)?.filter(Boolean) || []
)
const getListSignTypes = () => {
  let options: TCommonSelectOptions<string>[] = []
  if (documentType === 'OUT_DOCUMENT') {
    options = Object.entries(OD_EXTERNAl_SIGN_TYPE_OPTS)?.map(([value, label]) => ({
      label,
      value
    }))
  } else {
    options = Object.entries(OD_INTERNAL_DOC_SIGN_TYPE_OPTS)?.map(([value, label]) => ({
      label,
      value
    }))
  }
  return {
    options: options,
    hasMore: false
  }
}

const handleSelectStaff = (selectedStaffs: TStaffSelectValue[] | null) => {
  setSignersValue(selectedStaffs)
}

const handleDeleteStep = () => {
  if (disabled || values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES.majorSigner) return
  emit('delete', index)
}
</script>
<template>
  <div class="border-primary flex items-center gap-2 rounded-sm border p-2">
    <div
      class="item-center flex h-[24px] w-[24px] items-center justify-center bg-white font-semibold"
    >
      {{ index + 1 }}
    </div>
    <div class="grid flex-1 grid-cols-2 gap-4">
      <AppSelect
        :name="`${formName}.${index}.signType`"
        label="Trình tự ký"
        placeholder="Chọn trình tự ký"
        required
        :fetch-options="getListSignTypes"
        @select="setSignersValue(null)"
        :disabled="isSelectTypeDisabled || disabled"
        :selectable="
          (option) => {
            return !allSignTypes?.includes(
              (option as TCommonSelectOptions<string>)?.value as TODSignTypes
            )
          }
        "
      ></AppSelect>
      <InternalStaffSelect
        type="FULL"
        label="Chọn người thực hiện"
        :model-value="values?.signFlow?.[index]?.staffs"
        :disabled="!values?.signFlow?.[index]?.signType || disabled"
        :is-select-multiple="true"
        @submit="handleSelectStaff"
        :filter-leader-mode="filterLeaderMode"
        :permission-filter="permissionFilter"
      />
    </div>
    <div
      class="item-center flex h-[24px] w-[24px] cursor-pointer items-center justify-center bg-white font-semibold text-gray-400 transition hover:text-red-400"
      :class="{
        'cursor-not-allowed! hover:text-gray-400!':
          disabled || values?.signFlow?.[index]?.signType?.value === OD_SIGN_TYPES.majorSigner
      }"
    >
      <span class="icon-[tabler--trash] text-2xl" @click="handleDeleteStep"></span>
    </div>
  </div>
</template>
