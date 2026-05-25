<script setup lang="ts">
import AppTabs from '@/shared/components/AppTabs.vue'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BsignAccount from '../components/BsignAccount.vue'
import SimEsignAccount from '../components/SimEsignAccount.vue'
import UsbTokenAccount from '../components/UsbTokenAccount.vue'
import { EsignProviderConfig, type EsignProvider } from '../constants/esignProvider'

const user = useUserProfileStore().user
const accountId = user?.username

const tabList = Object.values(EsignProviderConfig)
const route = useRoute()
const router = useRouter()

const selectedTab = ref<EsignProvider>('BSIGN')
const getTabFromQuery = (): EsignProvider => {
  const tab = route.query.tab
  return tab as EsignProvider
}
selectedTab.value = getTabFromQuery() || 'BSIGN'

watch(selectedTab, (newTab) => {
  router.replace({
    query: {
      ...route.query,
      tab: newTab.toString()
    }
  })
})

const tabComponents = {
  BSIGN: BsignAccount,
  VIETTELSIM: SimEsignAccount,
  USB: UsbTokenAccount,
  VIETTELREMOTE: SimEsignAccount,
  VNPT: SimEsignAccount
}

const tabProps = {
  BSIGN: { accountId, esignProviderType: 'p12' },
  VIETTELSIM: { accountId, esignProviderName: 'Viettel SIM', esignProviderType: 'vt_sim' },
  USB: { accountId, esignProviderType: 'usb' },
  VIETTELREMOTE: { accountId, esignProviderName: 'Viettel Remote', esignProviderType: 'vt_remote' },
  VNPT: { accountId, esignProviderName: 'VNPT Remote', esignProviderType: 'vnpt_remote' }
}
</script>

<template>
  <div>
    <div class="mx-auto w-full px-4 sm:px-6 md:px-8">
      <div class="w-full overflow-x-auto whitespace-nowrap">
        <div class="inline-flex min-w-full items-center justify-center">
          <AppTabs v-model="selectedTab" :tab-list="tabList" class="mb-4" />
        </div>
      </div>
      <keep-alive>
        <component :is="tabComponents[selectedTab]" v-bind="tabProps[selectedTab]" />
      </keep-alive>
    </div>
  </div>
</template>
