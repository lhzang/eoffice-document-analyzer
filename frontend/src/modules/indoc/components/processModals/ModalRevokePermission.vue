<script setup lang="ts">
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_TEXTAREA_LARGE_ROW } from '@/shared/constants/common'
import { type TDocumentProcessRole } from '@/shared/constants/document'
import type { ReceiverVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { toastSucceed } from '@/shared/utils/common'
import { getDisplayDistributeLabel } from '@/shared/utils/document'
import { toTypedSchema } from '@vee-validate/zod'
import { differenceBy, uniqBy } from 'lodash-es'
import { Button, Checkbox, ConfirmDialog, Popover, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref, type ComponentPublicInstance } from 'vue'
import { z } from 'zod'
import { useGetRevocableAssignees } from '../../composables/queries/useGetRevocableAssignees'
import { useRevokePermission } from '../../composables/queries/useRevokePermission'

type TProps = {
  documentId: string
}

type RevokeFormValues = z.infer<typeof schema>

type PopoverInstance = ComponentPublicInstance & InstanceType<typeof Popover>

const props = defineProps<TProps>()

const emit = defineEmits<{
  (e: 'revokeSuccess'): void
}>()

const isVisible = ref<boolean>(false)
const confirm = useConfirm()
const activeAccordions = ref<string[]>([])
const selectedReceivers = ref<ReceiverVM[]>([])
const receiversPopoverRef = ref<PopoverInstance>()
const DISPLAY_LIMIT = 3
const currentPopoverRole = ref<TDocumentProcessRole | null>(null)

const user = useUserProfileStore().user

const { data: revocableAssignees, isLoading } = useGetRevocableAssignees(() => props.documentId, {
  enabled: () => !!props.documentId && isVisible.value
})

const schema = z.object({
  message: z.string()
})

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    message: ''
  }
})

const { mutate: revokeDoc, isPending } = useRevokePermission({
  onSuccess: () => {
    toastSucceed({
      detail: 'Thu hồi quyền thành công'
    })
    emit('revokeSuccess')
    isVisible.value = false
    selectedReceivers.value = []
  }
})

const allFilteredData = computed(() => {
  const source = revocableAssignees.value ?? []
  return source
})

const revocableByRole = computed(() => {
  const source = allFilteredData.value ?? []
  return source.reduce(
    (acc, receiver) => {
      const role = receiver.role as string
      if (!role) return acc
      if (!acc[role]) acc[role] = []
      acc[role].push(receiver)
      return acc
    },
    {} as Record<string, ReceiverVM[]>
  )
})

const tabList = computed(() => {
  const roles = Object.keys(revocableByRole.value)
  return roles.map((role) => ({
    label: getDisplayDistributeLabel(role as TDocumentProcessRole).fullLabel,
    value: role
  }))
})

const roleSelectionMap = computed(() => {
  const map: Record<string, boolean> = {}
  tabList.value.forEach((tab) => {
    const role = tab.value
    const receivers = revocableByRole.value[role] || []
    map[role] =
      receivers.length > 0 &&
      receivers.every((r) => selectedReceivers.value.some((s) => s.id === r.id))
  })
  return map
})

const handleSelectReceiver = (checked: boolean, receiver: ReceiverVM) => {
  if (checked) {
    selectedReceivers.value = uniqBy([...selectedReceivers.value, receiver], 'id')
  } else {
    selectedReceivers.value = selectedReceivers.value.filter((r) => r.id !== receiver.id)
  }
}

const handleSelectRole = (checked: boolean, role: string) => {
  const visibleForRole = revocableByRole.value[role] || []
  if (checked) {
    selectedReceivers.value = uniqBy([...selectedReceivers.value, ...visibleForRole], 'id')
  } else {
    selectedReceivers.value = differenceBy(selectedReceivers.value, visibleForRole, 'id')
  }
}

const toggleRole = (role: string) => {
  if (activeAccordions.value.includes(role)) {
    activeAccordions.value = activeAccordions.value.filter((r) => r !== role)
  } else {
    activeAccordions.value.push(role)
  }
}

const confirmRevoke = (values: RevokeFormValues) => {
  if (selectedReceivers.value.length === 0) return

  confirm.require({
    group: 'revoke-confirm',
    header: 'Thu hồi quyền',
    accept: () => {
      revokeDoc({
        id: props.documentId,
        receivers: selectedReceivers.value,
        message: values?.message,
        revokerId: user?.currentPosition?.id!
      })
    },
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    }
  })
}

const onSubmit = handleSubmit((values) => {
  confirmRevoke(values)
})

const openRolePopover = (event: MouseEvent, role: TDocumentProcessRole) => {
  currentPopoverRole.value = role
  receiversPopoverRef.value?.toggle(event)
}

const receiversByRole = computed(() => {
  return selectedReceivers.value.reduce(
    (acc, receiver) => {
      const role = receiver.role
      if (!acc[role]) acc[role] = []
      acc[role].push(receiver)
      return acc
    },
    {} as Record<string, ReceiverVM[]>
  )
})

const popoverList = computed(() => {
  if (!currentPopoverRole.value) return []
  return receiversByRole.value[currentPopoverRole.value]?.slice(DISPLAY_LIMIT) ?? []
})

defineExpose({
  openModal: () => {
    resetForm({ values: { message: '' } })
    selectedReceivers.value = []
    activeAccordions.value = []
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    title="Thu hồi quyền"
    v-model:visible="isVisible"
    :wrapper-style="{ width: '80%', height: '80%' }"
  >
    <div class="flex flex-col gap-4">
      <div class="flex-1 overflow-auto">
        <div v-if="isLoading" class="flex h-[300px] items-center justify-center">
          <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
        </div>
        <div
          v-else-if="allFilteredData.length === 0"
          class="flex flex-col items-center justify-center p-4"
        >
          <span class="icon-[mdi--flask-empty-remove-outline] text-5xl text-gray-400"></span>
          <span class="text-secondary font-semibold">Không có người nhận để thu hồi</span>
        </div>
        <div v-else class="flex flex-col rounded-[10px] border-[#e2e8f0]">
          <div
            v-for="tab in tabList"
            :key="tab.value"
            class="flex flex-col border-b border-gray-100 last:border-0"
          >
            <!-- Header Role -->
            <div
              class="flex cursor-pointer items-center justify-between rounded-[10px] px-2 py-3 transition-colors"
              @click="toggleRole(tab.value)"
            >
              <div class="flex items-center gap-2">
                <span
                  class="text-primary transition-transform duration-200"
                  :class="
                    activeAccordions.includes(tab.value)
                      ? 'icon-[solar--alt-arrow-up-linear]'
                      : 'icon-[solar--alt-arrow-down-linear]'
                  "
                ></span>
                <span class="text-primary font-semibold select-none">{{ tab.label }}</span>
              </div>
              <div @click.stop class="flex items-center pr-6">
                <Checkbox
                  v-if="revocableByRole[tab.value]"
                  :inputId="`role-${tab.value}`"
                  :modelValue="roleSelectionMap[tab.value]"
                  :binary="true"
                  @update:modelValue="(checked: boolean) => handleSelectRole(checked, tab.value)"
                />
              </div>
            </div>

            <!-- List Users in Role -->
            <div v-show="activeAccordions.includes(tab.value)" class="flex flex-col">
              <div
                v-for="receiver in revocableByRole[tab.value]"
                :key="receiver.id"
                class="flex items-center justify-between px-8 py-2 transition-colors"
                @click="
                  handleSelectReceiver(
                    !selectedReceivers.some((r) => r.id === receiver.id),
                    receiver
                  )
                "
              >
                <div class="cursor-pointer font-semibold select-none">
                  {{ receiver.displayName }}
                </div>
                <div @click.stop>
                  <Checkbox
                    :inputId="`receiver-${receiver.id}`"
                    :modelValue="selectedReceivers.some((r) => r.id === receiver.id)"
                    :binary="true"
                    @update:modelValue="
                      (checked: boolean) => handleSelectReceiver(checked, receiver)
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedReceivers.length === 0" class="text-primary mt-2 text-base font-bold">
        * Vui lòng chọn người cần thu hồi quyền
      </div>

      <form @submit="onSubmit">
        <AppTextarea
          class="col-span-2"
          name="message"
          label="Lý do thu hồi"
          :rows="APP_TEXTAREA_LARGE_ROW"
          :limitNumber="250"
          :placeholder="`Nhập lý do thu hồi quyền`"
        />
        <div class="mt-2 flex h-10 items-center justify-end">
          <div class="flex gap-2">
            <Button
              class="min-w-[100px]"
              label="Huỷ"
              severity="secondary"
              variant="outlined"
              :disabled="isPending"
              @click="isVisible = false"
            />
            <Button
              type="submit"
              class="min-w-[100px]"
              label="Xác nhận"
              severity="primary"
              :loading="isPending"
            />
          </div>
        </div>
      </form>
    </div>

    <ConfirmDialog group="revoke-confirm">
      <template #message>
        <div class="space-y-1">
          <div>Thầy/Cô chắc chắn muốn thu hồi quyền của:</div>

          <div v-for="(receivers, role) in receiversByRole" :key="role">
            <span class="text-primary font-semibold">
              {{ getDisplayDistributeLabel(role as TDocumentProcessRole).fullLabel }}:
            </span>
            <span>
              {{
                receivers
                  .slice(0, DISPLAY_LIMIT)
                  .map((r) => r.displayName)
                  .join(', ')
              }}
              <template v-if="receivers.length > DISPLAY_LIMIT">
                ,
                <span
                  class="text-primary cursor-pointer underline"
                  @click="(e) => openRolePopover(e, role as TDocumentProcessRole)"
                >
                  và {{ receivers.length - DISPLAY_LIMIT }} người khác
                </span>
              </template>
            </span>
          </div>
        </div>
      </template>
    </ConfirmDialog>

    <Popover ref="receiversPopoverRef" id="receivers-popover">
      <div class="text-sm">
        <div v-if="popoverList.length" class="max-h-56 space-y-1 overflow-auto">
          <div v-for="u in popoverList" :key="u.id">{{ u.displayName }}</div>
        </div>
      </div>
    </Popover>
  </AppModal>
</template>
