<script setup lang="ts">
import { Button, OverlayBadge } from 'primevue'
</script>
<template>
  <div>
    <Button class="h-full" variant="text" severity="contrast" disabled>
      <template #icon>
        <OverlayBadge
          severity="danger"
          size="small"
          :pt="{
            pcBadge: {
              root: '!hidden'
            }
          }"
        >
          <i class="pi pi-bell text-sm" />
        </OverlayBadge>
      </template>
    </Button>
  </div>
</template>
