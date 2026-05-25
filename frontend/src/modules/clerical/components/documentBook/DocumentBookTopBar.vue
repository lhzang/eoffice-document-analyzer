<script setup lang="ts">
import AppTabs from '@/shared/components/AppTabs.vue'
import type { TAppTab } from '@/shared/models/common'
import { Button, IconField, InputIcon, InputText } from 'primevue'
import { useTemplateRef } from 'vue'
import AddNewDocumentBookModal from './AddNewDocumentBookModal.vue'

type TModalAddBook = InstanceType<typeof AddNewDocumentBookModal>

type TProps = {
  tabList: TAppTab[]
}

const { tabList } = defineProps<TProps>()

const modalAddNewRef = useTemplateRef<TModalAddBook | null>('modalAddNewRef')

const modelTab = defineModel<string>('model-tab', { required: true })
const modelSearch = defineModel<string>('model-search', { required: true })
</script>
<template>
  <div class="flex items-center justify-between gap-4">
    <AppTabs :tab-list="tabList" v-model="modelTab" />
    <div class="flex items-center justify-between gap-2">
      <IconField class="flex h-[40px] w-[300px] items-center justify-center">
        <InputIcon class="mt-0! h-[20px]! w-[20px]! -translate-y-1/2">
          <span
            class="custom-input--icon__search text-[20px] text-gray-500"
            :class="'icon-[line-md--search]'"
          />
        </InputIcon>
        <InputText
          class="h-full flex-1"
          placeholder="Tìm kiếm theo tên sổ văn bản"
          size="small"
          v-model="modelSearch"
        />
        <InputIcon v-if="modelSearch" class="pi pi-search" />
      </IconField>
      <Button
        class="h-[40px]"
        label="Thêm mới"
        variant="contained"
        @click="modalAddNewRef?.openModal()"
      />
    </div>
  </div>
  <AddNewDocumentBookModal ref="modalAddNewRef" />
</template>
