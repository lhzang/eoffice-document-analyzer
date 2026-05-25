<script setup lang="ts">
import type { TenantWithNameOnlyVM } from '@/shared/services/api'
import { cleanObject, safeParseJson } from '@/shared/utils/common'
import { pick } from 'lodash-es'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { TRegistedNumberFilter } from '../models/keepNumber'
import KeepNumberFilter from './KeepNumberFilter.vue'
import KeptNumberTable from './KeptNumberTable.vue'
type TProps = {
  chooableHasStampUnits: TenantWithNameOnlyVM[]
  isLoadingUnitData: boolean
}

const filterParams = ref<TRegistedNumberFilter>({})

const route = useRoute()

const handleFilter = (data: TRegistedNumberFilter | null) => {
  filterParams.value = data ? cleanObject(data) : {}
}

//bind value from qs to filterParams
watch(
  () => route.query,
  (query) => {
    if (query) {
      const queryValues = pick(route.query, ['search', 'ownBookUnit', 'documentBook', 'status'])
      const parsedQueryValues = {
        ...queryValues,
        ownBookUnit: queryValues?.ownBookUnit ? safeParseJson(queryValues?.ownBookUnit) : undefined,
        documentBook: queryValues?.documentBook
          ? safeParseJson(queryValues?.documentBook)
          : undefined,
        status: queryValues?.status ? safeParseJson(queryValues?.status) : undefined
      }
      filterParams.value = parsedQueryValues as TRegistedNumberFilter
    }
  },
  { deep: true, once: true, immediate: true }
)

const { chooableHasStampUnits, isLoadingUnitData } = defineProps<TProps>()
</script>
<template>
  <div class="card">
    <div class="flex items-center justify-between gap-4">
      <span class="text-xl font-semibold">Danh sách số đã đăng ký</span>
      <KeepNumberFilter
        @submit="handleFilter"
        :isLoadingUnitData
        :chooableHasStampUnits
        :filterValues="filterParams"
      />
    </div>
    <div class="mt-8">
      <KeptNumberTable :filterParams="filterParams" />
    </div>
  </div>
</template>
