import type { TAppTab } from '@/shared/models/common'
import { cleanObject } from '@/shared/utils/common'
import pick from 'lodash-es/pick'
import { ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'

export interface TTaskFilter {
  search?: string
}

export function useTaskCommonFilter<TTab>(tabList?: TAppTab<TTab>[]): {
  filterParams: Ref<TTaskFilter>
  selectTab: Ref<TTab | null>
  handleFilter: (data: TTaskFilter | null) => void
  handleResetFilter: () => void
} {
  const filterParams = ref<TTaskFilter>({})

  const route = useRoute()

  const selectTab: Ref<TTab | null> = ref(
    tabList?.length
      ? tabList?.find((tab) => tab.value === (route.query?.tab?.toString() as TTab))?.value ||
          tabList[0].value
      : null
  ) as Ref<TTab | null>

  const handleFilter = (data: TTaskFilter | null) => {
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
        const queryValues = pick(route.query, ['search'])
        filterParams.value = queryValues as TTaskFilter
      }
    },
    { deep: true, once: true, immediate: true }
  )

  return { filterParams, selectTab, handleFilter, handleResetFilter }
}
