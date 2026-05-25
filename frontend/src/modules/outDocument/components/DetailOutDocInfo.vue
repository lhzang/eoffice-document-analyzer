<script setup lang="ts">
import PriorityLevelComponent from '@/modules/indoc/components/PriorityLevelComponent.vue'
import AppLongText from '@/shared/components/AppLongText.vue'
import DumbFilePreviewLabel from '@/shared/components/DumbFilePreviewLabel.vue'
import ModalPreviewFile from '@/shared/components/ModalPreviewFile.vue'
import AppReferenceFile from '@/shared/components/modals/reference-file-modal/AppReferenceFile.vue'
import OutDocDestinationInfo from '@/shared/components/outDoc/OutDocDestinationInfo.vue'
import { ROUTE_PATHS } from '@/shared/constants/router'
import type { FilesBySource } from '@/shared/models/document'
import { OUT_DOC_STATUS_VALUES } from '@/shared/models/outDoc/document'
import type {
  DetailDocumentVM,
  InDocumentFileVM,
  OutDocumentFileVM,
  RelatedFileRequestTypeEnum,
  UploadedFileVM,
  WorkFileVM
} from '@/shared/services/api'
import { toastSucceed } from '@/shared/utils/common'
import { mappingRelatedFromDocType } from '@/shared/utils/document'
import { transformDocDestinationsIntoTreeInput } from '@/shared/utils/outDoc/destination'
import { DateTime } from 'luxon'
import { Button } from 'primevue'
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAddDestinations } from '../composables/queries/useAddDestinations'
import { useAddRelatedDocs } from '../composables/queries/useAddRelatedDocs'
import SelectDestination from './SelectDestination.vue'

type TPreviewModalRef = InstanceType<typeof ModalPreviewFile>

type TProps = {
  detailDocument: DetailDocumentVM
}

const emit = defineEmits<{
  (e: 'addedDestinations'): void
  (e: 'addedRelatedFiles'): void
}>()
const router = useRouter()

const relatedTasks = computed(() => {
  return Array.from(detailDocument?.documentFiles?.relatedFiles?.values())?.filter(
    (file) => file?.type === 'WORK'
  ) as WorkFileVM[]
})
const relatedUploads = computed(() => {
  return Array.from(detailDocument?.documentFiles?.relatedFiles?.values())?.filter(
    (file) => file?.type === 'UPLOADED'
  ) as UploadedFileVM[]
})
const relatedDocs = computed(() => {
  return Array.from(detailDocument?.documentFiles?.relatedFiles?.values())?.filter(
    (file) => file?.type === 'INDOC' || file?.type === 'OUTDOC' || file?.type === 'INTERNAL_DOC'
  ) as InDocumentFileVM[] | OutDocumentFileVM[]
})

const { mutate: addDestinations, isPending: isAddingDestinations } = useAddDestinations({
  onSuccess: () => {
    toastSucceed({
      detail: 'Bổ sung nơi nhận thành công'
    })
    emit('addedDestinations')
  }
})
const { mutate: addRelatedDocs, isPending: isAddingRelatedDocs } = useAddRelatedDocs({
  onSuccess: () => {
    toastSucceed({
      detail: 'Bổ sung file căn cứ thành công'
    })
    emit('addedRelatedFiles')
  }
})

const previewModalRef = ref<TPreviewModalRef | null>(null)
const { detailDocument } = defineProps<TProps>()

const handleAddRelatedFiles = (values: FilesBySource) => {
  const uploadFiles = (values?.upload ?? [])?.map((file) => file?.file)
  const uploadFromSystem = [
    ...(values?.fromDoc ?? [])?.map((relatedDoc) => ({
      relatedId: relatedDoc?.id,
      type: mappingRelatedFromDocType(relatedDoc?.docType)
    })),
    ...(values?.fromDoc ?? [])?.map((relatedDoc) => ({
      relatedId: relatedDoc?.id,
      type: 'WORK_FILE' as RelatedFileRequestTypeEnum
    }))
  ]
  addRelatedDocs({
    docId: detailDocument?.id,
    relatedDocs: {
      relatedFileRequests: uploadFromSystem,
      relatedUploadFiles: uploadFiles
    }
  })
}
watchEffect(() => {
  console.log(
    'detailDocument?.documentFiles?.relatedFiles',
    detailDocument?.documentFiles?.relatedFiles,
    detailDocument?.documentFiles?.relatedFiles?.size
  )
})
</script>
<template>
  <div>
    <div
      class="[&>*]:flex [&>*]:justify-between [&>*]:gap-4 [&>*]:px-4 [&>*]:py-2 [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-[#DFE5EF] [&>*>:first-child]:shrink-0"
    >
      <div v-if="detailDocument?.documentStatus === OUT_DOC_STATUS_VALUES.completed">
        <div class="font-semibold">Số ký hiệu</div>
        <div>{{ detailDocument?.documentCode ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Trích yếu</div>
        <div>{{ detailDocument?.subject ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Ghi chú</div>
        <div>{{ detailDocument?.description ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Người trình</div>
        <div>{{ detailDocument?.creator?.name ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Ngày tạo</div>
        <div>
          {{
            detailDocument?.createdAt
              ? DateTime.fromISO(detailDocument?.createdAt)?.toFormat('dd-MM-yyyy')
              : '--'
          }}
        </div>
      </div>
      <div>
        <div class="font-semibold">Lãnh đạo ký ban hành</div>
        <div>{{ detailDocument?.majorSignerLeader?.name ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Đơn vị ban hành</div>
        <div>{{ detailDocument?.issueUnit?.name ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Hạn trả lời</div>
        <div>
          {{
            detailDocument?.dueDate
              ? DateTime.fromISO(detailDocument?.dueDate)?.toFormat('dd-MM-yyyy')
              : '--'
          }}
        </div>
      </div>
      <div>
        <div class="font-semibold">Độ khẩn</div>
        <div>
          <template v-if="!detailDocument?.priority"> -- </template>
          <PriorityLevelComponent
            v-else
            :priority="detailDocument?.priority"
            :exclude-priorities="[]"
          />
        </div>
      </div>
      <div>
        <div class="font-semibold">File văn bản</div>
        <div class="max-h-[200px] truncate overflow-auto">
          <template v-if="!detailDocument?.documentFiles?.lastestSignedFile"> -- </template>
          <DumbFilePreviewLabel
            v-else
            :relative-url="detailDocument?.documentFiles?.lastestSignedFile"
            @show-preview="(url, name) => previewModalRef?.openModal(url, name)"
          />
        </div>
      </div>
      <div>
        <div class="font-semibold">File phụ lục</div>
        <div class="max-h-[200px] truncate overflow-auto">
          <template v-if="!detailDocument?.documentFiles?.annexes?.length"> -- </template>
          <template v-else>
            <DumbFilePreviewLabel
              v-for="(file, idx) in detailDocument?.documentFiles?.annexes"
              :key="idx"
              :relative-url="file"
              @show-preview="(url, name) => previewModalRef?.openModal(url, name)"
            />
          </template>
        </div>
      </div>
      <div>
        <div class="font-semibold">File căn cứ</div>
        <div class="max-h-[200px] truncate overflow-auto">
          <template v-if="!detailDocument?.documentFiles?.relatedFiles?.length"> -- </template>
          <AppReferenceFile
            v-if="detailDocument?.canAddRelatedFiles"
            :disabled="isAddingRelatedDocs"
            @confirm="handleAddRelatedFiles"
          >
            <template #triggerElement="{ onClick }">
              <div class="flex w-full justify-end">
                <Button @click="onClick" variant="outlined" severity="secondary"
                  >Bổ sung file căn cứ</Button
                >
              </div>
            </template>
          </AppReferenceFile>
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
      <div>
        <div class="font-semibold">Nội dung căn cứ</div>
        <div>{{ detailDocument?.relatedContent ?? '--' }}</div>
      </div>
      <div>
        <div class="font-semibold">Nơi nhận nội bộ</div>
        <OutDocDestinationInfo
          :documentId="detailDocument?.id"
          :destinationList="detailDocument?.destinations"
          :type="'internal'"
        />
      </div>
      <div>
        <div class="font-semibold">Nơi nhận bên ngoài</div>
        <OutDocDestinationInfo
          :documentId="detailDocument?.id"
          :destinationList="detailDocument?.destinations"
          :type="'external'"
        />
      </div>
      <div>
        <div class="font-semibold">Bổ sung nơi nhận</div>
        <SelectDestination
          v-if="detailDocument?.canAddDestinations"
          :unitId="detailDocument?.issueUnit?.id"
          :readOnlySelectedDestinations="
            transformDocDestinationsIntoTreeInput(detailDocument?.destinations)
          "
          :disabled="isAddingDestinations"
          @submit="
            (values) =>
              addDestinations({
                docId: detailDocument?.id,
                destinations: [...values?.values()]?.map((destination) => ({
                  type: destination?.type,
                  systemType: destination?.systemType,
                  role: destination?.formName,
                  destinationId: destination?.id
                }))
              })
          "
        >
          <template #triggerElement="{ onClick }">
            <Button class="rouned-full" @click="onClick"> Bổ sung </Button>
          </template>
        </SelectDestination>
        <div v-else>--</div>
      </div>
    </div>
    <ModalPreviewFile ref="previewModalRef" />
  </div>
</template>
