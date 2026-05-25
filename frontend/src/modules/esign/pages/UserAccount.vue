<script lang="ts" setup>
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { Button } from 'primevue'
import { computed, useTemplateRef } from 'vue'
import EditUserAccount from '../components/EditUserAccount.vue'
import KeyValueElement from '../components/KeyValueElement.vue'
import { useGetUserAccount } from '../composables/user-account/useGetUserAccount'
import type { KeyValueElement as UserAccountDto } from '../model/types'
import type { UserAccountResponse } from '../model/userAccount'

const user = useUserProfileStore().user

const { data, isLoading, isError } = useGetUserAccount(user?.username)
type EditModalRef = InstanceType<typeof EditUserAccount>
const editModalRef = useTemplateRef<EditModalRef | null>('editModalRef')

const tranformGetUserAccountResponse = (response: UserAccountResponse): UserAccountDto => {
  return [
    { label: 'AccountId', value: response.accountId },
    {
      label: 'Trạng thái tài khoản',
      value: response.hasChangedPassword ? 'Đã đổi mật khẩu' : 'Mật khẩu mặc định'
    },
    { label: 'Vai trò', value: response.roles },
    { label: 'Họ tên', value: response.info.name },
    { label: 'Số điện thoại', value: response.info.phone ? response.info.phone : '' },
    { label: 'Email', value: response.info.email },
    { label: 'Tổ chức', value: response.info.organization },
    { label: 'Đơn vị', value: response.info.unit ? response.info.unit : '' }
  ]
}
const result = computed(() => (data.value ? tranformGetUserAccountResponse(data.value) : []))
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 text-gray-800">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Thông tin tài khoản</h1>
        <Button @click="() => data && editModalRef?.openModal(data)" class="font-semibold">
          <i class="pi pi-cog"></i>
          Sửa
        </Button>
      </div>
      <div v-if="isLoading" class="mt-10 flex items-center justify-center">
        <span
          class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-4xl"
        ></span>
      </div>
      <dl v-if="data" class="flex flex-col gap-2">
        <KeyValueElement
          v-for="line in result ?? []"
          :key="line.label"
          :label="line.label"
          :value="line.value"
        />
      </dl>
      <div v-if="isError" class="text-primary flex justify-center font-semibold">
        Đã có lỗi khi lấy thông tin tài khoản! Vui lòng thử lại sau!
      </div>
      <EditUserAccount ref="editModalRef" :isLoading="isLoading" />
    </div>
  </div>
</template>
