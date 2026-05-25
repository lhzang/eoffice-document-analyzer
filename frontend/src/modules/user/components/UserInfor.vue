<script setup lang="ts">
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import { useAuth } from '@/shared/composables/useAuth'
import { SIGN_PROVIDER_LABEL } from '@/shared/constants/sign'
import type { TSignProviderValue } from '@/shared/models/sign'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { cleanObject, notifyError, toastSucceed } from '@/shared/utils/common'
import { Button } from 'primevue'
import { useTemplateRef } from 'vue'
import { useUpdateAccountInfo } from '../composables/useUpdateAccountInfo'
import userService from '../services/userService'
import ChangePassword from './ChangePassword.vue'

const itemAlignWithBorderClass = 'flex justify-between items-center border-b border-[#e2e8f0]'

const profileStore = useUserProfileStore()
const { changeUserPosition } = useAuth()
type EditPasswordModalRef = InstanceType<typeof ChangePassword>
const editPasswordModalRef = useTemplateRef<EditPasswordModalRef | null>('editPasswordModalRef')

const { mutate: updateAccount } = useUpdateAccountInfo({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật thông tin thành công'
    })
  }
})

const userPosionOpts = (profileStore?.user?.positions ?? [])?.map((pos) => ({
  label: pos?.title,
  value: pos?.id
}))

const userSigningOpts = (profileStore?.user?.signingConfig ?? [])?.map((signing) => ({
  label: SIGN_PROVIDER_LABEL?.[signing?.signingProvider],
  value: signing?.signingProvider
}))

const fetchUserPositionOpts = () => ({
  options: userPosionOpts,
  hasMore: false
})

const fetchUserSigningOpts = () => ({
  options: userSigningOpts,
  hasMore: false
})

async function updateUserData() {
  try {
    const profileStore = useUserProfileStore()
    const data = await userService.getUser()
    if (data) profileStore.updateUser(data)
    else profileStore.updateUser(null)
  } catch (error) {
    notifyError(error as TServerError, 'Có lỗi xảy ra')
  }
}

async function changeUserSigning(newSigning: string) {
  if (profileStore && profileStore?.user?.defaultPositionId) {
    updateAccount({
      id: profileStore?.user?.id,
      payload: cleanObject({
        fullName: profileStore.user.fullName,
        defaultPositionId: profileStore.user.defaultPositionId,
        defaultSigningProvider: newSigning as TSignProviderValue
      })
    })
  }
  updateUserData()
}

async function changeDefaultPosition(position: TCommonSelectOptions<string>) {
  if (profileStore?.user)
    updateAccount({
      id: profileStore?.user?.id,
      payload: cleanObject({
        fullName: profileStore?.user?.fullName,
        defaultPositionId: position?.value,
        defaultSigningProvider: profileStore.user?.defaultSigningConfig?.signingProvider
      })
    })

  updateUserData()
}

const handleChangeSigning = (newOpt: TCommonSelectOptions<string>) => {
  changeUserSigning(newOpt?.value)
}
</script>

<template>
  <div class="card text-surface-700">
    <div class="pb-4" :class="itemAlignWithBorderClass">
      <span class="font-semibold">Họ và tên</span>
      <span class="text-red">{{ profileStore?.user?.fullName }}</span>
    </div>
    <div class="py-4" :class="itemAlignWithBorderClass">
      <span class="font-semibold">Email</span>
      <span class="text-red">{{ profileStore?.user?.username }}</span>
    </div>
    <div class="py-4" :class="itemAlignWithBorderClass">
      <span class="font-semibold">Số điện thoại</span>
      <span class="text-red">{{ profileStore?.user?.phone }}</span>
    </div>
    <div class="py-4" :class="itemAlignWithBorderClass">
      <span class="font-semibold">Vị trí việc làm</span>
      <div class="text-right">
        <div
          v-for="(term, index) in profileStore?.user?.positions ?? []"
          :key="index"
          :class="
            term.id === profileStore?.user?.currentPosition.id ? 'text-primary font-semibold' : ''
          "
        >
          {{ term.title }} - {{ term.unitShortName }}
        </div>
      </div>
    </div>
    <div class="py-4" :class="itemAlignWithBorderClass">
      <span class="font-semibold">Mật khẩu</span>
      <div>
        <Button @click="editPasswordModalRef?.handleOpenModal()" class="text-primary font-semibold">
          Đổi mật khẩu
        </Button>
        <ChangePassword
          v-if="profileStore?.user?.id"
          ref="editPasswordModalRef"
          :id="profileStore?.user?.id"
        />
      </div>
    </div>
    <div class="py-4" :class="itemAlignWithBorderClass">
      <span class="font-semibold">Vị trí mặc định khi đăng nhập</span>
      <div class="w-[250px]">
        <AppSelect
          name="position"
          :fetch-options="fetchUserPositionOpts"
          isFetchOnInit
          :defaultValue="
            userPosionOpts?.find(
              (posOpt) => posOpt?.value === profileStore?.user?.defaultPositionId
            )
          "
          placeholder="Chưa có vị trí đăng nhập mặc định"
          @select="changeDefaultPosition"
        />
      </div>
    </div>
    <div class="flex justify-between pt-4">
      <span class="font-semibold">Chữ ký số mặc định để ký</span>
      <div class="w-[250px]">
        <AppSelect
          name="sign"
          :fetch-options="fetchUserSigningOpts"
          isFetchOnInit
          :defaultValue="
            userSigningOpts?.find(
              (signingOpt) =>
                signingOpt?.value === profileStore?.user?.defaultSigningConfig?.signingProvider
            )
          "
          placeholder="Chưa có cấu hình mặc định"
          @select="handleChangeSigning"
        />
      </div>
    </div>
  </div>
</template>
