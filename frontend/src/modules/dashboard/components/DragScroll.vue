<script setup lang="ts">
import { useAuth } from '@/shared/composables/useAuth'
import type { DashboardResponse } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import Badge from 'primevue/badge'
import { computed, nextTick, onMounted, ref } from 'vue'

type TProps = {
  statistic: DashboardResponse
}

const { statistic } = defineProps<TProps>()
const { changeUserPosition } = useAuth()
const profileStore = useUserProfileStore()

const scrollRow = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const currentPositionID = computed(() => profileStore?.user?.currentPosition?.id)
const otherPositions = computed(() =>
  statistic?.positions?.filter((pos) => pos?.positionId !== currentPositionID?.value)
)

function checkScroll() {
  const el = scrollRow.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

function scroll(dir: 'left' | 'right') {
  scrollRow.value?.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' })
}

async function onPositionClick(positionId: string) {
  if (positionId === currentPositionID?.value) return
  try {
    await changeUserPosition(positionId)
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  await nextTick()
  checkScroll()
})
</script>

<template>
  <div class="card border-shadow mb-5 p-4">
    <h3 class="mb-4 font-semibold">
      <span class="text-primary">Vị trí hiện tại: </span>
      {{ profileStore?.user?.currentPosition?.title }}
    </h3>

    <div class="relative flex items-center">
      <!-- left arrow -->
      <button
        v-if="canScrollLeft"
        class="hover:border-primary-300 hover:text-primary-500 absolute left-0 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all"
        @click="scroll('left')"
      >
        <i class="pi pi-chevron-left text-xs" />
      </button>

      <!-- pill row -->
      <div
        ref="scrollRow"
        class="flex w-full gap-2 overflow-x-auto px-1 pb-0.5 select-none"
        style="-ms-overflow-style: none; scrollbar-width: none"
        @scroll="checkScroll"
      >
        <button
          v-for="pos in otherPositions"
          :key="pos?.positionId"
          class="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200"
          :class="
            pos?.positionId === currentPositionID
              ? 'border-primary-500 bg-primary-500 shadow-primary-200 text-white shadow-md'
              : 'hover:border-primary-400 hover:bg-primary-50 hover:text-primary-500 border-gray-200 bg-white text-gray-500'
          "
          @click="onPositionClick(pos?.positionId)"
        >
          {{ pos?.positionName }}
          <Badge
            :value="pos?.totalNotification >= 99 ? '99+' : pos?.totalNotification"
            size="small"
            :pt="{
              pcBadge: {
                root: `${pos.totalNotification ? '!w-5 !h-5' : '!w-0 !h-0 !hidden'}  rounded-full! font-light!`
              }
            }"
            :class="
              pos.totalNotification ? 'bg-red-100! text-red-500!' : 'bg-gray-100! text-gray-400!'
            "
          />
        </button>
      </div>

      <!-- right arrow -->
      <button
        v-if="canScrollRight"
        class="hover:border-primary-300 hover:text-primary-500 absolute right-0 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all"
        @click="scroll('right')"
      >
        <i class="pi pi-chevron-right text-xs" />
      </button>
    </div>

    <p class="mt-2 text-xs text-gray-500">* Số hiển thị là tổng văn bản / công việc chưa xử lý</p>
  </div>
</template>

<style scoped>
div::-webkit-scrollbar {
  display: none;
}
</style>
