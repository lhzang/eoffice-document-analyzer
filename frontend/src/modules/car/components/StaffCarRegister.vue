<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'

const { user } = useUserProfileStore()
</script>
<template>
  <AppTextInput label="Họ và tên cán bộ" name="staffName" disabled :model-value="user?.fullName" />
  <AppTextInput
    placeholder="Biển số xe"
    :hint-content="'VD: 30A-123.45'"
    required
    label="Biển số xe"
    name="licensePlate"
  />
  <AppTextInput
    placeholder="Nhập số thẻ eTag/ePass"
    required
    label="Số eTag(VETC, ePass)"
    name="eTag"
  />
  <AppFileInput
    class="col-span-2"
    placeholder="Tải mặt sau lên"
    label="Mặt sau giấy đăng ký xe"
    required
    name="registrationFile"
    accept=".pdf, .png, .jpg, .jpeg, application/pdf, image/png, image/jpeg"
  />
</template>
