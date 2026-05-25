<script setup lang="ts">
import ModalDetailCar from '@/modules/car/components/ModalDetailCar.vue'
import ModalDetailRequestCar from '@/modules/car/components/ModalDetailRequestCar.vue'
import { CAR_TYPES } from '@/modules/car/constants/carType'
import type { TCarType } from '@/modules/car/models/common'
import ModalDetailInDoc from '@/modules/indoc/components/ModalDetailInDoc.vue'
import ModalDetailInternalDoc from '@/modules/internalDocument/components/modals/ModalDetailInternalDoc.vue'
import ModalDetailOutDoc from '@/modules/outDocument/components/modals/ModalDetailOutDoc.vue'
import { useNotification } from '@/shared/composables/useNotification'
import { ROUTE_PATHS } from '@/shared/constants/router'
import { useNotificationStore } from '@/shared/stores/useNotificationStore'
import { useInfiniteScroll } from '@vueuse/core'
import { Button, Divider, OverlayBadge, Popover } from 'primevue'
import { ref, useTemplateRef } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppTabs from '../AppTabs.vue'
import NotificationItem from './NotificationItem.vue'

// type PopoverInstance = ComponentPublicInstance & InstanceType<typeof Popover>

type TModalDetailOutDocRef = InstanceType<typeof ModalDetailOutDoc>
type TModalDetailInDocRef = InstanceType<typeof ModalDetailInDoc>
type TModalDetailInternalDocRef = InstanceType<typeof ModalDetailInternalDoc>
type TModalDetailCarRef = InstanceType<typeof ModalDetailCar>
type TModalDetailRequestCarRef = InstanceType<typeof ModalDetailRequestCar>

const containerRef = useTemplateRef<HTMLElement>('containerRef')

// modal for click
const modalDetailOutDocRef = useTemplateRef<TModalDetailOutDocRef>('modalDetailOutDocRef')
const modalDetailInDocRef = useTemplateRef<TModalDetailInDocRef>('modalDetailInDocRef')
const modalDetailInternalDocRef = useTemplateRef<TModalDetailInternalDocRef>(
  'modalDetailInternalDocRef'
)
const modalDetailCarModalRef = useTemplateRef<TModalDetailCarRef>('modalDetailCarModalRef')
const modalDetailRequestCarModalRef = useTemplateRef<TModalDetailRequestCarRef>(
  'modalDetailRequestCarModalRef'
)

const notiPopoverRef = ref<InstanceType<typeof Popover> | null>(null)

const router = useRouter()
const notificationStore = useNotificationStore()
const isNotiNotOpenYet = ref(false)
const {
  tabList,
  selectedTab,
  isGetNextExternalLoading,
  hasNextPage,
  isReadingAllNoti,
  readNoti,
  readAllNoti,
  resetNotificationListWhenChangeTab,
  fetchNextPage
} = useNotification(isNotiNotOpenYet)

const toggleNotiPopover = (event: MouseEvent) => {
  notiPopoverRef?.value?.show(event)
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
const handleProcessCarClick = (carId: string, type: TCarType) => {
  notiPopoverRef?.value?.hide()
  modalDetailCarModalRef?.value?.openModal(carId, type)
}
const handleRequestCarClick = (carId: string, type: TCarType) => {
  notiPopoverRef?.value?.hide()
  if (type === CAR_TYPES.staff || type === CAR_TYPES.guest)
    modalDetailRequestCarModalRef?.value?.openModal(carId, type)
}
const handleIndocClick = (docId: string) => {
  notiPopoverRef?.value?.hide()
  modalDetailInDocRef?.value?.openModal(docId)
}
const handleOutDocClick = (docId: string) => {
  notiPopoverRef?.value?.hide()
  modalDetailOutDocRef?.value?.openModal(docId)
}
const handleInternalDocClick = (docId: string) => {
  notiPopoverRef?.value?.hide()
  modalDetailInternalDocRef?.value?.openModal(docId)
}
const handleRecordClick = (recordId: string) => {
  notiPopoverRef?.value?.hide()
}
const handleTaskClick = (taskId: string) => {
  notiPopoverRef?.value?.hide()
  router?.push(`/${ROUTE_PATHS?.task?.taskDetail}/${taskId}`)
}
</script>
<template>
  <div>
    <Button class="h-full" variant="text" severity="contrast" @click="toggleNotiPopover">
      <template #icon>
        <OverlayBadge
          :value="notificationStore?.unReadCount >= 99 ? '99+' : notificationStore?.unReadCount"
          severity="danger"
          size="small"
          :pt="{
            pcBadge: {
              root: `${notificationStore?.unReadCount ? '!w-5 !h-5' : '!w-0 !h-0 !hidden'}  rounded-full! font-light!`
            }
          }"
        >
          <i class="pi pi-bell text-sm" />
        </OverlayBadge>
      </template>
    </Button>
    <Popover ref="notiPopoverRef" id="notiPop" append-to="self" @show="isNotiNotOpenYet = true">
      <div class="w-120 rounded-md">
        <div class="flex items-center justify-between gap-4">
          <h4 class="text-primary font-semibold">Thông báo</h4>
          <Button
            :disabled="!notificationStore?.allNotifications?.find((noti) => !noti?.read)"
            severity="primary"
            variant="outlined"
            size="small"
            :loading="isReadingAllNoti"
            @click="readAllNoti()"
            >Đã đọc tất cả</Button
          >
        </div>
        <Divider class="mb-0! h-0.5" />
        <AppTabs
          v-model="selectedTab"
          :tab-list="tabList"
          @update:model-value="resetNotificationListWhenChangeTab()"
        />
        <div class="text-primary my-2 flex items-center justify-between font-semibold">
          <span>Gần đây nhất</span>
          <RouterLink
            :to="ROUTE_PATHS.notification"
            class="cursor-pointer transition-all hover:underline"
            >Xem tất cả</RouterLink
          >
        </div>
        <div class="relative mt-3 h-100 min-h-50 overflow-auto" ref="containerRef">
          <template v-if="notificationStore?.allNotifications?.length">
            <NotificationItem
              v-for="(noti, idx) in notificationStore?.allNotifications"
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
          <div v-else class="flex h-full w-full items-center justify-center">Chưa có thông báo</div>
          <div v-if="isGetNextExternalLoading" class="flex w-full items-center justify-center">
            <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
          </div>
        </div>
      </div>
    </Popover>
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
