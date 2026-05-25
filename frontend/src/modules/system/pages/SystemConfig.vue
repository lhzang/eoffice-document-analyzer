<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { useGetSystemConfig } from '@/shared/composables/queries/system/useGetSystemConfig'
import { IMG_FILE_TYPE } from '@/shared/constants/document'
import { MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { getFileName, getFullFileUrl, toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ColorPicker, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { ref, watch, watchEffect } from 'vue'
import { Tippy } from 'vue-tippy'
import z from 'zod'
import {
  useUpdateSystemConfig,
  type TUpdateSystemConfigParams
} from '../composables/useUpdateSystemConfig'
import { ROLE_CONFIG_LABEL } from '../constants/roleConfigSelect'

const schema = z.object({
  unitName: z.string().min(1, MSG_REQUIRED_FIELD),
  mainColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, 'Mã màu hex không hợp lệ')
    .min(1, MSG_REQUIRED_FIELD),
  backgroundColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, 'Mã màu hex không hợp lệ')
    .min(1, MSG_REQUIRED_FIELD),
  uploadFile: z.instanceof(File).nullable().optional(),
  director: z.custom<TCommonSelectOptions<string>>().optional(),
  leader: z.custom<TCommonSelectOptions<string>>().optional(),
  collaborator: z.custom<TCommonSelectOptions<string>>().optional(),
  viewer: z.custom<TCommonSelectOptions<string>>().optional()
})

type TSystemConfigForm = z.infer<typeof schema>

const confirm = useConfirm()
const queryClient = useQueryClient()

const logoUrl = ref<string | null>(null)

const { handleSubmit, errors, setValues, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    unitName: '',
    mainColor: '',
    backgroundColor: ''
  }
})
watchEffect(() => {
  console.log(values, 'ádfasdfasdfasdfadssdfasd')
})
// const setBackgroundColor = (color: string) => setFieldValue('backgroundColor', color)
const {
  data: SystemConfigInfo,
  isFetching: isGettingSystemConfigInfo,
  isSuccess: isGetSystemConfigSuccess
} = useGetSystemConfig()
const setMainColor = (color: string) => setFieldValue('mainColor', color)
// const { data: SystemConfigInfo, isLoading: isGettingSystemConfigInfo } = useGetSystemConfig()

const { mutate: configSystem, isPending } = useUpdateSystemConfig({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật thành công'
    })
    queryClient.invalidateQueries({ queryKey: ['useGetSystemConfig'] })
  }
})

const roleConfigOptions = Object.entries(ROLE_CONFIG_LABEL).map(([value, label]) => ({
  label,
  value
}))

const fetchRoleConfigOpts = () => ({
  options: roleConfigOptions,
  hasMore: false
})

// Convert role config value to option with label
const getRoleConfigOption = (
  value: string | undefined
): TCommonSelectOptions<string> | undefined => {
  if (!value) return undefined
  const label = ROLE_CONFIG_LABEL[value as keyof typeof ROLE_CONFIG_LABEL]
  return label ? { value, label } : undefined
}

async function fetImageWithToken(url: string) {
  if (!SystemConfigInfo?.value) return
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${useUserProfileStore().accessToken}`
    }
  })
  const blob = await response.blob()
  logoUrl.value = URL.createObjectURL(blob)
}

const confirmUpdate = (formData: TSystemConfigForm) => {
  confirm.require({
    group: 'updateUnitInfo',
    message: `Thầy/Cô có chắc chắn muốn thay đổi thông tin đơn vị?`,
    header: 'Thay đổi thông tin đơn vị',
    accept: () => {
      const payload: TUpdateSystemConfigParams = {
        unitName: formData.unitName,
        mainColor: formData.mainColor,
        backgroundColor: formData.backgroundColor,
        roleConfigDirector: formData.director?.value ?? '',
        roleConfigLeader: formData.leader?.value ?? '',
        roleConfigCollaborator: formData.collaborator?.value ?? '',
        roleConfigViewer: formData.viewer?.value ?? ''
      }

      if (formData.uploadFile instanceof File) {
        payload.logo = formData.uploadFile
      }
      configSystem(payload)
    },
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    }
  })
}

const onSubmit = handleSubmit((formData: TSystemConfigForm) => {
  confirmUpdate(formData)
})

const handleResetForm = () => {
  const config = SystemConfigInfo.value
  if (!config) return
  setValues(
    {
      unitName: config.unitName,
      mainColor: config.mainColor,
      backgroundColor: config.backgroundColor,
      director: getRoleConfigOption(config.systemRoleConfig.DIRECTOR),
      leader: getRoleConfigOption(config.systemRoleConfig.LEADER),
      collaborator: getRoleConfigOption(config.systemRoleConfig.COLLABORATOR),
      viewer: getRoleConfigOption(config.systemRoleConfig.VIEWER)
    },
    false
  )
}

watch(
  [() => SystemConfigInfo.value, () => isGetSystemConfigSuccess.value],
  ([config, isSuccess]) => {
    if (!isSuccess || !config) return
    fetImageWithToken(getFullFileUrl(config.logo))
    setValues(
      {
        unitName: config.unitName,
        mainColor: config.mainColor,
        backgroundColor: config.backgroundColor,
        director: getRoleConfigOption(config.systemRoleConfig.DIRECTOR),
        leader: getRoleConfigOption(config.systemRoleConfig.LEADER),
        collaborator: getRoleConfigOption(config.systemRoleConfig.COLLABORATOR),
        viewer: getRoleConfigOption(config.systemRoleConfig.VIEWER)
      },
      false
    )
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div v-if="isGettingSystemConfigInfo" class="mt-10 flex h-[200px] items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div v-else class="grid grid-cols-3 gap-4">
    <div class="card text-surface-700 col-span-2">
      <form @submit="onSubmit">
        <div class="grid grid-cols-2 items-center justify-between border-b border-[#e2e8f0] pb-4">
          <span class="font-semibold">Tên hiển thị</span>
          <AppTextInput name="unitName" :error-message="errors?.unitName" />
        </div>
        <div class="grid grid-cols-2 justify-between border-b border-[#e2e8f0] py-4">
          <span class="font-semibold">Ảnh đại diện</span>
          <AppFileInput
            name="uploadFile"
            :accept="`${IMG_FILE_TYPE}`"
            :multiple="false"
            required
            :placeholder="SystemConfigInfo?.logo ? getFileName(SystemConfigInfo?.logo) : undefined"
          />
        </div>
        <div class="grid grid-cols-2 justify-between border-b border-[#e2e8f0] py-4">
          <span class="font-semibold">Màu sắc chủ đạo</span>
          <div class="flex items-center gap-3">
            <AppTextInput name="mainColor" :error-message="errors?.mainColor" class="flex-1" />
            <ColorPicker
              :modelValue="values.mainColor"
              @update:model-value="(val) => setFieldValue('mainColor', '#' + val)"
              :pt="{
                preview: {
                  style: {
                    border: '1px solid var(--p-surface-400)'
                  },
                  class: '!w-9 !h-9 !rounded'
                }
              }"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 justify-between border-b border-[#e2e8f0] py-4">
          <span class="font-semibold">Màu nền</span>
          <div class="flex items-center gap-3">
            <AppTextInput
              name="backgroundColor"
              :error-message="errors?.backgroundColor"
              class="flex-1"
            />
            <ColorPicker
              :modelValue="values.backgroundColor"
              @update:model-value="(val) => setFieldValue('backgroundColor', '#' + val)"
              :pt="{
                preview: {
                  style: {
                    border: '1px solid var(--p-surface-400)'
                  },
                  class: '!w-9 !h-9 !rounded'
                }
              }"
            />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 border-b border-[#e2e8f0] py-4">
          <Button
            size="large"
            class="h-8 w-24 border-0! bg-[#005AAB]!"
            @click="setMainColor('#005AAB')"
          />
          <Button
            size="large"
            class="h-8 w-24 border-0! bg-[#60393B]!"
            @click="setMainColor('#60393B')"
          />
          <Button
            size="large"
            class="h-8 w-24 border-0! bg-[#A3D4BB]!"
            @click="setMainColor('#A3D4BB')"
          />
          <Button
            size="large"
            class="h-8 w-24 border-0! bg-[#D6C075]!"
            @click="setMainColor('#D6C075')"
          />
          <Button
            size="large"
            class="h-8 w-24 border-0! bg-[#DB93B6]!"
            @click="setMainColor('#DB93B6')"
          />
          <Button
            size="large"
            class="h-8 w-24 border-0! bg-[#a34141]!"
            @click="setMainColor('#a34141')"
          />
        </div>
        <div class="grid grid-cols-2 justify-between border-b border-[#e2e8f0] py-4">
          <div class="mb-5 font-semibold">Vai trò</div>
          <div class="mb-5 font-semibold">Số lượng</div>
          <div class="mb-1 font-semibold">Chỉ đạo</div>
          <AppSelect
            name="director"
            :fetch-options="fetchRoleConfigOpts"
            isFetchOnInit
            class="mb-1"
          />
          <div class="mb-1 font-semibold">Chủ trì</div>
          <AppSelect
            name="leader"
            :fetch-options="fetchRoleConfigOpts"
            isFetchOnInit
            class="mb-1"
          />
          <div class="mb-1 font-semibold">Phối hợp</div>
          <AppSelect
            name="collaborator"
            :fetch-options="fetchRoleConfigOpts"
            isFetchOnInit
            class="mb-1"
          />
          <div class="mb-1 font-semibold">Xem để biết</div>
          <AppSelect
            name="viewer"
            :fetch-options="fetchRoleConfigOpts"
            isFetchOnInit
            class="mb-1"
          />
        </div>
        <div class="mt-2 flex h-10 items-center justify-end gap-2">
          <Button
            class="min-w-[100px]"
            label="Đặt lại"
            severity="secondary"
            variant="outlined"
            @click="handleResetForm"
          />
          <Button
            type="submit"
            class="min-w-[100px]"
            label="Lưu thay đổi"
            severity="primary"
            :loading="isPending"
          />
        </div>
      </form>
      <ConfirmDialog group="updateUnitInfo" />
    </div>
    <div class="col-span-1">
      <div class="card mb-4 flex items-center">
        <img class="w-30" :src="logoUrl || ''" alt="Logo" />
        <Tippy :content="values?.unitName || SystemConfigInfo?.unitName || ''">
          <span class="text-surface-700 ml-4 flex-1 truncate text-xl font-semibold wrap-break-word">
            {{ values?.unitName || SystemConfigInfo?.unitName || '' }}
          </span>
        </Tippy>
      </div>
      <div class="card" :style="{ backgroundColor: values?.mainColor }">
        <img src="https://i.pinimg.com/736x/ff/1a/a0/ff1aa0c3d72b5224322504702191a2be.jpg" />
      </div>
    </div>
  </div>
</template>
