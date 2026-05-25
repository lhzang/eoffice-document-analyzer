<script setup lang="ts">
import { router } from '@/router'
import AppTabs from '@/shared/components/AppTabs.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { commonReferenceTabs } from '@/shared/constants/document'
import type { TAppTab } from '@/shared/models/common'
import type { AppFile, FilesBySource } from '@/shared/models/document'
import Button from 'primevue/button'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { Tippy } from 'vue-tippy'
import UploadFromDevice from './UploadFromDevice.vue'
import UploadFromDoc from './UploadFromDoc.vue'
import UploadFromTask from './UploadFromTask.vue'

type ModalType = InstanceType<typeof AppModal>

type TProps = {
  tabList?: TAppTab[]
  disabled?: boolean
  label?: string
  defaultFiles?: FilesBySource
}
let initialized = false

const { tabList = commonReferenceTabs, defaultFiles, disabled = false } = defineProps<TProps>()

const emit = defineEmits<{
  confirm: [FilesBySource]
}>()

const modalRef = useTemplateRef<ModalType | null>('modalRef')
const selectTab = ref<string>(tabList?.[0]?.value)

const selectedFiles = defineModel<FilesBySource>({
  default: { fromDoc: [], fromTask: [], upload: [] }
})
const draftFiles = ref<FilesBySource>({ fromDoc: [], fromTask: [], upload: [] })

const isConfirmed = ref(false)
const isVisible = ref(false)

const previewFiles = computed<AppFile[]>(() => [
  ...draftFiles.value.fromDoc,
  ...draftFiles.value.fromTask,
  ...draftFiles.value.upload
])

function removeFromDoc(id: string) {
  draftFiles.value.fromDoc = draftFiles.value.fromDoc.filter((f) => f.id !== id)
}

function removeFromTask(id: string) {
  draftFiles.value.fromTask = draftFiles.value.fromTask.filter((f) => f.id !== id)
}

function removeUpload(file: File) {
  draftFiles.value.upload = draftFiles.value.upload.filter(
    (f) => !(f.file.name === file.name && f.file.size === file.size)
  )
}

function confirmSelection() {
  isConfirmed.value = true
  selectedFiles.value = { ...draftFiles.value }
  emit('confirm', {
    fromDoc: [...draftFiles.value.fromDoc],
    fromTask: [...draftFiles.value.fromTask],
    upload: [...draftFiles.value.upload]
  })
  isVisible.value = false
}

function cancelSelection() {
  isVisible.value = false
}

function handleVisibleChange(v: boolean) {
  if (!v) {
    router.replace({
      query: {}
    })
    isConfirmed.value = false
  }
}

const openModal = () => {
  isConfirmed.value = false
  draftFiles.value = { ...selectedFiles.value }
  isVisible.value = true
}

const handleOpenModalSelectReferenceFile = () => {
  if (disabled) return
  openModal()
}

watch(
  () => defaultFiles,
  (newVal) => {
    if (
      !initialized &&
      newVal
      // && (selectedFiles.value == null || selectedFiles.value === undefined)
    ) {
      selectedFiles.value = newVal
      initialized = true
    }
  },
  { immediate: true }
)

defineExpose({
  openModal,
  closeModal: () => {
    isVisible.value = false
  }
})
</script>

<template>
  <slot name="triggerElement" @click="handleOpenModalSelectReferenceFile">
    <div class="text-primary" @click="handleOpenModalSelectReferenceFile">
      <label class="block font-semibold">Đính kèm file (nếu có)</label>
      <div
        class="relative w-full cursor-pointer rounded-md border border-solid border-[var(--p-inputtext-border-color)] bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-placeholder-color)] shadow-[var(--p-inputtext-shadow)] transition-colors duration-200 hover:border-[var(--p-inputtext-hover-border-color)]"
        :style="{
          minHeight: 'var(--p-form-field-height)',
          paddingBlock: 'var(--p-inputtext-padding-y)',
          paddingInline: 'var(--p-form-field-padding-x)'
        }"
        tabindex="0"
      >
        Chọn file ({{
          selectedFiles?.fromDoc?.length +
          selectedFiles?.fromTask?.length +
          selectedFiles?.upload?.length
        }}
        tệp)
      </div>
    </div>
  </slot>

  <AppModal
    :wrapper-style="{ width: '90%', margin: '0 3rem' }"
    ref="modalRef"
    v-model:visible="isVisible"
    @update:visible="handleVisibleChange"
    title="Chọn file căn cứ"
  >
    <div class="grid grid-cols-6 gap-4">
      <div class="border-primary col-span-4 border-r">
        <AppTabs
          :tab-list="tabList"
          v-model="selectTab"
          class="flex flex-1 items-center justify-center"
        />
        <div class="flex items-center justify-center">
          <UploadFromDoc
            v-if="selectTab === 'fromDoc'"
            :files="draftFiles.fromDoc"
            @update:files="
              (val) => {
                console.log(val, 'sdfaaaaaaaaaaaaaaaaa')
                draftFiles.fromDoc = val
              }
            "
          />
          <UploadFromTask
            v-if="selectTab === 'fromTask'"
            :files="draftFiles.fromTask"
            @update:files="(val) => (draftFiles.fromTask = val)"
          />
          <UploadFromDevice
            v-if="selectTab === 'upload'"
            :files="draftFiles.upload"
            @update:files="(val) => (draftFiles.upload = val)"
          />
        </div>
      </div>
      <div class="col-span-2">
        <div class="text-primary font-semibold">Văn bản/Công việc đã chọn</div>
        <div
          v-for="(item, index) in previewFiles"
          :key="index"
          class="card mt-2 flex w-full items-center justify-between gap-5 rounded-md! py-1.5!"
        >
          <div class="w-full flex-1 truncate">
            <Tippy v-if="item.type === 'upload'" :content="item.file.name">
              <div class="w-full truncate">{{ item.file.name }}</div>
            </Tippy>
            <Tippy v-else :content="item.name">
              <div class="w-full truncate">{{ item.name }}</div>
            </Tippy>
          </div>
          <i
            v-if="item.type === 'fromDoc'"
            class="icon-[streamline-ultimate--bin-1] text-primary cursor-pointer text-base font-semibold"
            @click="removeFromDoc(item.id)"
          />
          <i
            v-else-if="item.type === 'fromTask'"
            class="icon-[streamline-ultimate--bin-1] text-primary cursor-pointer text-base font-semibold"
            @click="removeFromTask(item.id)"
          />
          <i
            v-else
            class="icon-[streamline-ultimate--bin-1] text-primary cursor-pointer text-base font-semibold"
            @click="removeUpload(item.file)"
          />
        </div>
      </div>
    </div>

    <slot name="footer">
      <div class="mt-4 flex w-full justify-end gap-4">
        <Button label="Hủy bỏ" type="button" @click="cancelSelection" />
        <Button label="Xác nhận" type="button" @click="confirmSelection" />
      </div>
    </slot>
  </AppModal>
</template>
