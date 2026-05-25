<script setup lang="ts">
import DistributeListDisplay from '@/shared/components/document/DistributeListDisplay.vue'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useFlowInfo } from '@/shared/composables/useFlowInfo'
import { APP_TEXTAREA_ROW } from '@/shared/constants/common'
import {
  RECEIVER_TYPES,
  URGENCY_LEVEL_LABELS,
  URGENCY_LEVELS,
  UrgentLevelsEnum
} from '@/shared/constants/document'
import { MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import type { TDocumentProcessValue, TUrgencyLevelValue } from '@/shared/models/document'
import { optionalStringSchema } from '@/shared/schemas/commonSchema'
import { toastError, toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { omit } from 'lodash-es'
import { DateTime } from 'luxon'
import { Button, Checkbox, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import { type TUrgentLevel } from '../../../../shared/constants/document'
import { useDistributeID } from '../../composables/queries/useDistributeID'
import { useEditDistributeProposal } from '../../composables/queries/useEditDistributeProposal'
import { useGetCreationHistoryID } from '../../composables/queries/useGetCreationHistoryID'
import { CREATE_HISTORY_INDOC_ACTION_VALUES } from '../../constants/availableActions'
import type {
  TFormSelectDistributeItemValue,
  TSelectStaffDistributeValue,
  TSelectUnitDistributeValue
} from '../../models/types'
import { getFormatValueDistribute } from '../../utils/distributeUtils'
import DistributeIDTree from '../distribute/DistributeIDTree.vue'

type TProps = {
  unitId: string
  documentId: string
}
const mode = ref<TMode | null>(null)
const isVisible = ref<boolean>(false)

const {
  data: eventList,
  isLoading: isGettingCreationHistory,
  isSuccess: isGetCreationSuccess
} = useGetCreationHistoryID(() => documentId, { enabled: () => isVisible?.value })

const proposeList = computed(() => {
  const proposeEventList = eventList.value?.filter(
    (event) => event.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.proposeDoc
  )
  const lastEvent = proposeEventList?.[proposeEventList?.length - 1]
  const resList = new Map<string, TFormSelectDistributeItemValue>()
  lastEvent?.receivers?.forEach((receiver) => {
    resList.set(
      receiver?.id,
      receiver?.type === RECEIVER_TYPES.UNIT
        ? {
            id: receiver?.id,
            name: receiver?.displayName,
            type: 'UNIT',
            isGroup: false,
            formName: receiver?.role
          }
        : {
            id: receiver?.id,
            name: receiver?.displayName,
            type: 'STAFF',
            formName: receiver?.role
          }
    )
  })
  return resList
})

type TMode = 'distribute' | 'propose'

const emit = defineEmits<{
  (e: 'distributeSuccess'): void
}>()

const { unitId, documentId } = defineProps<TProps>()

const selectedDistributedItems = ref<Map<string, TFormSelectDistributeItemValue>>(
  new Map(proposeList.value)
)

const validSelectedDistributedItems = computed(() => {
  const listValidItems: TFormSelectDistributeItemValue[] = []
  selectedDistributedItems.value.forEach((item) => {
    if (item?.type === RECEIVER_TYPES.STAFF) {
      if (checkIfStaffDisabled(omit(item, 'formName'))) return
    } else {
      if (checkIfUnitDisabled(item)) return
    }
    listValidItems.push(item)
  })
  return listValidItems
})

const sendPersonal = ref<boolean>(false)

const schema = z.object({
  answerDate: z.date().optional().nullable(),
  urgencyLevel: z.custom<TCommonSelectOptions<TUrgentLevel>>(
    (val) => {
      return val !== null && val !== undefined
    },
    { message: MSG_REQUIRED_FIELD }
  ),
  directiveContent: optionalStringSchema
})

type DistributeFormValues = z.infer<typeof schema>

const confirm = useConfirm()

const { handleSubmit, handleReset, setFieldValue } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    directiveContent: ''
  }
})

const { mutate: distributeID, isPending } = useDistributeID({
  onSuccess: () => {
    toastSucceed({
      detail: 'Phân phối thành công'
    })
    emit('distributeSuccess')
  }
})

const { mutate: proposeDistribute } = useEditDistributeProposal({
  onSuccess: () => {
    toastSucceed({
      detail: 'Đề xuất phân phối thành công'
    })
    emit('distributeSuccess')
  }
})

const {
  availableDistributeRoles: availableRoles,
  formDistributeInputList: formInputList,
  flowData,
  isGettingFlow,
  isGettingSystemConfigInfo
} = useFlowInfo(unitId!, () => !!unitId)

const handleFetchPriority = async () => {
  return {
    options: URGENCY_LEVELS?.map((urgencyLevel) => ({
      value: urgencyLevel.value,
      label: urgencyLevel.title
    })),
    hasMore: false
  }
}

const checkIfUnitDisabled = (unit: TSelectUnitDistributeValue) => {
  return false
}
const checkIfStaffDisabled = (staff: TSelectStaffDistributeValue) => {
  return false
}

const beforeDistributeList = computed(
  () =>
    Array.from(proposeList?.value?.values())?.map((distribute) => ({
      action: distribute.formName,
      subjectName: distribute?.name
    })) as TDocumentProcessValue[]
)

const afterDistributeList = computed(
  () =>
    Array.from(selectedDistributedItems.value?.values())?.map((distribute) => ({
      action: distribute.formName,
      subjectName: distribute?.name
    })) as TDocumentProcessValue[]
)

const confirmEditDistribute = (values: DistributeFormValues) => {
  confirm.require({
    group: 'confirmEditDistribute',
    message: `Thầy/Cô chắc chắn muốn phân phối văn bản?`,
    header: 'Phân phối',
    accept: () => {
      distributeID({
        id: documentId,
        body: {
          receivers: getFormatValueDistribute(validSelectedDistributedItems.value),
          directiveContent: values.directiveContent,
          dueDate: values?.answerDate
            ? DateTime.fromJSDate(values?.answerDate!).toISODate()!
            : undefined,
          priority: values?.urgencyLevel?.value as TUrgencyLevelValue
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

const confirmProposeDistribute = (values: DistributeFormValues) => {
  confirm.require({
    group: 'confirmEditDistribute',
    message: `Thầy/Cô chắc chắn muốn sửa đề xuất phân phối văn bản?`,
    header: 'Sửa đề xuẩt',
    accept: () => {
      proposeDistribute({
        id: documentId,
        body: {
          receivers: getFormatValueDistribute(validSelectedDistributedItems.value),
          directiveContent: values.directiveContent
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

const handleSubmitAssign = (e: MouseEvent) => {
  if (!validSelectedDistributedItems?.value?.length) {
    e.preventDefault()
    return toastError({
      detail: 'Vui lòng chọn đơn vị/cá nhân để giao việc'
    })
  }
}

const onSubmit = handleSubmit((values) => {
  if (!mode.value) return
  if (mode.value === 'distribute') confirmEditDistribute(values)
  else confirmProposeDistribute(values)
})

const reset = () => {
  handleReset()
  selectedDistributedItems.value = proposeList?.value
  sendPersonal.value = false
  mode.value = null
}

const handleVisibleChange = (isVisible: boolean) => {
  if (!isVisible) reset()
}

watch(proposeList, (newVal) => {
  selectedDistributedItems.value = newVal
})

watch([eventList, isGetCreationSuccess], ([events, isSuccess]) => {
  if (events?.length && isSuccess) {
    const proposeEventList = eventList.value?.filter(
      (event) => event.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.proposeDoc
    )
    const lastEvent = proposeEventList?.[proposeEventList?.length - 1]
    setFieldValue('directiveContent', lastEvent?.comment ?? '', false)
  }
})

defineExpose({
  openModal: (distributeMode: TMode) => {
    mode.value = distributeMode
    isVisible.value = true
  },
  closeModal: () => {
    isVisible.value = false
  }
})
</script>
<template>
  <AppModal
    title="Sửa đề xuất"
    @update:visible="handleVisibleChange"
    v-model:visible="isVisible"
    :wrapper-style="{ width: '60%' }"
    :loading="isGettingCreationHistory || isGettingFlow || isGettingSystemConfigInfo"
  >
    <form @submit="onSubmit">
      <div class="mb-2 grid grid-cols-2 gap-4">
        <div class="border-primary bg-gray-399 rounded-sm border">
          <div
            class="border-primary text-primary flex items-center justify-center border-b py-1 font-bold"
          >
            Trước
          </div>
          <DistributeListDisplay :item-list="beforeDistributeList" />
        </div>
        <div class="border-primary bg-gray-399 rounded-sm border">
          <div
            class="border-primary text-primary flex items-center justify-center border-b py-1 font-bold"
          >
            Sau
          </div>
          <DistributeListDisplay :item-list="afterDistributeList" />
        </div>
      </div>
      <div class="mb-6 h-[400px]">
        <DistributeIDTree
          :distribute-unit-i-d="unitId"
          :fetchQuerykey="'getTreeDirector'"
          :is-distribute="false"
          :check-if-unit-disabled="checkIfUnitDisabled"
          :check-if-staff-disabled="checkIfStaffDisabled"
          :isPersonalDistribute="!!sendPersonal"
          :availableRoles
          :formInputList
          :flowData
          :isGettingFlow
          :isGettingSystemConfigInfo
          v-model="selectedDistributedItems"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2 flex items-center gap-2">
          <label class="text-primary font-semibold" for="sendPersonal">Gửi cá nhân</label>
          <br />
          <Checkbox v-model="sendPersonal" name="sendPersonal" :binary="true" />
        </div>
        <template v-if="mode === 'distribute'">
          <AppDateInput
            name="answerDate"
            label="Thay đổi hạn trả lời"
            placeholder="Chọn ngày"
            date-format="dd/mm/yy"
            :min-date="new Date()"
          />
          <AppSelect
            name="urgencyLevel"
            label="Thay đổi độ khẩn"
            :searchable="false"
            :fetch-options="handleFetchPriority"
            :default-value="{
              label: URGENCY_LEVEL_LABELS?.NORMAL,
              value: UrgentLevelsEnum.Normal
            }"
          />
        </template>
        <AppTextarea
          class="col-span-2"
          name="directiveContent"
          label="Ý kiến chỉ đạo"
          :rows="APP_TEXTAREA_ROW"
          :limitNumber="0"
          placeholder="Nhập ý kiến chỉ đạo"
        />
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
    <ConfirmDialog group="confirmEditDistribute" />
  </AppModal>
</template>
