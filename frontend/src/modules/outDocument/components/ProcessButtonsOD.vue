<script setup lang="ts">
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModalWithMessage from '@/shared/components/modals/AppModalWithMessage.vue'
import ModalWaitAcceptSign from '@/shared/components/modals/ModalWaitAcceptSign.vue'
import { useGetDetailUnit } from '@/shared/composables/queries/organization/unit/useGetDetailUnit'
import { useSignDocRemote } from '@/shared/composables/queries/outdoc/useSignDocRemote'
import { APP_TEXTAREA_EXTRA_LARGE_ROW } from '@/shared/constants/common'
import { SIGN_PROVIDER_LABEL, SIGN_PROVIDER_VALUES } from '@/shared/constants/sign'
import { OUT_DOC_STATUS_VALUES } from '@/shared/models/outDoc/document'
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
import { useIsMutating } from '@tanstack/vue-query'
import { Button, ConfirmDialog, SplitButton, useConfirm } from 'primevue'
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useDeleteRejectedDoc } from '../composables/queries/useDeleteRejectedDoc'
import { useEvaluateDocument } from '../composables/queries/useEvaluateDocument'
import { useRejectOD } from '../composables/queries/useRejectOD'
import { useRevokeOD } from '../composables/queries/useRevokeOD'
import { useSecretaryEvaluateDocument } from '../composables/queries/useSecretaryEvaluateDocument'
import ModalPreviewCreateDoc from './modals/ModalPreviewCreateDoc.vue'
import ModalPrintDoc from './modals/ModalPrintDoc.vue'
import ModalRevokeAfterIssue from './modals/ModalRevokeAfterIssue.vue'
import ModalSendDocToUnits from './modals/ModalSendDocToUnits.vue'

type TProps = {
  detailOutDoc: DetailDocumentVM
  availableActions: string[]
}
type ModalType = InstanceType<typeof AppModalWithMessage>
type ModalRevokeAfterIssueType = InstanceType<typeof ModalRevokeAfterIssue>
type TModalWaitAcceptSign = InstanceType<typeof ModalWaitAcceptSign>
type TModalPreviewDoc = InstanceType<typeof ModalPreviewCreateDoc>
type TModalPrintDoc = InstanceType<typeof ModalPrintDoc>
type TModalSendDocToUnits = InstanceType<typeof ModalSendDocToUnits>

const { detailOutDoc, availableActions } = defineProps<TProps>()
const previewModalDoc = ref<TModalPreviewDoc | null>(null)
const sendToUnitsRef = ref<TModalSendDocToUnits | null>(null)

const emit = defineEmits<{
  (e: 'documentProcessed'): void
  (e: 'submitAllocate', provider: SigningConfigVM): void
  (e: 'updateFile'): void
  (e: 'reIsssue'): void
}>()

const confirm = useConfirm()
const user = useUserProfileStore().user
const isMutatingAllocate = useIsMutating({ mutationKey: ['issueEOutDoc'] })

const isAllocating = computed(() => {
  return isMutatingAllocate?.value > 0
})

const router = useRouter()

const rejectModalRef = ref<ModalType | null>(null)
const evaluateModalRef = ref<ModalType | null>(null)
// const deleleDocRef = ref<ModalType | null>(null)
const secretaryEvaluateModalRef = ref<ModalType | null>(null)
const revokeModalRef = ref<ModalType | null>(null)
const revokeAfterIssueModalRef = ref<ModalRevokeAfterIssueType | null>(null)
const modalWaitAcceptSign = ref<TModalWaitAcceptSign | null>(null)
const modalPrintDocRef = ref<TModalPrintDoc | null>(null)

const signMessage = ref<string>()

const { mutate: rejectDoc, isPending: isRejectingDoc } = useRejectOD({
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
const { mutate: revokeDoc, isPending: isRevokingDoc } = useRevokeOD({
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

const {
  data: detailIssueUnit,
  isLoading: isLoadingIssueUnit,
  isSuccess: isGetIssueUnitSuccess
} = useGetDetailUnit(() => detailOutDoc.issueUnit?.id, {
  enabled: () => hasODAction(availableActions, 'STAMP') || hasODAction(availableActions, 'ISSUED')
})

const selectedSignMethod = ref<SigningConfigVM | undefined>(
  (user?.signingConfig ?? [])?.find(
    (provider) => provider?.signingProvider === user?.defaultSigningConfig?.signingProvider
  )
)
const selectedAllocateMethod = ref<SigningConfigVM | undefined>()

watchEffect(() => {
  if (detailIssueUnit?.value?.defaultSigningConfig && isGetIssueUnitSuccess) {
    selectedAllocateMethod.value = (detailIssueUnit?.value?.signingConfig ?? [])?.find(
      (provider) =>
        provider?.signingProvider === detailIssueUnit?.value?.defaultSigningConfig?.signingProvider
    )
  }
})

const signProviders = computed(() => {
  return user?.signingConfig?.map((provider) => ({
    label: SIGN_PROVIDER_LABEL?.[provider.signingProvider],
    command: () => (selectedSignMethod.value = provider)
  }))
})
const unitSignProviders = computed(() => {
  return detailIssueUnit?.value?.signingConfig?.map((provider) => ({
    label: SIGN_PROVIDER_LABEL?.[provider.signingProvider],
    command: () => (selectedAllocateMethod.value = provider)
  }))
})

const handleConfirmReturn = (reason: string, files: File[]) => {
  if (!detailOutDoc?.id) return
  rejectDoc({
    id: detailOutDoc?.id,
    body: {
      reason,
      files
    }
  })
}
const handleConfirmEvaluate = (message?: string) => {
  if (!detailOutDoc?.id) return
  evaluateDoc({
    id: detailOutDoc?.id,
    body: cleanObject({
      message
    })
  })
}
const handleConfirmSecretaryEvaluate = (message?: string) => {
  if (!detailOutDoc?.id) return
  secretaryEvaluateDoc({
    id: detailOutDoc?.id,
    body: cleanObject({
      message
    })
  })
}
const handleConfirmRevoke = (message?: string) => {
  if (!detailOutDoc?.id) return
  revokeDoc({
    id: detailOutDoc?.id,
    body: cleanObject({
      message
    })
  })
}

const handleSignOutDoc = () => {
  if (!selectedSignMethod?.value) return
  const signConfig = user?.signingConfig?.find(
    (config) => config?.signingProvider === selectedSignMethod?.value?.signingProvider
  )
  if (signConfig) modalWaitAcceptSign?.value?.openModal(signConfig)
  signDocRemote({
    docId: detailOutDoc?.id,
    body: {
      signingProvider: selectedSignMethod?.value?.signingProvider,
      message: hasODAction(availableActions, 'SIGN_WITH_MESSAGE') ? signMessage?.value : undefined
    }
  })
}
const handleStampOutDoc = () => {
  if (!selectedAllocateMethod?.value) return
  modalWaitAcceptSign?.value?.openModal(selectedAllocateMethod?.value)
  signDocRemote({
    docId: detailOutDoc?.id,
    body: {
      signingProvider: selectedAllocateMethod?.value?.signingProvider
    }
  })
}

const confirmSignWithPublicSignature = () => {
  signMessage.value = undefined
  confirm.require({
    header: 'Lưu ý',
    group: 'confirmSignWithPublicSignature',
    rejectProps: {
      label: 'Kiểm tra lại',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      if (!signMessage?.value && hasODAction(availableActions, 'SIGN_WITH_MESSAGE'))
        return toastError({
          detail: 'Vui lòng nhập ý kiến phê duyệtF'
        })
      handleSignOutDoc()
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
      if (!detailOutDoc?.id) return
      deleteDoc(detailOutDoc?.id)
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
      handleSignOutDoc()
    }
  })
}
const confirmStampWithPublicSignature = () => {
  confirm.require({
    header: 'Lưu ý',
    group: 'confirmStampWithPublicSignature',
    rejectProps: {
      label: 'Kiểm tra lại',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      handlePreview()
    }
  })
}

const handleReIssue = (docId: string) => {
  router.push(`/out-doc/re-register/${docId}`)
  emit('reIsssue')
}

const handlePreview = async () => {
  const fetchedFile = await createFileFromUrl(getFullFileUrl(detailOutDoc?.documentFiles?.mainFile))
  previewModalDoc?.value?.openModal({
    file: fetchedFile,
    metadataRequest: {
      unitIds: detailOutDoc?.jointUnits?.map((unit, index) => ({
        unitId: unit.id,
        index
      })),
      issuedUnitId: detailOutDoc?.issueUnit?.id,
      haveCreatorSign: detailOutDoc?.signFlowVM?.flowStepVMS?.some(
        (step) => step?.signType === 'CREATOR'
      ),
      processingSteps: {
        steps: detailOutDoc?.signFlowVM?.flowStepVMS
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
      isEnglish: !!detailOutDoc?.isEnglish,
      type: detailOutDoc.outDocType
    }
  })
}
</script>
<template>
  <div class="flex shrink-0 items-center justify-end gap-4">
    <Button
      contained
      severity="primary"
      label="In văn bản"
      v-if="hasODAction(availableActions, 'PRINT_DOCUMENT')"
      @click="modalPrintDocRef?.openModal()"
    ></Button>
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
      label="Xem trước"
    ></Button>
    <Button
      v-tippy="'Cập nhật file văn bản mới'"
      @click="emit('updateFile')"
      label="Cập nhật"
      v-if="hasODAction(availableActions, 'UPDATE_DOCUMENT')"
    ></Button>
    <Button
      outlined
      severity="secondary"
      :loading="isRejectingDoc"
      @click="rejectModalRef?.openModal()"
      v-if="hasODAction(availableActions, 'REJECT')"
      label="Trả lại"
    ></Button>
    <Button
      outlined
      severity="secondary"
      :loading="isEvaluatingDoc"
      @click="evaluateModalRef?.openModal()"
      v-if="hasODAction(availableActions, 'EVALUATED')"
      label="Duyệt"
    ></Button>
    <Button
      outlined
      severity="secondary"
      @click="handleReIssue(detailOutDoc?.id)"
      v-if="hasODAction(availableActions, 'RECREATE')"
      label="Trình lại"
    ></Button>
    <Button
      outlined
      severity="secondary"
      :loading="isSecretaryEvaluatingDoc"
      @click="secretaryEvaluateModalRef?.openModal()"
      v-if="hasODAction(availableActions, 'SECRETARY_EVALUATED')"
      label="Duyệt"
    ></Button>
    <Button
      outlined
      severity="secondary"
      @click="sendToUnitsRef?.openModal()"
      v-if="hasODAction(availableActions, 'SEND_DESTINATION')"
      label="Gửi đơn vị"
    ></Button>
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
      label="Thu hồi"
    ></Button>
    <!-- revoke after issue  -->
    <Button
      outlined
      severity="secondary"
      @click="revokeAfterIssueModalRef?.openModal()"
      v-if="hasODAction(availableActions, 'REVOKE')"
      label="Thu hồi"
    ></Button>
    <!-- revoke after issue  -->
    <Button
      outlined
      severity="secondary"
      @click="handleConfirmDeleteDoc()"
      :loading="isDeletingDoc"
      v-if="hasODAction(availableActions, 'DELETE')"
      label="Xoá văn bản"
    ></Button>
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
          if (
            selectedSignMethod?.signingProvider !== SIGN_PROVIDER_VALUES.usb &&
            detailOutDoc?.documentStatus === OUT_DOC_STATUS_VALUES.waitingIssuanceSignature
          )
            return confirmSignWithPublicSignature()
          else if (hasODAction(availableActions, 'SIGN_WITH_MESSAGE')) {
            confirmSignWithMessage()
          } else handleSignOutDoc()
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
    <SplitButton
      class="custom-split-button"
      :model="unitSignProviders"
      label="Cấp số"
      severity="primary"
      outlined
      :disabled="!selectedAllocateMethod || isLoadingIssueUnit || isAllocating"
      :button-props="{
        class: 'bg-primary! text-white!'
      }"
      @click="
        () => {
          if (selectedAllocateMethod) emit('submitAllocate', selectedAllocateMethod)
        }
      "
      v-if="hasODAction(availableActions, 'ISSUED')"
    >
      <template #dropdownicon>
        <div
          v-if="selectedAllocateMethod !== undefined"
          class="flex items-center gap-2 font-semibold"
        >
          {{ SIGN_PROVIDER_LABEL?.[selectedAllocateMethod?.signingProvider] }}
          <span class="icon-[oui--arrow-down]"></span>
        </div>
        <div v-else class="flex items-center gap-2 font-semibold">Không có phương thức</div>
      </template>
    </SplitButton>
    <SplitButton
      class="custom-split-button"
      :model="unitSignProviders"
      label="Đóng dấu"
      severity="primary"
      outlined
      :disabled="!selectedAllocateMethod || isLoadingIssueUnit || isAllocating"
      :button-props="{
        class: 'bg-primary! text-white!'
      }"
      @click="
        () => {
          if (
            selectedSignMethod?.signingProvider !== SIGN_PROVIDER_VALUES.usb &&
            detailOutDoc?.documentStatus === OUT_DOC_STATUS_VALUES.waitingJointStamp
          )
            return confirmStampWithPublicSignature()
          handlePreview()
        }
      "
      v-if="hasODAction(availableActions, 'STAMP')"
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
      :document-id="detailOutDoc?.id"
      ref="revokeAfterIssueModalRef"
      @revoked-doc="emit('documentProcessed')"
      v-if="hasODAction(availableActions, 'REVOKE')"
    />
    <ConfirmDialog
      group="confirmStampWithPublicSignature"
      class="w-[600px]"
      v-if="hasODAction(availableActions, 'STAMP')"
    >
      <template #message>
        <div>
          <div class="text-primary font-bold">
            Thầy/Cô đang sử dụng chữ ký số nội bộ
            {{ SIGN_PROVIDER_LABEL?.[selectedAllocateMethod?.signingProvider!] }} để đóng dấu văn
            bản đi!
          </div>
          <div class="font-bold">Thầy/Cô xác nhận sử dụng loại chữ ký này?</div>
        </div>
      </template>
    </ConfirmDialog>
    <ConfirmDialog
      group="confirmSignWithPublicSignature"
      class="w-[600px]"
      v-if="
        hasODAction(availableActions, 'SIGN') || hasODAction(availableActions, 'SIGN_WITH_MESSAGE')
      "
    >
      <template #message>
        <div>
          <div class="text-primary font-bold">
            Thầy/Cô đang sử dụng chữ ký số nội bộ
            {{ SIGN_PROVIDER_LABEL?.[selectedSignMethod?.signingProvider!] }} để ban hành văn bản
            đi!
          </div>
          <div class="font-bold">Thầy/Cô xác nhận sử dụng loại chữ ký này?</div>
          <div v-if="hasODAction(availableActions, 'SIGN_WITH_MESSAGE')">
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
        </div>
      </template>
    </ConfirmDialog>
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
        hasODAction(availableActions, 'SECRETARY_EVALUATED') ||
        hasODAction(availableActions, 'STAMP')
      "
      :isViewonly="hasODAction(availableActions, 'STAMP') ? false : true"
      @confirm-register="handleStampOutDoc"
      ref="previewModalDoc"
    />
    <ModalSendDocToUnits
      v-if="hasODAction(availableActions, 'SEND_DESTINATION')"
      :detailDocument="detailOutDoc"
      @sentUnits="emit('documentProcessed')"
      ref="sendToUnitsRef"
    />

    <ModalPrintDoc v-if="detailOutDoc" :detail-out-doc="detailOutDoc" ref="modalPrintDocRef" />
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
