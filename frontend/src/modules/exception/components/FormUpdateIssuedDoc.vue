<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import { APP_TEXTAREA_LARGE_ROW } from '@/shared/constants/common'
</script>

<template>
  <AppTextarea
    class="col-span-2 mt-6"
    name="reason"
    label="Lý do cập nhật"
    required
    :rows="APP_TEXTAREA_LARGE_ROW"
    :limitNumber="250"
    :placeholder="`Nhập lý do cập nhật`"
  />

  <div class="mt-2 flex items-center gap-4">
    <span class="text-primary w-75 font-semibold whitespace-nowrap"
      >File căn cứ, yêu cầu chỉnh sửa:
    </span>
    <span class="w-80">
      <AppFileInput name="relatedFile" :multiple="false" class="mt-4" />
    </span>
  </div>
</template>
