<template>
  <div class="mx-auto flex h-full w-4/5 flex-col items-center justify-center lg:w-150">
    <img src="@/assets/images/404_rocket.png" />
    <div class="text-center">
      <div class="text-center text-4xl font-semibold">Nội dung không khả dụng</div>
      <div class="mt-4 text-center text-lg font-semibold">
        Trang bạn truy cập không tồn tại hoặc không khả dụng. Vui lòng thử lại sau
      </div>
      <Button class="mx-auto mt-4">Trở về</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue'
</script>
