<script setup lang="ts">
import DistributeListDisplay from '@/shared/components/document/DistributeListDisplay.vue'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import { APP_TEXTAREA_LARGE_ROW } from '@/shared/constants/common'
import { RECEIVER_TYPES } from '@/shared/constants/document'
import type { TDocumentProcessValue, TUrgencyLevelValue } from '@/shared/models/document'
import { commonSelectSchema, optionalStringSchema } from '@/shared/schemas/commonSchema'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { getUrgencyLevelOptions, getUrgencyLevelSelectData } from '@/shared/utils/document'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, watch } from 'vue'
import z from 'zod'
import { useDistributeID } from '../../composables/queries/useDistributeID'
import { useGetCreationHistoryID } from '../../composables/queries/useGetCreationHistoryID'
import { CREATE_HISTORY_INDOC_ACTION_VALUES } from '../../constants/availableActions'
import { getFormatValueDistribute } from '../../utils/distributeUtils'

type TProps = {
  documentId: string
}

const emit = defineEmits<{
  (e: 'distributeSuccess'): void
}>()

const { documentId } = defineProps<TProps>()

const confirm = useConfirm()

const schema = z.object({
  answerDate: z.date().optional().nullable(),
  priorityLevel: commonSelectSchema.optional(),
  directiveContent: optionalStringSchema
})
type DistributeFormValues = z.infer<typeof schema>

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    priorityLevel: getUrgencyLevelOptions()?.find((level) => level?.value === 'NORMAL'),
    directiveContent: ''
  }
})

const {
  data: eventList,
  isLoading: isGettingCreationHistory,
  error: getCreattionHistoryError,
  isSuccess: isGetCreationSuccess
} = useGetCreationHistoryID(() => documentId)

const lastProposeEvent = computed(() => {
  const proposeEventList = eventList.value?.filter(
    (event) => event.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.proposeDoc
  )
  const lastEvent = proposeEventList?.[proposeEventList?.length - 1]
  return lastEvent
})

const displayProposedActorList = computed(() => {
  return lastProposeEvent.value?.receivers?.map((receiver) => ({
    action: receiver?.role,
    subjectName: receiver?.displayName
  })) as TDocumentProcessValue[]
})

const proposedActorList = computed(() => {
  const proposeEventList = eventList.value?.filter(
    (event) => event.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.proposeDoc
  )
  const lastEvent = proposeEventList?.[proposeEventList?.length - 1]
  return (lastEvent?.receivers ?? [])?.map((receiver) =>
    receiver?.type === RECEIVER_TYPES.UNIT
      ? {
          id: receiver?.id,
          name: receiver?.displayName,
          type: RECEIVER_TYPES?.UNIT,
          isGroup: false,
          formName: receiver?.role
        }
      : {
          id: receiver?.id,
          name: receiver?.displayName,
          type: RECEIVER_TYPES?.STAFF,
          formName: receiver?.role
        }
  )
})

const { mutate: distributeID } = useDistributeID({
  onSuccess: () => {
    toastSucceed({
      detail: 'Phân phối thành công'
    })
    emit('distributeSuccess')
  }
})

const confirmDistribute = (values: DistributeFormValues) => {
  confirm.require({
    group: 'confirmEvaluateDistribute',
    message: `Thầy/Cô chắc chắn muốn duyệt phân phối văn bản?`,
    header: 'Duyệt đề xuất',
    accept: () => {
      distributeID({
        id: documentId,
        body: cleanObject({
          receivers: getFormatValueDistribute(proposedActorList.value),
          directiveContent: values.directiveContent,
          dueDate: values?.answerDate
            ? DateTime.fromJSDate(values?.answerDate!).toISODate()!
            : undefined,
          priority: values?.priorityLevel?.value as TUrgencyLevelValue
        })
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

const handleTriggerSubmitDistribute = () => {
  handleSubmit((values) => {
    confirmDistribute(values)
  })()
}

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
  triggerSubmit: handleTriggerSubmitDistribute
})
</script>
<template>
  <div class="flex h-full flex-col px-4 py-2">
    <div v-if="isGettingCreationHistory" class="flex h-full items-center justify-center">
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div v-else-if="getCreattionHistoryError" class="flex h-full items-center justify-center">
      <span class="text-xl">{{
        getCreattionHistoryError?.response?.data?.detail ??
        getCreattionHistoryError?.message ??
        'Đã có lỗi xảy ra. Vui lòng thử lại sau!'
      }}</span>
    </div>
    <template v-else>
      <span
        >Đề xuất xử lý của
        <span class="font-semibold">{{ lastProposeEvent?.displayName }}</span></span
      >
      <DistributeListDisplay :item-list="displayProposedActorList" />

      <div class="mt-6 grid shrink-0 grid-cols-2 gap-4">
        <AppDateInput
          name="answerDate"
          label="Thay đổi hạn trả lời"
          placeholder="Chọn ngày"
          date-format="dd/mm/yy"
        />
        <AppSelect
          name="priorityLevel"
          :fetch-options="getUrgencyLevelSelectData"
          label="Độ khẩn"
          placeholder="Độ khẩn"
        />
        <AppTextarea
          class="col-span-2"
          name="directiveContent"
          label="Nội dung chỉ đạo"
          :rows="APP_TEXTAREA_LARGE_ROW"
          :limitNumber="250"
          placeholder="Nhập nội dung chỉ đạo"
        />
      </div>
    </template>
    <ConfirmDialog group="confirmEvaluateDistribute" />
  </div>
</template>
