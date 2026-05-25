import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { ref } from 'vue'

const breakpoints = useBreakpoints(breakpointsTailwind)

const lgAndLarger = breakpoints.greaterOrEqual('lg')

const isSidebarOpen = ref(lgAndLarger.value)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

export function useLayout() {
  return { lgAndLarger, isSidebarOpen, toggleSidebar }
}
