<script setup lang="ts">
import AppTabs from '@/shared/components/AppTabs.vue'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { notifyError } from '@/shared/utils/common'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { Button } from 'primevue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import ModalAddPosition from '../components/ModalAddPosition.vue'
import StaffDetailInfo from '../components/StaffDetailInfo.vue'
import StaffDetailPositionList from '../components/StaffDetailPositionList.vue'
import { useGetDetailAccount } from '../composables/queries/useGetDetailAccount'

type TModalAddPositionRef = InstanceType<typeof ModalAddPosition>

const route = useRoute()

const selectTab = ref('info')
const currentPermissions = computed(() => useUserProfileStore().user?.currentPermission ?? [])

const tabList = [
  {
    label: 'Thông tin',
    value: 'info'
  },
  {
    label: 'Chức vụ',
    value: 'position'
  }
]

const { data, isLoading, isError, error, refetch } = useGetDetailAccount(
  () => route.params.id as string,
  {
    enabled: !!route.params.id
  }
)

if (error?.value) {
  notifyError(error?.value, ' Đã có lỗi xảy ra khi lấy thông tin của nhân sự')
}

const modalAddPositionRef = ref<TModalAddPositionRef | null>(null)
</script>
<template>
  <div>
    <div class="card" v-if="data">
      <div class="mb-6 flex items-center justify-between gap-4">
        <AppTabs scrollable v-model="selectTab" :tab-list="tabList" />
        <Button
          variant="outlined"
          severity="primary"
          label="Thêm chức vụ"
          class="w-fit shrink-0"
          v-if="checkIfUserHasPermission(currentPermissions, APP_PERMISSION_VALUES.createPosition)"
          @click="modalAddPositionRef?.openModal()"
          v-show="selectTab === 'position'"
        />
      </div>
      <div>
        <StaffDetailInfo
          v-if="selectTab === 'info' && data"
          :staff-detail="data"
          @updated-staff="refetch"
        />
        <StaffDetailPositionList
          v-if="selectTab === 'position' && data"
          :staff-detail="data"
          @processed-position="refetch"
        />
      </div>
      <ModalAddPosition
        ref="modalAddPositionRef"
        v-if="checkIfUserHasPermission(currentPermissions, APP_PERMISSION_VALUES.createPosition)"
        :staff-detail="data"
        @created-position="refetch"
      />
    </div>
    <div v-else class="relative flex h-full w-full items-center justify-center p-4">
      <span
        v-if="isLoading"
        class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"
      ></span>
      <div v-if="isError && error" class="text-danger text-center">
        {{
          error?.response?.data?.detail ??
          error?.message ??
          'Đã có lỗi xảy ra khi lấy thông tin của nhân sự!'
        }}
      </div>
    </div>
  </div>
</template>
