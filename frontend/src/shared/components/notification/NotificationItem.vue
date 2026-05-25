<script setup lang="ts">
import type { TCarType } from '@/modules/car/models/common'
import { URGENCY_LEVEL_LABELS, UrgentLevelsEnum } from '@/shared/constants/document'
import type { TUrgencyLevelValue } from '@/shared/models/document'
import type { NotificationDTO } from '@/shared/services/api'
import {
  getNotificationSummary,
  getObjectLabel
} from '@/shared/utils/notification/convertDisplayLabel'
import { DateTime } from 'luxon'
import { computed } from 'vue'

type TProps = {
  notification: NotificationDTO
  size: 'minify' | 'full'
}

const emit = defineEmits<{
  (e: 'indocClicked', objectId: string): void
  (e: 'outdocClicked', objectId: string): void
  (e: 'internaldocClicked', objectId: string): void
  (e: 'taskClicked', objectId: string): void
  (e: 'recordClicked', objectId: string): void
  (e: 'carRequestClicked', objectId: string, type: TCarType): void
  (e: 'carProcessedClicked', objectId: string, type: TCarType): void
  (e: 'readNoti', notiId: string): void
}>()

const { notification, size } = defineProps<TProps>()

const label = computed(() => getObjectLabel(notification?.object?.type))
const summary = computed(() => getNotificationSummary(notification))
const isRead = computed(() => notification?.read)
const content = computed(() => notification?.object?.name)
const reason = computed(() => notification?.object?.properties?.reason)

const displayPriority = computed(() => {
  if (
    (notification?.object?.type === 'indoc' ||
      notification?.object?.type === 'internal_doc' ||
      notification?.object?.type === 'outdoc') &&
    notification?.object?.properties?.priority !== UrgentLevelsEnum?.Normal
  )
    return URGENCY_LEVEL_LABELS?.[notification?.object?.properties?.priority as TUrgencyLevelValue]
  return undefined
})

const handleClickNotication = () => {
  if (notification?.object?.type === 'indoc') emit('indocClicked', notification?.object?.id)
  if (notification?.object?.type === 'outdoc') emit('outdocClicked', notification?.object?.id)
  if (notification?.object?.type === 'internal_doc')
    emit('internaldocClicked', notification?.object?.id)
  if (notification?.object?.type === 'task') emit('taskClicked', notification?.object?.id)
  if (notification?.object?.type === 'subtask')
    emit('taskClicked', notification?.object?.properties?.taskId)
  if (notification?.object?.type === 'carregistration' && notification?.activityType === 'register')
    emit('carRequestClicked', notification?.object?.id, notification?.object?.properties?.carType)
  if (
    notification?.object?.type === 'carregistration' &&
    (notification?.activityType === 'accept' || notification?.activityType === 'rejected')
  )
    emit('carProcessedClicked', notification?.object?.id, notification?.object?.properties?.carType)

  if (!notification?.read) emit('readNoti', notification?.notificationId)
}
</script>

<template>
  <div
    v-if="size === 'minify'"
    class="hover:border-primary cursor-pointer justify-between rounded-md border border-[#dfe5ef] text-sm transition-all"
    @click="handleClickNotication"
  >
    <div class="mb-3 flex items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 text-base">
          <span class="text-primary font-semibold">{{ label }}</span>
          <div v-if="!isRead" class="bg-primary h-4 w-4 rounded-full"></div>
        </div>
        <div
          v-if="displayPriority"
          class="mx-2 flex items-center gap-1 text-base font-semibold text-red-500"
        >
          <span class="icon-[tabler--urgent]"></span>
          <span>{{ displayPriority }}</span>
        </div>
      </div>
      <div class="text-primary font-semibold">
        {{ DateTime.fromISO(notification?.publishedAt).toFormat('HH:mm - dd/MM/yyyy') }}
      </div>
    </div>
    <div class="truncate font-semibold" v-if="summary">
      {{ summary }}
    </div>
    <div class="truncate">{{ content }}</div>
    <div class="truncate italic" v-if="reason">Lý do: {{ reason }}</div>
  </div>
</template>
