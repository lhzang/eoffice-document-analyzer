<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Message } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, useTemplateRef, watch, type Ref } from 'vue'
import { Tippy } from 'vue-tippy'
import z from 'zod'
import type { TPermission } from '../models/authorization'
import type { permissionConfigSchema } from '../schemas/authorizationConfigSchemas'
import { staffPermissionsConfigSchema } from '../schemas/staffManagementSchema'
import PermissionConfig from './PermissionConfig.vue'

type TProps = {
  label?: string
  modalLabel?: string
  hideLabel?: boolean
  placeholder?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: TPermission[]
  generatedPermissionsFromRoles?: TPermission[]
}

type TPermissionSchema = z.infer<typeof permissionConfigSchema>
type Modal = InstanceType<typeof AppModal>

const {
  label = 'Cấu hình quyền bổ sung',
  modalLabel = 'Chọn cấu hình quyền bổ sung',
  hideLabel = false,
  placeholder = 'Chọn cấu hình quyền bổ sung',
  errorMessage,
  required,
  disabled,
  defaultValue,
  generatedPermissionsFromRoles = []
} = defineProps<TProps>()

const emit = defineEmits<{
  submit: [submitValue: TPermission[]]
}>()

let initialized = false

const selectedAdditionalPermissions = defineModel<TPermission[]>() as Ref<TPermission[]>

const displayValues = computed(() => {
  if (!selectedAdditionalPermissions?.value) return ''
  return selectedAdditionalPermissions?.value
    ?.map((selectedPermission) => selectedPermission?.permission?.label)
    ?.join(', ')
})

const modalRef = useTemplateRef<Modal>('modalRef')

const { values, resetForm, handleSubmit, setFieldValue } = useForm({
  validationSchema: toTypedSchema(
    staffPermissionsConfigSchema.superRefine((data, ctx) => {
      const list = data.permissions ?? []
      const seen = new Map<string, string>()
      const duplicates = new Set<string>()
      for (const role of generatedPermissionsFromRoles) {
        const key = [
          role.permission?.value?.permission,
          role.scope?.value,
          role.effect,
          role.unit?.id ?? 'null'
        ].join('|')
        seen.set(key, label)
      }
      for (const item of list) {
        const key = [
          item.permission?.value?.permission,
          item.scope?.value,
          item.effect,
          item.unit?.id ?? 'null'
        ].join('|')

        const label = item.permission?.label ?? 'quyền không xác định'

        if (seen.has(key)) duplicates.add(label)
        else seen.set(key, label)
      }

      if (duplicates.size > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['permissions'],
          message: `Các quyền trùng lặp: ${[...duplicates].join(', ')}`
        })
      }
    })
  ),
  initialValues: {
    permissions: []
  }
})

const handleOpenModal = () => {
  if (disabled) return
  resetForm({
    values: {
      permissions: selectedAdditionalPermissions.value ?? []
    }
  })
  // tempValue.value = selectedAdditionalPermissions.value ?? []
  modalRef?.value?.openModal()
}

const handleCancel = () => {
  setFieldValue('permissions', (defaultValue ?? []) as TPermission[])
  // setFieldValue('permissions', (defaultValue ?? []) as TPermission[])
}
const onSubmit = handleSubmit((values) => {
  selectedAdditionalPermissions.value = (values?.permissions as TPermissionSchema[]) ?? []
  modalRef?.value?.closeModal()
  emit('submit', selectedAdditionalPermissions.value)
})
watch(
  () => defaultValue,
  (newVal) => {
    if (
      !initialized &&
      newVal &&
      (selectedAdditionalPermissions.value == null ||
        selectedAdditionalPermissions.value === undefined)
    ) {
      selectedAdditionalPermissions.value = newVal
      initialized = true
    }
  },
  { immediate: true }
)
</script>
<template>
  <slot name="triggerElement" @click="handleOpenModal" v-bind="$attrs">
    <div :class="`h-full w-full`" v-bind="$attrs">
      <label v-if="!hideLabel" class="text-primary font-semibold"
        >{{ label }} <span v-if="required" class="text-red-500">*</span></label
      >
      <Tippy :max-width="300" :content="displayValues">
        <div
          :class="`font-sm 0 h-10 border border-solid px-[.75rem] py-[.5rem] ${errorMessage ? 'border-[var(--p-inputtext-invalid-border-color)]' : 'border-[var(--p-inputtext-border-color)]'} rounded-md ${disabled ? 'cursor-not-allowed hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} - all duration - 200 transition ${disabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
          @click="handleOpenModal"
        >
          <div
            v-if="!false"
            class="h-full w-full truncate text-[var(--p-inputtext-disabled-color)]"
          >
            {{ displayValues || placeholder }}
          </div>
        </div>
      </Tippy>
      <Message v-if="!!errorMessage" severity="error" size="small" variant="simple">
        {{ errorMessage }}
      </Message>
    </div>
  </slot>
  <AppModal
    :title="modalLabel"
    ref="modalRef"
    :wrapper-style="{ width: '99%', height: '99%', maxHeight: '99%', overflow: 'hidden' }"
    :classContent="'!overflow-hidden !pt-6 !p-0 h-full'"
  >
    <form class="relative h-full" @submit="onSubmit">
      <PermissionConfig
        :style="{ height: 'calc(100% - 4rem)' }"
        class="overflow-auto px-4"
        :generatedPermissionsFromRoles
      />
      <div class="absolute right-4 bottom-4 mt-2 flex items-center justify-end gap-2">
        <Button
          class="min-w-[100px]"
          label="Đặt lại"
          severity="secondary"
          variant="outlined"
          @click="handleCancel"
        />
        <Button class="min-w-[100px]" label="Xác nhận" severity="primary" type="submit" />
      </div>
    </form>
  </AppModal>
</template>
