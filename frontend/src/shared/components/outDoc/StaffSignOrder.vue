<script setup lang="ts">
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import type { TSignerWithSignOrder } from '@/shared/models/outDoc/signer'
import { remapAccendingSequentialIndexes } from '@/shared/utils/common'
import { Checkbox } from 'primevue'
import { computed } from 'vue'

type TProps = {
  isDefaultUnOrdered?: boolean
}

const {} = defineProps<TProps>()

const signerList = defineModel<TSignerWithSignOrder[]>({
  required: true
})
const isUnOrder = defineModel<boolean>('isUnOrder', {
  default: false
})
const maxOrder = computed(() => {
  if (!signerList?.value?.length) return 1
  return Math.min(
    (signerList?.value?.[signerList?.value?.length - 1]?.index ?? 0) + 1,
    signerList?.value?.length
  )
})

const emits = defineEmits<{
  'staff-removed': [TSignerWithSignOrder]
}>()

// watchEffect(() => {
//   console.log(isUnOrder.value, 'isUnOrder')
// })
// watch(
//   () => isDefaultUnOrdered,
//   (isDefaultUnOrdered) => {
//     alert(isDefaultUnOrdered, 'isDefaultUnOrdered')
//     isUnOrder.value = isDefaultUnOrdered
//   }
// )

const handleUpdateSignOrder = (isUnOrder: boolean) => {
  if (isUnOrder) signerList?.value?.forEach((staff) => (staff.index = 1))
  else signerList?.value?.forEach((staff, idx) => (staff.index = idx + 1))
}
</script>
<template>
  <div>
    <div class="bg-primary flex h-10 items-center justify-end gap-1 px-4 py-2 font-bold text-white">
      <div class="flex items-center justify-center gap-2">
        Ký theo trình tự bất kỳ
        <div class="mr-[1px] flex h-auto shrink-0 items-center justify-center">
          <Checkbox
            v-model="isUnOrder"
            binary
            @update:model-value="handleUpdateSignOrder"
          ></Checkbox>
        </div>
      </div>
    </div>
    <div class="relative">
      <div
        v-if="!signerList?.length"
        class="flex h-full min-h-[200px] w-full items-center justify-center bg-white"
      >
        <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
        <span class="text-lg font-medium text-gray-400">Không có nhân sự</span>
      </div>
      <div v-else class="relative h-[400px] min-h-[200px] overflow-auto">
        <div
          :class="`mb-1 flex h-10 cursor-pointer items-center gap-1 bg-white px-4 py-2 font-semibold shadow-[0px_12px_24px_-4px_#919EAB33]`"
          v-for="(signer, idx) in signerList"
          :key="idx"
        >
          <div class="flex flex-1 items-center gap-2 truncate">
            <span
              @click="emits('staff-removed', signer)"
              class="icon-[streamline--recycle-bin-2-remix] shrink-0 text-red-500"
            ></span>
            <div class="w-full truncate">{{ signer?.staff?.displayName }}</div>
          </div>
          <div class="flex h-auto shrink-0 items-center justify-center">
            <AppNumberInput
              class="w-6"
              inputClass="text-center p-0! h-6! w-6!"
              inputContainerClass="h-6 w-6"
              :name="`signOrder_${signer?.staff?.positionId}`"
              :min="1"
              :max="maxOrder"
              :disabled="isUnOrder"
              :allow-empty="true"
              :invalid="signer.index === null"
              @change="
                (value) => {
                  if (value === null) signer.index = 1
                  else signer.index = value
                  const normalizedValues = remapAccendingSequentialIndexes(signerList, 'index')
                  signerList = normalizedValues
                }
              "
              :model-value="signer?.index"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
