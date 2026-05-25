<script setup lang="ts">
import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import {
  APP_PERMISSION_EFFECTS,
  APP_PERMISSION_LIST_LABEL,
  APP_PERMISSION_SCOPE_LABEL,
  APP_PERMISSION_SCOPES,
  type TAppFeatureKey
} from '@/shared/constants/permission'
import type { PermissionVM } from '@/shared/services/api'
import { getError } from '@/shared/utils/common'
import { Checkbox, Divider, Message } from 'primevue'
import { useFieldArray, useFormContext } from 'vee-validate'
import { ref, watchEffect } from 'vue'
import type z from 'zod'
import { useGetAllPermissionList } from '../composables/queries/useGetAllPermissionList'
import type { TPermission, TPermissionValue, TPermissonScopeValue } from '../models/authorization'
import type { permissionConfigSchema } from '../schemas/authorizationConfigSchemas'
import type { staffPermissionsConfigSchema } from '../schemas/staffManagementSchema'
type TPermissionConFigSchema = z.infer<typeof permissionConfigSchema>
type TStaffPermissionConFigSchema = z.infer<typeof staffPermissionsConfigSchema>

type TProps = {
  generatedPermissionsFromRoles?: TPermission[]
  isUseForPositionConfig?: boolean
}

const { generatedPermissionsFromRoles = [], isUseForPositionConfig = true } = defineProps<TProps>()

const showGeneneratedPermissions = ref(false)
const { data: allPermission, isLoading: isGettingPermissions } = useGetAllPermissionList()

const handleGetPermissionOpts = async () => {
  return {
    options: (allPermission?.value ?? []).map((doc) => ({
      value: doc,
      label: APP_PERMISSION_LIST_LABEL?.[doc.permission as TAppFeatureKey] ?? doc.permission
    })),
    hasMore: false
  }
}

const handleAddPermission = async () => {
  const newRow = {
    permission: null!,
    unit: null,
    scope: {
      label: APP_PERMISSION_SCOPE_LABEL[APP_PERMISSION_SCOPES.self],
      value: APP_PERMISSION_SCOPES.self
    },
    effect: APP_PERMISSION_EFFECTS.allow
  }

  setFieldValue('permissions', [...(values.permissions ?? []), newRow])
  await validateField('permissions')
}

const handleGetPermissionScopeOpts = () => {
  return {
    options: Object.entries(APP_PERMISSION_SCOPE_LABEL)?.map(([scopeValue, scopeLabel]) => ({
      label: scopeLabel,
      value: scopeValue as TPermissonScopeValue
    })),
    hasMore: false
  }
}

const handleResetValueWhenSelectPermission = (
  value: TCommonSelectOptions<PermissionVM>,
  idx: number
) => {
  if (value?.value?.isGlobal) {
    update(idx, {
      ...fields.value[idx]?.value,
      permission: value as TCommonSelectOptions<TPermissionValue>,
      unit: null,
      scope: {
        label: APP_PERMISSION_SCOPE_LABEL[APP_PERMISSION_SCOPES.all],
        value: APP_PERMISSION_SCOPES.all
      }
    })
  }
}
const { errors, validateField, setFieldValue, values } =
  useFormContext<TStaffPermissionConFigSchema>()
// const { validate } = useField<TPermissionConFigSchema>('permissions')
const { fields, remove, update } = useFieldArray<TPermissionConFigSchema>('permissions')
watchEffect(() => {
  console.log(fields, 'ádfsdafsdaffdfsda')
})
</script>
<template>
  <div>
    <template v-if="isUseForPositionConfig">
      <div class="col-span-2 mb-4 flex items-center gap-2">
        <Checkbox
          v-model="showGeneneratedPermissions"
          name="showGeneratedPermissions"
          :binary="true"
        />
        <label class="font-semibold" for="showGeneratedPermissions"
          >Hiển thị các quyền từ vai trò đã chọn</label
        >
      </div>
      <div class="italic">
        <span class="text-red-500">*</span>
        Các quyền từ vai trò đã chọn, không thể sửa(<span
          class="icon-[fluent-emoji-flat--red-exclamation-mark]"
        ></span
        >)
      </div>
    </template>
    <div class="grid grid-cols-25 gap-4">
      <div class="col-span-3 font-semibold">Hiệu lực</div>
      <div class="col-span-9 font-semibold">Hành động</div>
      <div class="col-span-6 font-semibold">Đơn vị</div>
      <div class="col-span-6 font-semibold">Phạm vi</div>
      <div class="col-span-1 font-semibold"></div>
    </div>
    <Divider />

    <template v-if="showGeneneratedPermissions">
      <div
        class="grid grid-cols-25 gap-4"
        v-for="(permission, idx) in generatedPermissionsFromRoles"
        :key="idx"
      >
        <div
          class="col-span-3 flex h-fit cursor-not-allowed items-center overflow-hidden rounded-md"
        >
          <div
            class="flex-1 rounded-l-md px-4 py-[var(--p-form-field-padding-y)] text-center font-medium transition-colors"
            :class="
              permission?.effect === APP_PERMISSION_EFFECTS.allow
                ? 'bg-blue-300 text-white'
                : 'bg-red-300 text-white'
            "
          >
            {{ permission?.effect === APP_PERMISSION_EFFECTS.allow ? 'Cho phép' : 'Cấm' }}
          </div>
        </div>
        <AppSelect
          class="col-span-9 cursor-not-allowed"
          :name="`permissions_gen[${idx}].permission`"
          :fetch-options="handleGetPermissionOpts"
          placeholder="Vui lòng chọn"
          :disabled="true"
          :model-value="permission?.permission"
          :append-to-body="true"
        ></AppSelect>
        <InternalUnitSelect
          class="col-span-6 mb-4 flex-1 cursor-not-allowed"
          modal-label="Chọn đơn vị"
          placeholder="Đơn vị của nhân sự"
          label=""
          type="FULL"
          :disabled="true"
          :is-select-multiple="false"
          :model-value="permission?.unit"
          @submit="(value) => update(idx, { ...fields[idx]?.value, unit: value })"
        />
        <AppSelect
          class="col-span-6 cursor-not-allowed"
          :name="`permissions_gen[${idx}].scope`"
          placeholder="Chính mình"
          :disabled="true"
          :fetch-options="handleGetPermissionScopeOpts"
          :searchable="false"
          :model-value="permission?.scope"
          :append-to-body="true"
        ></AppSelect>

        <div
          class="col-span-1 flex h-fit cursor-not-allowed items-center justify-center overflow-hidden rounded-md py-[var(--p-form-field-padding-y)] text-red-500"
        >
          <span class="icon-[fluent-emoji-flat--red-exclamation-mark] text-2xl"></span>
        </div>
      </div>
    </template>
    <div class="grid grid-cols-25 gap-4" v-for="(entry, idx) in fields" :key="entry.key">
      <div class="col-span-3 flex h-fit cursor-pointer items-center overflow-hidden rounded-md">
        <div
          class="flex-1 rounded-l-md px-4 py-[var(--p-form-field-padding-y)] text-center font-medium transition-colors"
          :class="
            fields[idx].value.effect === APP_PERMISSION_EFFECTS.allow
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-red-400 text-white hover:bg-red-500'
          "
          @click="
            () =>
              update(idx, {
                ...fields[idx]?.value,
                effect:
                  fields[idx]?.value.effect === APP_PERMISSION_EFFECTS.allow
                    ? APP_PERMISSION_EFFECTS.deny
                    : APP_PERMISSION_EFFECTS.allow
              })
          "
        >
          {{ fields[idx].value.effect === APP_PERMISSION_EFFECTS.allow ? 'Cho phép' : 'Cấm' }}
        </div>
      </div>
      <AppSelect
        class="col-span-9"
        :name="`permissions[${idx}].permission`"
        :fetch-options="handleGetPermissionOpts"
        placeholder="Vui lòng chọn"
        :disabled="isGettingPermissions"
        :searchable="true"
        @select="
          (value: TCommonSelectOptions<PermissionVM>) =>
            handleResetValueWhenSelectPermission(value, idx)
        "
        :append-to-body="true"
      ></AppSelect>
      <InternalUnitSelect
        class="col-span-6 mb-4 flex-1"
        modal-label="Chọn đơn vị"
        label=""
        placeholder="Đơn vị của nhân sự"
        type="FULL"
        :disabled="fields[idx]?.value?.permission?.value?.isGlobal"
        :is-select-multiple="false"
        :model-value="
          fields[idx]?.value?.unit
            ? {
                id: fields[idx]?.value?.unit.id,
                name: fields[idx]?.value?.unit.name
              }
            : null
        "
        :error-message="getError(errors, `permissions.${idx}.unit`)"
        @submit="(value) => update(idx, { ...fields[idx]?.value, unit: value })"
      />
      <AppSelect
        class="col-span-6"
        :name="`permissions[${idx}].scope`"
        placeholder="Chính mình"
        :disabled="fields[idx]?.value?.permission?.value?.isGlobal"
        :fetch-options="handleGetPermissionScopeOpts"
        :searchable="false"
        :append-to-body="true"
      ></AppSelect>

      <div
        class="col-span-1 flex h-fit cursor-pointer items-center justify-center overflow-hidden rounded-md py-[var(--p-form-field-padding-y)]"
      >
        <span
          class="icon-[tabler--trash] text-2xl"
          @click="
            () => {
              remove(idx)
            }
          "
        ></span>
      </div>
    </div>
    <Message v-if="!!errors?.permissions" severity="error" size="small" variant="simple">
      {{ errors?.permissions }}
    </Message>
    <button
      type="button"
      class="text-primary mb-4 inline-flex items-center gap-2 font-semibold hover:underline"
      @click="handleAddPermission"
    >
      <span class="icon-[gravity-ui--circle-plus-fill]"></span> Thêm quyền
    </button>
  </div>
</template>
