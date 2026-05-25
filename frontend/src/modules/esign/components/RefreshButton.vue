<script setup lang="ts">
import Button from 'primevue/button'

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

</script>

<template>
  <Button
    icon="pi pi-refresh"
    label="Làm mới"
    :loading="props.loading"
    @click="$emit('refresh')"
  />
</template>