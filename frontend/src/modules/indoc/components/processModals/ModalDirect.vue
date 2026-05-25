<script setup lang="ts">
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useFlowInfo } from '@/shared/composables/useFlowInfo'
import { APP_TEXTAREA_LARGE_ROW } from '@/shared/constants/common'
import { RECEIVER_TYPES } from '@/shared/constants/document'
import { ROUTE_PATHS } from '@/shared/constants/router'
import { optionalStringSchema } from '@/shared/schemas/commonSchema'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { toastError, toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Checkbox, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useAssignInDoc } from '../../composables/queries/useAssignInDoc'
import { useRelavantActors } from '../../composables/queries/useRelavantActors'
import type {
  TFormSelectDistributeItemValue,
  TSelectStaffDistributeValue,
  TSelectUnitDistributeValue
} from '../../models/types'
import {
  getFormatValueDistribute,
  gettFormatValueFromRelevantActors
} from '../../utils/distributeUtils'
import AssignIDTree from '../distribute/AssignIDTree.vue'

type TProps = {
  documentId: string
}

const emit = defineEmits<{
  (e: 'directSucess'): void
}>()

const { documentId } = defineProps<TProps>()

const isVisible = ref<boolean>(false)

const confirm = useConfirm()
const userProfile = useUserProfileStore()

const selectedDistributedItems = ref<Map<string, TFormSelectDistributeItemValue>>(new Map())

const validSelectedDistributedItems = computed(() => {
  const listValidItems: TFormSelectDistributeItemValue[] = []
  selectedDistributedItems.value.forEach((item) => {
    if (item?.type === RECEIVER_TYPES.STAFF) {
      if (checkIfStaffDisabled(item)) return
    } else {
      if (checkIfUnitDisabled(item)) return
    }
    listValidItems.push(item)
  })
  return listValidItems
})

const schema = z.object({
  createWork: z.boolean(),
  sendPersonal: z.boolean().optional(),
  directiveContent: optionalStringSchema
})

type AssignFormValues = z.infer<typeof schema>

const {
  availableAssignRoles: availableRoles,
  formAssignInputList: formInputList,
  flowData,
  isGettingFlow,
  isGettingSystemConfigInfo
} = useFlowInfo(
  userProfile?.user?.currentPosition?.unitId!,
  () => isVisible.value && !!userProfile?.user?.currentPosition?.unitId
)

const { handleSubmit, values, resetForm, defineField } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    createWork: false,
    directiveContent: ''
  }
})
const [createWork] = defineField('createWork')
const [sendPersonal] = defineField('sendPersonal')
const router = useRouter()

const {
  data: relevantActors,
  isLoading: isGettingRelevantActor,
  isSuccess: isGetRelevantActorsSuccess
} = useRelavantActors(() => documentId, {
  enabled: () => isVisible.value,
  structuralSharing: false
})

const preSelectValue = computed(() => {
  if (isGetRelevantActorsSuccess?.value && relevantActors?.value?.length) {
    return gettFormatValueFromRelevantActors(relevantActors.value)
  }
  return new Map<string, TFormSelectDistributeItemValue>()
})

const { mutate: assignDoc, isPending } = useAssignInDoc({
  onSuccess: () => {
    toastSucceed({
      detail: 'Giao việc thành công'
    })
    emit('directSucess')
    if (values.createWork) {
      // router.push({ name: ROUTES_DISPLAY?.createTask?.name })
      router.push(ROUTE_PATHS?.task?.createTask)
    }
    isVisible.value = false
  }
})

const checkIfUnitDisabled = (unit: TSelectUnitDistributeValue) => {
  const matchItem = preSelectValue?.value?.get(unit?.id)
  return !!unit?.id && !!matchItem && matchItem?.type === RECEIVER_TYPES.UNIT
}

// const checkIfUnitDisabled = (unit: TTreeUnitNode) => {
//   return defaultValues?.has(unit?.id)
// }
const checkIfStaffDisabled = (staff: TSelectStaffDistributeValue) => {
  const matchItem = preSelectValue?.value?.get(staff?.id)
  return !!staff?.id && !!matchItem && matchItem?.type === RECEIVER_TYPES.STAFF
}

const confirmAssign = (values: AssignFormValues) => {
  confirm.require({
    message: `Thầy/Cô chắc chắn muốn giao việc?`,
    header: 'Giao việc',
    accept: () => {
      if (!userProfile?.user?.currentPosition?.id) return
      assignDoc({
        id: documentId,
        body: {
          docId: documentId,
          assignerId: userProfile?.user?.currentPosition?.id,
          receivers: getFormatValueDistribute(validSelectedDistributedItems.value),
          directiveContent: values.directiveContent
        }
      })
    },
    group: 'assign',
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
  confirmAssign(values)
})

const handleSubmitAssign = (e: MouseEvent) => {
  if (!validSelectedDistributedItems?.value?.length) {
    e.preventDefault()
    return toastError({
      detail: 'Vui lòng chọn đơn vị/cá nhân để giao việc'
    })
  }
}

const handleWhenModalVisibleChange = (visible: boolean) => {
  if (!visible) {
    selectedDistributedItems.value = new Map()
    resetForm()
  }
}

defineExpose({
  openModal: () => (isVisible.value = true),
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    title="Chỉ đạo"
    v-model:visible="isVisible"
    @update:visible="handleWhenModalVisibleChange"
    :wrapper-style="{ width: '60%' }"
  >
    <form @submit="onSubmit">
      <div class="mb-6 h-[500px]">
        <AssignIDTree
          :isLoadingData="isGettingRelevantActor"
          :preSelectValue
          :isPersonalDistribute="!!sendPersonal"
          :fetchQuerykey="'getTreeDirector'"
          :is-distribute="false"
          :check-if-unit-disabled="checkIfUnitDisabled"
          :check-if-staff-disabled="checkIfStaffDisabled"
          v-model="selectedDistributedItems"
          :availableRoles
          :formInputList
          :flowData
          :isGettingFlow
          :isGettingSystemConfigInfo
        />
      </div>
      <div class="mt-6 grid shrink-0 grid-cols-2 gap-4">
        <div class="col-span-2 flex items-center gap-2">
          <label class="text-primary font-semibold" for="sendPersonal">Gửi cá nhân</label>
          <br />
          <Checkbox v-model="sendPersonal" name="sendPersonal" :binary="true" />
        </div>
      </div>
      <AppTextarea
        class="col-span-2"
        name="directiveContent"
        label="Nội dung chỉ đạo"
        :rows="APP_TEXTAREA_LARGE_ROW"
        :limitNumber="250"
        placeholder="Nhập nội dung chỉ đạo"
      />
      <div class="col-span-2 flex items-center gap-2">
        <label class="text-primary font-semibold" for="createWork">Tạo công việc</label>
        <br />
        <Checkbox name="createWork" v-model="createWork" :defaultValue="false" :binary="true" />
      </div>
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
          @click="handleSubmitAssign"
        />
      </div>
    </form>
    <ConfirmDialog group="assign" />
  </AppModal>
</template>
