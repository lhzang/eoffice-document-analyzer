<script setup lang="ts">
import { computed, defineProps, h, type VNode } from 'vue'
import { Tippy } from 'vue-tippy'

import AssignedUserRole from '@/shared/components/AssignedUserRole.vue'
import { capitalizeText, getShortName, isEmptyValue, isExist } from '@/shared/utils/common'

import type { IAssignedUsers, TAssignedUserRoles } from '../models/types'

type TCustomDataAssignedUser = Record<`${Lowercase<TAssignedUserRoles>}`, IAssignedUsers[]>

const { assignedUsers } = defineProps<{
  assignedUsers: IAssignedUsers[]
}>()

const customDataAssignedUsers = computed<TCustomDataAssignedUser>(() => {
  if (isEmptyValue(assignedUsers))
    return {
      director: [],
      host: [],
      coordinator: [],
      reference: []
    }

  const newCustomRelevantUsers = {
    director: assignedUsers.filter((assignedUser) => assignedUser.functionType === 'Director'),
    host: assignedUsers.filter((assignedUser) => assignedUser.functionType === 'Host'),
    coordinator: assignedUsers.filter(
      (assignedUser) => assignedUser.functionType === 'Coordinator'
    ),
    reference: assignedUsers.filter((assignedUser) => assignedUser.functionType === 'Reference')
  }
  return newCustomRelevantUsers
})

const totalShowItem = 2

const generateTitleHistory = (functionType: TAssignedUserRoles) => {
  switch (functionType) {
    case 'Director':
      return 'Chỉ đạo'
    case 'Host':
      return 'Chủ trì'
    case 'Coordinator':
      return 'Phối hợp'
    default:
      return 'Xem để biết'
  }
}

function getDisplayName(user: IAssignedUsers, checkListUserVisible: boolean): VNode | string {
  if (user.unitId && !checkListUserVisible) {
    if (!isExist(user?.unit)) return 'Đơn vị không tồn tại'
    return h(
      Tippy,
      {
        content: user.unit?.unitName ?? '',
        placement: 'right'
      },
      {
        default: () =>
          h(
            'span',
            {
              class: 'cursor-pointer select-none'
            },
            `${user.unit?.unitName}`
          )
      }
    )
  }

  if (checkListUserVisible && user.unitId) {
    if (!isExist(user.unit)) return 'Đơn vị không tồn tại'
    return h(
      'span',
      `${getShortName(user.unit?.unitName)} - ${generateTitleHistory(user.functionType)}`
    )
  }
  if (checkListUserVisible && !user.unitId)
    return h(
      'span',
      `${getShortName(user.actionUser?.fullName)} - ${generateTitleHistory(user?.functionType)}`
    )
  if (!isExist(user?.actionUser)) return 'Người dùng không tồn tại'
  return h('span', `${getShortName(user.actionUser?.fullName)} ${user.actionUser?.fullName}`)
}
</script>
<template>
  <div
    class="mt-[2px]"
    v-for="(assignedUsers, assignedUsersKey, assignedUsersIdx) in customDataAssignedUsers"
    :key="assignedUsersIdx"
  >
    <template v-if="isExist(assignedUsers)">
      <AssignedUserRole :role="capitalizeText(assignedUsersKey) as TAssignedUserRoles" />
      <span>: </span>
      <span
        v-for="(assignedUser, assignedUserIdx) in assignedUsers.slice(0, totalShowItem)"
        :key="assignedUserIdx"
      >
        {{ assignedUserIdx > 0 ? ', ' : '' }}
        <component :is="getDisplayName(assignedUser, false)" />
      </span>

      <Tippy
        v-if="assignedUsers.length > totalShowItem"
        :max-width="300"
        interactive
        placement="bottom-start"
        theme="light-border"
      >
        <template #content>
          <div
            v-for="(assignedUser, assignedUserIdx) in assignedUsers.slice(totalShowItem)"
            :key="assignedUserIdx"
            class="max-h-[500px] overflow-y-auto"
          >
            <component :is="getDisplayName(assignedUser, false)" />
          </div>
        </template>
        <span class="text-primary cursor-pointer">
          và {{ assignedUsers.length - totalShowItem }} đơn vị, người khác
        </span>
      </Tippy>
    </template>
  </div>
</template>

<style>
.tippy-box[data-theme~='light-border'] {
  border: 1px solid var(--p-primary-color);
}
.tippy-box[data-theme~='light-border'][data-placement^='bottom-start'] > .tippy-arrow {
  transform: translate3d(10px, 0, 0) !important;
}
.tippy-box[data-theme~='light-border'][data-placement^='bottom-start'] > .tippy-arrow::before {
  border-bottom-color: var(--p-primary-color);
}
</style>
