<script setup lang="ts">
import { DateTime } from 'luxon'

import AppLongText from '@/shared/components/AppLongText.vue'
import DumbFilePreviewLabel from '@/shared/components/DumbFilePreviewLabel.vue'
import ModalPreviewFile from '@/shared/components/ModalPreviewFile.vue'
import { ROUTE_PATHS } from '@/shared/constants/router'
import type {
  DetailInDocumentVM,
  InDocumentFileVM,
  OutDocumentFileVM,
  UploadedFileVM,
  WorkFileVM
} from '@/shared/services/api'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PriorityLevelComponent from './PriorityLevelComponent.vue'
const router = useRouter()

const props = defineProps<{
  documentDetail: DetailInDocumentVM
}>()

type TPreviewModalRef = InstanceType<typeof ModalPreviewFile>

const previewModalRef = ref<TPreviewModalRef | null>(null)
const relatedTasks = computed(() => {
  return Array.from(documentDetail?.relatedFiles?.values() ?? [])?.filter(
    (file) => file?.type === 'WORK'
  ) as WorkFileVM[]
})
const relatedUploads = computed(() => {
  return Array.from(documentDetail?.relatedFiles?.values() ?? [])?.filter(
    (file) => file?.type === 'UPLOADED'
  ) as UploadedFileVM[]
})
const relatedDocs = computed(() => {
  return Array.from(documentDetail?.relatedFiles?.values() ?? [])?.filter(
    (file) => file?.type === 'INDOC' || file?.type === 'OUTDOC' || file?.type === 'INTERNAL_DOC'
  ) as InDocumentFileVM[] | OutDocumentFileVM[]
})
const { documentDetail } = props
</script>
<template>
  <div>
    <div
      class="[&>*]:flex [&>*]:justify-between [&>*]:gap-4 [&>*]:px-4 [&>*]:py-2 [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-[#DFE5EF]"
    >
      <div v-if="documentDetail?.sourceInfo?.type === 'OUTDOC'">
        <div class="font-semibold">Sổ văn bản</div>
        <div>{{ documentDetail?.documentBookName ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Số ký hiệu</div>
        <div>{{ documentDetail?.documentCode ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Trích yếu</div>
        <div>{{ documentDetail?.subject ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Ghi chú</div>
        <div>{{ documentDetail?.description ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Đơn vị ban hành</div>
        <div>{{ documentDetail?.issuedUnit ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Tên người ký</div>
        <div>{{ documentDetail?.signerName || '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Vị trí người ký</div>
        <div>{{ documentDetail?.signerPosition || '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Ngày ban hành</div>
        <div>
          {{
            documentDetail?.issuedDate
              ? DateTime.fromISO(documentDetail.issuedDate).toFormat('dd/MM/yyyy')
              : '--'
          }}
        </div>
      </div>
      <div>
        <div class="font-semibold">Ngày đến</div>
        <div>
          {{
            documentDetail?.arrivalDate
              ? DateTime.fromISO(documentDetail.arrivalDate).toFormat('dd/MM/yyyy')
              : '--'
          }}
        </div>
      </div>
      <div>
        <div class="font-semibold">Hạn trả lời</div>
        <div>
          {{
            documentDetail?.dueDate
              ? DateTime.fromISO(documentDetail?.dueDate)?.toFormat('dd/MM/yyyy')
              : '--'
          }}
        </div>
      </div>
      <div>
        <div class="font-semibold">Độ khẩn</div>
        <div>
          <template v-if="!documentDetail?.priority"> -- </template>
          <PriorityLevelComponent
            v-else
            :priority="documentDetail?.priority"
            :exclude-priorities="[]"
          />
        </div>
      </div>
      <div>
        <div class="font-semibold">File văn bản</div>
        <div class="max-h-[200px] w-full truncate overflow-auto">
          <template v-if="!documentDetail?.mainFile"> -- </template>
          <DumbFilePreviewLabel
            v-else
            :relative-url="documentDetail?.mainFile"
            @show-preview="(url, name) => previewModalRef?.openModal(url, name)"
          />
        </div>
      </div>
      <div>
        <div class="font-semibold">File phụ lục</div>
        <div class="max-h-[200px] w-full truncate overflow-auto">
          <template v-if="!documentDetail?.annexes?.length"> -- </template>
          <template v-else>
            <DumbFilePreviewLabel
              v-for="(file, idx) in documentDetail?.annexes"
              :key="idx"
              :relative-url="file"
              @show-preview="(url, name) => previewModalRef?.openModal(url, name)"
            />
          </template>
        </div>
      </div>
      <div>
        <div class="font-semibold">File căn cứ</div>
        <div class="max-h-[200px] w-full truncate overflow-auto">
          <DumbFilePreviewLabel
            v-for="(file, idx) in relatedDocs"
            :key="idx"
            :relative-url="file?.mainFiles"
            @show-preview="(url, name) => previewModalRef?.openModal(url, name)"
          />
          <DumbFilePreviewLabel
            v-for="(file, idx) in relatedUploads"
            :key="idx"
            :relative-url="file?.path"
            @show-preview="(url, name) => previewModalRef?.openModal(url, name)"
          />
          <AppLongText
            v-for="(task, idx) in relatedTasks"
            :key="idx"
            class="cursor-pointer text-right"
            :text="task?.title"
            :splice-length="50"
            :is-show-read-more="false"
            @click="router.push(`${ROUTE_PATHS.task.taskDetail}/${task?.workId}`)"
            is-show-tooltips
          />
        </div>
      </div>
      <ModalPreviewFile ref="previewModalRef" />
    </div>
  </div>
</template>
