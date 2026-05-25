<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import { ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import { SIGN_PROVIDER_LABEL } from '@/shared/constants/sign'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import type { UnitInfoVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import {
  cleanObject,
  fetchImageWithAuth,
  getFullFileUrl,
  toastSucceed
} from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import { useDeleteUnit } from '../composables/queries/useDeleteUnit'
import { useUpdateUnit } from '../composables/queries/useUpdateUnit'
import { unitInfoSchema } from '../schemas/unitSchema'

type TProps = {
  unitDetails: UnitInfoVM
  unitTreeData: TTreeUnitWithStaffNode
  unitId: string
  hasManageUnitPermission: boolean
}

const { unitDetails, unitTreeData, unitId, hasManageUnitPermission } = defineProps<TProps>()
const logo = ref<string | undefined>(undefined)

const emit = defineEmits<{
  (e: 'unitHandled'): void
}>()

const confirm = useConfirm()

const { mutate: updateUnit, isPending: isUpdatingUnit } = useUpdateUnit({
  onSuccess: () => {
    emit('unitHandled')
    toastSucceed({ detail: 'Cập nhật thông tin đơn vị thành công' })
  }
})

const { mutate: deleteUnit, isPending: isDeletingUnit } = useDeleteUnit({
  onSuccess: () => {
    emit('unitHandled')
    toastSucceed({
      detail: 'Xóa đơn vị thành công'
    })
  }
})

const selectedNode = ref<TTreeUnitWithStaffNode | null>()
const selectedClericalNode = ref<TTreeUnitWithStaffNode | null>()

const headStaff = unitDetails.leaders?.find((staff) =>
  staff.positions?.some(
    (p) =>
      p.unitId === unitId &&
      (p.roleInUnit === ROLE_IN_UNIT_VALUES.director ||
        p.roleInUnit === ROLE_IN_UNIT_VALUES.unitHead)
  )
)
const headInitialValue = headStaff
  ? {
      label: headStaff.fullName,
      value:
        headStaff.positions.find(
          (p) =>
            p.unitId === unitId &&
            (p.roleInUnit === ROLE_IN_UNIT_VALUES.director ||
              p.roleInUnit === ROLE_IN_UNIT_VALUES.unitHead)
        )?.id ?? ''
    }
  : undefined

const deputyInitialValues: TCommonSelectOptions<string>[] =
  unitDetails.leaders
    ?.filter((staff) =>
      staff.positions?.some(
        (p) => p.unitId === unitId && p.roleInUnit === ROLE_IN_UNIT_VALUES.unitDeputy
      )
    )
    .map((staff) => ({
      label: staff.fullName,
      value:
        staff.positions.find(
          (p) => p.unitId === unitId && p.roleInUnit === ROLE_IN_UNIT_VALUES.unitDeputy
        )?.id ?? ''
    })) ?? []

const defaultSigningProviderInitialValue = unitDetails.defaultSigningConfig
  ? {
      label: SIGN_PROVIDER_LABEL[unitDetails.defaultSigningConfig.signingProvider],
      value: unitDetails.defaultSigningConfig.signingProvider
    }
  : undefined

const { setFieldValue, handleSubmit, values } = useForm({
  validationSchema: toTypedSchema(unitInfoSchema),
  initialValues: {
    abbr: unitDetails.abbr,
    parentId: unitDetails.parentUnit?.id,
    groupId: unitDetails.group?.id,
    clericalUnit: unitDetails.clericalUnit
      ? {
          id: unitDetails.clericalUnit?.id,
          name: unitDetails.clericalUnit?.name
        }
      : undefined,
    axisOrgId: unitDetails.axisOrgId,
    name: unitDetails.name,
    address: unitDetails.address,
    rank: unitDetails.rank,
    email: unitDetails.email,
    phone: unitDetails.phone,
    fax: unitDetails.fax,
    head: headInitialValue,
    deputy: deputyInitialValues,
    defaultSigningProvider: defaultSigningProviderInitialValue
  }
})

const descendantUnits = computed(() => {
  if (!unitTreeData) return new Map<string, TTreeUnitWithStaffNode>()
  return getAllDescendantUnits(unitTreeData)
})

const headId = computed(() => values.head?.value)
const deputyIds = computed<string[]>(() => {
  if (Array.isArray(values.deputy)) {
    return values.deputy.map((item) => item.value)
  }
  return []
})

const handleUnitSelect = (unit: TTreeUnitWithStaffNode) => {
  selectedNode.value = unit
  setFieldValue('parentId', unit.isGroup ? unit.parentUnit?.id : unit.id)
  setFieldValue('groupId', unit.isGroup ? unit.id : '')
}

const handleClericalUnitSelect = (unit: TTreeUnitWithStaffNode) => {
  selectedClericalNode.value = unit
  setFieldValue('clericalUnit', unit)
}

const getAllDescendantUnits = (
  unit: TTreeUnitWithStaffNode
): Map<string, TTreeUnitWithStaffNode> => {
  const listDescendantUnits = new Map<string, TTreeUnitWithStaffNode>()

  unit?.subUnits?.forEach((subUnit) => {
    listDescendantUnits.set(subUnit.id, subUnit)
    getAllDescendantUnits(subUnit).forEach((item, id) => {
      listDescendantUnits.set(id, item)
    })
  })

  return listDescendantUnits
}

const checkIfParentUnitDisabled = (unit: TTreeUnitWithStaffNode) => {
  return unit.id === unitId || descendantUnits.value.has(unit.id)
}

const checkIfClericalUnitDisabled = (unit: TTreeUnitWithStaffNode) => {
  return unit.id === unitDetails.clericalUnit?.id
}

const handleFetchUserinUnit = async (search: string, page: number) => {
  const result = await sharedUnitService.getUserInUnit(
    cleanObject({
      unitId,
      page
      // size: 20
    })
  )
  return {
    options: result?.items.map((user) => ({
      label: user.fullName,
      value: user.positions?.[0]?.id
    })),
    hasMore: result.pageNumber < result?.totalPages
  }
}

const handleGetProviders = () => ({
  options: unitDetails.signingConfig?.map((config) => ({
    label: SIGN_PROVIDER_LABEL?.[config.signingProvider],
    value: config.signingProvider
  })),
  hasMore: false
})

const handleDeleteUnit = () => {
  confirm.require({
    group: 'confirmProcessUnit',
    message: 'Thầy/Cô có chắc chắn muốn xóa đơn vị này?',
    header: 'Xác nhận',
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
      if (!unitId) return
      deleteUnit(unitId)
    }
  })
}

const onSubmit = handleSubmit((formValues) => {
  const payload = cleanObject({
    abbr: formValues.abbr,
    parentId: formValues.parentId ?? undefined,
    groupId: formValues.groupId ?? undefined,
    clericalUnitId: formValues.clericalUnit?.id ?? undefined,
    axisOrgId: formValues.axisOrgId ?? undefined,
    name: formValues.name,
    address: formValues.address ?? undefined,
    rank: formValues.rank ?? undefined,
    email: formValues.email ?? undefined,
    phone: formValues.phone ?? undefined,
    fax: formValues.fax ?? undefined,
    logo: formValues.logo ?? undefined,
    defaultSigningProvider: formValues.defaultSigningProvider?.value,
    headId: formValues.head?.value,
    deputyIds: formValues.deputy.map((item) => item.value) || []
  })
  payload.deputyIds = formValues.deputy?.map((item) => item.value) ?? []
  confirm.require({
    group: 'confirmProcessUnit',
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
      if (!unitId) return
      updateUnit({
        id: unitId,
        payload: payload
      })
    }
  })
})

watch(
  () => unitDetails?.logo,
  async (logoPath) => {
    if (!logoPath) {
      logo.value = undefined
      return
    }
    logo.value = await fetchImageWithAuth(getFullFileUrl(logoPath))
  },
  { immediate: true }
)
</script>

<template>
  <Button
    v-if="hasManageUnitPermission"
    :fluid="false"
    class="mb-4 w-fit min-w-[100px]"
    label="Xóa đơn vị"
    severity="danger"
    @click="handleDeleteUnit"
    :loading="isDeletingUnit"
    :disabled="isUpdatingUnit"
  />
  <div class="mx-auto h-40 w-40" v-if="unitDetails?.logo">
    <img :src="logo" class="border-shadow max-h-full max-w-full align-middle" alt="logo" />
  </div>
  <form @submit="onSubmit">
    <div class="grid grid-cols-2 gap-4">
      <AppTextInput
        :disabled="!hasManageUnitPermission"
        name="abbr"
        label="Mã đơn vị"
        placeholder="Mã đơn vị"
        required
      />
      <AppTextInput
        :disabled="!hasManageUnitPermission"
        name="axisOrgId"
        label="Mã định danh"
        placeholder="Nhập mã định danh"
      />
      <AppTextInput
        :disabled="!hasManageUnitPermission"
        class="col-span-2"
        name="name"
        label="Tên đơn vị"
        placeholder="Nhập tên đơn vị"
        required
      />
      <AppTextInput
        :disabled="!hasManageUnitPermission"
        class="col-span-2"
        name="address"
        label="Địa chỉ"
        placeholder="Nhập địa chỉ"
      />

      <div v-if="!unitDetails.isRoot" class="col-span-2">
        <div class="flex">
          <div class="text-primary font-semibold">Đơn vị:</div>
          <InternalUnitSelect
            :disabled="!hasManageUnitPermission"
            class="col-span-2"
            modal-label="Chọn đơn vị"
            label="Đơn vị cấp trên"
            required
            type="FULL"
            :is-select-multiple="false"
            :check-if-unit-disabled="checkIfParentUnitDisabled"
            :isPreventSelectGroup="false"
            @unit-select="handleUnitSelect"
          >
            <template #triggerElement="{ open }">
              <div
                class="text-primary ml-auto cursor-pointer font-semibold underline"
                @click="open"
              >
                Chọn vị trí
              </div>
            </template>
          </InternalUnitSelect>
        </div>

        <div class="card" v-if="selectedNode">
          <div v-if="selectedNode?.isGroup">
            <span class="font-semibold">Đơn vị cấp trên: </span>
            <span>{{ selectedNode?.parentUnit?.name }}</span>
            <hr class="my-3 text-[#e2e8f0]" />
            <span class="font-semibold">Khối đơn vị: </span>
            <span>{{ selectedNode?.name }}</span>
          </div>
          <div v-else>
            <span class="font-semibold">Đơn vị cấp trên: </span>
            <span>{{ selectedNode?.name }}</span>
          </div>
        </div>

        <div class="card" v-else>
          <div v-if="unitDetails.group">
            <span class="font-semibold">Đơn vị cấp trên: </span>
            <span>{{ unitDetails.parentUnit?.name }}</span>
            <hr class="my-3 text-[#e2e8f0]" />
            <span class="font-semibold">Khối đơn vị: </span>
            <span>{{ unitDetails.group?.name }}</span>
          </div>
          <div v-else>
            <span class="font-semibold">Đơn vị cấp trên: </span>
            <span v-if="!unitDetails.parentUnit">Không có đơn vị cấp trên</span>
            <span v-else>{{ unitDetails.parentUnit?.name }}</span>
          </div>
        </div>
      </div>

      <AppSelect
        :disabled="!hasManageUnitPermission"
        class="col-span-2"
        name="head"
        label="Trưởng đơn vị"
        placeholder="Chọn cán bộ"
        :fetch-options="handleFetchUserinUnit"
        :selectable="
          (option) => !deputyIds.includes((option as TCommonSelectOptions<string>)?.value)
        "
      />

      <AppSelect
        :disabled="!hasManageUnitPermission"
        class="col-span-2"
        name="deputy"
        label="Phó đơn vị"
        :multiple="true"
        placeholder="Chọn cán bộ"
        :fetch-options="handleFetchUserinUnit"
        :selectable="(option) => (option as TCommonSelectOptions<string>)?.value !== headId"
      />

      <div class="col-span-2">
        <InternalUnitSelect
          :disabled="!hasManageUnitPermission"
          modal-label="Chọn đơn vị"
          label="Chọn đơn vị văn thư quản lý"
          type="FULL"
          :is-select-multiple="false"
          :model-value="
            values.clericalUnit?.id && values.clericalUnit?.name
              ? { name: values.clericalUnit.name, id: values.clericalUnit.id }
              : undefined
          "
          :check-if-unit-disabled="checkIfClericalUnitDisabled"
          @unit-select="handleClericalUnitSelect"
        >
          <!-- <template #triggerElement="{ open }">
            <div class="h-full w-full">
              <label class="text-primary font-semibold"
                >Chọn đơn vị văn thư quản lý</label
              >
              <Tippy
                :max-width="300"
                @click="open"
                :content="selectedClericalNode?.name || unitDetails.clericalUnit?.name"
              >
                <div
                  class="flex justify-between items-center font-sm truncate border border-solid px-[.75rem] py-[.5rem] rounded-md duration-200 transition-all relative border-[var(--p-inputtext-border-color)] hover:border-[#94a3b8] cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]"
                >
                  <div
                    class="h-full truncate text-[var(--p-inputtext-disabled-color)] text-[var(--vs-colors--dark)]"
                  >
                    {{ selectedClericalNode ? selectedClericalNode.name : (unitDetails.clericalUnit ? unitDetails.clericalUnit?.name : 'Chưa có đơn vị văn thư quản lý' ) }}
                  </div>
                  <Button label="Chọn" />
                </div>
              </Tippy>
            </div>
          </template> -->
        </InternalUnitSelect>
      </div>

      <AppNumberInput
        :disabled="!hasManageUnitPermission"
        required
        name="rank"
        label="STT"
        placeholder="Nhập số thứ tự"
      />
      <AppTextInput
        :disabled="!hasManageUnitPermission"
        name="email"
        label="Email"
        placeholder="Nhập email"
      />
      <AppTextInput
        :disabled="!hasManageUnitPermission"
        name="phone"
        label="SĐT"
        placeholder="Nhập số điện thoại"
      />
      <AppTextInput
        :disabled="!hasManageUnitPermission"
        name="fax"
        label="Fax"
        placeholder="Nhập số fax"
      />
      <AppFileInput
        :disabled="!hasManageUnitPermission"
        name="logo"
        label="Logo"
        placeholder="Chọn logo"
        class="col-span-2"
      />

      <AppSelect
        :disabled="!hasManageUnitPermission"
        name="defaultSigningProvider"
        label="Chữ ký số mặc định để ký"
        class="col-span-2"
        placeholder="Vui lòng chọn"
        :fetchOptions="handleGetProviders"
      />
    </div>
    <slot name="footer" v-if="hasManageUnitPermission">
      <div class="mt-6 flex w-full justify-end gap-2">
        <Button label="Cập nhật" type="submit" :loading="isUpdatingUnit" />
      </div>
    </slot>
  </form>
  <ConfirmDialog group="confirmProcessUnit" />
</template>
