<script setup lang="ts">
import { useDeleteEsignAccount } from '@/modules/esign/composables/esign-account/useDeleteEsignAccount'
import { useGetEsignAccount } from '@/modules/esign/composables/esign-account/useGetEsignAccount'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import { notifyError } from '@/shared/utils/common'
import { Button, Message, useToast } from 'primevue'
import { computed, ref } from 'vue'
import type { AccountProviderKey } from '../constants/esignProvider'
import type { Account } from '../model/esignAccount'
import EmptyAccount from './EmptyAccount.vue'
import KeyValueElement from './KeyValueElement.vue'

const { esignProviderType, accountId, esignProviderName } = defineProps<{
  esignProviderType: string
  accountId?: string
  esignProviderName: string
}>()

const { data, refetch, isLoading } = useGetEsignAccount(accountId)
const account = computed<Account | null>(
  () => data.value?.accounts?.[esignProviderType as AccountProviderKey] ?? null
)

const infor = computed(() => [
  {
    label: 'Số sê-ri (serialNumber)',
    value: account.value?.infos?.[0].serialNumber
  },
  {
    label: 'Cơ quan cấp (issuerDN)',
    value: account.value?.infos?.[0].issuerDN
  },
  {
    label: 'Chủ thể (subjectDN)',
    value: account.value?.infos?.[0].subjectDN
  },
  {
    label: 'Ngày hiệu lực bắt đầu',
    value: account.value?.infos?.[0].validFrom
  },
  {
    label: 'Ngày hiệu lực kết thúc',
    value: account.value?.infos?.[0].validTo
  }
])

const { mutate: deleteMutation, isPending } = useDeleteEsignAccount()
const showConfirm = ref(false)
const toast = useToast()

function computeExpirationDate(exp: number | Date | string): string {
  const expirationDate = new Date(exp)
  const currentDate = new Date()
  const oneMoreMonth = new Date()
  oneMoreMonth.setMonth(oneMoreMonth.getMonth() + 1)

  if (expirationDate < currentDate) {
    return 'Chứng thư đã hết hạn'
  } else if (expirationDate < oneMoreMonth) {
    return 'Chứng thư sắp hết hạn (< 1 tháng)'
  } else {
    return `Chứng thư có hạn tới ${expirationDate.toLocaleString('vi-VN')}`
  }
}

const accountInfo = computed(() => [
  {
    label: 'Id tài khoản',
    value: account.value?._id ?? '--'
  },
  {
    label:
      esignProviderType === 'vt_sim'
        ? 'SĐT'
        : esignProviderType === 'vt_remote' || esignProviderType === 'vnpt_remote'
          ? 'CCCD'
          : '',
    value:
      esignProviderType === 'vt_sim'
        ? (account.value?.msisdn ?? '--')
        : esignProviderType === 'vt_remote' || esignProviderType === 'vnpt_remote'
          ? (account.value?.userId ?? '--')
          : '--'
  },
  {
    label: 'Thời hạn chứng thư',
    value: account.value?.infos?.[0]?.validTo
      ? computeExpirationDate(account.value.infos[0].validTo)
      : '--'
  }
])

function deleteAccount() {
  if (accountId)
    deleteMutation(
      { simType: esignProviderType, accountId },
      {
        onSuccess: async () => {
          await refetch()
          showConfirm.value = false
          toast.add({
            severity: 'success',
            life: APP_NOTI_TIME,
            summary: 'Xóa tài khoản thành công'
          })
        },
        onError: (e) => {
          notifyError(e, 'Xóa tài khoản thất bại')
        }
      }
    )
}
</script>

<template>
  <div v-if="isLoading" class="mt-10 flex h-[400px] items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-4xl"></span>
  </div>
  <div v-else class="p-0">
    <div v-if="!account">
      <EmptyAccount
        v-if="accountId"
        :esign-provider-name="esignProviderName"
        :esign-provider-type="esignProviderType"
        :account-id="accountId"
        :isLoading="isLoading"
        @created="refetch"
      />
    </div>

    <div v-else>
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold">Thông tin tài khoản:</h3>
        <Button v-if="accountId" icon="pi pi-trash" label="Xóa" @click="showConfirm = true" />
      </div>
      <div>
        <AppModal
          :wrapper-style="{ width: '90%', maxWidth: '500px', margin: '0 3rem' }"
          v-model:visible="showConfirm"
          title="Xác nhận xóa tài khoản ký số"
        >
          <div>Thầy/Cô có chắc chắn muốn xóa tài khoản ký số này?</div>
          <slot name="footer">
            <div class="mt-4 flex w-full justify-end gap-4">
              <Button
                label="Hủy"
                type="button"
                @click="showConfirm = false"
                :disabled="isPending || isLoading"
              />
              <Button label="Xác nhận" @click="deleteAccount" :loading="isPending || isLoading" />
            </div>
          </slot>
        </AppModal>
      </div>
      <div class="card mt-4">
        <KeyValueElement :label="accountInfo[1]?.label" :value="accountInfo[1]?.value" isSingle />
      </div>

      <div class="card mt-4 bg-green-50 p-0">
        <Message
          v-if="accountInfo[2]?.value !== '--'"
          :severity="
            accountInfo[2]?.value?.includes('có hạn tới')
              ? 'success'
              : accountInfo[2]?.value?.includes('sắp hết hạn')
                ? 'warn'
                : accountInfo[2]?.value?.includes('hết hạn')
                  ? 'error'
                  : undefined
          "
          class="flex items-start gap-3 rounded-lg p-4"
        >
          <div class="flex gap-5">
            <i
              :class="[
                accountInfo[2]?.value?.includes('có hạn tới')
                  ? 'pi pi-check-circle text-green-500'
                  : accountInfo[2]?.value?.includes('sắp hết hạn')
                    ? 'pi pi-exclamation-triangle text-yellow-500'
                    : accountInfo[2]?.value?.includes('hết hạn')
                      ? 'pi pi-times-circle text-red-500'
                      : ''
              ]"
              class="mt-2 text-xl"
            />
            <div>
              <div class="font-semibold">Thời hạn chứng thư:</div>
              <div>{{ accountInfo[2]?.value }}</div>
            </div>
          </div>
        </Message>
      </div>

      <div class="card mt-4">
        <KeyValueElement label="Chứng thư số (PEM)" :value="account.pems?.at(0) ?? '--'" isSingle />
      </div>

      <div class="card mt-4">
        <h3 class="text-lg font-semibold">Chuỗi chứng thư:</h3>
        <KeyValueElement
          v-for="item in infor"
          :key="item.label"
          :label="item.label"
          :value="item.value ?? ''"
        />
      </div>
    </div>
  </div>
</template>
