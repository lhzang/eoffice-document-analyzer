import type { TAppTab } from '@/shared/models/common'
import { cleanObject, safeParseJson } from '@/shared/utils/common'
import pick from 'lodash-es/pick'
import { ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { TCommonIndocFilter } from '../models/types'

export function useInDocCommonFilter<TTab>(tabList?: TAppTab<TTab>[]): {
  filterParams: Ref<TCommonIndocFilter>
  selectTab: Ref<TTab | null>
  handleFilter: (data: TCommonIndocFilter | null) => void
  handleResetFilter: () => void
} {
  const filterParams = ref<TCommonIndocFilter>({})

  const route = useRoute()

  const selectTab: Ref<TTab | null> = ref(
    tabList?.length
      ? tabList?.find((tab) => tab.value === (route.query?.tab?.toString() as TTab))?.value ||
          tabList[0].value
      : null
  ) as Ref<TTab | null>

  const handleFilter = (data: TCommonIndocFilter | null) => {
    filterParams.value = data ? cleanObject(data) : {}
  }

  const handleResetFilter = () => {
    filterParams.value = {}
  }

  //bind value from qs to filterParams
  watch(
    () => route.query,
    (query) => {
      if (query) {
        const queryValues = pick(route.query, [
          'search',
          'receivedAfter',
          'receivedBefore',
          'documentTypes',
          'priorityLevels'
        ])
        const parsedQueryValues = {
          ...queryValues,
          documentTypes: queryValues?.documentTypes
            ? safeParseJson(queryValues?.documentTypes)
            : undefined,
          priorityLevels: queryValues?.priorityLevels
            ? safeParseJson(queryValues?.priorityLevels)
            : undefined
        }
        filterParams.value = parsedQueryValues as TCommonIndocFilter
      }
    },
    { deep: true, once: true, immediate: true }
  )

  return { filterParams, selectTab, handleFilter, handleResetFilter }
}
