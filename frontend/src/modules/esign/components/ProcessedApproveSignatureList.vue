<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import type { TCommonColumn } from '@/shared/models/common'
import { cleanObject } from '@/shared/utils/common'
import { Button, Image } from 'primevue'
import { computed, ref, useTemplateRef } from 'vue'
import { useGetProcessedApproveSignatureList } from '../composables/signature-approve/useGetProcessedApproveSignatureList'
import { SIGNATURE_IMG_STATES } from '../constants/signatureImage'
import type { SignatureImageType } from '../model/signatureimg'
import type { TApproveSignatureItem } from '../model/types'
import ModalDetailSigntureApprove from './ModalDetailSigntureApprove.vue'

type TModalDetailSignatures = InstanceType<typeof ModalDetailSigntureApprove>
type TProps = {
  activeTab: 'WAIT_FOR_APPOVE' | 'PROCESSED'
  searchValue?: string
}

const columns: TCommonColumn<TApproveSignatureItem>[] = [
  {
    header: 'STT',
    field: 'order',
    customSlot: 'order',
    style: {
      width: '80px'
    }
  },
  { header: 'AccountId', field: 'accountId' },
  {
    header: 'Họ tên',
    field: (record) => record?.info?.name
  },
  {
    header: 'Chữ ký chính',
    field: 'majorSignature',
    customSlot: 'majorSignature'
  },
  {
    header: 'Chữ ký chính (Văn phòng Đại học lưu)',
    field: 'originalMajorSignature',
    customSlot: 'originalMajorSignature'
  },
  {
    header: 'Chữ ký nháy',
    field: 'minorSignature',
    customSlot: 'minorSignature'
  },
  {
    header: 'Chữ ký nháy (Văn phòng Đại học lưu)',
    field: 'originalMinorSignature',
    customSlot: 'originalMinorSignature'
  },
  {
    field: 'action',
    customSlot: 'tableAction',
    style: {
      whiteSpace: 'nowrap',
      width: '1%'
    }
  }
]

const detailSignaturesRef = useTemplateRef<TModalDetailSignatures | null>('detailSignaturesRef')

const props = defineProps<TProps>()
const selectedSignatures = ref<SignatureImageType>()

const tabIncludedFilterParams = computed(() =>
  cleanObject({
    search: props.searchValue,
    tab: props.activeTab
  })
)

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  isMemorizedPage: true,
  pageSize: 50,
  otherMemoParams: tabIncludedFilterParams
})

const { data, isLoading, refetch } = useGetProcessedApproveSignatureList(() =>
  cleanObject({
    pageSize: tablePagination.value.pageSize,
    page: tablePagination.value.current + 1,
    search: props.searchValue
  })
)

const handleViewDetailSignatures = (data: TApproveSignatureItem) => {
  selectedSignatures.value = cleanObject({
    majorSignatureImage: data?.majorSignatureImage
      ? {
          signedURL: data?.majorSignatureImage?.signedURL,
          state: data?.majorSignatureImage?.state,
          rejectReason: data?.majorSignatureImage?.rejectReason
        }
      : undefined,
    minorSignatureImage: data?.minorSignatureImage
      ? {
          signedURL: data?.minorSignatureImage?.signedURL,
          state: data?.minorSignatureImage?.state,
          rejectReason: data?.minorSignatureImage?.rejectReason
        }
      : undefined,
    originalMajorSignatureImage: data?.originalMajorSignatureImage
      ? { signedURL: data?.originalMajorSignatureImage?.signedURL }
      : undefined,
    originalMinorSignatureImage: data?.originalMinorSignatureImage
      ? { signedURL: data?.originalMinorSignatureImage?.signedURL }
      : undefined
  })
  detailSignaturesRef.value?.openModal(data.accountId)
}
defineExpose({
  dataList: data,
  isPending: isLoading,
  refetch
})
</script>
<template>
  <AppTable
    class="mt-10"
    :data="data?.docs ?? []"
    :columns="columns"
    :loading="isLoading"
    paginator
    :always-show-paginator="true"
    :totalRecords="data?.docCount"
    :lazy="true"
    :rows="tablePagination.pageSize"
    @update:rows="updatePageSize"
    :rowsPerPageOptions="tablePagination.pageSizeOptions"
    @page="({ page, rows }) => updateCurrentPage(page, rows)"
    :first="tablePagination.current * tablePagination.pageSize"
  >
    <template #order="{ index }">
      <span>{{
        ((data?.page ?? 1) - 1) * (data?.pageSize ?? tablePagination.pageSize) + index + 1
      }}</span>
    </template>
    <template #majorSignature="{ data }">
      <div class="relative h-full w-full text-center">
        <Image
          v-if="data.majorSignatureImage?.signedURL"
          :src="data.majorSignatureImage?.signedURL"
          alt="majorSignature"
          image-class="max-w-[100px] max-h-[100px] align-middle"
        />
        <span
          v-if="data?.majorSignatureImage?.state === SIGNATURE_IMG_STATES.accepted"
          class="icon-[charm--circle-tick] absolute top-[2px] right-[2px] text-xl font-semibold text-green-500"
        ></span>
        <span
          v-if="data?.majorSignatureImage?.state === SIGNATURE_IMG_STATES.rejected"
          class="icon-[jam--close-circle] absolute top-[2px] right-[2px] text-xl font-semibold text-red-500"
        ></span>
      </div>
    </template>
    <template #minorSignature="{ data }">
      <div class="relative h-full w-full text-center">
        <Image
          v-if="data.minorSignatureImage?.signedURL"
          :src="data.minorSignatureImage?.signedURL"
          alt="minorSignature"
          image-class="max-w-[100px] max-h-[100px] align-middle"
        />
        <span
          v-if="data?.minorSignatureImage?.state === SIGNATURE_IMG_STATES.accepted"
          class="icon-[charm--circle-tick] absolute top-[2px] right-[2px] text-xl font-semibold text-green-500"
        ></span>
        <span
          v-if="data?.minorSignatureImage?.state === SIGNATURE_IMG_STATES.rejected"
          class="icon-[jam--close-circle] absolute top-[2px] right-[2px] text-xl font-semibold text-red-500"
        ></span>
      </div>
    </template>
    <template #originalMajorSignature="{ data }">
      <div class="relative h-full w-full text-center">
        <Image
          v-if="data.originalMajorSignatureImage?.signedURL"
          :src="data.originalMajorSignatureImage?.signedURL"
          alt="originalMajorSignature"
          image-class="max-w-[100px] max-h-[100px] align-middle"
        />
      </div>
    </template>
    <template #originalMinorSignature="{ data }">
      <div class="relative h-full w-full text-center">
        <Image
          v-if="data.originalMinorSignatureImage?.signedURL"
          :src="data.originalMinorSignatureImage?.signedURL"
          alt="originalMinorSignature"
          image-class="max-w-[100px] max-h-[100px] align-middle"
        />
      </div>
    </template>
    <template #tableAction="{ data }">
      <div class="flex items-center justify-end gap-2">
        <Button
          variant="contained"
          @click="handleViewDetailSignatures(data)"
          severity="primary"
          class="flex items-center justify-center"
        >
          Xem
        </Button>
      </div>
    </template>
  </AppTable>
  <ModalDetailSigntureApprove ref="detailSignaturesRef" @action-processed="refetch" />
</template>
