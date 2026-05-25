<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import FullTreeSelectInternalUnit from '@/shared/components/organization/unit/FullTreeSelectInternalUnit.vue'
import SelectExternalUnit from '@/shared/components/organization/unit/SelectExternalUnit.vue'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import { type TUnitSelectValue } from '@/shared/models/organization/unit'
import { Button, Message } from 'primevue'
import { ref, useTemplateRef } from 'vue'

const emit = defineEmits<{
  submit: [submitValue: TUnitSelectValue | null]
}>()

type TProps = {
  label?: string
  placeholder?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
}
type Modal = InstanceType<typeof AppModal>

const {
  label = 'Đơn vị ban hành',
  placeholder = MSG_PLEASE_SELECT,
  errorMessage,
  required,
  disabled
} = defineProps<TProps>()

const modelValue = defineModel<TUnitSelectValue | null>()

const modalRef = useTemplateRef<Modal>('modalRef')
const selectedTab = ref(0)

const tempValue = ref<TUnitSelectValue | null>(null)

const handleOpenModalSelectOrg = () => {
  tempValue.value = modelValue.value ?? null
  modalRef?.value?.openModal()
}

const handleConfirm = () => {
  modelValue.value = tempValue.value
  emit('submit', modelValue.value)
  modalRef?.value?.closeModal()
}
</script>

<template>
  <div :class="`h-full w-full`">
    <label class="text-primary font-semibold"
      >{{ label }} <span v-if="required" class="text-red-500">*</span></label
    >
    <div
      :class="`font-sm border border-solid py-[.5rem] pr-[2.5rem] pl-[.75rem] ${
        errorMessage
          ? 'border-[var(--p-inputtext-invalid-border-color)]'
          : 'border-[var(--p-inputtext-border-color)]'
      } rounded-md ${
        disabled
          ? 'cursor-not-allowed hover:border-[#94a3b8]'
          : 'hover:border-[var(--p-inputtext-border-color)]'
      } - all duration - 200 transition ${
        disabled
          ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]'
          : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'
      } relative`"
      @click="handleOpenModalSelectOrg"
    >
      <div v-if="modelValue?.id" class="truncate" :title="modelValue?.name">
        {{ modelValue?.name }}
      </div>
      <div v-else class="truncate text-[var(--p-inputtext-disabled-color)]">
        {{ placeholder }}
      </div>
    </div>
    <Message v-if="!!errorMessage" severity="error" size="small" variant="simple">
      {{ errorMessage }}
    </Message>
    <AppModal title="Chọn cơ quan ban hành" ref="modalRef" :wrapper-style="{ width: '60%' }">
      <div
        class="mb-6 flex h-9 cursor-pointer items-center overflow-hidden rounded-md border bg-white"
      >
        <div
          class="flex h-full flex-1 items-center justify-center font-bold"
          :class="`${selectedTab === 0 ? 'bg-primary text-white' : 'text-primary bg-inherit'}`"
          @click="() => (selectedTab = 0)"
        >
          Đơn vị bên ngoài
        </div>
        <div
          class="flex h-full flex-1 items-center justify-center font-bold"
          :class="`${selectedTab === 1 ? 'bg-primary text-white' : 'text-primary bg-inherit'}`"
          @click="() => (selectedTab = 1)"
        >
          Đơn vị nội bộ
        </div>
      </div>
      <SelectExternalUnit
        v-if="selectedTab === 0"
        v-model="tempValue"
        :is-select-multiple="false"
      />
      <FullTreeSelectInternalUnit
        v-else
        v-model="tempValue"
        :is-select-multiple="false"
        isPreventSelectGroup
      />
      <div class="mt-5 flex items-center justify-end gap-2">
        <Button
          class="min-w-[100px]"
          label="Đặt lại"
          severity="secondary"
          @click="tempValue = null"
        />
        <Button
          type="submit"
          class="min-w-[100px]"
          label="Xác nhận"
          severity="primary"
          @click="handleConfirm"
        />
      </div>
    </AppModal>
  </div>
</template>
