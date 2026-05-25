<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useGetAffectUnitByPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitByPermission'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type {
  TIssueUnitSelectValue,
  TStaffAndUnitSelectTab
} from '@/shared/models/organization/unit'
import type { AdminUnitVM } from '@/shared/services/api'
import { toastWarning } from '@/shared/utils/common'
import { Button, Message, RadioButton } from 'primevue'
import { computed, ref, useTemplateRef, watch, type Ref } from 'vue'
import { Tippy } from 'vue-tippy'
import { cloneDeep } from 'lodash-es'

type TProps = {
  stampUserPositionId?: string
  label?: string
  modalLabel?: string
  placeholder?: string
  errorMessage?: string
  disabled?: boolean
  tabList?: TStaffAndUnitSelectTab[]
  defaultValue?: TIssueUnitSelectValue | null
  hasStampUnits: AdminUnitVM[]
}
type Modal = InstanceType<typeof AppModal>

let initialized = false

const { data: unitsUserCanUseStamp, isLoading: isGettingUnitsCanUseStamp } =
  useGetAffectUnitByPermission(() => stampUserPositionId!, APP_PERMISSION_VALUES.useStamp, {
    enabled: () => !!stampUserPositionId
  })

const listUnitUserHasUseStampPermission = computed(() => {
  const resultList = new Set<string>()
  unitsUserCanUseStamp?.value?.forEach((unit) => resultList.add(unit?.id))
  return resultList
})

const listHasStampUnitUserCanUser = computed(() => {
  return (hasStampUnits ?? [])
    ?.filter((unit) => listUnitUserHasUseStampPermission?.value?.has(unit?.id))
    ?.map((unit) => ({
      id: unit?.id,
      name: unit?.name,
      isOrganization: !unit?.parentUnit
    }))
})

const {
  stampUserPositionId,
  label = 'Đơn vị cấp số, đóng dấu',
  modalLabel = 'Đơn vị cấp số, đóng dấu',
  placeholder = MSG_PLEASE_SELECT,
  errorMessage,
  disabled,
  defaultValue,
  hasStampUnits
} = defineProps<TProps>()

const emit = defineEmits<{
  submit: [submitValue: TIssueUnitSelectValue | null]
}>()

const isDisabled = computed(() => disabled || !stampUserPositionId)
const modalRef = useTemplateRef<Modal>('modalRef')

const issueUnit = defineModel<TIssueUnitSelectValue | null>()

const tempValue = ref<TIssueUnitSelectValue | null>(
  cloneDeep(defaultValue) ?? cloneDeep(issueUnit.value) ?? null
) as Ref<TIssueUnitSelectValue | null>

const displayValues = computed(() => {
  if (!issueUnit?.value) return ''
  return Array.isArray(issueUnit?.value)
    ? issueUnit?.value?.map((unit) => unit?.name)?.join(', ')
    : issueUnit?.value?.name
})
const handleOpenModalSelectUnit = () => {
  if (isDisabled?.value) return
  tempValue.value = cloneDeep(issueUnit.value) ?? null
  modalRef?.value?.openModal()
}

const handleConfirmSelect = () => {
  if (!tempValue.value) {
    return toastWarning({ detail: 'Vui lòng chọn đon vị cấp số, đóng dấu' })
  }
  issueUnit.value = cloneDeep(tempValue.value)
  emit('submit', issueUnit.value)
  modalRef?.value?.closeModal()
}

const handleCancel = () => {
  tempValue.value = cloneDeep(defaultValue) ?? null
}

const handleRadioValueChange = (selectedValue: TIssueUnitSelectValue) => {
  if (selectedValue) {
    tempValue.value = selectedValue
  }
}

// allow radio button can be unselect
const handleClickRadio = (e: MouseEvent) => {
  console.log(e.target, 'e.targete.target')
  if ((e.target as HTMLInputElement).checked) {
    tempValue.value = null
  }
}

watch(
  listHasStampUnitUserCanUser,
  (listUnit) => {
    if (listUnit?.length === 1) {
      issueUnit.value = listUnit[0]!
      emit('submit', issueUnit.value)
    }
  },
  { immediate: true }
)

watch(
  () => defaultValue,
  (newVal) => {
    if (!initialized && newVal && (issueUnit.value == null || issueUnit.value === undefined)) {
      issueUnit.value = newVal
      initialized = true
    }
  },
  { immediate: true }
)

watch(
  () => stampUserPositionId,
  () => {
    issueUnit.value = null
    tempValue.value = null
  },
  { immediate: true }
)
</script>

<template>
  <slot name="triggerElement" @click="handleOpenModalSelectUnit">
    <div :class="`h-full w-full`" v-bind="$attrs">
      <label v-if="label" class="text-primary font-semibold"
        >{{ label }} <span class="text-red-500">*</span></label
      >
      <Tippy :max-width="300" :content="displayValues">
        <div
          :class="`font-sm truncate border border-solid px-[.75rem] py-[.5rem] ${errorMessage ? 'border-[var(--p-inputtext-invalid-border-color)]' : 'border-[var(--p-inputtext-border-color)]'} rounded-md ${isDisabled ? 'cursor-not-allowed hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} - all duration - 200 transition ${isDisabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
          @click="handleOpenModalSelectUnit"
        >
          <div
            v-if="!false"
            class="h-full truncate text-[var(--p-inputtext-disabled-color)]"
            :class="{ 'text-[var(--vs-colors--dark)]': displayValues }"
          >
            {{ displayValues || placeholder }}
          </div>
        </div>
      </Tippy>
      <Message v-if="!!errorMessage" severity="error" size="small" variant="simple">
        {{ errorMessage }}
      </Message>
      <AppModal :title="modalLabel" ref="modalRef" :wrapper-style="{ width: '60%' }">
        <div class="bg-primary mt-4 flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
          <div class="item flex-1">Đơn vị</div>
          <div class="flex w-10 shrink-0 items-center justify-center">Chọn</div>
        </div>
        <div class="relative">
          <div
            v-if="isGettingUnitsCanUseStamp"
            class="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center"
          >
            <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
          </div>
          <div
            v-if="!listHasStampUnitUserCanUser?.length"
            class="flex h-full min-h-[200px] w-full items-center justify-center bg-white"
          >
            <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
            <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
          </div>
          <div v-else class="relative h-[400px] min-h-[200px] overflow-auto">
            <div
              v-for="(unit, idx) in listHasStampUnitUserCanUser"
              :key="idx"
              :class="`text-primary border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-4 py-2 font-bold ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`"
            >
              <div class="flex flex-1 items-center truncate">
                <span>{{ unit?.name }}</span>
              </div>
              <div class="flex h-auto w-10 shrink-0 items-center justify-center">
                <RadioButton
                  name="issueUnit"
                  @update:modelValue="handleRadioValueChange"
                  :value="unit"
                  @click.stop="handleClickRadio"
                  :model-value="tempValue"
                ></RadioButton>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 flex items-center justify-end gap-2">
          <Button
            class="min-w-[100px]"
            label="Đặt lại"
            severity="secondary"
            variant="outlined"
            @click="handleCancel"
          />
          <Button
            type="submit"
            class="min-w-[100px]"
            label="Xác nhận"
            severity="primary"
            @click="handleConfirmSelect"
          />
        </div>
      </AppModal>
    </div>
  </slot>
</template>
