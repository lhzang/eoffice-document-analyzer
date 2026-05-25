<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import FullTreeSelectInternalUnit from '@/shared/components/organization/unit/FullTreeSelectInternalUnit.vue'
import SelectExternalUnit from '@/shared/components/organization/unit/SelectExternalUnit.vue'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { TExternalUnit, TSelectedInternalUnit } from '@/shared/models/organization/unit'
import { useForm } from 'vee-validate'
import { ref, useTemplateRef } from 'vue'

type TProps = {
  class?: string
  label?: string
  name: string
  placeholder?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
}
type Modal = InstanceType<typeof AppModal>
type TFormData = {
  externalUnit: TExternalUnit | null
  internalUnit: TSelectedInternalUnit | null
}

const {
  label = 'Đơn vị ban hành',
  placeholder = MSG_PLEASE_SELECT,
  errorMessage,
  required,
  disabled
} = defineProps<TProps>()

const modelValue = defineModel()

const modalRef = useTemplateRef<Modal>('modalRef')
const selectedTab = ref(0)

const { defineField } = useForm<TFormData>({
  initialValues: {
    externalUnit: null,
    internalUnit: null
  }
})

const [externalUnit] = defineField('externalUnit')
const [internalUnit] = defineField('internalUnit')
const handleOpenModalSelectOrg = () => {
  modalRef?.value?.openModal()
}
</script>

<template>
  <div class="h-full w-full" v-bind="$attrs">
    <label class="text-primary font-semibold"
      >{{ label }} <span v-if="required" class="text-red-500">*</span></label
    >
    <div
      :class="`font-sm h-10 border border-solid py-[.5rem] pr-[2.5rem] pl-[.75rem] ${errorMessage ? 'border-[var(--p-inputtext-invalid-border-color)]' : 'border-[var(--p-inputtext-border-color)]'} rounded-md ${disabled ? 'cursor-not-allowed hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} - all duration - 200 transition ${disabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
    >
      <div
        v-if="!modelValue"
        class="text-[var(--p-inputtext-disabled-color)]"
        @click="handleOpenModalSelectOrg"
      >
        {{ placeholder }}
      </div>
    </div>
  </div>
  <AppModal title="Chọn cơ quan ban hành" ref="modalRef" :wrapper-style="{ width: '60%' }">
    <div class="mb-6 flex h-9 cursor-pointer items-center rounded-full bg-white">
      <div
        class="flex h-full flex-1 items-center justify-center rounded-full font-bold"
        :class="`${selectedTab === 0 ? 'bg-primary text-white' : 'text-primary bg-inherit'}`"
        @click="() => (selectedTab = 0)"
      >
        Đơn vị bên ngoài
      </div>
      <div
        class="flex h-full flex-1 items-center justify-center rounded-full font-bold"
        :class="`${selectedTab === 1 ? 'bg-primary text-white' : 'text-primary bg-inherit'}`"
        @click="() => (selectedTab = 1)"
      >
        Đơn vị nội bộ
      </div>
    </div>
    <template v-if="selectedTab === 0">
      <SelectExternalUnit
        v-model="externalUnit"
        form-name="externalUnit"
        :is-select-multiple="true"
      />
    </template>
    <template v-else>
      <FullTreeSelectInternalUnit
        v-model="internalUnit"
        form-name="internalUnit"
        :is-select-multiple="true"
      />
    </template>
  </AppModal>
</template>
