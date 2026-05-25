<script setup lang="ts">
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useGetAllUsersInUnit } from '@/shared/composables/queries/organization/unit/useGetAllUsersInUnit'
import { APP_TEXTAREA_ROW, ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import { RECEIVER_TYPES } from '@/shared/constants/document'
import type { TDistributeRole } from '@/shared/models/common'
import { optionalStringSchema } from '@/shared/schemas/commonSchema'
import type { StaffVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { toastError, toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, RadioButton, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useFowardProcessRole } from '../../composables/queries/useFowardProcessRole'
import { useRelavantActors } from '../../composables/queries/useRelavantActors'
import { getDisplayValueForDistributeRole } from '../../utils/distributeUtils'

type TProps = {
  documentId: string
}

const { documentId } = defineProps<TProps>()

const emit = defineEmits<{
  (e: 'forwardSuccess'): void
}>()

// type TForwardRole = Extract<TDistributeRole, 'COLLABORATOR' | 'LEADER'>
type TForwardRole = TDistributeRole

const schema = z.object({
  message: optionalStringSchema
})
type ForwardRoleFormValues = z.infer<typeof schema>

const currentUserUnitId = useUserProfileStore().user?.currentPosition?.unitId
const isVisible = ref<boolean>(false)
const roleName = ref<TForwardRole>()
const selectedUser = ref<StaffVM | null>(null)
const roleDisplayValue = computed(() =>
  getDisplayValueForDistributeRole(roleName.value as TDistributeRole)?.toLowerCase()
)

const { data: relevantActors, isLoading: isGettingRelevantActor } = useRelavantActors(
  () => documentId,
  {
    enabled: () => isVisible.value,
    structuralSharing: false
  }
)

const alreadyInHandlingProcessActorIds = computed(() => {
  return (relevantActors?.value ?? [])
    ?.filter((actor) => actor?.type === RECEIVER_TYPES.STAFF)
    ?.map((actor) => actor?.id)
})

const { mutate: forwardRole, isPending } = useFowardProcessRole({
  onSuccess: () => {
    toastSucceed({
      detail: 'Chuyển quyền xử lý văn bản thành công'
    })
    emit('forwardSuccess')
    isVisible.value = false
  }
})

const confirm = useConfirm()
const { data: listUsersInUnit, isLoading: isGettingUserList } = useGetAllUsersInUnit(
  currentUserUnitId!,
  {
    enabled: () => isVisible?.value || !!currentUserUnitId
  }
)

const filteredUserInUnit = computed(() =>
  (listUsersInUnit?.value ?? [])?.filter(
    (user) => user?.positions?.[0]?.roleInUnit !== ROLE_IN_UNIT_VALUES.admin
  )
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    message: ''
  }
})

const handleSubmitForwardRole = (e: MouseEvent) => {
  if (!selectedUser.value) {
    e.preventDefault()
    return toastError({
      detail: 'Vui lòng chọn cá nhân để chuyển quyền xử lý văn bản'
    })
  }
}

const confirmForwardRole = (values: ForwardRoleFormValues) => {
  if (!roleName.value || !selectedUser?.value?.positions?.[0]?.id) return
  confirm.require({
    group: 'confirmForward',
    message: `Thầy/Cô chắc chắn muốn chuyển quyền xử lý?`,
    header: `Chuyển quyền xử lý`,
    // message: `Thầy/Cô chắc chắn muốn chuyển ${roleDisplayValue.value?.toLowerCase()}?`,
    // header: `Chuyển ${roleDisplayValue.value?.toLowerCase()}`,
    accept: () => {
      forwardRole({
        id: documentId,
        body: {
          toStaff: {
            id: selectedUser?.value?.positions?.[0]?.id!,
            role: roleName.value!,
            type: RECEIVER_TYPES.STAFF
          },
          message: values.message
        }
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
  confirmForwardRole(values)
})

const handleModalVisibleChange = (visible: boolean) => {
  if (!visible) {
    selectedUser.value = null
    resetForm()
  }
}

defineExpose({
  openModal: (role: TForwardRole) => {
    roleName.value = role
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    @update:visible="handleModalVisibleChange"
    :title="`Chuyển ${roleDisplayValue}`"
    class="w-3/5!"
  >
    <form @submit="onSubmit">
      <div>
        <div class="mb-6">
          <div class="bg-primary top-0 flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
            <div class="flex-1">Chọn</div>
            <div class="flex w-10 shrink-0 items-center justify-center"></div>
          </div>
          <div
            v-if="isGettingUserList || isGettingRelevantActor"
            class="absolute flex h-full w-full items-center justify-center"
          >
            <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
          </div>
          <div
            v-if="!filteredUserInUnit?.length && !isGettingUserList"
            class="flex h-full w-full items-center justify-center"
          >
            <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
            <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
          </div>
          <div v-else class="max-h-[50vh] overflow-y-auto shadow-md">
            <div
              v-for="(user, index) of filteredUserInUnit"
              :key="index"
              class="text-primary mb-1 flex h-10 cursor-pointer items-center gap-1 bg-white px-4 py-2 font-bold"
            >
              <div class="flex flex-1 items-center truncate">{{ user.fullName }}</div>
              <div class="flex w-10 shrink-0 items-center justify-center">
                <RadioButton
                  name="receiver"
                  :value="user"
                  v-model="selectedUser"
                  :disabled="
                    !!user?.positions?.[0]?.id &&
                    alreadyInHandlingProcessActorIds?.includes(user?.positions?.[0]?.id)
                  "
                ></RadioButton>
              </div>
            </div>
          </div>
        </div>
        <AppTextarea
          class="col-span-2"
          name="message"
          :rows="APP_TEXTAREA_ROW"
          :limitNumber="250"
          :placeholder="`Nhập lý do chuyển quyền xử lý`"
          :label="`Lý do chuyển quyền xử lý`"
        />
        <!-- :placeholder="`Nhập lý do chuyển ${roleDisplayValue}`"
          :label="`Lý do chuyển ${roleDisplayValue}`" -->
      </div>
      <slot name="footer">
        <div class="mt-2 flex h-10 items-center justify-end gap-2">
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
            @click="handleSubmitForwardRole"
          />
        </div>
      </slot>
    </form>
    <ConfirmDialog group="confirmForward" />
  </AppModal>
</template>
