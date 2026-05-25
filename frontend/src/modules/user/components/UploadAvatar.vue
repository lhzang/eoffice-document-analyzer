<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { fetchImageWithAuth, getFullFileUrl, toastSucceed } from '@/shared/utils/common'
import { Button, Image } from 'primevue'
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload'
import { ref, watch } from 'vue'
import { CircleStencil, Cropper } from 'vue-advanced-cropper'
import { useChangeAvatar } from '../composables/useChangeAvatar'
import userService from '../services/userService'

const profileStore = useUserProfileStore()

const showConfirm = ref(false)
const previewImg = ref<string | null>(null)
const cropperRef = ref()
const avatarUrl = ref<string>()

function onSelect(event: FileUploadSelectEvent) {
  const file = event.files?.at(-1)
  if (file) {
    //clear old url
    if (previewImg?.value) URL.revokeObjectURL(previewImg.value)
    previewImg.value = URL.createObjectURL(file)
  }
}

const { mutate: changeAvatar, isPending: isChanggingAvatar } = useChangeAvatar({
  onSuccess: async () => {
    const res = await userService.getUser()
    profileStore.user = res
    toastSucceed({ detail: 'Đổi ảnh đại diện thành công' })
    showConfirm.value = false
  }
})

async function uploadImg() {
  const result = cropperRef.value?.getResult?.()
  if (!result?.canvas) return

  const file: File | null = await new Promise((resolve) => {
    result.canvas.toBlob((blob: Blob) => {
      if (!blob) return resolve(null)
      resolve(new File([blob], 'avatar.png', { type: blob.type }))
    }, 'image/png')
  })

  if (!file) return

  if (profileStore?.user?.id) {
    changeAvatar({
      accountId: profileStore.user.id,
      profilePic: file
    })
  }
}

watch(
  () => profileStore?.user?.profilePic,
  (newPic) => {
    if (!newPic) return
    const fullUrl = getFullFileUrl(newPic)
    fetchImageWithAuth(fullUrl).then((url) => {
      if (avatarUrl?.value) URL.revokeObjectURL(avatarUrl.value)
      avatarUrl.value = url
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="px-15">
    <div class="relative w-full">
      <div class="relative h-20 w-full overflow-hidden sm:h-24 md:h-26 lg:h-28">
        <img
          src="@/assets/images/user-background.png"
          alt="bg"
          class="h-full w-full object-cover"
        />
      </div>

      <div
        class="absolute -bottom-12 left-1/2 z-10 h-24 w-24 -translate-x-1/2 transform cursor-pointer sm:-bottom-14 sm:h-28 sm:w-28 md:-bottom-16 md:h-32 md:w-32 lg:-bottom-18 lg:h-36 lg:w-36"
        @click="
          () => {
            showConfirm = true
            previewImg = null
          }
        "
      >
        <div class="h-full w-full overflow-hidden rounded-full border-4 border-white shadow-lg">
          <Image :src="avatarUrl" imageClass="w-full h-full object-cover rounded-full" />
        </div>
        <div
          class="absolute right-1 -bottom-1 z-20 flex h-6 w-6 items-center justify-center truncate rounded-full transition sm:h-7 sm:w-7"
        >
          <i
            class="icon-[solar--camera-bold] bg-black text-base text-white md:text-lg lg:text-xl"
          />
        </div>
      </div>
      <AppModal
        :wrapper-style="{ width: '90%', maxWidth: '450px', margin: '0 3rem' }"
        v-model:visible="showConfirm"
        title="Cập nhật ảnh đại diện"
      >
        <div class="flex flex-col gap-4">
          <FileUpload
            ref="fileupload"
            mode="basic"
            accept="image/png, image/jpeg"
            :maxFileSize="1000000"
            @select="onSelect"
            choose-label="Chọn ảnh đại diện"
            customUpload
          >
          </FileUpload>

          <div
            v-if="previewImg"
            class="mx-auto aspect-square w-full max-w-sm overflow-hidden bg-gray-200"
          >
            <cropper
              ref="cropperRef"
              :src="previewImg"
              :stencil-component="CircleStencil"
              :stencil-size="{
                width: 250,
                height: 250
              }"
              :stencil-props="{
                previewClass: 'preview',
                handlers: {},
                movable: false,
                resizable: false,
                aspectRatio: 1
              }"
              image-restriction="stencil"
              class="h-full w-full object-cover"
            />
          </div>

          <div class="flex w-full justify-end gap-4">
            <Button label="Hủy" type="button" @click="showConfirm = false" />
            <Button
              label="Xác nhận"
              @click="uploadImg"
              :disabled="!previewImg"
              :loading="isChanggingAvatar"
            />
          </div>
        </div>
      </AppModal>
    </div>
  </div>
</template>

<style lang="css" scoped>
::v-deep(.preview) {
  border: dashed 2px rgba(255, 255, 255, 0.25);
}
</style>
