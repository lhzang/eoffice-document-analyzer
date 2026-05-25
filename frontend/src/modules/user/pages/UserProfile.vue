<script setup lang="ts">
import "vue-advanced-cropper/dist/style.css";
import UploadAvatar from "../components/UploadAvatar.vue";
import UserInfor from "../components/UserInfor.vue";
</script>

<template>
  <div class="w-full flex flex-col col-2 items-center">
    <div class="card md:w-2xl border-0 shadow">
      <UploadAvatar />
      <div class="flex justify-center font-semibold mt-20 mb-5 text-2xl text-surface-700">
        Thông tin cá nhân
      </div>
      <UserInfor />
    </div>
  </div>
</template>
