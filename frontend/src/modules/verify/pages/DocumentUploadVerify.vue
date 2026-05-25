<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { PDF_FILE_TYPE } from '@/shared/constants/document'
import { toastError } from '@/shared/utils/common'
import { useDropZone } from '@vueuse/core'
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primevue'
import { computed, ref, watch } from 'vue'
import { useGetSignaturesInDoc } from '../composables/queries/useGetSignaturesInDoc'

//type các file verify
const file = ref<File>()
const dropZoneRef = ref<HTMLDivElement>()
const openedItems = ref<string[]>([])
const VERIFICATION_STATUS = {
  VALID: 'VALID',
  VALID_BUT_HAS_ISSUES: 'VALID_BUT_HAS_ISSUES',
  INVALID: 'INVALID'
} as const
const {
  data: listCerts,
  error: getListCertsError,
  isLoading: isLoadingListCerts
} = useGetSignaturesInDoc(() => file.value!, { enabled: () => !!file.value })

//
const isTrusted = (certificate) =>
  certificate?.certDetails?.length == 1 && certificate?.verifyCertsChainErrors?.length == 0
const isRevoked = (certificate) => {
  if (isTrusted(certificate)) return false
  if (certificate?.revocationsOK.length >= 1) return false
  return true
}

const docVerificationStatus = computed(() => {
  const isModified = !!listCerts?.value?.find((certificate) => !certificate?.integrity?.integrity)
  const isHasIssues = !!listCerts?.value?.find(
    (certificate) =>
      !!certificate?.certDetails?.find(
        (certDetail) => certDetail?.certStatusSigningTime !== 'VALID'
      ) ||
      certificate?.verifyCertsChainErrors?.length ||
      isRevoked(certificate)
  )
  if (isModified) return VERIFICATION_STATUS.INVALID
  else if (isHasIssues) return VERIFICATION_STATUS.VALID_BUT_HAS_ISSUES
  return VERIFICATION_STATUS.VALID
})

const getDigitalCertificateErrs = (certificate) => {
  const errList = []
  const notValidCertDetail = certificate?.certDetails?.find(
    (certDetail) => certDetail?.certStatusSigningTime !== 'VALID'
  )
  if (notValidCertDetail)
    errList.push(
      notValidCertDetail?.certStatusSigningTime === 'NOT_VALID_YET'
        ? 'chứng thư chưa được kích hoạt tại thời điểm ký'
        : 'chứng thư đã hết hạn khi ký'
    )
  if (certificate?.verifyCertsChainErrors?.length) {
    errList.push('chưa xác minh được người cấp chứng thư')
  }
  if (isRevoked(certificate)) errList.push('chưa kiểm tra được trạng thái thu hồi của chứng thư')
  return errList
}

function getCnNameFromDn(dn) {
  const match = dn.match(/CN=((?:[^\\,]|\\,)+)/)
  if (match) {
    return match[1].replace(/\\/g, '') // Remove escape characters
  }
  return null
}

const getNameAndEmail = (certCn) => {
  const matchValue = certCn.match(/(.*?)\s*<(.+?)>/)
  return matchValue
    ? {
        name: matchValue[1],
        email: matchValue[2]
      }
    : { name: certCn }
}

const checkValidationOfSignature = (certificate) => {
  if (certificate?.integrity?.integrity) {
    if (
      certificate?.verifyCertsChainErrors?.length ||
      isRevoked(certificate) ||
      !!(certificate?.certDetails ?? []).find(
        (certDetail) => certDetail?.certStatusSigningTime !== 'VALID'
      )
    )
      return VERIFICATION_STATUS.VALID_BUT_HAS_ISSUES
    return VERIFICATION_STATUS.VALID
  }
  return VERIFICATION_STATUS.INVALID
}
//
const handleImportDocument = (files: File[] | null) => {
  const dropFile = files?.[0]
  if (!dropFile) {
    return
  }
  file.value = dropFile
}

const handleChangeAttachmentFile = (selectedFile: File | null) => {
  if (!selectedFile) {
    return
  }
  file.value = selectedFile
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: handleImportDocument,
  // specify the types of data to be received.
  dataTypes: [PDF_FILE_TYPE],
  // control multi-file drop
  multiple: false,
  // whether to prevent default behavior for unhandled events
  preventDefaultForUnhandled: false
})

watch(getListCertsError, (error) => {
  if (error) {
    toastError({
      detail: error?.message ?? 'Có lỗi khi lấy thông tin chữ ký số trong tài liệu'
    })
  }
})
</script>
<template>
  <div
    class="flex h-screen w-full flex-col overflow-auto px-4 py-6 md:px-6 xl:mx-auto xl:w-3/4 xl:px-8"
  >
    <h3
      class="text-primary text:lg mb-6 w-full text-center text-xl font-semibold md:text-2xl xl:text-3xl"
    >
      Kiểm tra chữ ký số trong văn bản
    </h3>
    <div
      class="flex flex-1 flex-col-reverse gap-6 md:h-full md:max-h-[calc(100vh_-_120px)] md:flex-col xl:flex-row"
    >
      <div v-if="file" class="flex h-full w-full">
        <PdfViewer
          class="border-shadow md:max-h-auto max-h-[calc(100vh_-_120px)] w-full flex-1 overflow-auto md:h-full"
          container-class=" shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
          :src="file"
        />
      </div>
      <AppFileInput
        v-else
        :accept="PDF_FILE_TYPE"
        name="file"
        :multiple="false"
        @change="handleChangeAttachmentFile"
      >
        <template #trigger-element="{ triggerFunction }">
          <div
            class="hover:border-primary flex h-[calc(100vh_-_120px)] w-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-all"
            :class="{
              'border-primary': isOverDropZone
            }"
            ref="dropZoneRef"
            @click="triggerFunction"
          >
            <span class="text-primary text-center"
              >Kéo thả hoặc bấm để chọn file văn bản tải lên</span
            >
          </div>
        </template>
      </AppFileInput>
      <div
        class="card mt-4 flex h-fit min-h-50 w-full shrink-0 flex-col overflow-auto xl:mt-0 xl:h-full xl:w-[450px]"
      >
        <div class="text-primary mb-4 w-full text-center text-xl font-semibold sm:text-2xl">
          Thông tin chữ ký số
        </div>
        <div class="flex h-full items-center justify-center" v-if="isLoadingListCerts">
          <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
        </div>
        <div class="flex h-full items-center justify-center" v-else-if="!file">
          <div class="flex flex-col items-center justify-center p-4">
            <span class="icon-[mdi--flask-empty-remove-outline] text-5xl text-gray-400"></span>
            <span class="text-secondary font-semibold">Không có dữ liệu</span>
          </div>
        </div>
        <div class=":xl:max-h-full max-h-120 overflow-auto" v-else-if="listCerts?.length">
          <div class="flex items-start gap-2.5">
            <div>
              <span
                v-if="docVerificationStatus === VERIFICATION_STATUS?.INVALID"
                class="icon-[solar--close-circle-linear] h-5 w-5 text-red-500"
              ></span>
              <span
                v-if="docVerificationStatus === VERIFICATION_STATUS?.VALID_BUT_HAS_ISSUES"
                class="icon-[solar--warning-circle-linear] h-5 w-5 text-orange-500"
              ></span>
              <span
                v-if="docVerificationStatus === VERIFICATION_STATUS?.VALID"
                class="icon-[solar--check-circle-linear] h-5 w-5 text-green-500"
              ></span>
            </div>
            <div class="mb-6">
              <div
                v-if="docVerificationStatus === VERIFICATION_STATUS?.VALID"
                class="text-primary font-semibold"
              >
                Văn bản được ký số và tất cả chữ ký số đều hợp lệ.
              </div>
              <template v-else>
                <div class="text-primary font-semibold">
                  Văn bản này được ký số, tuy nhiên ít nhất một chữ ký số có vấn đề.
                </div>
                <div>
                  Người dùng có thể kiểm tra lại với phần mềm Acrobat Reader (
                  <a
                    class="text-primary font-bold underline"
                    href="https://get.adobe.com/reader/"
                    target="_blank"
                    rel="noreferrer"
                    >Tải phần mềm</a
                  >
                  ).
                </div>
              </template>
            </div>
          </div>
          <div>
            <div class="mb-2 text-center text-lg font-semibold sm:text-xl xl:text-2xl">
              Danh sách chữ ký số
            </div>
            <div class="flex flex-col gap-2">
              <Accordion
                :pt="{
                  headerLink: {
                    class: 'flex-row-reverse justify-end gap-2'
                  }
                }"
                multiple
                expandIcon="pi pi-plus"
                collapseIcon="pi pi-minus"
              >
                <AccordionPanel
                  class="w-full"
                  v-for="(certificate, index) in listCerts ?? []"
                  :key="index"
                  :value="index.toString()"
                >
                  <AccordionHeader class="p-3!">
                    <div class="flex w-full items-center gap-2 truncate">
                      <span
                        v-if="
                          checkValidationOfSignature(certificate) === VERIFICATION_STATUS?.INVALID
                        "
                        class="icon-[solar--close-circle-linear] h-5 w-5 text-red-500"
                      ></span>
                      <span
                        v-if="
                          checkValidationOfSignature(certificate) ===
                          VERIFICATION_STATUS?.VALID_BUT_HAS_ISSUES
                        "
                        class="icon-[solar--warning-circle-linear] h-5 w-5 text-orange-500"
                      ></span>
                      <span
                        v-if="
                          checkValidationOfSignature(certificate) === VERIFICATION_STATUS?.VALID
                        "
                        class="icon-[solar--check-circle-linear] h-5 w-5 text-green-500"
                      ></span>
                      <span class="truncate font-bold whitespace-nowrap"
                        >Chữ ký {{ `${Number(index) + 1}` }}:
                        {{ getNameAndEmail(certificate?.cert?.cn)?.name }}</span
                      >
                    </div>
                  </AccordionHeader>
                  <AccordionContent
                    class="w-full overflow-hidden"
                    :pt="{ contentWrapper: { class: 'w-full' } }"
                  >
                    <div>
                      <span className="font-semibold">Thời gian ký: </span>
                      {{ certificate?.time?.signTime }}
                    </div>
                    <div>
                      <span className="font-semibold">Tính toàn vẹn: </span>
                      <span>
                        {{
                          certificate?.integrity?.integrity
                            ? 'Không bị chỉnh sửa sau khi ký '
                            : 'Đã bị chỉnh sửa sau khi ký '
                        }}
                      </span>

                      <span
                        v-if="certificate?.integrity?.integrity"
                        class="icon-[solar--check-circle-linear] inline-flex h-5 w-5 items-center align-middle text-green-500"
                      ></span>

                      <span
                        v-else
                        class="icon-[solar--close-circle-linear] inline-flex h-5 w-5 items-center align-middle text-red-500"
                      ></span>
                    </div>
                    <div>
                      <span className="font-semibold">Chứng thư số: </span>
                      <span>
                        {{
                          !certificate?.verifyCertsChainErrors?.length &&
                          !isRevoked(certificate) &&
                          certificate?.certDetails?.every(
                            (certDetail) => certDetail?.certStatusSigningTime === 'VALID'
                          )
                            ? 'Hợp lệ '
                            : `Có vấn đề (${getDigitalCertificateErrs(certificate)?.join(', ')})  `
                        }}
                      </span>
                      <span>
                        <span
                          v-if="
                            !certificate?.verifyCertsChainErrors?.length &&
                            !isRevoked(certificate) &&
                            certificate?.certDetails?.every(
                              (certDetail) => certDetail?.certStatusSigningTime === 'VALID'
                            )
                          "
                          class="icon-[solar--check-circle-linear] inline-flex h-5 w-5 items-center align-middle text-green-500"
                        ></span>
                        <span
                          v-else
                          class="icon-[solar--warning-circle-linear] inline-flex h-5 w-5 items-center align-middle text-orange-500"
                        ></span>
                      </span>
                    </div>
                    <Accordion
                      v-for="(certDetail, idx) in certificate?.certDetails"
                      :key="idx"
                      multiple
                      expandIcon="pi pi-plus"
                      collapseIcon="pi pi-minus"
                      :pt="{
                        root: { class: 'border-0' },
                        header: { class: 'border-0' },
                        content: { class: 'border-0' }
                      }"
                    >
                      <AccordionPanel :value="certDetail + idx" class="border-0!">
                        <AccordionHeader class="border-0 p-0! text-(--text-color)!">
                          <span class="w-full">
                            <span className="font-semibold">
                              {{
                                index === 0
                                  ? 'Người ký'
                                  : index === 1
                                    ? 'Đơn vị cấp chứng thư số'
                                    : 'Đơn vị cấp chứng thư gốc'
                              }}
                              :{{ ' ' }}
                              {{ getCnNameFromDn(certDetail?.subjectDN) }}
                            </span>
                          </span>
                        </AccordionHeader>
                        <AccordionContent class="w-full">
                          <ul>
                            <li>
                              <span className="font-semibold">Serial number: </span>
                              <span className="wrap-anywhere">{{ certDetail?.serialNumber }}</span>
                            </li>
                            <li v-if="certificate?.certDetails?.length === 1">
                              <span className="font-semibold">Cấp bởi: </span>
                              <span className="wrap-anywhere">
                                {{ getCnNameFromDn(certDetail?.issuerDN) }}
                              </span>
                            </li>

                            <li>
                              <span className="font-semibold">Trạng thái khi ký: </span>
                              <span className="wrap-anywhere">
                                {{
                                  certDetail?.certStatusSigningTime === 'VALID'
                                    ? 'Hợp lệ'
                                    : certDetail?.certStatusSigningTime === 'NOT_VALID_YET'
                                      ? 'Chưa kích hoạt'
                                      : 'Hết hạn'
                                }}
                              </span>
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionPanel>
                    </Accordion>
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>
            </div>
          </div>
        </div>
        <div class="flex h-full items-center justify-center" v-else>
          <div class="flex flex-col items-center justify-center p-4">
            <span class="icon-[mdi--flask-empty-remove-outline] text-5xl text-gray-400"></span>
            <span class="text-secondary font-semibold">Văn bản này không có chữ ký số</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
