<script setup lang="ts">
import ModalSelectUsb from '@/shared/components/modals/ModalSelectUsb.vue'
import { useAuth } from '@/shared/composables/useAuth'
import { Button } from 'primevue'
import { useTemplateRef } from 'vue'

type TModalRef = InstanceType<typeof ModalSelectUsb>

const modalRef = useTemplateRef<TModalRef>('modalSelectUsb')

const auth = useAuth()
function logout() {
  auth.logout()
}
</script>

<template>
  <div>HomePage</div>
  <Button @click="modalRef?.openModal()">Click</Button>
  <ModalSelectUsb ref="modalSelectUsb" />
  <!-- <Button label="Test" icon="icon-[material-symbols--logout]" severity="danger" @click="logout" /> -->
  <Button label="Logout" icon="icon-[material-symbols--logout]" severity="danger" @click="logout" />
</template>
