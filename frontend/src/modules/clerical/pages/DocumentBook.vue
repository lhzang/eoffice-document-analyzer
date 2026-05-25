<script setup lang="ts">
import { router } from '@/router'
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTabs from '@/shared/components/AppTabs.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import { useGetAffectUnitBySelfPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitBySelfPermission'
import { useGetPermissionsInUnit } from '@/shared/composables/queries/accessControl/useGetPermissionsInUnit'
import { DOCUMENT_BOOK_STATUS } from '@/shared/constants/clerical/documentBook.shared'
import { APP_PERMISSION_VALUES, type TAppFeatureKey } from '@/shared/constants/permission'
import type { TAppTab } from '@/shared/models/common'
import type { TTreeUnitWithStaffNode, TUnitSelectValue } from '@/shared/models/organization/unit'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { DateTime } from 'luxon'
import { Button } from 'primevue'
import { computed, ref, useTemplateRef, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import AddNewDocumentBookModal from '../components/documentBook/AddNewDocumentBookModal.vue'
import CurrentDocumentBookList from '../components/documentBook/CurrentDocumentBookList.vue'
import LockedDocumentBookList from '../components/documentBook/LockedDocumentBookList.vue'
import type { TDocumentBookStatus } from '../model/documentBookType'

type TModalAddBook = InstanceType<typeof AddNewDocumentBookModal>
const currentUnitId = useUserProfileStore()?.user?.currentPosition?.unitId
const route = useRoute()

const modalAddNewRef = useTemplateRef<TModalAddBook | null>('modalAddNewRef')

const selectedUnit = ref<TUnitSelectValue | null>(null)
const searchValue = ref<string>()

const {
  data: hasRoleUnits,
  isLoading: isGetttingHasRoleUnits,
  isSuccess: isGetHasRoleUnitsSuccess,
  isError: isGetHasRoleUnisError
} = useGetAffectUnitBySelfPermission(() => APP_PERMISSION_VALUES.viewDocumentBook)

const {
  data: permissionInUnit,
  isLoading: isGettingPermission,
  isError: isErrorWhenGetPerm
} = useGetPermissionsInUnit(() => selectedUnit?.value?.id!, {
  enabled: () => !!selectedUnit?.value?.id
})

const typeCastedPerms = computed(() => (permissionInUnit?.value as TAppFeatureKey[]) ?? [])

const tabList: Ref<TAppTab<TDocumentBookStatus>[]> = computed(() => [
  {
    label: `Năm ${DateTime.now().year}`,
    value: DOCUMENT_BOOK_STATUS.OPEN
  },
  {
    label: `Đã khóa`,
    value: DOCUMENT_BOOK_STATUS.LOCKED
  }
])

const selectTab = ref(
  tabList.value?.find((tab) => tab.value === (route.query?.tab?.toString() as TDocumentBookStatus))
    ?.value || tabList?.value?.[0]?.value!
)
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

const handleSelectConfigUnit = (value: TUnitSelectValue | null) => {
  selectedUnit.value = value
}

const filterDisableUnit = (unit: TTreeUnitWithStaffNode) => {
  if (
    isGetHasRoleUnisError.value ||
    isGetttingHasRoleUnits.value ||
    !hasRoleUnits?.value?.some((hasRoleUnit) => hasRoleUnit?.id === unit?.id)
  )
    return true
  return false
}

watch([isGetHasRoleUnitsSuccess, hasRoleUnits], ([isGetHasRoleUnitsSuccess, hasRoleUnits]) => {
  if (!isGetHasRoleUnitsSuccess || !hasRoleUnits?.length) return
  if (hasRoleUnits?.length === 1) selectedUnit.value = hasRoleUnits?.[0]!
  else {
    const sameCurrentUnit = hasRoleUnits?.find((unit) => unit?.id === currentUnitId)
    if (sameCurrentUnit) selectedUnit.value = sameCurrentUnit
    else selectedUnit.value = hasRoleUnits?.[0]!
  }
})
</script>
<template>
  <div>
    <div class="border-primary mb-4 rounded-xl border p-4">
      <InternalUnitSelect
        :default-value="null"
        label="Chọn đơn vị"
        modalLabel="Chọn đơn vị"
        :is-select-multiple="false"
        type="FULL"
        :model-value="selectedUnit"
        :disabled="isGetttingHasRoleUnits"
        @submit="handleSelectConfigUnit"
        :check-if-unit-disabled="filterDisableUnit"
      />
    </div>
    <template v-if="selectedUnit?.id">
      <div v-if="isGettingPermission" class="mt-10 flex h-[200px] items-center justify-center">
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
      <div v-else-if="isErrorWhenGetPerm" class="mt-10 flex h-[200px] items-center justify-center">
        <div class="text-primary text-justify text-xl">
          Đã có lỗi khi kiểm tra quyền với đơn vị. Vui lòng thử lại sau
        </div>
      </div>
      <template v-else>
        <div class="flex items-center justify-between gap-4">
          <AppTabs v-model="selectTab" @update:model-value="handleChangeTab" :tab-list="tabList" />

          <AppFilterBarWithSearch
            class="flex items-center justify-end gap-2"
            placeholder="Tìm kiếm theo tên sổ văn bản"
            :search-string="searchValue"
            @search="handleSearch"
          >
            <template #postAdditionalSlot>
              <Button label="Thêm mới" variant="contained" @click="modalAddNewRef?.openModal()" />
            </template>
          </AppFilterBarWithSearch>
        </div>
        <CurrentDocumentBookList
          v-if="selectTab === DOCUMENT_BOOK_STATUS.OPEN"
          :active-tab="selectTab"
          :search-value="searchValue"
          :selected-unit="selectedUnit"
          :hasLockPerm="
            checkIfUserHasPermission(typeCastedPerms, APP_PERMISSION_VALUES.lockDocumentBook)
          "
          :hasManagePerm="
            checkIfUserHasPermission(typeCastedPerms, APP_PERMISSION_VALUES.manageDocumentBook)
          "
          :hasEditStartNumberPerm="
            checkIfUserHasPermission(typeCastedPerms, APP_PERMISSION_VALUES.editBookStartNumber)
          "
          :hasViewDocPerm="
            checkIfUserHasPermission(typeCastedPerms, APP_PERMISSION_VALUES.viewDocumentInBook)
          "
        />
        <LockedDocumentBookList
          v-else
          :active-tab="selectTab"
          :hasUnLockPerm="
            checkIfUserHasPermission(typeCastedPerms, APP_PERMISSION_VALUES.unlockDocumentBook)
          "
          :search-value="searchValue"
          :selected-unit="selectedUnit"
          :hasViewDocPerm="
            checkIfUserHasPermission(typeCastedPerms, APP_PERMISSION_VALUES.viewDocumentInBook)
          "
        />

        <AddNewDocumentBookModal
          v-if="
            checkIfUserHasPermission(
              typeCastedPerms,
              APP_PERMISSION_VALUES.createInternalDocumentBook
            ) || checkIfUserHasPermission(typeCastedPerms, APP_PERMISSION_VALUES.manageDocumentBook)
          "
          :hasCreateInternal="
            checkIfUserHasPermission(
              typeCastedPerms,
              APP_PERMISSION_VALUES.createInternalDocumentBook
            )
          "
          :hasCreateOtherType="
            checkIfUserHasPermission(typeCastedPerms, APP_PERMISSION_VALUES.manageDocumentBook)
          "
          ref="modalAddNewRef"
          :selected-unit-id="selectedUnit?.id"
        />
      </template>
    </template>
  </div>
</template>
