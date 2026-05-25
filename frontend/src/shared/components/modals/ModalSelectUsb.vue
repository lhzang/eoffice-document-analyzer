<script setup lang="ts">
import { useSignatureImages } from '@/modules/esign/composables/esign-image/useGetSignatureImage'
import { useCompleteUsbSign } from '@/shared/composables/queries/usb-sign/useCompleteUsbSign'
import { useGetUSBAlliases } from '@/shared/composables/queries/usb-sign/useGetUSBAlliases'
import { useUpdateAliasDisplay } from '@/shared/composables/queries/usb-sign/useUpdateAliasDisplay'
import { IMAGE_AND_TEXT_ALIGN, SIGNATURE_IMAGE_TYPES, USB_SIGN_TYPES } from '@/shared/constants/usb'
import type {
  TUsbAlias,
  TUsbSignsNoti,
  TVisibleImageAndTextSign,
  TVisibleMultipleSign,
  TVisibleWithImageSign,
  TVisibleWithTextSign
} from '@/shared/models/usb.types'
import usbService from '@/shared/services/usb-services/usb.service'
import {
  createFileFromUrl,
  getFullFileUrl,
  notifyError,
  toastError,
  toastSucceed
} from '@/shared/utils/common'
import { Button, InputText } from 'primevue'
import { computed, ref, watch } from 'vue'
import AppModal from './AppModal.vue'
const isVisible = ref(false)
const isLoadingSign = ref(false)
const signNoti = ref<TUsbSignsNoti | null>(null)
const selectedAlias = ref<TUsbAlias | null>(null)
const editingAlias = ref<TUsbAlias | null>(null)
const newAliasName = ref<string | null>(null)

const needFetchSignerId = computed(() => {
  if (
    signNoti?.value?.typeSign === USB_SIGN_TYPES?.visibleWithText ||
    signNoti?.value?.typeSign === USB_SIGN_TYPES?.visibleWithImage ||
    (signNoti?.value?.typeSign === USB_SIGN_TYPES?.visibleWithImageAndText &&
      signNoti?.value?.mode === IMAGE_AND_TEXT_ALIGN?.vertical)
  ) {
    return signNoti?.value?.signerId
  }
  return null
})

const { data: signatureImages, error: getImageError } = useSignatureImages(
  () => needFetchSignerId?.value!,
  {
    enabled: () => !!needFetchSignerId.value
  }
)

const {
  data: aliases,
  isLoading,
  refetch
} = useGetUSBAlliases({
  enabled: () => !!isVisible?.value
})

const getSignatureImageFile = async () => {
  try {
    if (signNoti?.value?.typeSign === USB_SIGN_TYPES.multiSign) return null
    const type = signNoti?.value?.signatureImageType
    const url =
      type === SIGNATURE_IMAGE_TYPES.major
        ? signatureImages?.value?.major?.url
        : type === SIGNATURE_IMAGE_TYPES.minor
          ? signatureImages?.value?.minor?.url
          : undefined

    if (!url) return null

    const res = await fetch(url)
    if (!res.ok) throw new Error('Fetch failed')

    const blob = await res.blob()
    return new File([blob], 'anh_chu_ky', { type: blob.type })
  } catch (e) {
    console.log(e)
  }
}

const { mutate: updateAlias, isPending: isUpdatingAlias } = useUpdateAliasDisplay({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật thông tin USB thành công'
    })
    refetch()
    handleCancelEditAlias()
  }
})

const { mutateAsync: completeSignUsb } = useCompleteUsbSign({
  onSuccess: () => {
    toastSucceed({ detail: 'Ký USB thành công' })
  }
})

const handleReset = () => {
  selectedAlias.value = null
  signNoti.value = null
  isLoadingSign.value = false
  editingAlias.value = null
  newAliasName.value = null
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) handleReset()
}

const handleSignMultiple = async () => {
  if (!signNoti?.value || !selectedAlias.value?.alias) return
  const signNotiValue = signNoti?.value as TVisibleMultipleSign
  const pdfFile = await createFileFromUrl(getFullFileUrl(signNoti?.value?.file))
  return await usbService.signMultiple({
    alias: selectedAlias?.value?.alias,
    pdfFile: pdfFile,
    placeholders: signNotiValue?.placeholders
  })
}

const handleSignText = async () => {
  if (!signNoti?.value || !selectedAlias.value?.alias) return
  const signNotiValue = signNoti?.value as TVisibleWithTextSign
  const pdfFile = await createFileFromUrl(getFullFileUrl(signNoti?.value?.file))
  return await usbService.signVisibleWithText({
    alias: selectedAlias?.value?.alias,
    pdfFile: pdfFile,
    text: signNotiValue?.text,
    options: signNotiValue?.options,
    placeholder: signNotiValue?.placeholder
  })
}

const handleSignImageAndText = async () => {
  if (!signNoti?.value || !selectedAlias.value?.alias) return
  const signNotiValue = signNoti?.value as TVisibleImageAndTextSign
  const pdfFile = await createFileFromUrl(getFullFileUrl(signNoti?.value?.file))
  if (signNotiValue?.mode === IMAGE_AND_TEXT_ALIGN.horizontal) {
    const image = await createFileFromUrl(getFullFileUrl(signNotiValue?.image))
    if (image) {
      return await usbService.signVisibleImageLeftTextRight({
        alias: selectedAlias?.value?.alias,
        pdfFile: pdfFile,
        imageFile: image,
        text: signNotiValue?.text,
        options: signNotiValue?.options,
        placeholder: signNotiValue?.placeholder
      })
    }
  } else {
    const image = await getSignatureImageFile()
    if (image) {
      return await usbService.signVisibleImageBelowTextAbove({
        alias: selectedAlias?.value?.alias,
        pdfFile: pdfFile,
        imageFile: image,
        text: signNotiValue?.text,
        options: signNotiValue?.options,
        placeholder: signNotiValue?.placeholder
      })
    }
  }
}

const handleSignImage = async () => {
  if (!signNoti?.value || !selectedAlias.value?.alias) return
  const signNotiValue = signNoti?.value as TVisibleWithImageSign
  const pdfFile = await createFileFromUrl(getFullFileUrl(signNoti?.value?.file))
  console.log(pdfFile, 'pdfFile1')
  const image = await getSignatureImageFile()
  console.log(image, 'pdfFile2')

  if (image) {
    console.log(pdfFile, '')

    return await usbService.signVisibleWithImage({
      alias: selectedAlias?.value?.alias,
      pdfFile: pdfFile,
      imageFile: image,
      // options: signNotiValue?.options,
      placeholder: signNotiValue?.placeholder
    })
  }
}

const handleSelectUsb = async () => {
  try {
    isLoadingSign.value = true
    if (selectedAlias?.value) {
      let buffer: ArrayBuffer | undefined
      if (signNoti?.value?.typeSign === USB_SIGN_TYPES?.multiSign) {
        buffer = await handleSignMultiple()
      } else if (signNoti?.value?.typeSign === USB_SIGN_TYPES?.visibleWithText) {
        buffer = await handleSignText()
      } else if (signNoti?.value?.typeSign === USB_SIGN_TYPES?.visibleWithImage) {
        buffer = await handleSignImage()
      } else if (signNoti?.value?.typeSign === USB_SIGN_TYPES?.visibleWithImageAndText) {
        buffer = await handleSignImageAndText()
      }
      if (buffer && signNoti?.value?.correlationId) {
        const file = new File([buffer], 'signed.pdf', {
          type: 'application/pdf'
        })

        await completeSignUsb({
          correlationId: signNoti?.value?.correlationId,
          file: file
        })
        isVisible.value = false
      }
    } else {
      toastError({
        summary: 'Chưa chọn USB token',
        detail: 'Thầy/Cô cần chọn USB token trước khi xác nhận'
      })
    }
  } catch (e) {
    console.log(e)
    toastError({ detail: e?.message ?? 'Có lỗi xảy ra khi ký usb' })
  } finally {
    isLoadingSign.value = false
  }
}

const handleSelectEditAlias = (alias: TUsbAlias) => {
  editingAlias.value = alias
  newAliasName.value = alias.name ?? alias?.alias
}

const handleCancelEditAlias = () => {
  editingAlias.value = null
  newAliasName.value = null
}

const handleConfirmEditAlias = () => {
  if (editingAlias?.value && newAliasName.value) {
    updateAlias({
      alias: editingAlias.value.alias,
      name: newAliasName.value
    })
  } else {
    toastError({
      summary: 'Chưa nhập tên USB token',
      detail: 'Thầy/Cô cần nhập tên USB token trước khi xác nhận'
    })
  }
}

const isNoAvailableSignImage = computed(() => {
  if (signNoti?.value?.typeSign === USB_SIGN_TYPES?.multiSign) return false
  if (
    signNoti?.value?.typeSign === USB_SIGN_TYPES?.visibleWithImageAndText &&
    signNoti?.value?.mode === IMAGE_AND_TEXT_ALIGN.horizontal
  ) {
    if (!signNoti?.value?.image) {
      toastError({ detail: 'Đã có lỗi xảy ra khi lấy thông tin ảnh để ký' })
      return true
    }
    return false
  }
  if (
    !signatureImages?.value ||
    !signNoti?.value ||
    (!signatureImages?.value.major &&
      signNoti?.value?.signatureImageType === SIGNATURE_IMAGE_TYPES?.major) ||
    (!signatureImages?.value.minor &&
      signNoti?.value?.signatureImageType === SIGNATURE_IMAGE_TYPES?.minor)
  )
    return true
  return false
})

defineExpose({
  openModal: (noti: TUsbSignsNoti) => {
    signNoti.value = noti
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})

watch(getImageError, (val) => {
  if (val) {
    notifyError(val, 'Đã có lỗi khi lấy ảnh chữ ký')
  }
})

watch(getImageError, (val) => {
  if (val) {
    notifyError(val, 'Đã có lỗi khi lấy ảnh chữ ký')
  }
})

watch([signatureImages, signNoti], ([signatureImages, signNoti]) => {
  if (!signatureImages || !signNoti || signNoti?.typeSign === USB_SIGN_TYPES?.multiSign) return
  if (
    (!signatureImages.major?.url &&
      signNoti?.signatureImageType === SIGNATURE_IMAGE_TYPES?.major) ||
    (!signatureImages.minor?.url && signNoti?.signatureImageType === SIGNATURE_IMAGE_TYPES?.minor)
  ) {
    toastError({ detail: 'Đơn vị/Người dùng không có ảnh chữ ký' })
  }
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    @update:visible="handleVisibleChange"
    :wrapper-style="{ minWidth: '500px' }"
    title="Ký số USB"
    :closeWhenClickOutside="false"
  >
    <div>
      <Button
        class="mb-4 w-full"
        label="Cập nhật danh sách USB"
        @click="refetch()"
        :loading="isLoading"
      />
      <div v-if="isLoading" class="flex h-40 items-center justify-center">
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>

      <div
        v-else-if="aliases && aliases.length > 0"
        class="flex h-40 cursor-pointer flex-col gap-2 overflow-auto"
      >
        <div class="flex items-center gap-2" v-for="alias in aliases" :key="alias?.alias">
          <div
            class="hover:text-primary flex flex-1 items-center gap-2 rounded border-2 border-gray-200 px-(--p-form-field-padding-x) py-(--p-form-field-padding-y) font-semibold transition-all"
            :class="{
              'border-primary': selectedAlias?.alias === alias?.alias,
              'hover:border-primary-200': selectedAlias?.alias !== alias?.alias
            }"
            @click="selectedAlias = alias"
          >
            <span class="text-primary">USB:</span>
            <InputText
              class="w-full border-none! bg-transparent! p-0! shadow-none!"
              v-if="alias === editingAlias"
              v-model="newAliasName"
              @keypress.enter.stop="handleConfirmEditAlias"
            />
            <span v-else>{{ alias?.name ?? alias?.alias }}</span>
          </div>

          <div v-if="alias === editingAlias" class="flex items-center gap-2">
            <Button
              class="h-8! w-8!"
              icon="pi pi-times"
              severity="danger"
              variant="outlined"
              :loading="isUpdatingAlias"
              @click="handleCancelEditAlias"
            />
            <Button
              class="h-8! w-8!"
              icon="pi pi-check"
              severity="success"
              variant="outlined"
              :loading="isUpdatingAlias"
              @click="handleConfirmEditAlias"
            />
          </div>
          <Button
            v-else
            class="h-8! w-8!"
            icon="pi pi-pencil"
            severity="primary"
            variant="outlined"
            :loading="isUpdatingAlias"
            @click="handleSelectEditAlias(alias)"
          />
        </div>
      </div>

      <div v-else class="flex h-[200px] flex-col items-center justify-center gap-2 text-red-500">
        <span class="icon-[bx--error] text-5xl"></span>
        <span class="font-medium">Không tìm thấy USB token</span>
        <span class="font-medium"
          >Thầy/Cô cần kiểm tra kết nối, hạn chứng thư của USB và bật plugin</span
        >
      </div>
      <div class="mt-2 flex h-10 items-center justify-end gap-2">
        <Button
          class="min-w-[100px]"
          label="Huỷ"
          severity="secondary"
          variant="outlined"
          @click="isVisible = false"
        />
        <Button
          class="min-w-[100px]"
          label="Xác nhận"
          severity="primary"
          :loading="isLoading || isLoadingSign"
          :disabled="isNoAvailableSignImage"
          @click="handleSelectUsb"
        />
      </div>
    </div>
  </AppModal>
</template>
