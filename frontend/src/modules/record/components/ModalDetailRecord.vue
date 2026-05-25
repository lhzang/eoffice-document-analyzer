<script setup lang="ts">
import type DetailInDocTabs from '@/modules/indoc/components/DetailInDocTabs.vue'
import type DistributeID from '@/modules/indoc/components/distribute/DistributeID.vue'
import type ModalDirect from '@/modules/indoc/components/processModals/ModalDirect.vue'
import type ModalEditDistributeProposal from '@/modules/indoc/components/processModals/ModalEditDistributeProposal.vue'
import type ModalFinishDocument from '@/modules/indoc/components/processModals/ModalFinishDocument.vue'
import type ModalForwardReference from '@/modules/indoc/components/processModals/ModalForwardReference.vue'
import type ModalForwardRole from '@/modules/indoc/components/processModals/ModalForwardRole.vue'
import type ModalReportWorkProcess from '@/modules/indoc/components/processModals/ModalReportWorkProcess.vue'
import type ModalReturnAsignedTask from '@/modules/indoc/components/processModals/ModalReturnAsignedTask.vue'
import type ModalReturnDocument from '@/modules/indoc/components/processModals/ModalReturnDocument.vue'
import type ModalRevokeCreatedID from '@/modules/indoc/components/processModals/ModalRevokeCreatedID.vue'
import type ModalRevokePermission from '@/modules/indoc/components/processModals/ModalRevokePermission.vue'
import type ModalSendComment from '@/modules/indoc/components/processModals/ModalSendComment.vue'
import type ReceiveDocFromInternetID from '@/modules/indoc/components/ReceiveDocFromInternetID.vue'
import { useGetAvailableActions } from '@/modules/indoc/composables/queries/useGetAvailableActions'
import { useGetInDocumentDetail } from '@/modules/indoc/composables/queries/useGetInDocumentDetail'
import type { TDetailDocumentTabs } from '@/modules/indoc/composables/useTabModalDetail'
import { INDOC_ACTION, type IndocActionType } from '@/modules/indoc/constants/availableActions'
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { useConvertDocxIntoPdf } from '@/shared/composables/queries/common/useConvertDocxIntoPdf'
import { DOCUMENT_PROCESS_ROLES } from '@/shared/constants/document'
import { isDoc } from '@/shared/utils/check'
import { createFileFromUrl, getFileName, getFullFileUrl, toastError } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { uniq } from 'lodash-es'
import { Button } from 'primevue'
import { provide, ref, useTemplateRef, watchEffect } from 'vue'

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
type TReturnAssignedTask = InstanceType<typeof ModalReturnAsignedTask>
type TModalSendCommentRef = InstanceType<typeof ModalSendComment>
type TModalRevokePermissionRef = InstanceType<typeof ModalRevokePermission>
//tab distribute
type TDistributeTab = InstanceType<typeof DistributeID>
type TProps = {
  isViewByOM: boolean
}

const isVisible = ref(false)
const documentId = ref<string | null>(null)
const detailDocumentTabsRef = useTemplateRef<TDetailDocumentTabsRef | null>('detailDocumentTabsRef')
const addDocBookRef = useTemplateRef<TAddDocBookFromInternetRef | null>('addDocBookRef')
const initialTabs = ref<TDetailDocumentTabs[]>(['info'])
const addDocBookButtonRef = ref<HTMLButtonElement | null>(null)
const modalDirectRef = ref<TModalDirectRef | null>(null)
const modalForwardRoleRef = ref<TModalForwardRoleRef | null>(null)
const modalForwardReferenceRef = ref<TForwardReferenceRef | null>(null)
const modalEditDistributeProposalRef = ref<TEditDistributeProposalRef | null>(null)
const modalReportIDRef = ref<TReportIDRef | null>(null)
const modalFinishDocumentRef = ref<TFinishDocumentRef | null>(null)
const modalRevokedCreatedIDRef = ref<TRevokeCreatedIDRef | null>(null)
const modalReturnIDRef = ref<TReturnIDRef | null>(null)
const modalReturnAssignedTaskRef = ref<TReturnAssignedTask | null>(null)
const modalSendCommentRef = ref<TModalSendCommentRef | null>(null)
const modalRevokePermissionRef = ref<TModalRevokePermissionRef | null>(null)
const distributePanelRef = ref<TDistributeTab | null>()

const abortController = ref<AbortController | null>(null)

const props = defineProps<TProps>()
const { isViewByOM = false } = props

const previewFile = ref<string | File | null>()

const queryClient = useQueryClient()

const queryResults = useGetInDocumentDetail(() => documentId.value!, {
  enabled: () => !!documentId.value
})
const {
  data: documentDetail,
  isLoading: isGettinDocumentData,
  isError: isGetDocumentFail
} = queryResults

const { data: availableActions } = useGetAvailableActions(() => documentId.value!, {
  enabled: () => !!documentId.value
})

const { mutateAsync: convertFile } = useConvertDocxIntoPdf()

const isProcessFetchAndConverExternalFile = ref(false)

const hasAction = (action: IndocActionType) => {
  return availableActions.value?.includes(action) ?? false
}

const onVisibleChange = (visible: boolean) => {
  if (!visible) {
    documentId.value = ''
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

watchEffect(() => {
  if (isViewByOM) {
    initialTabs.value = ['info']
  } else {
    const tabs: TDetailDocumentTabs[] = ['info', 'createdProcess', 'procedure']
    if (hasAction(INDOC_ACTION.register)) {
      tabs.push('inputInDoc')
    }
    if (hasAction(INDOC_ACTION.distribute) || hasAction(INDOC_ACTION.propose)) {
      tabs.push('distribute')
    }
    initialTabs.value = uniq(tabs)
  }
})

watchEffect(() => {
  console.log(queryResults?.data?.value?.mainFile, 'previewFile')
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
        {{ documentDetail?.subject }}
        <PriorityLevelComponent
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
        <PdfViewer :src="previewFile" :loading="isProcessFetchAndConverExternalFile" />
      </div>
      <div class="border-shadow flex h-full w-1/2 flex-col overflow-auto 2xl:w-3/5">
        <DetailInDocTabs ref="detailDocumentTabsRef" :initialTabs="initialTabs" />
        <div class="h-full overflow-auto border-t border-[#DFE5EF]">
          <DetailInfoInDoc
            v-if="detailDocumentTabsRef?.selectedTab === 'info'"
            :documentDetail="documentDetail"
            :have-permission="true"
            :is-distributor="true"
          />
          <CreationHistory
            v-if="detailDocumentTabsRef?.selectedTab === 'createdProcess' && documentId"
            :document-id="documentId"
          />
          <ProcessHistory
            v-if="detailDocumentTabsRef?.selectedTab === 'procedure' && documentId"
            :document-id="documentId"
          />

          <ReceiveDocFromInternetID
            v-if="
              detailDocumentTabsRef?.selectedTab === 'inputInDoc' && documentId && documentDetail
            "
            ref="addDocBookRef"
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
            v-if="detailDocumentTabsRef?.selectedTab === 'distribute' && documentId"
          />
        </div>
      </div>
    </div>
    <template v-if="documentDetail?.unitId && documentId">
      <div class="wrapper-action mt-2 flex flex-row flex-wrap justify-end gap-x-4 gap-y-2">
        <!-- Giao việc -->
        <Button
          v-if="hasAction(INDOC_ACTION.assign)"
          v-tippy="'Phân công phối hợp xử lý văn bản'"
          @click="modalDirectRef?.openModal()"
          >Giao việc</Button
        >
        <!-- Chuyển chủ trì/phối hợp -->
        <Button
          v-if="hasAction(INDOC_ACTION.delegate)"
          v-tippy="'Chuyển Chủ trì xử lý văn bản sang cho thành viên khác'"
          @click="modalForwardRoleRef?.openModal(DOCUMENT_PROCESS_ROLES.Leader)"
          >Chuyển chủ trì</Button
        >
        <!-- Báo cáo -->
        <Button
          v-if="hasAction(INDOC_ACTION.report)"
          v-tippy="'Báo cáo kết quả công việc được giao'"
          @click="modalReportIDRef?.openModal()"
          >Báo cáo</Button
        >
        <!-- Thu hồi quyền -->
        <Button
          v-if="hasAction(INDOC_ACTION.revokePermission)"
          v-tippy="'Thu hồi quyền đã phân phối'"
          @click="modalRevokePermissionRef?.openModal()"
          >Thu hồi quyền</Button
        >
        <!-- Thu hồi văn bản -->
        <Button
          v-if="hasAction(INDOC_ACTION.revokeDocument)"
          v-tippy="
            'Thu hồi văn bản đã tạo nếu có sai sót. Văn bản sau khi thu hồi sẽ không thể xử lý tiếp'
          "
          @click="modalRevokedCreatedIDRef?.openModal()"
          >Thu hồi VB</Button
        >
        <!-- Người tạo sửa đề xuất -->
        <Button
          v-if="hasAction(INDOC_ACTION.updatePropose)"
          @click="modalEditDistributeProposalRef?.openModal('propose')"
          >Sửa để xuất</Button
        >
        <!-- Người duyệt sửa đề xuất -->
        <Button
          v-if="hasAction(INDOC_ACTION.evaluateDistribute)"
          @click="modalEditDistributeProposalRef?.openModal('distribute')"
          >Sửa để xuất</Button
        >
        <!-- Kết thúc văn bản -->
        <Button
          v-if="hasAction(INDOC_ACTION.finishDocument) || hasAction(INDOC_ACTION.finishAssignee)"
          @click="modalFinishDocumentRef?.openModal()"
          v-tippy="'Kết thúc văn bản'"
          >Kết thúc</Button
        >
        <!-- Duyệt đề xuất -->
        <Button v-if="hasAction(INDOC_ACTION.evaluateDistribute)">Duyệt đề xuất</Button>
        <!-- Trả lại văn bản -->
        <Button
          v-if="hasAction(INDOC_ACTION.rejectDocument)"
          @click="modalReturnIDRef?.openModal()"
          v-tippy="'Trả lại/từ chối tiếp nhận văn bản'"
          >Trả lại</Button
        >
        <!-- Trả lại xử lý văn bản -->
        <Button
          v-if="hasAction(INDOC_ACTION.rejectAssignee)"
          @click="modalReturnAssignedTaskRef?.openModal()"
          v-tippy="'Trả lại văn bản cho người phân công'"
          >Trả lại</Button
        >
        <!-- Gửi đề xuất -->
        <Button
          v-if="
            hasAction(INDOC_ACTION.propose) && detailDocumentTabsRef?.selectedTab === 'distribute'
          "
          @click="distributePanelRef?.triggerSubmit()"
          v-tippy="'Gửi yêu cầu phân phối đến người có thẩm quyền để duyệt đề xuất'"
          >Gửi đề xuất</Button
        >
        <!-- Phân phối -->
        <Button
          v-if="
            hasAction(INDOC_ACTION.distribute) &&
            detailDocumentTabsRef?.selectedTab === 'distribute'
          "
          @click="distributePanelRef?.triggerSubmit()"
          v-tippy="'Phân phối trực tiếp đến đơn vị/cán bộ được chọn'"
          >Phân phối</Button
        >
        <!-- Cho ý kiến -->
        <Button
          v-if="hasAction(INDOC_ACTION.comment)"
          v-tippy="'Cho ý kiến về văn bản'"
          @click="modalSendCommentRef?.openModal()"
          >Cho ý kiến</Button
        >
        <!-- Nhập sổ vb đến qua mạng -->
        <Button
          v-if="hasAction(INDOC_ACTION.register)"
          ref="addDocBookButtonRef"
          @click="() => addDocBookRef?.onSubmit()"
          >Thêm vào sổ</Button
        >
      </div>
      <ModalDirect
        :documentId="documentId"
        ref="modalDirectRef"
        :unit-id="documentDetail?.unitId"
      />
      <ModalForwardRole ref="modalForwardRoleRef" :unit-id="documentDetail?.unitId" />
      <ModalForwardReference
        :distributed-user-position-ids="['66c6ab299483a00e8da2be2c']"
        ref="modalForwardReferenceRef"
        :unit-id="documentDetail?.unitId"
      />
      <ModalEditDistributeProposal
        :documentId="documentId"
        ref="modalEditDistributeProposalRef"
        :unit-id="documentDetail?.unitId"
      />
      <ModalReportWorkProcess :documentId="documentId" ref="modalReportIDRef" />
      <ModalFinishDocument :documentId="documentId" ref="modalFinishDocumentRef" />
      <ModalRevokeCreatedID :documentId="documentId" ref="modalRevokedCreatedIDRef" />
      <ModalReturnDocument :documentId="documentId" ref="modalReturnIDRef" />
      <ModalReturnAsignedTask :documentId="documentId" ref="modalReturnAssignedTaskRef" />
      <ModalSendComment :documentId="documentId" ref="modalSendCommentRef" />
      <ModalRevokePermission :documentId="documentId || ''" ref="modalRevokePermissionRef" />
    </template>
    <div v-if="isGetDocumentFail" class="flex h-full w-full items-center justify-center">
      Đã có lỗi khi lấy dữ liệu
    </div>
  </AppModal>
</template>

<style scoped></style>
