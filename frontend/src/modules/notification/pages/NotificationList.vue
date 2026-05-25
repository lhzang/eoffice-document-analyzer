<script setup lang="ts">
import ModalDetailCar from '@/modules/car/components/ModalDetailCar.vue'
import ModalDetailRequestCar from '@/modules/car/components/ModalDetailRequestCar.vue'
import { CAR_TYPES } from '@/modules/car/constants/carType'
import type { TCarType } from '@/modules/car/models/common'
import ModalDetailInDoc from '@/modules/indoc/components/ModalDetailInDoc.vue'
import ModalDetailInternalDoc from '@/modules/internalDocument/components/modals/ModalDetailInternalDoc.vue'
import ModalDetailOutDoc from '@/modules/outDocument/components/modals/ModalDetailOutDoc.vue'
import AppTabs from '@/shared/components/AppTabs.vue'
import NotificationItem from '@/shared/components/notification/NotificationItem.vue'
import { useNotification } from '@/shared/composables/useNotification'
import { ROUTE_PATHS } from '@/shared/constants/router'
import { useNotificationStore } from '@/shared/stores/useNotificationStore'
import { useInfiniteScroll } from '@vueuse/core'
import { Button } from 'primevue'
import { computed, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'

type TModalDetailOutDocRef = InstanceType<typeof ModalDetailOutDoc>
type TModalDetailInDocRef = InstanceType<typeof ModalDetailInDoc>
type TModalDetailInternalDocRef = InstanceType<typeof ModalDetailInternalDoc>
type TModalDetailCarRef = InstanceType<typeof ModalDetailCar>
type TModalDetailRequestCarRef = InstanceType<typeof ModalDetailRequestCar>

// modal for click
const modalDetailOutDocRef = useTemplateRef<TModalDetailOutDocRef>('modalDetailOutDocRef')
const modalDetailInDocRef = useTemplateRef<TModalDetailInDocRef>('modalDetailInDocRef')
const modalDetailCarModalRef = useTemplateRef<TModalDetailCarRef>('modalDetailCarModalRef')
const modalDetailInternalDocRef = useTemplateRef<TModalDetailInternalDocRef>(
  'modalDetailInternalDocRef'
)
const modalDetailRequestCarModalRef = useTemplateRef<TModalDetailRequestCarRef>(
  'modalDetailRequestCarModalRef'
)

const router = useRouter()
const notificationStore = useNotificationStore()

const containerRef = useTemplateRef<HTMLElement>('containerRef')

const {
  tabList,
  selectedTab,
  isGetNextExternalLoading,
  isReadingAllNoti,
  hasNextPage,
  readNoti,
  readAllNoti,
  resetNotificationListWhenChangeTab,
  fetchNextPage
} = useNotification()

const notificationListByType = computed(() => {
  if (selectedTab?.value === 'all') return notificationStore?.allNotifications
  else return notificationStore?.allNotifications?.filter((noti) => !noti?.read)
})

useInfiniteScroll(
  containerRef,
  () => {
    if (hasNextPage.value && !isGetNextExternalLoading.value) {
      fetchNextPage()
    }
  },
  { distance: 5 }
)
const handleProcessCarClick = (carId: string, type: TCarType) => {
  modalDetailCarModalRef?.value?.openModal(carId, type)
}

const handleRequestCarClick = (carId: string, type: TCarType) => {
  if (type === CAR_TYPES.staff || type === CAR_TYPES.guest)
    modalDetailRequestCarModalRef?.value?.openModal(carId, type)
}

const handleIndocClick = (docId: string) => {
  modalDetailInDocRef?.value?.openModal(docId)
}

const handleOutDocClick = (docId: string) => {
  modalDetailOutDocRef?.value?.openModal(docId)
}

const handleInternalDocClick = (docId: string) => {
  modalDetailInternalDocRef?.value?.openModal(docId)
}

const handleRecordClick = (recordId: string) => {}

const handleTaskClick = (taskId: string) => {
  router?.push(`${ROUTE_PATHS?.task?.taskDetail}/${taskId}`)
}

useInfiniteScroll(
  containerRef,
  () => {
    if (hasNextPage.value && !isGetNextExternalLoading.value) {
      fetchNextPage()
    }
  },
  { distance: 5 }
)
</script>
<template>
  <div class="flex h-full w-full flex-col">
    <AppTabs
      v-model="selectedTab"
      :tab-list="tabList"
      tab-list-class="w-fit"
      @update:model-value="resetNotificationListWhenChangeTab()"
    />
    <div class="text-primary my-2 mt-8 flex items-center justify-between font-semibold">
      <span>Gần đây nhất</span>
      <Button
        :disabled="
          !notificationStore?.allNotifications?.find((noti) => !noti?.read) || isReadingAllNoti
        "
        severity="primary"
        variant="outlined"
        size="small"
        :loading="isReadingAllNoti"
        @click="readAllNoti()"
        label="Đã đọc tất cả"
      ></Button>
    </div>
    <div class="relative mt-3 h-full min-h-50 overflow-auto" ref="containerRef">
      <template v-if="notificationListByType?.length">
        <NotificationItem
          v-for="(noti, idx) in notificationListByType"
          :key="idx"
          class="px-3 py-2"
          :class="{ 'mt-3': idx !== 0 }"
          :notification="noti"
          size="minify"
          @car-processed-clicked="handleProcessCarClick"
          @car-request-clicked="handleRequestCarClick"
          @indoc-clicked="handleIndocClick"
          @outdoc-clicked="handleOutDocClick"
          @internaldoc-clicked="handleInternalDocClick"
          @record-clicked="handleRecordClick"
          @task-clicked="handleTaskClick"
          @read-noti="readNoti"
        />
      </template>
      <div v-else class="flex h-100 w-full items-center justify-center">Chưa có thông báo</div>
      <div v-if="isGetNextExternalLoading" class="flex w-full items-center justify-center">
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
    </div>
    <ModalDetailOutDoc ref="modalDetailOutDocRef" />
    <ModalDetailInternalDoc ref="modalDetailInternalDocRef" />
    <ModalDetailInDoc ref="modalDetailInDocRef" :is-view-by-o-m="false" />
    <ModalDetailCar
      ref="modalDetailCarModalRef"
      @update-etag-success="modalDetailCarModalRef?.closeModal()"
    />
    <ModalDetailRequestCar ref="modalDetailRequestCarModalRef" />
  </div>
</template>
