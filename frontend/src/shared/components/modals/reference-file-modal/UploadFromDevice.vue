<script setup lang="ts">
import type { TDeviceFiles } from '@/shared/models/document'
import { uniqBy } from 'lodash-es'
import AppFileInput from '../../form-elements/AppFileInput.vue'

type TProps = {
  files: TDeviceFiles[]
}

const { files } = defineProps<TProps>()

const emit = defineEmits<{
  (e: 'update:files', value: TDeviceFiles[]): void
}>()

function toAppFiles(selected: File[] | File): TDeviceFiles[] {
  const arr = Array.isArray(selected) ? selected : [selected]
  return arr.map((file) => ({ type: 'upload', file }))
}

function handleUpload(selected: File[] | null) {
  if (!selected) return
  emit(
    'update:files',
    uniqBy(
      [...(files ?? []), ...toAppFiles(selected)],
      (refFile) => `${refFile?.file.name}-${refFile?.file?.size}`
    )
  )
}
</script>

<template>
  <AppFileInput
    name="signature"
    placeholder="Tải file căn cứ lên..."
    multipleFileSelectMode="append"
    :multiple="true"
    @change="handleUpload"
    :showFileList="false"
  >
    <template #trigger-element="{ triggerFunction }">
      <div class="p-5">
        <div
          class="card mt-5 flex h-50 w-full cursor-pointer flex-col items-center justify-center rounded-sm bg-white text-xl font-semibold text-[#9DA2AE]"
          @click="triggerFunction"
        >
          <span class="icon-[icon-park-outline--upload-logs] text-5xl"></span>
          Tải file căn cứ
        </div>
      </div>
    </template>
  </AppFileInput>
</template>
