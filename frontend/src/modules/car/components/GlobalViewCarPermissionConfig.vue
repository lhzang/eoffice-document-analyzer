<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import { Button, type ColumnProps } from 'primevue'
import { computed, ref } from 'vue'
import { useGetStaffsWithGlobalViewCarPermission } from '../composables/queries/carDelagation/useGetStaffsWithGlobalViewCarPermission'
import { CAR_TYPES } from '../constants/carType'
import type {
  TCarConfigViewAndDeletePermissions,
  TCarPermissionUser
} from '../models/carDelagation'
import type { TCarType } from '../models/common'
import ModalConfigViewOrgCar from './ModalConfigViewOrgCar.vue'

type TModalConfigViewOrgCar = InstanceType<typeof ModalConfigViewOrgCar>

const { data, isLoading, refetch } = useGetStaffsWithGlobalViewCarPermission()
const formatedData = computed(() => {
  const groupedStaffByCarPerm: Record<TCarType, TCarPermissionUser[]> = {
    [CAR_TYPES.university]: [],
    [CAR_TYPES.staff]: [],
    [CAR_TYPES.student]: [],
    [CAR_TYPES.guest]: [],
    [CAR_TYPES.collaborator]: []
  }

  data?.value?.forEach((staff) =>
    groupedStaffByCarPerm[staff?.carType]?.push({
      positionId: staff?.staffId,
      displayName: staff?.staffName
    })
  )
  const tableData: TCarConfigViewAndDeletePermissions[] = [
    {
      permission: {
        label: 'Xem xe đại học',
        value: CAR_TYPES.university
      },
      users: groupedStaffByCarPerm.UNIVERSITY
    },
    {
      permission: {
        label: 'Xem xe cán bộ',
        value: CAR_TYPES.staff
      },
      users: groupedStaffByCarPerm.STAFF
    },
    {
      permission: {
        label: 'Xem xe người học',
        value: CAR_TYPES.student
      },
      users: groupedStaffByCarPerm.STUDENT
    },
    {
      permission: {
        label: 'Xem xe khách',
        value: CAR_TYPES.guest
      },
      users: groupedStaffByCarPerm.GUEST
    },
    {
      permission: {
        label: 'Xem xe thỉnh giảng/CTV',
        value: CAR_TYPES.collaborator
      },
      users: groupedStaffByCarPerm.COLLABORATOR
    }
  ]
  return tableData
})

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: TCarConfigViewAndDeletePermissions) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    header: 'STT',
    field: 'order',
    customSlot: 'order',
    style: {
      width: '80px'
    }
  },
  {
    header: 'Quyền thực hiện',
    field: (permission) => permission?.permission?.label
  },
  {
    header: 'Cán bộ thực hiện',
    field: (permission) => permission?.users?.map((user) => user?.displayName)?.join(', ')
  },
  {
    header: 'Hành động',
    field: 'action',
    customSlot: 'tableAction',
    style: {
      whiteSpace: 'nowrap',
      width: '1%'
    }
  }
]

const configViewOrgCarRef = ref<TModalConfigViewOrgCar | null>(null)
</script>
<template>
  <div>
    <AppTable
      :data="formatedData ?? []"
      :columns="columns"
      :loading="isLoading"
      :always-show-paginator="false"
      :lazy="false"
    >
      <template #order="{ index }">
        <span>{{ index + 1 }}</span>
      </template>
      <template #tableAction="{ data }">
        <div class="flex items-center justify-end">
          <Button
            @click="configViewOrgCarRef?.openModal(data?.permission?.value)"
            severity="primary"
            class="my-auto p-2!"
          >
            <span class="icon-[mingcute--pencil-3-fill]"></span>
          </Button>
        </div> </template
    ></AppTable>
    <ModalConfigViewOrgCar
      ref="configViewOrgCarRef"
      :viewCarStaffsData="formatedData"
      @updated-config="refetch"
    />
  </div>
</template>
