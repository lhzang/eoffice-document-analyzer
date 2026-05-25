<script setup lang="ts">
import { appConfig } from '@/config/app-config'
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Checkbox, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { useCreateInternalChildUnit } from '../composables/queries/useCreateInternalChildUnit'
import { unitCreateSchema } from '../schemas/unitSchema'

type TProps = {
  groupId?: string
  groupName?: string
  isGroup?: boolean
  parentId: string
  parentName: string
}

const { isGroup = false, groupId, parentId, parentName, groupName } = defineProps<TProps>()

const emit = defineEmits<{
  (e: 'unitHandled'): void
}>()

const confirm = useConfirm()

const { mutate: createUnit, isPending: isCreatingUnit } = useCreateInternalChildUnit({
  onSuccess: () => {
    emit('unitHandled')
    toastSucceed({
      detail: 'Tạo đơn vị thành công'
    })
  }
})

const selectedClericalNode = ref<TTreeUnitWithStaffNode | null>()
const shouldCreateBSign = ref(false)

const { setFieldValue, handleSubmit } = useForm({
  validationSchema: toTypedSchema(unitCreateSchema),
  initialValues: {
    parentId: parentId,
    rank: 1
  }
})

const handleClericalUnitSelect = (unit: TTreeUnitWithStaffNode) => {
  selectedClericalNode.value = unit
  setFieldValue('clericalUnitId', unit.id)
}

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    group: 'addUnitIntoUnit',
    message: 'Thầy/Cô có xác nhận tạo đơn vị này?',
    header: 'Tạo khối đơn vị',
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
      if (!parentId) return
      createUnit(
        cleanObject({
          abbr: formValues.abbr,
          parentId: parentId,
          clericalUnitId: formValues.clericalUnitId,
          axisOrgId: formValues.axisOrgId ?? undefined,
          name: formValues.name,
          address: formValues.address ?? undefined,
          rank: formValues.rank ?? undefined,
          email: formValues.email ?? undefined,
          phone: formValues.phone ?? undefined,
          logo: formValues.logo ?? undefined,
          shouldCreateBSign: shouldCreateBSign.value ?? undefined,
          groupId: groupId ?? undefined
        })
      )
    }
  })
})
</script>

<template>
  <div>
    <form @submit="onSubmit">
      <div class="grid grid-cols-2 gap-4">
        <AppTextInput name="abbr" label="Mã đơn vị" placeholder="Mã đơn vị" required />
        <AppTextInput name="axisOrgId" label="Mã định danh" placeholder="Nhập mã định danh" />
        <AppTextInput
          class="col-span-2"
          name="name"
          label="Tên đơn vị"
          placeholder="Nhập tên đơn vị"
          required
        />
        <AppTextInput
          class="col-span-2"
          name="address"
          label="Địa chỉ"
          placeholder="Nhập địa chỉ"
        />

        <div class="col-span-2">
          <div class="text-primary font-semibold">Đơn vị:</div>
          <div class="card">
            <div v-if="isGroup">
              <span class="font-semibold">Đơn vị cấp trên: </span>
              <span>{{ parentName }}</span>
              <hr class="my-3 text-[#e2e8f0]" />
              <span class="font-semibold">Khối đơn vị: </span>
              <span>{{ groupName }}</span>
            </div>
            <div v-else>
              <span class="font-semibold">Đơn vị cấp trên: </span>
              <span>{{ parentName }}</span>
            </div>
          </div>
        </div>

        <div class="col-span-2">
          <InternalUnitSelect
            modal-label="Chọn đơn vị"
            label="Chọn đơn vị văn thư quản lý"
            type="FULL"
            :is-select-multiple="false"
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
                  :content="selectedClericalNode?.name"
                >
                  <div
                    class="flex justify-between items-center font-sm truncate border border-solid px-[.75rem] py-[.5rem] rounded-md duration-200 transition-all relative border-[var(--p-inputtext-border-color)] hover:border-[#94a3b8] cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]"
                  >
                    <div
                      class="h-full truncate text-[var(--p-inputtext-disabled-color)] text-[var(--vs-colors--dark)]"
                    >
                      {{
                        selectedClericalNode
                          ? selectedClericalNode.name
                          : "Chưa có đơn vị văn thư quản lý"
                      }}
                    </div>
                    <Button label="Chọn" />
                  </div>
                </Tippy>
              </div>
            </template> -->
          </InternalUnitSelect>
        </div>

        <AppNumberInput required name="rank" label="STT" placeholder="Nhập số thứ tự" />
        <AppTextInput name="email" label="Email" placeholder="Nhập email" />
        <AppTextInput name="phone" label="SĐT" placeholder="Nhập số điện thoại" />
        <AppFileInput name="logo" label="Logo" placeholder="Chọn logo" class="col-span-2" />

        <div class="col-span-2 mt-1">
          <!-- <div class="text-primary font-semibold">Chữ ký số mặc định để ký</div> -->
          <div class="flex items-center gap-3">
            <Checkbox v-model="shouldCreateBSign" binary />
            <span>{{ `Tạo tài khoản ${appConfig.VITE_ESIGN_PROVIDER_LABEL}` }}</span>
          </div>
        </div>
      </div>
      <slot name="footer">
        <div class="mt-6 flex w-full justify-end gap-2">
          <Button label="Tạo" type="submit" :loading="isCreatingUnit" />
        </div>
      </slot>
    </form>
    <ConfirmDialog group="addUnitIntoUnit" />
  </div>
</template>
