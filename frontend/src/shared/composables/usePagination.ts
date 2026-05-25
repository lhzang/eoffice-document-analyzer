import { nextTick, onUnmounted, ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'

import { router } from '@/router'
import omit from 'lodash-es/omit'
import { DEFAULT_PAGE_SIZE } from '../constants/common'
import { isExist, toQueryParams } from '../utils/common'

type TOtherMemoParams = Partial<Record<string, unknown> & { tab: string; sort?: string }>

export const usePagination = ({
  showSizeChanger = true,
  showQuickJumper = false,
  pageSizeOptions = [5, 10, 20, 30, 50],
  isMemorizedPage = false,
  pageSize = DEFAULT_PAGE_SIZE,
  otherMemoParams = ref({}) as Ref<TOtherMemoParams>
}) => {
  const route = useRoute()
  const tablePagination = ref({
    current: 0,
    pageSize: pageSize,
    showSizeChanger,
    showQuickJumper,
    pageSizeOptions
  })

  const refresh = () => {
    tablePagination.value = {
      ...tablePagination.value,
      current: 0,
      pageSize
    }
  }

  const updatePaginationRouteParams = (page: number, pageSize: number) => {
    const newQuery = { ...route.query }
    newQuery.page = page?.toString()
    newQuery.pageSize = pageSize?.toString()
    tablePagination.value.current = page - 1
    tablePagination.value.pageSize = pageSize
    if (isMemorizedPage) {
      router.push({
        path: route.path,
        query: newQuery
      })
    }
  }

  const updateCurrentPage = (page: number, pageSize: number) => {
    console.log(page)
    if (tablePagination.value.pageSize !== pageSize) return
    updatePaginationRouteParams(page + 1, pageSize)
  }

  const updatePageSize = async (pageSize: number) => {
    if (tablePagination.value.pageSize === pageSize) return
    await nextTick()
    updatePaginationRouteParams(1, pageSize)
  }

  watch(
    () => otherMemoParams.value,
    (newVal: TOtherMemoParams, oldValue: TOtherMemoParams) => {
      tablePagination.value.current = 0
      if (!isMemorizedPage) return
      if (newVal.tab && newVal.tab !== oldValue?.tab) {
        router.push({
          query: {
            tab: newVal?.tab
          }
        })
        return
      }
      if (newVal?.tab && newVal?.tab === oldValue?.tab) {
        router.push({
          query: {
            tab: newVal?.tab,
            page: 1,
            pageSize: tablePagination.value.pageSize,
            ...toQueryParams({ ...omit(newVal, 'tab') })
          }
        })
        return
      }
      if (!newVal?.tab && isExist(omit(newVal, 'tab'))) {
        router.push({
          query: {
            page: 1,
            pageSize: tablePagination.value.pageSize,
            ...toQueryParams({ ...omit(newVal, 'tab', 'sort') })
          }
        })
        return
      }
      router.push({
        query: {
          page: 1,
          pageSize: tablePagination.value.pageSize
        }
      })
    }
  )

  watch(
    () => JSON.stringify(route.query),
    (newQuery) => {
      if (isMemorizedPage) {
        const parsed = JSON.parse(newQuery)

        const { page, pageSize: queryPageSize, ...otherParams } = parsed
        tablePagination.value.current = Number(page ?? 1) - 1
        tablePagination.value.pageSize = Number(queryPageSize ?? pageSize ?? DEFAULT_PAGE_SIZE)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    refresh()
  })
  return { tablePagination, refresh, updateCurrentPage, updatePageSize }
}
