<script setup lang="ts">
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import {
  ITD_SIGN_TYPE_LABELS,
  OD_SIGN_TYPE_LABELS,
  OD_SIGN_TYPES,
  type TODSignTypes
} from '@/shared/constants/sign'
import type {
  TDocumentSignSteps,
  TSigner,
  TSignerWithSignOrder
} from '@/shared/models/outDoc/signer'
import { getDisplayTypeLabel, transformStaffIntoSignerFormat } from '@/shared/utils/outDoc/signer'
import { useField } from 'vee-validate'
import { computed, watch, type ComputedRef } from 'vue'
import z from 'zod'
import type { signStepSchema } from '../../schemas/signFlowSchema'
import PreDefinedSignerWithOrder from './signFlowStaffSelects/PreDefinedSignerWithOrder.vue'
import PreDefinedSignerWithoutOrder from './signFlowStaffSelects/PreDefinedSignerWithoutOrder.vue'
import SelectSignerWithoutOrderStaff from './signFlowStaffSelects/SelectSignerWithoutOrderStaff.vue'
import SelectSignersWithOrderStaff from './signFlowStaffSelects/SelectSignersWithOrderStaff.vue'
import UnitSigner from './signFlowStaffSelects/UnitSigner.vue'

type TSignFlowStep = z.infer<typeof signStepSchema>

type TProps = {
  index: number
  // isSelectStaffDisabled?: boolean
  selectedFlow: TDocumentSignSteps
  type: 'internal' | 'out'
}
// add typ when update tree done
const { index, selectedFlow, type } = defineProps<TProps>()
// const emit = defineEmits<{
//   delete: [idx: number]
//   // update: [idx: number, newValue: T]
// }>()

const {
  setValue: setSignStepValue,
  value: stepData,
  errorMessage,
  meta
} = useField<TSignFlowStep>(() => `signFlow.${index}`)

const displayErrorMessage = computed(() => {
  return meta.touched ? errorMessage.value : undefined
})
const permittedStaffs: ComputedRef<TSigner[]> = computed(() =>
  (selectedFlow?.steps?.[index]?.permittedStaff ?? [])?.map((staff) =>
    transformStaffIntoSignerFormat(staff)
  )
)

watch(
  [permittedStaffs, () => stepData?.value?.signType],
  ([staffs, signType]) => {
    if (staffs?.length === 1) {
      if (signType === OD_SIGN_TYPES.majorSigner)
        setSignStepValue({
          signType: OD_SIGN_TYPES.majorSigner,
          staff: staffs?.[0]!
        })
      // if (
      //   signType === OD_SIGN_TYPES.leaderUnitSigner ||
      //   signType === OD_SIGN_TYPES.staffUnitSigner ||
      //   signType === OD_SIGN_TYPES.leaderCollaborator ||
      //   signType === OD_SIGN_TYPES.staffCollaborator
      // ) {
      //   setSignStepValue({
      //     signType: signType as Extract<
      //       TODSignTypes,
      //       'leaderUnitSigner' | 'staffUnitSigner' | 'leaderCollaborator' | 'staffCollaborator'
      //     >,
      //     staffs: [
      //       {
      //         staff: staffs?.[0]!,
      //         index: 0
      //       }
      //     ]
      //   })
      // } else {
      //   setSignStepValue({
      //     signType: signType as Extract<
      //       TODSignTypes,
      //       'majorSigner' | 'minorSigner' | 'evaluator' | 'formatSigner' | 'leaderFormatSigner'
      //     >,
      //     staff: staffs?.[0]!
      //   })
      // }
    }
  },
  { immediate: true }
)
const signerLabel = computed(() =>
  getDisplayTypeLabel(stepData?.value?.signType, type === 'internal')
)
</script>
<template>
  <div class="border-primary flex items-center gap-2 rounded-sm border p-2">
    <div
      class="item-center flex h-[24px] w-[24px] items-center justify-center bg-white font-semibold"
    >
      {{ index + 1 }}
    </div>
    <div class="grid flex-1 grid-cols-2 gap-4">
      <!-- <AppTextInput
        :name="`signFlow.${index}.signType_show`"
        label="Trình tự ký"
        disabled
        :placeholder="OD_SIGN_TYPE_LABELS?.[stepData?.signType]"
      /> -->
      <div class="h-full w-full">
        <label class="text-primary font-semibold">Trình tự ký</label>
        <div
          :class="`relative cursor-not-allowed rounded-md border border-solid border-[var(--p-inputtext-border-color)] bg-[var(--p-inputtext-disabled-background)] py-[var(--p-inputtext-padding-y)] pl-[.75rem] text-[var(--p-inputtext-disabled-color)] transition duration-200 hover:border-[#94a3b8]`"
          :style="{
            paddingInlineEnd: 'calc((var(--p-form-field-padding-x) * 2) + var(--p-icon-size))'
          }"
        >
          {{
            type === 'internal'
              ? ITD_SIGN_TYPE_LABELS?.[stepData?.signType]
              : OD_SIGN_TYPE_LABELS?.[stepData?.signType]
          }}
        </div>
      </div>
      <template v-if="selectedFlow?.steps?.[index]?.permittedStaff?.length">
        <PreDefinedSignerWithOrder
          v-if="
            stepData?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
            stepData?.signType === OD_SIGN_TYPES.staffUnitSigner ||
            stepData?.signType === OD_SIGN_TYPES.leaderCollaborator ||
            stepData?.signType === OD_SIGN_TYPES.staffCollaborator
          "
          @submit="
            (staffs, isCollab) =>
              setSignStepValue({
                signType: stepData?.signType as Extract<
                  TODSignTypes,
                  | 'leaderUnitSigner'
                  | 'staffUnitSigner'
                  | 'leaderCollaborator'
                  | 'staffCollaborator'
                >,
                staffs: staffs,
                isCollab: isCollab
              })
          "
          :isDefaultUnOrdered="stepData?.isCollab ?? selectedFlow?.steps?.[index]?.isCollab"
          :model-value="stepData?.staffs as TSignerWithSignOrder[]"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          :permitted-staff-list="permittedStaffs"
        />
        <PreDefinedSignerWithoutOrder
          v-else
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          :permitted-staff-list="permittedStaffs"
          :required="stepData?.signType === OD_SIGN_TYPES.majorSigner"
          @submit="
            (staff) =>
              setSignStepValue({
                signType: stepData?.signType as Extract<
                  TODSignTypes,
                  | 'majorSigner'
                  | 'minorSigner'
                  | 'evaluator'
                  | 'formatSigner'
                  | 'leaderFormatSigner'
                >,
                staff: staff
              })
          "
          :model-value="stepData?.staff as TSigner"
        />
      </template>
      <template v-else>
        <UnitSigner
          v-if="stepData?.signType === OD_SIGN_TYPES.leaderUnitSigner"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          type="LEADER"
          @submit="
            (staffs, isCollab) =>
              setSignStepValue({
                signType: OD_SIGN_TYPES.leaderUnitSigner,
                staffs: staffs,
                isCollab: isCollab
              })
          "
          :model-value="stepData?.staffs as TSignerWithSignOrder[]"
          :isDefaultUnOrdered="stepData?.isCollab ?? selectedFlow?.steps?.[index]?.isCollab"
          :errorMessage="displayErrorMessage"
        />
        <UnitSigner
          v-if="stepData?.signType === OD_SIGN_TYPES.staffUnitSigner"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          type="ALL"
          @submit="
            (staffs, isCollab) =>
              setSignStepValue({
                signType: OD_SIGN_TYPES.staffUnitSigner,
                staffs: staffs,
                isCollab: isCollab
              })
          "
          :model-value="stepData?.staffs as TSignerWithSignOrder[]"
          :isDefaultUnOrdered="stepData?.isCollab ?? selectedFlow?.steps?.[index]?.isCollab"
          :errorMessage="displayErrorMessage"
        />
        <SelectSignersWithOrderStaff
          v-if="stepData?.signType === OD_SIGN_TYPES.leaderCollaborator"
          filterLeaderMode="DIRECTOR_AND_VICE"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          @submit="
            (staffs, isCollab) =>
              setSignStepValue({
                signType: OD_SIGN_TYPES.leaderCollaborator,
                staffs: staffs,
                isCollab: isCollab
              })
          "
          :model-value="stepData?.staffs as TSignerWithSignOrder[]"
          :isDefaultUnOrdered="stepData?.isCollab ?? selectedFlow?.steps?.[index]?.isCollab"
          :errorMessage="displayErrorMessage"
        />
        <SelectSignersWithOrderStaff
          v-if="stepData?.signType === OD_SIGN_TYPES.staffCollaborator"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          @submit="
            (staffs, isCollab) =>
              setSignStepValue({
                signType: OD_SIGN_TYPES.staffCollaborator,
                staffs: staffs,
                isCollab: isCollab
              })
          "
          :model-value="stepData?.staffs as TSignerWithSignOrder[]"
          :isDefaultUnOrdered="stepData?.isCollab ?? selectedFlow?.steps?.[index]?.isCollab"
          :errorMessage="displayErrorMessage"
        />
        <SelectSignerWithoutOrderStaff
          v-if="stepData?.signType === OD_SIGN_TYPES.evaluator"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          type="FULL"
          :permissionFilter="APP_PERMISSION_VALUES.evaluateOutDoc"
          :isSelectMultiple="false"
          :model-value="stepData?.staff as TSigner"
          @submit="
            (staff) =>
              setSignStepValue({
                signType: OD_SIGN_TYPES.evaluator,
                staff: staff
              })
          "
          :errorMessage="displayErrorMessage"
        />
        <SelectSignerWithoutOrderStaff
          v-if="stepData?.signType === OD_SIGN_TYPES.formatSigner"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          :permissionFilter="APP_PERMISSION_VALUES.outdocFormatSign"
          type="FULL"
          :isSelectMultiple="false"
          :model-value="stepData?.staff as TSigner"
          @submit="
            (staff) =>
              setSignStepValue({
                signType: OD_SIGN_TYPES.formatSigner,
                staff: staff
              })
          "
          :errorMessage="displayErrorMessage"
        />
        <SelectSignerWithoutOrderStaff
          v-if="stepData?.signType === OD_SIGN_TYPES.leaderFormatSigner"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          :permissionFilter="APP_PERMISSION_VALUES.outdocFormatSign"
          filter-leader-mode="DIRECTOR_AND_VICE"
          type="FULL"
          :isSelectMultiple="false"
          :model-value="stepData?.staff as TSigner"
          @submit="
            (staff) =>
              setSignStepValue({
                signType: OD_SIGN_TYPES.leaderFormatSigner,
                staff: staff
              })
          "
          :errorMessage="displayErrorMessage"
        />
        <SelectSignerWithoutOrderStaff
          v-if="stepData?.signType === OD_SIGN_TYPES.majorSigner"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          :permissionFilter="APP_PERMISSION_VALUES.useStamp"
          filter-leader-mode="DIRECTOR_AND_VICE"
          type="FULL"
          :required="true"
          :isSelectMultiple="false"
          :model-value="stepData?.staff as TSigner"
          @submit="
            (staff) =>
              setSignStepValue({
                signType: OD_SIGN_TYPES.majorSigner,
                staff: staff
              })
          "
          :errorMessage="displayErrorMessage"
        />
        <SelectSignerWithoutOrderStaff
          v-if="stepData?.signType === OD_SIGN_TYPES.minorSigner"
          :label="signerLabel"
          :modalLabel="`Chọn ${signerLabel?.toLowerCase()}`"
          filter-leader-mode="DIRECTOR_AND_VICE"
          type="FULL"
          :isSelectMultiple="false"
          :model-value="stepData?.staff as TSigner"
          @submit="
            (staff) =>
              setSignStepValue({
                signType: OD_SIGN_TYPES.minorSigner,
                staff: staff
              })
          "
          :errorMessage="displayErrorMessage"
        />
      </template>
    </div>
  </div>
</template>
