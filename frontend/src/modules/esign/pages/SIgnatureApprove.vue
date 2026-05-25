<script setup lang="ts">
import { router } from '@/router'
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTabs from '@/shared/components/AppTabs.vue'
import type { TAppTab } from '@/shared/models/common'
import { toastSucceed } from '@/shared/utils/common'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProcessedApproveSignatureList from '../components/ProcessedApproveSignatureList.vue'
import WaittingApproveSignatureList from '../components/WaittingApproveSignatureList.vue'
import { useProcessMultipleApproveRequest } from '../composables/signature-approve/useProcessMultipleApproveRequest'
import { useResetAllProcessedApproveRequest } from '../composables/signature-approve/useResetAllProcessedApproveRequest'

type TTabValue = 'WAIT_FOR_APPOVE' | 'PROCESSED'
type TWaitForApproveSignatureRef = InstanceType<typeof WaittingApproveSignatureList>
type TProcessedApproveSignatureRef = InstanceType<typeof ProcessedApproveSignatureList>

const tabList: TAppTab<TTabValue>[] = [
  {
    label: 'Chờ duyệt',
    value: 'WAIT_FOR_APPOVE'
  },
  {
    label: 'Đã xử lý',
    value: 'PROCESSED'
  }
]

const route = useRoute()
const confirm = useConfirm()
const selectTab = ref(
  tabList?.find((tab) => tab.value === (route.query?.tab?.toString() as TTabValue))?.value ||
    tabList[0].value
)
const searchValue = ref<string>()

const waitApproveSignatureRef = ref<TWaitForApproveSignatureRef | null>(null)
const processedApproveSignatureRef = ref<TProcessedApproveSignatureRef | null>(null)

const handleSearch = (val?: string) => {
  searchValue.value = val
}

const handleChangeTab = () => {
  searchValue.value = ''
  router.push({
    query: {
      tab: selectTab.value
    }
  })
}

const handleConfirmAction = () => {
  confirm.require({
    group: 'confirmApprove',
    message: `Thầy/Cô có xác nhận ${selectTab?.value === 'WAIT_FOR_APPOVE' ? 'duyệt danh sách' : 'reset tất cả danh sách'} này?`,
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
      if (selectTab.value === 'WAIT_FOR_APPOVE')
        proceessAll({
          ids: waitApproveSignatureRef?.value?.dataList?.docs?.map((data) => data?._id) ?? []
        })
      else resetAll()
    }
  })
}

const { mutate: resetAll, isPending: isReseting } = useResetAllProcessedApproveRequest({
  onSuccess: () => {
    toastSucceed({
      detail: 'Duyệt danh sách chữ ký thành công'
    })
    waitApproveSignatureRef?.value?.refetch()
  }
})
const { mutate: proceessAll, isPending: isProcessing } = useProcessMultipleApproveRequest({
  onSuccess: () => {
    toastSucceed({
      detail: 'Reset danh sách chữ ký thành công'
    })
    processedApproveSignatureRef?.value?.refetch()
  }
})
watch(
  () => route.query,
  (query) => {
    if (query) {
      searchValue.value = route?.query?.search as string
    }
  },
  { deep: true, once: true, immediate: true }
)
</script>
<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <AppTabs v-model="selectTab" @update:model-value="handleChangeTab" :tab-list="tabList" />
      <AppFilterBarWithSearch
        class="flex items-center justify-end gap-2"
        placeholder="Tìm kiếm theo accountId hoặc tên"
        :search-string="searchValue"
        @search="handleSearch"
      >
        <template #postAdditionalSlot>
          <Button
            :label="selectTab === 'WAIT_FOR_APPOVE' ? 'Duyệt danh sách này' : 'Reset tất cả'"
            :severity="selectTab === 'WAIT_FOR_APPOVE' ? 'primary' : 'danger'"
            variant="contained"
            :loading="isReseting || isProcessing"
            :disabled="
              waitApproveSignatureRef?.isPending || processedApproveSignatureRef?.isPending
            "
            @click="handleConfirmAction"
          />
        </template>
      </AppFilterBarWithSearch>
    </div>
    <WaittingApproveSignatureList
      v-if="selectTab === 'WAIT_FOR_APPOVE'"
      ref="waitApproveSignatureRef"
      :active-tab="selectTab"
      :searchValue
    />
    <ProcessedApproveSignatureList
      v-if="selectTab === 'PROCESSED'"
      ref="processedApproveSignatureRef"
      :active-tab="selectTab"
      :searchValue
    />
    <ConfirmDialog group="confirmApprove" />
  </div>
</template>
