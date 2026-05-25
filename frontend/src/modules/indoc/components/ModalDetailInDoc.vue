<script setup lang="ts">
import {
  DETAIL_DOCUMENT_TABS,
  type TDetailDocumentTabs
} from '@/modules/indoc/composables/useTabModalDetail'
import AppTabs from '@/shared/components/AppTabs.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { useConvertDocxIntoPdf } from '@/shared/composables/queries/common/useConvertDocxIntoPdf'
import type { TAppTab } from '@/shared/models/common'
import { isDoc } from '@/shared/utils/check'
import { createFileFromUrl, getFileName, getFullFileUrl, toastError } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { Button } from 'primevue'
import { computed, provide, ref, useTemplateRef, watch, watchEffect, type ComputedRef } from 'vue'
import { useGetAvailableActions } from '../composables/queries/useGetAvailableActions'
import { useGetInDocumentDetail } from '../composables/queries/useGetInDocumentDetail'
import { useReadDoc } from '../composables/queries/useReadDoc'
import { INDOC_ACTION, type IndocActionType } from '../constants/availableActions'
import CreationHistory from './CreationHistory.vue'
import DetailInDocTabs from './DetailInDocTabs.vue'
import DetailInfoInDoc from './DetailInfoInDoc.vue'
import DistributeID from './distribute/DistributeID.vue'
import EvaluateDistribute from './distribute/EvaluateDistribute.vue'
import ModalNotiReplaceDoc from './ModalNotiReplaceDoc.vue'
import PriorityLevelComponent from './PriorityLevelComponent.vue'
import ProcessHistory from './ProcessHistory.vue'
import ModalDirect from './processModals/ModalDirect.vue'
import ModalEditDistributeProposal from './processModals/ModalEditDistributeProposal.vue'
import ModalFinishDocument from './processModals/ModalFinishDocument.vue'
import ModalForwardReference from './processModals/ModalForwardReference.vue'
import ModalForwardRole from './processModals/ModalForwardRole.vue'
import ModalRejectUpdateDocument from './processModals/ModalRejectUpdateDocument.vue'
import ModalReportWorkProcess from './processModals/ModalReportWorkProcess.vue'
import ModalReturnAsignedTask from './processModals/ModalReturnAsignedTask.vue'
import ModalReturnDocument from './processModals/ModalReturnDocument.vue'
import ModalRevokeCreatedID from './processModals/ModalRevokeCreatedID.vue'
import ModalRevokePermission from './processModals/ModalRevokePermission.vue'
import ModalSendComment from './processModals/ModalSendComment.vue'
import ModalSkipXroad from './processModals/ModalSkipXroad.vue'
import ReceiveDocFromInternetID from './ReceiveDocFromInternetID.vue'
import UpdateAxisDoc from './UpdateAxisDoc.vue'

type TDetailDocumentTabsRef = InstanceType<typeof DetailInDocTabs>
type TAddDocBookFromInternetRef = InstanceType<typeof ReceiveDocFromInternetID>
type TModalDirectRef = InstanceType<typeof ModalDirect>
type TModalForwardRoleRef = InstanceType<typeof ModalForwardRole>
type TForwardReferenceRef = InstanceType<typeof ModalForwardReference>
type TReportIDRef = InstanceType<typeof ModalReportWorkProcess>
type TFinishDocumentRef = InstanceType<typeof ModalFinishDocument>
type TEditDistributeProposalRef = InstanceType<typeof ModalEditDistributeProposal>
type TRevokeCreatedIDRef = InstanceType<typeof ModalRevokeCreatedID>
type TReturnIDRef = InstanceType<typeof ModalReturnDocument>
type TReturnXroadIDRef = InstanceType<typeof ModalRejectUpdateDocument>
type TSkipXroadRef = InstanceType<typeof ModalSkipXroad>
type TReturnAssignedTask = InstanceType<typeof ModalReturnAsignedTask>
type TModalSendCommentRef = InstanceType<typeof ModalSendComment>
type TModalRevokePermissionRef = InstanceType<typeof ModalRevokePermission>
type TModalNotiReplaced = InstanceType<typeof ModalNotiReplaceDoc>

//tab distribute
type TDistributeTab = InstanceType<typeof DistributeID>
type TEvaluateDistributeTab = InstanceType<typeof EvaluateDistribute>
type TProps = {
  isViewByOM: boolean
}

const isVisible = ref(false)
const documentId = ref<string | null>(null)
const addDocBookButtonRef = ref<HTMLButtonElement | null>(null)
const modalDirectRef = ref<TModalDirectRef | null>(null)
const modalForwardRoleRef = ref<TModalForwardRoleRef | null>(null)
const modalForwardReferenceRef = ref<TForwardReferenceRef | null>(null)
const modalEditDistributeProposalRef = ref<TEditDistributeProposalRef | null>(null)
const modalReportIDRef = ref<TReportIDRef | null>(null)
const modalSkipIDRef = ref<TSkipXroadRef | null>(null)
const modalFinishDocumentRef = ref<TFinishDocumentRef | null>(null)
const modalRevokedCreatedIDRef = ref<TRevokeCreatedIDRef | null>(null)
const modalReturnIDRef = ref<TReturnIDRef | null>(null)
const modalReturnXroadIDRef = ref<TReturnXroadIDRef | null>(null)
const modalReturnAssignedTaskRef = ref<TReturnAssignedTask | null>(null)
const modalSendCommentRef = ref<TModalSendCommentRef | null>(null)
const modalRevokePermissionRef = ref<TModalRevokePermissionRef | null>(null)
const distributePanelRef = ref<TDistributeTab | null>()
const evaluateDistributePanelRef = ref<TEvaluateDistributeTab | null>()
const addDocBookRef = ref<TAddDocBookFromInternetRef | null>()
const modalNotiReplacedDoc = useTemplateRef<TModalNotiReplaced>('modalNotiReplacedDoc')

const abortController = ref<AbortController | null>(null)

const tab = ref<TDetailDocumentTabs>('info')

const props = defineProps<TProps>()

const { isViewByOM = false } = props

const emit = defineEmits<{
  (e: 'docProcessed'): void
}>()

const tabList: ComputedRef<TAppTab<TDetailDocumentTabs>[]> = computed(() => {
  const tabList = [
    {
      label: DETAIL_DOCUMENT_TABS.info,
      value: 'info' as TDetailDocumentTabs
    }
  ]
  if (isViewByOM) {
    return tabList
  } else {
    tabList.push(
      {
        label: DETAIL_DOCUMENT_TABS.createdProcess,
        value: 'createdProcess' as TDetailDocumentTabs
      },
      {
        label: DETAIL_DOCUMENT_TABS.procedure,
        value: 'procedure' as TDetailDocumentTabs
      }
    )
    if (hasAction(INDOC_ACTION.register)) {
      tabList.push({
        label: DETAIL_DOCUMENT_TABS.inputInDoc,
        value: 'inputInDoc' as TDetailDocumentTabs
      })
    }
    if (hasAction(INDOC_ACTION.distribute) || hasAction(INDOC_ACTION.propose)) {
      tabList.push({
        label: DETAIL_DOCUMENT_TABS.distribute,
        value: 'distribute' as TDetailDocumentTabs
      })
    }
    if (hasAction(INDOC_ACTION.udpateDocument))
      tabList.push({
        label: DETAIL_DOCUMENT_TABS.updateDoc,
        value: 'updateDoc' as TDetailDocumentTabs
      })
  }
  return tabList
})

const previewFile = ref<string | File | null>()

const queryClient = useQueryClient()

const reset = () => {
  tab.value = 'info'
  documentId.value = null
}
const processCloseModal = () => {
  isVisible.value = false
  reset()
}

const handleDocProccessed = () => {
  processCloseModal()
  emit('docProcessed')
}

const queryResults = useGetInDocumentDetail(() => documentId.value!, {
  enabled: () => !!documentId.value
})
const {
  data: documentDetail,
  isLoading: isGettinDocumentData,
  error: getDetailDocError,
  isSuccess: isGetDocDetailSuccess
} = queryResults

const { data: availableActions } = useGetAvailableActions(() => documentId.value!, {
  enabled: () => !!documentId.value
})

const { mutate: readDoc } = useReadDoc({
  onSuccess: () => {
    emit('docProcessed')
  }
})

watch([documentDetail, isGetDocDetailSuccess], ([detailDoc, isSuccess]) => {
  if (detailDoc && isSuccess) {
    if (documentDetail?.value?.hasReplacement) {
      modalNotiReplacedDoc?.value?.openModal(documentDetail?.value?.replacementDocCode)
    }
    if (!detailDoc?.isRead) readDoc(detailDoc?.documentId)
  }
})

const { mutateAsync: convertFile } = useConvertDocxIntoPdf()

const isProcessFetchAndConverExternalFile = ref(false)

const hasAction = (action: IndocActionType) => {
  return availableActions.value?.includes(action) ?? false
}

const onVisibleChange = (visible: boolean) => {
  if (!visible) {
    processCloseModal()
  }
}

const handleWhenAddDocSuccess = () => {
  queryClient.invalidateQueries({
    queryKey: ['getDocumentDetail']
  })
  isVisible.value = false
}

const handleChangeMainFile = async (filePath: string) => {
  abortController.value?.abort()
  if (isDoc(filePath)) {
    try {
      isProcessFetchAndConverExternalFile.value = true
      abortController.value = new AbortController()
      const fetchedFile = await createFileFromUrl(getFullFileUrl(filePath), getFileName(filePath))
      const convertedFile = await convertFile({
        file: fetchedFile,
        signal: abortController.value.signal
      })
      if (convertedFile) previewFile.value = URL.createObjectURL(new Blob([convertedFile]))
    } catch (e) {
      toastError({ detail: e instanceof Error ? e?.message : 'Có lỗi xảy ra khi xem trước file' })
    } finally {
      isProcessFetchAndConverExternalFile.value = false
    }
  } else previewFile.value = getFullFileUrl(filePath)
}

watchEffect(() => {
  if (
    hasAction(INDOC_ACTION.propose) ||
    hasAction(INDOC_ACTION.distribute) ||
    hasAction(INDOC_ACTION.evaluateDistribute)
  ) {
    tab.value = 'distribute'
  } else if (hasAction(INDOC_ACTION.register)) {
    tab.value = 'inputInDoc'
  } else if (hasAction(INDOC_ACTION.udpateDocument)) {
    tab.value = 'updateDoc'
  }
})

defineExpose({
  openModal: (id: string) => {
    documentId.value = id
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})

watchEffect(() => {
  if (queryResults?.data?.value?.mainFile) {
    previewFile.value = getFullFileUrl(queryResults?.data?.value?.mainFile)
  }
  provide('documentDetailID', queryResults)
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    :wrapper-style="{ width: '99%', height: '99%', maxHeight: '98%', overflow: 'hidden' }"
    :classContent="'!overflow-auto pt-0! p-2! lg:p-4! lg:pt-0! h-full  flex flex-col'"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="text-primary flex items-center gap-4 text-xl font-semibold">
        {{ documentDetail?.documentCode }}
        <PriorityLevelComponent
          class="ml-[10px]"
          v-if="documentDetail?.priority"
          :priority="documentDetail?.priority"
          :exclude-priorities="['NORMAL']"
        />
      </div>
    </template>
    <div
      v-if="isGettinDocumentData"
      class="flex h-[calc(100%_-_40px)] w-full items-center justify-center"
    >
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div v-else-if="documentDetail" class="flex h-[calc(100%_-_50px)] gap-x-6">
      <div class="border-shadow relative h-full w-1/2 overflow-auto 2xl:w-3/5">
        <div
          v-if="documentDetail?.mainFileName && documentDetail?.mainFile === null"
          class="flex h-[calc(100%_-_50px)] w-full items-center justify-center"
        >
          {{ documentDetail?.mainFileName }}
        </div>
        <PdfViewer v-else :src="previewFile" :loading="isProcessFetchAndConverExternalFile" />
      </div>
      <div class="border-shadow flex h-full w-1/2 flex-col overflow-auto 2xl:w-3/5">
        <AppTabs
          :tab-list="tabList"
          v-model:model-value="tab"
          class="sticky top-0 z-99 bg-[var(--p-overlay-modal-background]"
        />

        <div class="h-full overflow-auto border-t border-[#DFE5EF]">
          <DetailInfoInDoc
            v-if="tab === 'info'"
            :documentDetail="documentDetail"
            :have-permission="true"
            :is-distributor="true"
          />
          <CreationHistory
            v-if="tab === 'createdProcess' && documentId"
            :sourceInfo="documentDetail?.sourceInfo"
            :document-id="documentId"
          />
          <ProcessHistory v-if="tab === 'procedure' && documentId" :document-id="documentId" />

          <ReceiveDocFromInternetID
            v-if="tab === 'inputInDoc' && documentId && documentDetail"
            ref="addDocBookRef"
            :document-detail="documentDetail"
            selectTab="inputInternalDoc"
            @main-file-selected="handleChangeMainFile"
            @success="handleWhenAddDocSuccess"
          />

          <UpdateAxisDoc
            v-if="tab === 'updateDoc' && documentId && documentDetail"
            ref="addDocBookRef"
            :is-e-doc-update="true"
            :document-detail="documentDetail"
            selectTab="inputInternalDoc"
            @main-file-selected="handleChangeMainFile"
            @success="handleWhenAddDocSuccess"
          />
          <DistributeID
            :documentId="documentId"
            :action="hasAction('PROPOSE') ? 'propose' : 'distribute'"
            :documentUnitID="documentDetail?.unitId"
            ref="distributePanelRef"
            @distribute-success="handleDocProccessed"
            v-if="
              tab === 'distribute' &&
              documentId &&
              (hasAction('PROPOSE') || hasAction('DISTRIBUTE')) &&
              documentDetail?.unitId
            "
          />
          <EvaluateDistribute
            :documentId="documentId"
            :documentUnitID="documentDetail?.unitId"
            ref="evaluateDistributePanelRef"
            @distribute-success="handleDocProccessed"
            v-if="
              tab === 'distribute' &&
              documentId &&
              hasAction(INDOC_ACTION.evaluateDistribute) &&
              documentDetail?.unitId
            "
          />
        </div>
      </div>
    </div>
    <template v-if="documentId">
      <div class="wrapper-action mt-2 flex flex-row flex-wrap justify-end gap-x-4 gap-y-2">
        <!-- Giao việc -->
        <Button
          v-if="hasAction(INDOC_ACTION.assign)"
          v-tippy="'Phân công phối hợp xử lý văn bản'"
          @click="modalDirectRef?.openModal()"
          label="Giao việc"
        />
        <!-- Chuyển chủ trì/phối hợp -->
        <!-- v-tippy="'Chuyển Chủ trì xử lý văn bản sang cho thành viên khác'" -->
        <Button
          v-if="hasAction(INDOC_ACTION.delegate) && documentDetail"
          v-tippy="'Chuyển quyền xử lý văn bản sang cho thành viên khác'"
          @click="modalForwardRoleRef?.openModal(documentDetail?.role)"
          label="Chuyển quyền"
        />
        <!-- Báo cáo -->
        <Button
          v-if="hasAction(INDOC_ACTION.report)"
          v-tippy="'Báo cáo kết quả công việc được giao'"
          @click="modalReportIDRef?.openModal()"
          label="Báo cáo"
        />
        <!-- Thu hồi quyền -->
        <Button
          v-if="hasAction(INDOC_ACTION.revokePermission)"
          v-tippy="'Thu hồi quyền đã phân phối'"
          @click="modalRevokePermissionRef?.openModal()"
          label="Thu hồi quyền"
        />
        <!-- Thu hồi văn bản -->
        <Button
          v-if="hasAction(INDOC_ACTION.revokeDocument)"
          v-tippy="
            'Thu hồi văn bản đã tạo nếu có sai sót. Văn bản sau khi thu hồi sẽ không thể xử lý tiếp'
          "
          @click="modalRevokedCreatedIDRef?.openModal()"
          label="Thu hồi VB"
        />
        <!-- Người tạo sửa đề xuất -->
        <Button
          v-if="hasAction(INDOC_ACTION.updatePropose)"
          @click="modalEditDistributeProposalRef?.openModal('propose')"
          label="Sửa để xuất"
        />
        <!-- Người duyệt sửa đề xuất -->
        <Button
          v-if="hasAction(INDOC_ACTION.evaluateDistribute)"
          @click="modalEditDistributeProposalRef?.openModal('distribute')"
          label="Sửa để xuất"
        />
        <!-- Kết thúc văn bản -->
        <Button
          v-if="hasAction(INDOC_ACTION.finishDocument) || hasAction(INDOC_ACTION.finishAssignee)"
          @click="modalFinishDocumentRef?.openModal()"
          v-tippy="'Kết thúc văn bản'"
          label="Kết thúc"
        />
        <!-- Duyệt đề xuất -->
        <Button
          v-if="hasAction(INDOC_ACTION.evaluateDistribute)"
          label="Duyệt đề xuất"
          @click="evaluateDistributePanelRef?.triggerSubmit()"
        />
        <!-- Trả lại văn bản -->
        <Button
          v-if="hasAction(INDOC_ACTION.rejectDocument)"
          @click="modalReturnIDRef?.openModal()"
          v-tippy="'Trả lại/từ chối tiếp nhận văn bản'"
          label="Trả lại"
        />
        <!-- Trả lại văn bản -->
        <Button
          v-if="hasAction(INDOC_ACTION.rejectUpdate)"
          @click="modalReturnXroadIDRef?.openModal()"
          v-tippy="'Từ chối cập nhật văn bản liên thông'"
          label="Từ chối"
        />
        <!-- Trả lại xử lý văn bản -->
        <Button
          v-if="hasAction(INDOC_ACTION.rejectAssignee)"
          @click="modalReturnAssignedTaskRef?.openModal()"
          v-tippy="'Trả lại văn bản cho người phân công'"
          label="Trả lại"
        />
        <!-- Gửi đề xuất -->
        <Button
          v-if="hasAction(INDOC_ACTION.propose) && tab === 'distribute'"
          @click="distributePanelRef?.triggerSubmit()"
          v-tippy="'Gửi yêu cầu phân phối đến người có thẩm quyền để duyệt đề xuất'"
          label="Gửi đề xuất"
        />
        <!-- Phân phối -->
        <Button
          v-if="hasAction(INDOC_ACTION.distribute) && tab === 'distribute'"
          @click="distributePanelRef?.triggerSubmit()"
          v-tippy="'Phân phối trực tiếp đến đơn vị/cán bộ được chọn'"
          label="Phân phối"
        />
        <!-- Cho ý kiến -->
        <Button
          v-if="hasAction(INDOC_ACTION.ignoreDocument)"
          v-tippy="'Bỏ qua văn bản liên thông'"
          @click="modalSkipIDRef?.openModal()"
          label="Bỏ qua"
        />
        <!-- Cho ý kiến -->
        <Button
          v-if="hasAction(INDOC_ACTION.comment)"
          v-tippy="'Cho ý kiến về văn bản'"
          @click="modalSendCommentRef?.openModal()"
          label="Cho ý kiến"
        />
        <!-- Nhập sổ vb đến qua mạng -->
        <Button
          v-if="hasAction(INDOC_ACTION.register)"
          ref="addDocBookButtonRef"
          @click="() => addDocBookRef?.onSubmit()"
          label="Thêm vào sổ"
        />
      </div>
      <ModalDirect
        v-if="hasAction(INDOC_ACTION.assign)"
        :documentId="documentId"
        ref="modalDirectRef"
        @direct-sucess="handleDocProccessed"
      />
      <ModalForwardRole
        v-if="hasAction(INDOC_ACTION.delegate)"
        :documentId="documentId"
        ref="modalForwardRoleRef"
        @forward-success="handleDocProccessed"
      />
      <!-- <ModalForwardReference
        :distributed-user-position-ids="[]"
        ref="modalForwardReferenceRef"
        :unit-id="documentDetail?.unitId"
      /> -->
      <ModalEditDistributeProposal
        v-if="
          (hasAction(INDOC_ACTION.updatePropose) || hasAction(INDOC_ACTION.evaluateDistribute)) &&
          documentDetail?.unitId
        "
        :documentId="documentId"
        ref="modalEditDistributeProposalRef"
        :unit-id="documentDetail?.unitId"
        @distribute-success="handleDocProccessed"
      />
      <ModalReportWorkProcess
        :documentId="documentId"
        v-if="hasAction(INDOC_ACTION.report)"
        ref="modalReportIDRef"
        @report-success="handleDocProccessed"
      />
      <ModalFinishDocument
        v-if="hasAction(INDOC_ACTION.finishDocument) || hasAction(INDOC_ACTION.finishAssignee)"
        :documentId="documentId"
        ref="modalFinishDocumentRef"
        @finish-success="handleDocProccessed"
      />
      <ModalRevokeCreatedID
        :documentId="documentId"
        ref="modalRevokedCreatedIDRef"
        v-if="hasAction(INDOC_ACTION.revokeDocument)"
        @revoke-success="handleDocProccessed"
      />
      <ModalReturnDocument
        :documentId="documentId"
        v-if="hasAction(INDOC_ACTION.rejectDocument)"
        ref="modalReturnIDRef"
        @return-success="handleDocProccessed"
      />
      <ModalRejectUpdateDocument
        :documentId="documentId"
        v-if="hasAction(INDOC_ACTION.rejectUpdate)"
        ref="modalReturnXroadIDRef"
        @return-success="handleDocProccessed"
      />
      <ModalSkipXroad
        :documentId="documentId"
        v-if="hasAction(INDOC_ACTION.ignoreDocument)"
        ref="modalSkipIDRef"
        @skip-xroad="handleDocProccessed"
      />
      <ModalReturnAsignedTask
        v-if="hasAction(INDOC_ACTION.rejectAssignee)"
        :documentId="documentId"
        ref="modalReturnAssignedTaskRef"
        @return-success="handleDocProccessed"
      />
      <ModalSendComment
        :documentId="documentId"
        v-if="hasAction(INDOC_ACTION.comment)"
        ref="modalSendCommentRef"
        @comment-success="handleDocProccessed"
      />
      <ModalRevokePermission
        :documentId="documentId"
        v-if="hasAction(INDOC_ACTION.revokePermission)"
        ref="modalRevokePermissionRef"
        @revoke-success="handleDocProccessed"
      />
    </template>
    <ModalNotiReplaceDoc ref="modalNotiReplacedDoc" />
    <div v-if="getDetailDocError" class="flex h-full w-full items-center justify-center">
      {{
        getDetailDocError?.response?.data?.detail ??
        getDetailDocError?.message ??
        'Có lỗi khi lấy thông tin văn bản'
      }}
    </div>
  </AppModal>
</template>

<style scoped></style>
