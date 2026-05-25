<script setup lang="ts">
import DistributeRoleTag from '@/modules/indoc/components/DistributeRoleTag.vue'
import type { TDocumentProcessValue } from '@/shared/models/document'
import { getGroupDistributedItemsByRole } from '@/shared/utils/document'
import { Popover } from 'primevue'
import { computed, ref, type ComponentPublicInstance } from 'vue'

type TProps = {
  itemList: TDocumentProcessValue[]
}
type PopoverInstance = ComponentPublicInstance & InstanceType<typeof Popover>

const props = defineProps<TProps>()

const popOverRef = ref<PopoverInstance[]>()

const toggle = (event: MouseEvent, id: string) => {
  const matchPopoverRef = popOverRef?.value?.find((ref) => ref.$attrs.id === id)
  if (matchPopoverRef) {
    matchPopoverRef.toggle(event)
  }
}

const groupedDistributeValue = computed(() => getGroupDistributedItemsByRole(props.itemList ?? []))
</script>
<template>
  <div class="flex h-25 flex-col items-center justify-center" v-if="!itemList?.length">
    <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
    <span class="text-md font-medium text-gray-400">Chưa có đơn vị/cá nhân được phân phối</span>
  </div>
  <template v-else>
    <div class="px-2">
      <div v-for="(distributedItems, roleName) in groupedDistributeValue" :key="roleName">
        <div v-if="distributedItems.length" class="py-0.5">
          <DistributeRoleTag :role="roleName" />
          :
          <span>
            {{ distributedItems?.slice(0, 2).join(', ') }}
          </span>
          <span v-if="distributedItems?.length > 2">
            <span class="text-primary cursor-pointer" @click="(e) => toggle(e, `${roleName}`)">
              {{ ` và ${distributedItems?.length - 2} đơn vị, người khác` }}
            </span>
            <Popover ref="popOverRef" :id="`${roleName}`">
              <div class="flex max-h-[300px] flex-col gap-4 overflow-y-auto">
                <ul class="m-0 flex list-none flex-col p-0">
                  <li
                    v-for="(distributedItem, idx) in distributedItems?.slice(2)"
                    :key="idx"
                    class="rounded-border w-[220px] cursor-pointer gap-2 px-0.5 py-1"
                  >
                    {{ distributedItem }}
                  </li>
                </ul>
              </div>
            </Popover>
          </span>
        </div>
      </div>
    </div>
  </template>
</template>
