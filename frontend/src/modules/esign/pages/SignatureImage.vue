<script setup lang="ts">
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { cleanObject, toastError, toastSucceed } from '@/shared/utils/common'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { Button, ConfirmDialog, Divider, useConfirm } from 'primevue'
import { nextTick, ref, watch } from 'vue'
import ReadonlySignatureCard from '../components/ReadonlySignatureCard.vue'
import SignatureCard from '../components/SignatureCard.vue'
import { useSignatureImages } from '../composables/esign-image/useGetSignatureImage'
import { useUploadMultipleSignatureImages } from '../composables/esign-image/useUploadMultipleSignatureImages'
import type { TSignatureImageData } from '../model/signatureimg'
import { esignService } from '../services/esignImageService'

const showFull = ref(true)
const isExpandable = ref(false)
const cardContentRef = ref<HTMLElement | null>(null)

const user = useUserProfileStore().user

const majorSignature = ref<TSignatureImageData>()
const minorSignature = ref<TSignatureImageData>()

const queryClient = useQueryClient()

const confirm = useConfirm()

const { data: dataRegulation, isLoading: isGettingRegulation } = useQuery({
  queryKey: ['signature-upload-guide'],
  queryFn: () => esignService.getSignatureUploadGuide()
})

const {
  data: signatureImages,
  isLoading: isGetttingImages,
  isSuccess: isGetImagesSucess
} = useSignatureImages(() => user?.username!, {
  enabled: () => !!user?.username
})

const { mutate: uploadSignatureImage, isPending: isUploadSignatureImage } =
  useUploadMultipleSignatureImages({
    onSuccess: (messages) => {
      messages.forEach((msg) => {
        if (msg.status === 'success')
          toastSucceed({
            detail: msg.content
          })
        else {
          toastError({
            detail: msg.content
          })
        }
      })
      queryClient.invalidateQueries({ queryKey: ['get-signature-images'] })
    }
  })

const showConfirmUpload = () => {
  confirm.require({
    group: 'confirmUpdate',
    message: 'Thầy/Cô có xác nhận cập nhật ảnh chữ ký?',
    header: 'Cập nhật ảnh chữ ký',
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
      if (user?.username) {
        console.log(majorSignature.value, minorSignature.value, 'minorSignature')
        uploadSignatureImage(
          cleanObject({
            major: majorSignature.value?.file,
            minor: minorSignature.value?.file,
            accountId: user?.username
          })
        )
      }
    }
  })
}

watch([signatureImages, isGetImagesSucess], ([signatureImagesValue, isSuccess]) => {
  if (isSuccess) {
    if (signatureImagesValue?.major)
      majorSignature.value = {
        url: signatureImagesValue?.major?.url
      }
    if (signatureImagesValue?.minor)
      minorSignature.value = {
        url: signatureImagesValue?.minor?.url
      }
  }
})

watch(
  () => dataRegulation.value,
  () => {
    nextTick(() => {
      const el = cardContentRef.value
      if (el && el.scrollHeight > 90) {
        showFull.value = false
        isExpandable.value = true
      } else {
        isExpandable.value = false
      }
    })
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <div class="rounded-xl border border-gray-200 bg-white p-4 text-gray-800">
      <div class="text-primary-emphasis-alt font-semibold">Quy định về ảnh chữ ký:</div>
      <Divider class="my-2" />

      <div
        ref="cardContentRef"
        :class="[
          !showFull ? 'max-h-[90px] overflow-hidden' : '',
          'transition-all duration-300 ease-in-out'
        ]"
        class="flex-1"
      >
        <div
          v-if="isGettingRegulation"
          class="bg-opacity-90 absolute inset-0 z-10 flex items-center justify-center bg-white"
        >
          <span
            class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-4xl"
          ></span>
        </div>
        <div v-else v-html="dataRegulation" class="flex w-full flex-col items-start gap-3" />
      </div>

      <template v-if="!isGettingRegulation && isExpandable">
        <Divider class="my-4" />
        <div class="flex justify-center">
          <button
            class="text-secondary flex items-center gap-2 hover:underline"
            @click="showFull = !showFull"
          >
            <i
              :class="showFull ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
              class="cursor-pointer"
            ></i>
          </button>
        </div>
      </template>
    </div>

    <div class="my-[30px] grid w-full grid-cols-1 items-start gap-[30px] sm:grid-cols-2">
      <SignatureCard
        label="Chữ ký chính"
        type="major"
        :savedImage="signatureImages?.major"
        v-model="majorSignature"
        :isGetImagesSucess
        :isLoading="isUploadSignatureImage || isGetttingImages"
      />
      <SignatureCard
        label="Chữ ký nháy"
        type="minor"
        :savedImage="signatureImages?.minor"
        v-model="minorSignature"
        :isGetImagesSucess
        :isLoading="isUploadSignatureImage || isGetttingImages"
      />
    </div>

    <div class="my-[30px] grid w-full grid-cols-1 items-start gap-[30px] sm:grid-cols-2">
      <ReadonlySignatureCard
        label="Chữ ký chính (Văn phòng Đại học lưu)"
        type="originalMajor"
        :url="signatureImages?.originalMajor?.url"
      />
      <ReadonlySignatureCard
        label="Chữ ký nháy (Văn phòng Đại học lưu)"
        type="originalMinor"
        :url="signatureImages?.originalMinor?.url"
      />
    </div>
    <div class="flex justify-end">
      <Button
        :disabled="
          !majorSignature?.url ||
          !minorSignature?.url ||
          (!!majorSignature?.url &&
            !!minorSignature?.url &&
            majorSignature?.url === signatureImages?.major?.url &&
            minorSignature?.url === signatureImages?.minor?.url)
        "
        :loading="isUploadSignatureImage || isGetttingImages"
        @click="showConfirmUpload"
        >Cập nhật</Button
      >
    </div>
    <ConfirmDialog group="confirmUpdate" />
  </div>
</template>
