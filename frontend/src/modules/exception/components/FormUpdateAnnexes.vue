<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import { APP_TEXTAREA_LARGE_ROW } from '@/shared/constants/common'
import type { DetailDocumentVM } from '@/shared/services/api'
import { getFileName } from '@/shared/utils/common'
import { ref, watch } from 'vue'

const props = defineProps<{
  detailOutDoc?: DetailDocumentVM
  selectedDoc?: string
}>()

const emit = defineEmits<{
  (e: 'removeAnnexes', list: string[]): void
}>()

const removeAnnexes = ref<string[]>([])
const annexeFiles = ref<File[]>([])

const handleRemoveFile = (file: string) => {
  if (!removeAnnexes.value.includes(file)) {
    removeAnnexes.value.push(file)
    emit('removeAnnexes', removeAnnexes.value)
  }
}

watch([() => props.detailOutDoc?.id, () => props.selectedDoc], () => {
  annexeFiles.value = []
})
</script>

<template>
  <div class="mt-6 flex gap-3" v-if="props.detailOutDoc">
    <span class="text-primary font-semibold whitespace-nowrap"
      >Danh sách files đính kèm trong văn bản:</span
    >
    <AppFileInput
      name="addAnnexes"
      :multiple="true"
      class=""
      :show-file-list="false"
      v-model="annexeFiles"
    >
      <template #trigger-element="{ triggerFunction }">
        <span
          class="icon-[zondicons--add-solid] text-primary cursor-pointer text-2xl"
          @click="triggerFunction"
        ></span>
      </template>
    </AppFileInput>
  </div>
  <div class="ml-76">
    <div v-if="props.detailOutDoc">
      <template
        v-if="
          (props.detailOutDoc?.documentFiles.annexes ?? []).filter(
            (f) => !removeAnnexes.includes(f)
          ).length > 0
        "
      >
        <div
          v-for="(file, index) in (props.detailOutDoc?.documentFiles.annexes ?? []).filter(
            (f) => !removeAnnexes.includes(f)
          )"
          :key="index"
        >
          {{ index + 1 }}. {{ getFileName(file) }}
          <span
            class="icon-[streamline--recycle-bin-2-remix] text-primary ml-3 cursor-pointer"
            @click="handleRemoveFile(file)"
          ></span>
        </div>
      </template>
      <div v-for="(file, index) in annexeFiles" :key="file.name + index" class="">
        {{ index + 1 + (props.detailOutDoc?.documentFiles.annexes ?? []).length }} .
        {{ file.name }}
        <span
          class="icon-[streamline--recycle-bin-2-remix] text-primary ml-3 cursor-pointer"
          @click="annexeFiles.splice(index, 1)"
        />
      </div>
      <template
        v-if="
          annexeFiles.length === 0 && (props.detailOutDoc?.documentFiles.annexes ?? []).length === 0
        "
      >
        <div class="text-gray-500 italic">Không có file đính kèm</div>
      </template>
    </div>
  </div>

  <AppTextarea
    class="col-span-2 mt-4"
    name="reason"
    label="Lý do cập nhật"
    required
    :rows="APP_TEXTAREA_LARGE_ROW"
    :limitNumber="250"
    :placeholder="`Nhập lý do cập nhật`"
  />

  <div class="mt-2 flex items-center gap-4">
    <span class="text-primary w-75 font-semibold whitespace-nowrap"
      >File căn cứ, yêu cầu chỉnh sửa:
    </span>
    <span class="w-80">
      <AppFileInput name="relatedFile" :multiple="false" class="mt-4" />
    </span>
  </div>
</template>
