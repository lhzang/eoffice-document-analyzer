<script setup lang="ts">
import ModalRevokeAfterIssue from '@/modules/outDocument/components/modals/ModalRevokeAfterIssue.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModalWithMessage from '@/shared/components/modals/AppModalWithMessage.vue'
import ModalWaitAcceptSign from '@/shared/components/modals/ModalWaitAcceptSign.vue'
import { useSignDocRemote } from '@/shared/composables/queries/outdoc/useSignDocRemote'
import { APP_TEXTAREA_EXTRA_LARGE_ROW } from '@/shared/constants/common'
import { SIGN_PROVIDER_LABEL } from '@/shared/constants/sign'
import type { DetailDocumentVM, SigningConfigVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import {
  cleanObject,
  createFileFromUrl,
  getFullFileUrl,
  toastError,
  toastSucceed
} from '@/shared/utils/common'
import { hasODAction } from '@/shared/utils/outDoc/common'
import { Button, ConfirmDialog, SplitButton, useConfirm } from 'primevue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDeleteRejectedDoc } from '../composables/queries/useDeleteRejectedDoc'
import { useEvaluateDocument } from '../composables/queries/useEvaluateDocument'
import { useRejectInternalDoc } from '../composables/queries/useRejectInternalDoc'
import { useRevokeInternalDoc } from '../composables/queries/useRevokeInternalDoc'
import { useSecretaryEvaluateDocument } from '../composables/queries/useSecretaryEvaluateDocument'
import ModalPreviewCreateDoc from './modals/ModalPreviewCreateDoc.vue'

type TProps = {
  detailInternalDoc: DetailDocumentVM
  availableActions: string[]
}
type ModalType = InstanceType<typeof AppModalWithMessage>
type TModalWaitAcceptSign = InstanceType<typeof ModalWaitAcceptSign>
type TModalPreviewDoc = InstanceType<typeof ModalPreviewCreateDoc>

const { detailInternalDoc, availableActions } = defineProps<TProps>()
const previewModalDoc = ref<TModalPreviewDoc | null>(null)

const emit = defineEmits<{
  (e: 'documentProcessed'): void
  (e: 'reIsssue'): void
}>()

const user = useUserProfileStore().user
const confirm = useConfirm()

const router = useRouter()

const rejectModalRef = ref<ModalType | null>(null)
const evaluateModalRef = ref<ModalType | null>(null)
// const deleleDocRef = ref<ModalType | null>(null)
const secretaryEvaluateModalRef = ref<ModalType | null>(null)
const revokeModalRef = ref<ModalType | null>(null)
const modalWaitAcceptSign = ref<TModalWaitAcceptSign | null>(null)

const signMessage = ref<string>()

const { mutate: rejectDoc, isPending: isRejectingDoc } = useRejectInternalDoc({
  onSuccess: () => {
    toastSucceed({
      detail: 'Trả lại văn bản thành công'
    })
    rejectModalRef?.value?.closeModal()
    emit('documentProcessed')
  }
})
const { mutate: evaluateDoc, isPending: isEvaluatingDoc } = useEvaluateDocument({
  onSuccess: () => {
    toastSucceed({
      detail: 'Duyệt văn bản thành công'
    })
    evaluateModalRef?.value?.closeModal()

    emit('documentProcessed')
  }
})
const { mutate: secretaryEvaluateDoc, isPending: isSecretaryEvaluatingDoc } =
  useSecretaryEvaluateDocument({
    onSuccess: () => {
      toastSucceed({
        detail: 'Duyệt văn bản thành công'
      })
      secretaryEvaluateModalRef?.value?.closeModal()

      emit('documentProcessed')
    }
  })
const { mutate: revokeDoc, isPending: isRevokingDoc } = useRevokeInternalDoc({
  onSuccess: () => {
    toastSucceed({
      detail: 'Thu hồi văn bản thành công'
    })
    revokeModalRef?.value?.closeModal()
    emit('documentProcessed')
  }
})
const { mutate: deleteDoc, isPending: isDeletingDoc } = useDeleteRejectedDoc({
  onSuccess: () => {
    toastSucceed({
      detail: 'Xoá văn bản thành công'
    })
    revokeModalRef?.value?.closeModal()
    emit('documentProcessed')
  }
})

const { mutate: signDocRemote, isPending: isSigningDocRemote } = useSignDocRemote({
  onSuccess: () => {
    toastSucceed({
      detail: 'Ký số văn bản thành công'
    })
    emit('documentProcessed')
  },
  onSettled: () => {
    modalWaitAcceptSign?.value?.closeModal()
  }
})

const selectedSignMethod = ref<SigningConfigVM | undefined>(
  (user?.signingConfig ?? [])?.find(
    (provider) => provider?.signingProvider === user?.defaultSigningConfig?.signingProvider
  )
)
const signProviders = computed(() => {
  return user?.signingConfig?.map((provider) => ({
    label: SIGN_PROVIDER_LABEL?.[provider.signingProvider],
    command: () => (selectedSignMethod.value = provider)
  }))
})

const handleConfirmReturn = (reason: string, files: File[]) => {
  if (!detailInternalDoc?.id) return
  rejectDoc({
    id: detailInternalDoc?.id,
    body: {
      reason,
      files
    }
  })
}
const handleConfirmEvaluate = (message?: string) => {
  if (!detailInternalDoc?.id) return
  evaluateDoc({
    id: detailInternalDoc?.id,
    body: cleanObject({
      message
    })
  })
}
const handleConfirmSecretaryEvaluate = (message?: string) => {
  if (!detailInternalDoc?.id) return
  secretaryEvaluateDoc({
    id: detailInternalDoc?.id,
    body: cleanObject({
      message
    })
  })
}
const handleConfirmRevoke = (message?: string) => {
  if (!detailInternalDoc?.id) return
  revokeDoc({
    id: detailInternalDoc?.id,
    body: cleanObject({
      message
    })
  })
}
// const handleConfirmDeleteDoc = (message: string) => {
//   if (!detailInternalDoc?.id) return
//   deleteDoc({
//     id: detailInternalDoc?.id,
//     message
//   })
// }

const handleSignInternalDoc = () => {
  if (!selectedSignMethod?.value) return
  const signConfig = user?.signingConfig?.find(
    (config) => config?.signingProvider === selectedSignMethod?.value?.signingProvider
  )
  if (signConfig) modalWaitAcceptSign?.value?.openModal(signConfig)
  signDocRemote({
    docId: detailInternalDoc?.id,
    body: {
      signingProvider: selectedSignMethod?.value?.signingProvider,
      message: hasODAction(availableActions, 'SIGN_WITH_MESSAGE') ? signMessage?.value : undefined
    }
  })
}

const confirmSignWithMessage = () => {
  confirm.require({
    header: 'Ý kiến phê duyệt',
    group: 'signWithMessage',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    },
    accept: () => {
      if (!signMessage?.value && hasODAction(availableActions, 'SIGN_WITH_MESSAGE'))
        return toastError({
          detail: 'Vui lòng nhập ý kiến phê duyệtF'
        })
      handleSignInternalDoc()
    }
  })
}

const handleConfirmDeleteDoc = () => {
  confirm.require({
    group: 'deleteDoc',
    message: 'Thầy/Cô có xác nhận xoá văn bản?',
    header: 'Xoá văn bản',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      if (!detailInternalDoc?.id) return
      deleteDoc(detailInternalDoc?.id)
    }
  })
}

const handleReIssue = (docId: string) => {
  router.push(`/internal-doc/re-register/${docId}`)
  emit('reIsssue')
}

const handlePreview = async () => {
  const fetchedFile = await createFileFromUrl(
    getFullFileUrl(detailInternalDoc?.documentFiles?.mainFile)
  )
  previewModalDoc?.value?.openModal({
    file: fetchedFile,
    metadataRequest: {
      unitIds: detailInternalDoc?.jointUnits?.map((unit, index) => ({
        unitId: unit.id,
        index
      })),
      issuedUnitId: detailInternalDoc?.issueUnit?.id,
      haveCreatorSign: detailInternalDoc?.signFlowVM?.flowStepVMS?.some(
        (step) => step?.signType === 'CREATOR'
      ),
      processingSteps: {
        steps: detailInternalDoc?.signFlowVM?.flowStepVMS
          ?.filter((step) => step?.signType !== 'CREATOR')
          ?.map((step, idx) => ({
            signers: (step?.userApproverVMs ?? [])?.map((approver, approveIdx) => ({
              signerIndex: approveIdx,
              staffId: approver?.leader?.id
            })),
            stepName: step?.signType,
            stepIndex: idx
          }))
      },
      isEnglish: !!detailInternalDoc?.isEnglish,
      type: detailInternalDoc.outDocType
    }
  })
}
</script>
<template>
  <div class="flex shrink-0 items-center justify-end gap-4">
    <Button
      outlined
      severity="secondary"
      @click="handlePreview"
      v-if="
        hasODAction(availableActions, 'SIGN') ||
        hasODAction(availableActions, 'SIGN_WITH_MESSAGE') ||
        hasODAction(availableActions, 'EVALUATED') ||
        hasODAction(availableActions, 'SECRETARY_EVALUATED') ||
        hasODAction(availableActions, 'STAMP')
      "
      >Xem trước</Button
    >
    <Button
      outlined
      severity="secondary"
      :loading="isRejectingDoc"
      @click="rejectModalRef?.openModal()"
      v-if="hasODAction(availableActions, 'REJECT')"
      >Trả lại</Button
    >
    <Button
      outlined
      severity="secondary"
      :loading="isEvaluatingDoc"
      @click="evaluateModalRef?.openModal()"
      v-if="hasODAction(availableActions, 'EVALUATED')"
      >Duyệt</Button
    >
    <Button
      outlined
      severity="secondary"
      @click="handleReIssue(detailInternalDoc?.id)"
      v-if="hasODAction(availableActions, 'RECREATE')"
      >Trình lại</Button
    >
    <Button
      outlined
      severity="secondary"
      :loading="isSecretaryEvaluatingDoc"
      @click="secretaryEvaluateModalRef?.openModal()"
      v-if="hasODAction(availableActions, 'SECRETARY_EVALUATED')"
      >Duyệt</Button
    >
    <!-- revoked created doc -->
    <Button
      outlined
      severity="secondary"
      :loading="isRevokingDoc"
      v-tippy="
        'Thu hồi văn bản đã tạo nếu có sai sót. Văn bản sau khi thu hồi sẽ không thể xử lý tiếp.'
      "
      @click="revokeModalRef?.openModal()"
      v-if="hasODAction(availableActions, 'CREATOR_REVOKE')"
      >Thu hồi</Button
    >
    <Button
      outlined
      severity="secondary"
      @click="handleConfirmDeleteDoc()"
      :loading="isDeletingDoc"
      v-if="hasODAction(availableActions, 'DELETE')"
      >Xoá văn bản</Button
    >
    <SplitButton
      class="custom-split-button"
      :model="signProviders"
      label="Đồng ý và ký số"
      severity="primary"
      :disabled="!selectedSignMethod || isSigningDocRemote"
      outlined
      :button-props="{
        class: 'bg-primary! text-white!'
      }"
      @click="
        () => {
          if (hasODAction(availableActions, 'SIGN_WITH_MESSAGE')) confirmSignWithMessage()
          else handleSignInternalDoc()
        }
      "
      v-if="
        hasODAction(availableActions, 'SIGN') || hasODAction(availableActions, 'SIGN_WITH_MESSAGE')
      "
    >
      <template #dropdownicon>
        <div v-if="selectedSignMethod !== undefined" class="flex items-center gap-2 font-semibold">
          {{ SIGN_PROVIDER_LABEL?.[selectedSignMethod?.signingProvider] }}
          <span class="icon-[oui--arrow-down]"></span>
        </div>
        <div v-else class="flex items-center gap-2 font-semibold">Không có phương thức</div>
      </template>
    </SplitButton>
    <AppModalWithMessage
      ref="rejectModalRef"
      title="Trả lại"
      :isMessageRequired="true"
      @submit="({ message, files }) => handleConfirmReturn(message ?? '', files ?? [])"
      labelMessageInput="Nhập lý do trả lại"
      :limit-character-number="500"
      :rows="APP_TEXTAREA_EXTRA_LARGE_ROW"
      included-files
      v-if="hasODAction(availableActions, 'REJECT')"
    />
    <AppModalWithMessage
      ref="evaluateModalRef"
      title="Duyệt văn bản"
      @submit="({ message }) => handleConfirmEvaluate(message)"
      placeholder="Nhập ý kiến (nếu có)"
      v-if="hasODAction(availableActions, 'EVALUATED')"
    />
    <AppModalWithMessage
      ref="secretaryEvaluateModalRef"
      title="Duyệt văn bản"
      @submit="({ message }) => handleConfirmSecretaryEvaluate(message)"
      placeholder="Nhập ý kiến (nếu có)"
      v-if="hasODAction(availableActions, 'SECRETARY_EVALUATED')"
    />
    <AppModalWithMessage
      ref="revokeModalRef"
      title="Thu hồi văn bản"
      @submit="({ message }) => handleConfirmRevoke(message)"
      placeholder="Nhập ý kiến (nếu có)"
      v-if="hasODAction(availableActions, 'CREATOR_REVOKE')"
    />
    <ModalRevokeAfterIssue
      :document-id="detailInternalDoc?.id"
      ref="revokeAfterIssueModalRef"
      @revoked-doc="emit('documentProcessed')"
      v-if="hasODAction(availableActions, 'REVOKE')"
    />
    <!-- <AppModalWithMessage
      ref="deleleDocRef"
      title="Xoá văn bản"
      @submit="({ message }) => handleConfirmDeleteDoc(message!)"
      placeholder="Nhập ý kiến"
      isMessageRequired
      v-if="hasODAction(availableActions, 'DELETE')"
    /> -->

    <ConfirmDialog group="deleteDoc" />

    <ModalWaitAcceptSign ref="modalWaitAcceptSign" />
    <ModalPreviewCreateDoc
      v-if="
        hasODAction(availableActions, 'SIGN') ||
        hasODAction(availableActions, 'SIGN_WITH_MESSAGE') ||
        hasODAction(availableActions, 'EVALUATED') ||
        hasODAction(availableActions, 'SECRETARY_EVALUATED')
      "
      :isViewonly="true"
      ref="previewModalDoc"
    />
    <ConfirmDialog
      group="signWithMessage"
      class="w-[600px]"
      v-if="hasODAction(availableActions, 'SIGN_WITH_MESSAGE')"
    >
      <template #message>
        <div>
          <AppTextarea
            name="message"
            label="Ý kiến phê duyệt"
            required
            :limit-number="110"
            :rows="2"
            :model-value="signMessage"
            placeholder="Nhập ý kiến phê duyệt"
          ></AppTextarea>
        </div>
      </template>
    </ConfirmDialog>
  </div>
</template>

<style lang="css" scoped>
::v-deep(.custom-split-button) {
  .p-splitbutton-dropdown {
    padding: var(--p-form-field-padding-y) var(--p-form-field-padding-y);
    width: fit-content;
  }
}
</style>
