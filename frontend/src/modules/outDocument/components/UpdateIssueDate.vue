<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import ModalWaitAcceptSign from '@/shared/components/modals/ModalWaitAcceptSign.vue'
import OutDocAllocateDestinationInfo from '@/shared/components/outDoc/OutDocAllocateDestinationInfo.vue'
import { RECEIVER_SYSTEM_TYPES, URGENCY_LEVEL_LABELS } from '@/shared/constants/document'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text.ts'
import { OUT_DOCUMENT_TYPES } from '@/shared/models/outDoc/document.ts'
import type { DetailDocumentVM, SigningConfigVM } from '@/shared/services/api/index.ts'
import { toastSucceed } from '@/shared/utils/common'
import { transformDocDestinationsIntoTreeInput } from '@/shared/utils/outDoc/destination.ts'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { Divider } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import z from 'zod'
import { useUpdateIssueDate } from '../composables/queries/useUpdateIssueDate.ts'
import ModalPreviewIssueDoc from './modals/ModalPreviewIssueDoc.vue'

type TProps = {
  detailDocument: DetailDocumentVM
}
type TModalPreviewDoc = InstanceType<typeof ModalPreviewIssueDoc>
type TModalWaitAcceptSign = InstanceType<typeof ModalWaitAcceptSign>

const emit = defineEmits<{
  (e: 'updatedDoc'): void
}>()

const { detailDocument } = defineProps<TProps>()

const destinations = computed(() =>
  transformDocDestinationsIntoTreeInput(detailDocument?.destinations)
)

const previewModalDoc = ref<TModalPreviewDoc | null>(null)
const selectedProvider = ref<SigningConfigVM | null>(null)
const modalWaitAcceptSign = ref<TModalWaitAcceptSign | null>(null)

const { mutate: updateIssueDate } = useUpdateIssueDate({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật ngày ban hành thành công'
    })
    emit('updatedDoc')
  },
  onSettled: () => {
    modalWaitAcceptSign?.value?.closeModal()
  }
})

const schema = z.object({
  issueDate: z.date({ error: MSG_PLEASE_SELECT })
})

const { handleSubmit, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    issueDate: new Date()
  }
})

const handleTriggerSubmitAllocate = (provider: SigningConfigVM) => {
  selectedProvider.value = provider
  handleSubmit(() => {
    previewModalDoc?.value?.openModal(provider?.signingProvider)
  })()
}

const handleUpdateIssueDate = () => {
  if (selectedProvider?.value || selectedProvider?.value?.signingProvider) {
    modalWaitAcceptSign?.value?.openModal(selectedProvider?.value)
    updateIssueDate({
      docId: detailDocument?.id,
      updatePayload: {
        signingProvider: selectedProvider?.value?.signingProvider,
        issuedDate: DateTime.fromJSDate(values?.issueDate!).toISODate()!
      }
    })
  }
}

defineExpose({
  triggerSubmit: handleTriggerSubmitAllocate
})
</script>
<template>
  <div class="px-4 py-2">
    <form>
      <div class="grid grid-cols-2 gap-4">
        <AppTextInput
          name="type"
          label="Kiểu văn bản"
          disabled
          class="col-span-2"
          :model-value="
            detailDocument?.outDocType === OUT_DOCUMENT_TYPES.paper
              ? 'Văn bản đi ký giấy'
              : 'Văn bản đi ký số'
          "
        />
        <AppTextInput
          name="stamp"
          label="Đóng dấu"
          disabled
          :model-value="detailDocument?.outDocType === OUT_DOCUMENT_TYPES.paper ? 'Có' : 'Không'"
        />
        <AppTextInput
          name="priority"
          label="Độ khẩn"
          disabled
          :model-value="URGENCY_LEVEL_LABELS?.[detailDocument?.priority]"
        />
        <AppTextInput name="book" label="Sổ văn bản" disabled :model-value="''" />
        <AppTextInput
          name="type"
          label="Loại văn bản"
          disabled
          :model-value="detailDocument?.documentType"
        />
        <AppTextInput
          name="number"
          label="Số văn bản"
          disabled
          :model-value="
            detailDocument?.haveNumber
              ? detailDocument?.documentCode?.split('/')?.[0]
              : detailDocument?.documentCode?.split('-')?.[2]
          "
        />
        <AppTextInput
          name="code"
          label="Số và ký hiệu văn bản"
          disabled
          :model-value="detailDocument?.documentCode"
        />
        <AppDateInput
          name="createDate"
          label="Ngày tạo"
          :clearable="false"
          disabled
          :append-to="'body'"
          :date-format="'dd/mm/yy'"
          auto-z-index
          :model-value="detailDocument?.createdAt ? new Date(detailDocument?.createdAt) : null"
        ></AppDateInput>
        <AppDateInput
          name="issueDate"
          label="Ngày ban hành"
          :clearable="false"
          required
          :append-to="'body'"
          :date-format="'dd/mm/yy'"
          auto-z-index
        ></AppDateInput>
        <AppTextarea
          name="subject"
          label="Trích yếu nội dung"
          required
          :limit-number="250"
          disabled
          :model-value="detailDocument?.subject"
          placeholder="Nhập trích yếu nội dung..."
          class="col-span-2"
        />
        <AppTextarea
          name="description"
          placeholder="Nhập ghi chú..."
          label="Ghi chú"
          disabled
          :model-value="detailDocument?.description"
          :limit-number="250"
          class="col-span-2"
        />
        <AppTextInput name="majorSigner" label="Lãnh đạo ban hành" disabled class="col-span-2" />
        <div class="col-span-2">
          <div class="flex items-center gap-2">
            <label class="text-primary font-semibold">Nơi nhận</label>
          </div>
          <div class="border-primary mt-4 min-h-40 rounded-sm border">
            <div v-if="destinations?.size">
              <div
                v-if="
                  [...(destinations?.values() ?? [])]?.filter(
                    (destination) => destination?.systemType === RECEIVER_SYSTEM_TYPES.internal
                  )?.length
                "
                class="flex items-start justify-between gap-4 p-4"
              >
                <span class="text-primary font-semibold">Trong tổ chức</span>
                <OutDocAllocateDestinationInfo
                  :destinationList="[...(destinations.values() ?? [])]"
                  :type="'internal'"
                />
              </div>
              <Divider class="m-0! p-0!" />
              <div
                v-if="
                  [...(destinations?.values() ?? [])]?.filter(
                    (destination) => destination?.systemType === RECEIVER_SYSTEM_TYPES.external
                  )?.length
                "
                class="flex items-start justify-between gap-4 p-4"
              >
                <span class="text-primary font-semibold">Ngoài tổ chức</span>
                <OutDocAllocateDestinationInfo
                  :destinationList="[...(destinations.values() ?? [])]"
                  :type="'external'"
                />
              </div>
            </div>
            <div
              v-else
              class="text-primary flex h-40 w-full items-center justify-center font-semibold"
            >
              Chưa có nơi nhận
            </div>
          </div>
        </div>
      </div>
    </form>
    <ModalPreviewIssueDoc
      v-if="detailDocument && values?.issueDate"
      ref="previewModalDoc"
      :fileName="detailDocument?.documentFiles?.mainFile?.split('/')?.[0] ?? 'file_van_ban.pdf'"
      :documentId="detailDocument?.id"
      :destinations="[...(destinations.values() ?? [])]"
      :outOrdinal="
        Number(
          detailDocument?.haveNumber
            ? detailDocument?.documentCode?.split('/')?.[0]
            : detailDocument?.documentCode?.split('-')?.[2]
        )
      "
      :documentCode="detailDocument?.documentCode"
      :issueDate="DateTime.fromJSDate(values?.issueDate).toISODate()!"
      @confirmRegister="handleUpdateIssueDate"
    />
    <ModalWaitAcceptSign ref="modalWaitAcceptSign" />
  </div>
</template>
