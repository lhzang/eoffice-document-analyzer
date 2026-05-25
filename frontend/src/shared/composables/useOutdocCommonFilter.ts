import type { TAppTab } from '@/shared/models/common'
import type { TCommonOutdocFilter } from '@/shared/models/outDoc/document'
import { cleanObject, safeParseJson } from '@/shared/utils/common'
import pick from 'lodash-es/pick'
import { ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'

export function useOutdocCommonFilter<TTab>(tabList?: TAppTab<TTab>[]): {
  filterParams: Ref<TCommonOutdocFilter>
  selectTab: Ref<TTab | null>
  handleFilter: (data: TCommonOutdocFilter | null) => void
  handleResetFilter: () => void
} {
  const filterParams = ref<TCommonOutdocFilter>({})

  const route = useRoute()
  const selectTab: Ref<TTab | null> = ref(
    tabList?.length
      ? tabList?.find((tab) => tab.value === (route.query?.tab?.toString() as TTab))?.value ||
          tabList[0].value
      : null
  ) as Ref<TTab | null>

  const handleFilter = (data: TCommonOutdocFilter | null) => {
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
        filterParams.value = parsedQueryValues as TCommonOutdocFilter
        console.log(filterParams, ';filterParams')
      }
    },
    { deep: true, once: true, immediate: true }
  )

  return { filterParams, selectTab, handleFilter, handleResetFilter }
}
