<script setup lang="ts">
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import {
  DOCUMENT_PROCESS_ROLES_LABELS,
  type TDocumentProcessRole
} from '@/shared/constants/document'
import type { unitsSchema } from '@/shared/schemas/commonSchema'
import type { FlowDetailVM } from '@/shared/services/api'
import { getError } from '@/shared/utils/common'
import { Checkbox, Divider, Message } from 'primevue'
import { useField, useFieldArray, useFormContext } from 'vee-validate'
import { z } from 'zod'
import { SCOPE, SCOPE_LIST } from '../constants/flow'
import type { flowConfigSchema, flowUnitRelatedConfigSchema } from '../schemas/flowSchemas'

type TRelatedUnitsSchema = z.infer<typeof flowUnitRelatedConfigSchema>
type TUnitsSchema = z.infer<typeof unitsSchema>
type TFlowConfigSchema = z.infer<typeof flowConfigSchema>

type TProps = {
  flowData?: FlowDetailVM
  disabled: boolean
}

const { flowData, disabled } = defineProps<TProps>()

const { value: assignees, errorMessage: assigneeErrMsg } = useField<TUnitsSchema>('assignees')
const { fields, push, remove, update } = useFieldArray<TRelatedUnitsSchema>('assignedUnits')
const { submitCount, errors } = useFormContext<TFlowConfigSchema>()
const { value: enabledAssignmentRoles } = useField<TDocumentProcessRole[]>('enabledAssignmentRoles')
const hanleGetScopeOpts = () => ({
  options: SCOPE_LIST,
  hasMore: false
})
const handleAddAssignedUnit = () => {
  push({
    unit: null,
    scope: SCOPE_LIST?.find((scope) => scope?.value === SCOPE.SELF)!
  })
}
const handleRemoveAssignedUnit = (idx: number) => {
  if (!disabled) remove(idx)
}
</script>
<template>
  <div class="mb-4 text-2xl font-semibold">Giao việc</div>
  <InternalUnitSelect
    class="mb-4 w-full"
    label="Đơn vị của người được giao việc văn bản đến"
    :required="true"
    type="FULL"
    :default-value="
      flowData?.assignmentStaffReceivers?.map((unit) => ({
        id: unit?.unitId,
        name: unit?.unitName
      }))
    "
    :disabled
    :is-select-multiple="true"
    :errorMessage="assigneeErrMsg"
    @submit="(value) => (assignees = value)"
  />
  <div>
    <label class="text-primary mb-4 block font-medium"
      >Vai trò xử lý văn bản <span class="text-red-500">*</span></label
    >
    <div class="flex flex-col gap-0 md:flex-row md:gap-4">
      <div
        v-for="([roleValue, roleLabel], idx) in Object.entries(DOCUMENT_PROCESS_ROLES_LABELS)"
        :key="idx"
        class="mb-2 flex items-center gap-2"
      >
        <Checkbox
          v-model="enabledAssignmentRoles"
          :inputId="`${roleValue}_assign`"
          name="`${roleValue}_assign`"
          :value="roleValue"
          :disabled
        />
        <label class="cursor-pointer" :for="`${roleValue}_assign`">{{ roleLabel }}</label>
      </div>
    </div>
  </div>
  <div>
    <label class="text-primary mb-4 block font-medium">
      Đơn vị được giao việc VB đến<span class="text-red-500">*</span>
    </label>
  </div>
  <div>
    <div class="item-center flex justify-between gap-4">
      <label class="text-primary mb-0 block flex-1 font-medium">Đơn vị</label>
      <label class="text-primary mb-0 block flex-1 font-medium">Phạm vi</label>
      <div class="h-[24px] w-[24px] shrink-0"></div>
    </div>
    <Divider class="mt-0!" />
  </div>

  <div
    v-for="(entry, idx) in fields"
    :key="entry.key"
    class="item-center flex justify-between gap-4"
  >
    <InternalUnitSelect
      class="mb-4 flex-1"
      modal-label="Chọn đơn vị"
      label=""
      :required="true"
      type="FULL"
      :disabled
      :is-select-multiple="false"
      :default-value="
        flowData
          ? {
              id: flowData?.assignmentUnitReceivers?.[idx]?.unitId,
              name: flowData?.assignmentUnitReceivers?.[idx]?.unitName
            }
          : null
      "
      :error-message="getError(errors, `assignedUnits.${idx}.unit`)"
      @submit="(value) => update(idx, { ...fields[idx]?.value, unit: value })"
    />
    <AppSelect
      class="flex-1"
      :name="`assignedUnits[${idx}].scope`"
      :fetch-options="hanleGetScopeOpts"
      :multiple="false"
      :disabled
      :default-value="
        SCOPE_LIST?.find(
          (scope) => scope?.value === flowData?.assignmentUnitReceivers?.[idx]?.scope
        )!
      "
      :searchable="false"
      :model-value="fields[idx]?.value?.scope"
    />
    <div
      class="mt-2 flex h-full w-[24px] shrink-0 items-center justify-center bg-white font-semibold transition"
      :class="
        disabled
          ? 'cursor-not-allowed text-gray-200'
          : 'cursor-pointer text-gray-400 hover:text-red-400'
      "
    >
      <span
        class="icon-[tabler--trash] text-2xl"
        @click="() => handleRemoveAssignedUnit(idx)"
      ></span>
    </div>
  </div>
  <Message
    v-if="!!errors?.assignedUnits && !!submitCount"
    severity="error"
    size="small"
    variant="simple"
  >
    {{ errors?.assignedUnits }}
  </Message>
  <button
    v-if="!disabled"
    type="button"
    class="text-primary mb-4 inline-flex items-center gap-2 font-semibold hover:underline"
    @click="handleAddAssignedUnit"
  >
    <span class="icon-[gravity-ui--circle-plus-fill]"></span> Thêm đơn vị
  </button>
</template>
