import type { TAppTab } from '@/shared/models/common'
import { ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'

export function useCarListFilter<TTab>(tabList?: TAppTab<TTab>[]): {
  search: Ref<string>
  selectTab: Ref<TTab | null>
  handleSearch: (search: string) => void
  handleResetFilter: () => void
} {
  const search = ref<string>('')

  const route = useRoute()

  const selectTab: Ref<TTab | null> = ref(
    tabList?.length
      ? tabList?.find((tab) => tab.value === (route.query?.tab?.toString() as TTab))?.value ||
          tabList[0].value
      : null
  ) as Ref<TTab | null>

  const handleSearch = (searchVal: string) => {
    search.value = searchVal
  }

  const handleResetFilter = () => {
    search.value = ''
  }

  //bind value from qs to search
  watch(
    () => route.query,
    (query) => {
      if (query) {
        search.value = route?.query?.search as string
      }
    },
    { deep: true, once: true, immediate: true }
  )

  return { search, selectTab, handleSearch, handleResetFilter }
}
