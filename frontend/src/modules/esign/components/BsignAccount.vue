<script setup lang="ts">
import { useGetEsignAccount } from '@/modules/esign/composables/esign-account/useGetEsignAccount'
import { computed } from 'vue'
import type { GetEsignAccountResponse } from '../model/esignAccount'
import KeyValueElement from './KeyValueElement.vue'

type AccountOnlyKeys = Exclude<keyof GetEsignAccountResponse['accounts'], 'usb'>

const props = defineProps<{
  accountId?: string
  esignProviderType: AccountOnlyKeys
}>()

const { data: accountData, isLoading, isError } = useGetEsignAccount(props.accountId)

const account = computed(() => accountData.value?.accounts?.[props.esignProviderType] ?? null)

const recipient = computed(() => [
  {
    label: 'Họ tên',
    value: account.value?.certInfo?.subject.common_name
  },
  {
    label: 'Tổ chức',
    value: account.value?.certInfo?.subject.organization
  }
])

const issuer = computed(() => [
  {
    label: 'Đơn vị cấp',
    value: account.value?.certInfo?.issuer.common_name
  },
  {
    label: 'Tổ chức cấp',
    value: account.value?.certInfo?.issuer.organization
  }
])

const infor = computed(() => [
  {
    label: 'AccountId',
    value: account.value?.accountId
  },
  {
    label: 'Chứng thư',
    value: account.value?.certificate
  },
  {
    label: 'Trạng thái',
    value: account.value?.status
  },
  {
    label: 'Ngày tạo',
    value: account.value?.createdAt
      ? new Date(account.value.createdAt).toLocaleDateString('vi-VN')
      : '--'
  },
  {
    label: 'Số seri',
    value: account.value?.certInfo?.serial_number
  },
  {
    label: 'Ngày bắt đầu',
    value: account.value?.certInfo?.not_before
  },
  {
    label: 'Ngày kết thúc',
    value: account.value?.certInfo?.not_after
  },
  {
    label: 'Thuật toán mã hóa',
    value: account.value?.certInfo?.sigalg
  },
  {
    label: 'Định danh khóa của tổ chức cấp chứng thư',
    value: account.value?.certInfo?.authority_key_id
  },
  {
    label: 'Định danh khóa của chủ thể',
    value: account.value?.certInfo?.subject_key_id
  }
])
</script>

<template>
  <div v-if="isLoading" class="mt-10 flex h-[400px] items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-4xl"></span>
  </div>
  <div v-else-if="isError" class="text-primary mt-5 flex justify-center font-semibold">
    Đã có lỗi khi lấy thông tin tài khoản! Vui lòng thử lại sau!
  </div>
  <div v-else>
    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="card">
        <h3 class="text-lg font-semibold">Cấp cho:</h3>
        <div>
          <KeyValueElement
            v-for="item in recipient"
            :key="item.label"
            :label="item.label"
            :value="item.value ?? ''"
          />
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold">Cấp bởi:</h3>
        <div>
          <KeyValueElement
            v-for="item in issuer"
            :key="item.label"
            :label="item.label"
            :value="item.value ?? ''"
          />
        </div>
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-4 bg-white">
      <div class="card">
        <h3 class="text-lg font-semibold">Thông tin tài khoản:</h3>
        <div>
          <KeyValueElement
            v-for="item in infor"
            :key="item.label"
            :label="item.label"
            :value="item.value ?? ''"
          />
        </div>
      </div>
    </div>
  </div>
</template>
