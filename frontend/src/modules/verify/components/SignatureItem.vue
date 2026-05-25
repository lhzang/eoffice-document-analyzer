<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<string | null>(null)
</script>

<template>
  <Accordion v-model:value="activeTab">
    <AccordionTab value="0">
      <template #header>
        <i
          class="pi pi-chevron-right mr-2 transition-transform duration-200"
          :class="{ 'rotate-90': activeTab === '0' }"
        />
        <span>Chữ ký 1: Huỳnh Quyết Thắng</span>
      </template>

      <div class="space-y-1">
        <div>Thời gian ký: 05/07/2024 18:05:43</div>
        <div>Tính toàn vẹn: Đã bị chỉnh sửa sau khi ký ❌</div>
        <div>Chứng thư số: Hợp lệ ✅</div>
        <div>Người ký: Huỳnh Quyết Thắng</div>
        <div>Đơn vị cấp chứng thư số: HUST Intermediate CA</div>
        <div>Đơn vị cấp chứng thư gốc: Staging HUST Root CA</div>
      </div>
    </AccordionTab>
  </Accordion>
</template>
