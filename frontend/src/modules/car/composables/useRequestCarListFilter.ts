import type { TAppTab } from '@/shared/models/common'
import { safeParseJson } from '@/shared/utils/common'
import { pick } from 'lodash-es'
import { ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { TCommonRequestCarFilter } from '../constants/carType'
import type { TCarStatus } from '../models/common'

export function useRequestCarListFilter<TTab>(tabList?: TAppTab<TTab>[]) {
  const filterParams = ref<TCommonRequestCarFilter>({
    search: '',
    status: null
  })

  const route = useRoute()

  const selectTab: Ref<TTab | null> = ref(
    tabList?.length
      ? tabList?.find((tab) => tab.value === (route.query?.tab?.toString() as TTab))?.value ||
          tabList[0].value
      : null
  ) as Ref<TTab | null>

  const handleSearch = (searchVal: string) => {
    filterParams.value.search = searchVal
  }

  const handleFilterStatus = (status: null | TCarStatus[]) => {
    filterParams.value.status = status
  }

  const handleResetFilter = () => {
    filterParams.value = {
      search: '',
      status: null
    }
  }

  //bind value from qs to search
  watch(
    () => route.query,
    (query) => {
      if (query) {
        const queryValues = pick(route.query, ['search', 'status'])
        const parsedValue = {
          ...queryValues,
          status: queryValues?.status ? safeParseJson(queryValues?.status) : undefined
        }
        filterParams.value = parsedValue as TCommonRequestCarFilter
      }
    },
    { deep: true, once: true, immediate: true }
  )

  return { filterParams, handleFilterStatus, selectTab, handleSearch, handleResetFilter }
}
