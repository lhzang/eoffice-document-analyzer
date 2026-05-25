<template>
  <div class="mx-auto flex h-full w-4/5 flex-col items-center justify-center lg:w-150">
    <img src="@/assets/images/403_no_permission.png" />
    <div class="text-center">
      <div class="text-center text-4xl font-semibold">Truy cập bị từ chối</div>
      <div class="mt-4 text-center text-lg font-semibold">
        Thầy/Cô không có quyền truy cập. Vui lòng đổi qua chức vụ khác
      </div>
      <Button class="mx-auto mt-4 min-w-25">Trở về</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue'
</script>
