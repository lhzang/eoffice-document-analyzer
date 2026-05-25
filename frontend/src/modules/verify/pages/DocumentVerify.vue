<script setup lang="ts">
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { ROUTE_PATHS } from '@/shared/constants/router'
import { Button } from 'primevue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGetPublicDoc } from '../composables/queries/useGetPublicDoc'
import { useGetSignaturesInDoc } from '../composables/queries/useGetSignaturesInDoc'

const route = useRoute()
const router = useRouter()

const isTrusted = (certificate) =>
  certificate?.certDetails?.length == 1 && certificate?.verifyCertsChainErrors?.length == 0
const isRevoked = (certificate) => {
  if (isTrusted(certificate)) return false
  if (certificate?.revocationsOK.length >= 1) return false
  return true
}

const isValid = computed(
  () =>
    (listCerts?.value ?? [])?.length &&
    (listCerts?.value ?? [])?.every(
      (certificate) =>
        certificate?.integrity?.integrity &&
        certificate?.certDetails?.every(
          (certDetail) => certDetail?.certStatusSigningTime === 'VALID'
        ) &&
        !certificate?.verifyCertsChainErrors?.length &&
        !isRevoked(certificate)
    )
)
const {
  data: documentFile,
  isLoading: isGettingDoc,
  error: getDocError
} = useGetPublicDoc(() => route.params.id as string, {
  enabled: !!route.params.id
})

const {
  data: listCerts,
  error: getListCertsError,
  isLoading: isLoadingListCerts
} = useGetSignaturesInDoc(() => documentFile.value!, { enabled: () => !!documentFile?.value })

const downloadFile = () => {
  if (!documentFile.value) return
  const url = URL.createObjectURL(documentFile.value)

  const a = document.createElement('a')
  a.href = url
  a.download = documentFile.value.name
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
<template>
  <div
    v-if="isGettingDoc || isLoadingListCerts"
    class="mt-10 flex h-full items-center justify-center"
  >
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div v-else-if="getDocError" class="mt-10 flex h-full items-center justify-center">
    <div class="text-primary text-justify text-xl">
      {{
        getDocError?.response?.data?.detail ??
        getDocError?.message ??
        'Có lỗi khi lấy thông tin văn bản'
      }}
    </div>
  </div>
  <div
    v-else-if="documentFile"
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
      <div class="flex h-full w-full">
        <PdfViewer
          class="border-shadow md:max-h-auto max-h-[calc(100vh_-_120px)] w-full flex-1 overflow-auto md:h-full"
          container-class=" shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
          :src="documentFile"
        />
      </div>
      <div class="py-4!">
        <div
          v-if="getListCertsError"
          class="mb-4 w-full text-center text-xl font-semibold text-red-500 sm:text-2xl"
        >
          Đã có lỗi trong quá trình xác thực chữ ký. Vui lòng thử lại sau!
        </div>
        <template v-else>
          <div
            v-if="isValid"
            class="mb-4 w-full text-center text-xl font-semibold text-blue-500 sm:text-2xl"
          >
            Văn bản này được phát hành bởi {{ listCerts[listCerts?.length - 1]?.cert?.cn }}
          </div>
          <div
            v-else
            class="text-primary mb-4 w-full text-center text-xl font-semibold sm:text-2xl"
          >
            Văn bản được ký số và có chữ ký số không hợp lệ
          </div>
          <div class="border-shadow mb-4 rounded-md p-4">
            <div class="text-primary mb-4 text-xl font-semibold sm:text-2xl">Lưu ý:</div>
            <div class="mb-4 flex items-start gap-2.5">
              <span class="icon-[jam--triangle-danger] text-primary h-5 w-5"></span>
              <span class="italic">Thầy/Cô đang xem văn bản gốc gắn với mã QR vừa truy cập</span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="icon-[jam--triangle-danger] text-primary h-5 w-5"></span>
              <span class="italic"
                >Thầy/Cô có thể upload file của mình
                <span
                  @click="router.push(ROUTE_PATHS.verify)"
                  class="text-primary cursor-pointer no-underline transition-all hover:underline"
                  >tại đây</span
                >
                để kiểm tra tính xác thực</span
              >
            </div>
          </div>
          <Button
            class="w-full sm:w-fit"
            severity="primary"
            variant="outlined"
            label="Tải xuống file văn bản"
            @click="downloadFile"
          ></Button>
        </template>
      </div>
    </div>
  </div>
</template>
