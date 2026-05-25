<script setup lang="ts">
import { useGetAffectUnitBySelfPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitBySelfPermission'
import { useGetHasStampUnits } from '@/shared/composables/queries/organization/unit/useGetHasStampUnits'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { computed } from 'vue'
import CreateRegisterNumOD from '../components/CreateRegisterNumOD.vue'
import RegistedNumberList from '../components/RegistedNumberList.vue'
const {
  data: hasRoleUnits,
  isLoading: isGetttingHasRoleUnits,
  isError
} = useGetAffectUnitBySelfPermission(() => APP_PERMISSION_VALUES.manageKeepNumber)

const { data: hasStampUnits, isLoading: isGettingHasStampUnits } = useGetHasStampUnits()

const unitHasPermissionIdSet = computed(() => {
  const res = new Set<string>()
  ;(hasStampUnits?.value ?? [])?.forEach((unit) => res?.add(unit?.id))
  return res
})
const chooableHasStampUnits = computed(() => {
  return (hasRoleUnits?.value ?? [])?.filter((unit) => unitHasPermissionIdSet.value.has(unit?.id))
})
</script>

<template>
  <div>
    <CreateRegisterNumOD
      :chooableHasStampUnits="chooableHasStampUnits"
      :isLoadingUnitData="isGettingHasStampUnits || isGetttingHasRoleUnits"
    />
    <RegistedNumberList
      :chooableHasStampUnits="chooableHasStampUnits"
      :isLoadingUnitData="isGettingHasStampUnits || isGetttingHasRoleUnits"
      class="mt-6"
    />
  </div>
</template>
