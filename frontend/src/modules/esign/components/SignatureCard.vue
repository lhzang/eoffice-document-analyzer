<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import { Divider, Tag, ToggleSwitch } from 'primevue'
import { computed, ref, watch } from 'vue'
import { useSignatureAIPreProcess } from '../composables/esign-image/useSignatureAIPreProcess'
import type { SignatureItem, TSignatureImageData } from '../model/signatureimg'
import { getLabelByState, getSeverityByState } from '../utils/signatureImage'

const props = defineProps<{
  label: string
  type: 'major' | 'minor'
  savedImage?: SignatureItem
  isLoading: boolean
  isGetImagesSucess: boolean
}>()

const modelValue = defineModel<TSignatureImageData>()
const isUseAi = ref(false)
const imageLoaded = ref(false)

const { mutate: processImage, isPending: isProcessingImg } = useSignatureAIPreProcess({
  onSuccess: (buffer) => {
    const processedFile = new File([buffer], `file_${Date.now()}`, { type: 'image/png' })
    const blob = new Blob([buffer], { type: 'image/png' })
    const imageUrl = URL.createObjectURL(blob)
    modelValue.value = { url: imageUrl, file: processedFile }
  }
})

const severity = computed(() => {
  if (props.savedImage?.state) return getSeverityByState(props.savedImage?.state)
  return undefined
})

const displayState = computed(() => {
  if (props.savedImage?.state) return getLabelByState(props.savedImage?.state)
  return undefined
})

const handleFileChange = (file: File | null) => {
  if (!file) return
  if (isUseAi.value) {
    processImage({ file })
  } else {
    modelValue.value = {
      url: URL.createObjectURL(file),
      file
    }
  }
}
watch(
  () => props.isGetImagesSucess,
  () => {
    if (props.isGetImagesSucess === true) isUseAi.value = false
  }
)
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 text-gray-800">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
      <p class="text-primary text-base font-semibold">{{ label }}</p>
      <div class="flex items-center justify-between gap-[15px]">
        <template v-if="props.savedImage">
          <Tag :severity :value="displayState" rounded />
        </template>
      </div>
    </div>
    <Divider />

    <div class="mt-4">
      <div v-if="isLoading" class="flex h-[200px] items-center justify-center">
        <span
          class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-2xl"
        ></span>
      </div>

      <div v-else>
        <div class="mt-2 mb-4 flex flex-wrap items-center justify-between gap-3 sm:gap-8">
          <span class="text-sm sm:text-base">Sử dụng AI để làm đẹp ảnh?</span>
          <ToggleSwitch v-model="isUseAi" class="origin-left scale-80 sm:scale-100" />
        </div>

        <div class="flex w-full justify-start">
          <AppFileInput
            name="signature"
            placeholder="Tải ảnh chữ ký..."
            accept="image/*"
            :multiple="false"
            @change="handleFileChange"
          >
            <template #trigger-element="{ triggerFunction }">
              <button
                type="button"
                @click="triggerFunction"
                class="bg-primary hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-white transition"
              >
                <span class="icon-[icon-park-outline--upload-logs] text-xl"></span>
                <span class="font-semibold">Tải</span>
              </button>
            </template>
          </AppFileInput>
        </div>
        <div class="flex justify-between">
          <div class="flex h-[150px] w-full items-center justify-center overflow-hidden">
            <span
              v-if="isProcessingImg"
              class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-2xl"
            ></span>
            <img
              v-else
              @load="imageLoaded = true"
              class="h-full w-full object-contain"
              :src="modelValue?.url"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
