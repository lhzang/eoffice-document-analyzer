<script setup lang="ts">
import ModalAddExternalUnit from '@/shared/components/organization/unit/ModalAddExternalUnit.vue'
import { useGetInfiniteListExternalUnits } from '@/shared/composables/queries/organization/unit/useGetListExternalUnits'
import { APP_PAGE_SIZE } from '@/shared/constants/common'
import { DOCUMENT_PROCESS_ROLES } from '@/shared/constants/document'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type {
  TFormSelectDestinationValue,
  TFormSelectDestinationValues
} from '@/shared/models/outDoc/destination'
import type { ExternalUnitVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { formatSelectValueForExternalUnit } from '@/shared/utils/outDoc/destination'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { useDebounceFn, useInfiniteScroll } from '@vueuse/core'
import { Button, Checkbox } from 'primevue'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

const searchValue = ref<string>('')
const debouncedSearchValue = ref<string>('')
const debouncedFn = useDebounceFn((newVal) => {
  debouncedSearchValue.value = newVal
}, 500)
const selectedDestinations = defineModel<TFormSelectDestinationValues>()

const addNewModal = useTemplateRef<InstanceType<typeof ModalAddExternalUnit>>('modalRef')
const containerRef = useTemplateRef<HTMLElement>('containerRef')
const user = useUserProfileStore().user
const isAddNewExternalUnitAllowed = computed(() =>
  checkIfUserHasPermission(user?.currentPermission ?? [], APP_PERMISSION_VALUES.createExternalUnit)
)
const {
  data: listExternalUnitsDataPages,
  isLoading: isGetListExternalUnitsLoading,
  isFetchingNextPage: isGetNextExternalLoading,
  fetchNextPage,
  hasNextPage
} = useGetInfiniteListExternalUnits(
  ref({
    pageSize: APP_PAGE_SIZE,
    name: debouncedSearchValue
  }),
  ref(true)
)

// flatted data for use
const listExternalUnitsData = computed(() =>
  listExternalUnitsDataPages?.value?.pages?.flatMap((page) => page?.items || [])
)
useInfiniteScroll(
  containerRef,
  async () => {
    if (hasNextPage.value && !isGetNextExternalLoading.value) {
      fetchNextPage()
    }
  },
  { distance: 5 }
)

watch(searchValue, (newValue) => {
  debouncedFn(newValue)
})

const handleOpenAddModal = () => {
  addNewModal?.value?.openModal()
}

const handleChangeExternalUnit = async (
  unit: ExternalUnitVM,
  selectedValue: TFormSelectDestinationValue[]
) => {
  console.log(unit, selectedValue, 'selectedValueselectedValue')
  if (selectedValue?.length) {
    selectedDestinations.value?.set(unit.id, selectedValue?.[0]!)
    await nextTick()
  } else {
    selectedDestinations.value?.delete(unit.id)
    await nextTick()
  }
}
</script>
<template>
  <div class="flex items-center justify-center">
    <div
      class="custom-input border-surface-300 inline-flex h-10 w-full items-center rounded-md border bg-white px-2 py-1"
      :class="{ ['rounded-none! rounded-l-sm!']: isAddNewExternalUnitAllowed }"
    >
      <span
        class="custom-input--icon__search shrink-0 pl-2 text-2xl text-gray-500"
        :class="'icon-[line-md--search]'"
      />
      <input
        ref="searchInputRef"
        class="w-full border-none px-2 py-1 outline-none"
        placeholder="Tìm kiếm"
        v-model="searchValue"
      />
      <span
        v-if="searchValue"
        class="mr-1 text-xl text-gray-400 hover:cursor-pointer active:text-gray-500"
        :class="'icon-[line-md--close-circle-filled]'"
        @click="searchValue = ''"
      />
    </div>
    <Button
      v-if="isAddNewExternalUnitAllowed"
      class="h-10 shrink-0 rounded-none! rounded-r-md!"
      contained
      severity="primary"
      @click="handleOpenAddModal"
      >Thêm mới</Button
    >
  </div>
  <div class="bg-primary mt-4 flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
    <div class="grid flex-1 grid-cols-22 gap-x-2">
      <div class="col-span-17">Đơn vị</div>
      <div class="col-span-5">Mã định danh</div>
    </div>
    <div class="flex w-10 shrink-0 items-center justify-center">Chọn</div>
  </div>
  <div class="relative h-[400px] min-h-[200px] overflow-auto" ref="containerRef">
    <div
      v-if="isGetListExternalUnitsLoading"
      class="absolute flex h-full min-h-[200px] w-full items-center justify-center"
    >
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div
      v-if="!listExternalUnitsData?.length"
      class="flex h-full min-h-[200px] w-full items-center justify-center bg-white"
    >
      <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
      <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
    </div>
    <div
      class="text-primary border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-4 py-2 font-bold"
      v-else
      v-for="(unit, index) of listExternalUnitsData"
      :key="index"
    >
      <div class="grid flex-1 grid-cols-22 gap-x-2">
        <div class="col-span-17">{{ unit.name }}</div>
        <div class="col-span-5">{{ unit.axisOrgId }}</div>
      </div>
      <div class="flex w-10 shrink-0 items-center justify-center">
        <Checkbox
          :value="{
            ...formatSelectValueForExternalUnit(unit),
            formName: DOCUMENT_PROCESS_ROLES.Collaborator
          }"
          :model-value="
            selectedDestinations?.get(unit.id) ? [selectedDestinations?.get(unit.id)] : null
          "
          @update:modelValue="
            (selectdValue: TFormSelectDestinationValue[]) =>
              handleChangeExternalUnit(unit, selectdValue)
          "
        ></Checkbox>
      </div>
    </div>
    <div
      class="text-primary mb-1 flex h-10 items-center justify-center gap-1 bg-white px-4 py-2 font-bold"
      v-if="isGetNextExternalLoading"
    >
      <span class="icon-[line-md--loading-twotone-loop] text-3xl"></span>
    </div>
  </div>
  <template v-if="isAddNewExternalUnitAllowed">
    <ModalAddExternalUnit ref="modalRef" />
  </template>
</template>
c
