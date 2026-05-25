<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import { useFlowInfo } from '@/shared/composables/useFlowInfo'
import { APP_TEXTAREA_LARGE_ROW } from '@/shared/constants/common'
import { commonSelectSchema } from '@/shared/schemas/commonSchema'
import { toastError, toastSucceed, toastWarning } from '@/shared/utils/common'
import { getUrgencyLevelOptions, getUrgencyLevelSelectData } from '@/shared/utils/document'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Checkbox, ConfirmDialog, Popover, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import type { ComponentPublicInstance } from 'vue'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useBulkDistributeID } from '../composables/queries/useBulkDistributeID'
import type {
  TFormSelectDistributeItemValue,
  TSelectStaffDistributeValue,
  TSelectUnitDistributeValue
} from '../models/types'
import { getFormatValueDistribute, getGroupDistributedItemsByRole } from '../utils/distributeUtils'
import DistributeIDTree from './distribute/DistributeIDTree.vue'
import DistributeRoleTag from './DistributeRoleTag.vue'

type TProps = {
  documentIds: string[]
  selectedUnitId: string
}
const emit = defineEmits<{
  (e: 'goToSelectDocStep'): void
  (e: 'distributeSuccess'): void
}>()
const { documentIds, selectedUnitId } = defineProps<TProps>()

type PopoverInstance = ComponentPublicInstance & InstanceType<typeof Popover>
const toggleViewMorRef = ref<PopoverInstance[]>()

const schema = z.object({
  sendPersonal: z.boolean().optional(),
  answerDate: z.date().optional().nullable(),
  priorityLevel: commonSelectSchema.optional(),
  directiveContent: z.string()
})

type DistributeFormValues = z.infer<typeof schema>

const confirm = useConfirm()

const { handleSubmit, defineField } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    sendPersonal: false,
    priorityLevel: getUrgencyLevelOptions()?.find((level) => level?.value === 'NORMAL'),
    directiveContent: ''
  }
})

const toggle = (event: MouseEvent, id: string) => {
  const matchPopoverRef = toggleViewMorRef?.value?.find((ref) => ref.$attrs.id === id)
  if (matchPopoverRef) {
    matchPopoverRef.toggle(event)
  }
}

const { mutate: distributeIDs, isPending } = useBulkDistributeID({
  onSuccess: (response) => {
    const failDocNumer = Object.keys(response?.failedDocIds).length
    if (failDocNumer) {
      toastWarning({
        summary: 'Phân phối nhiều văn bản',
        detail: `Có ${failDocNumer}/${documentIds?.length} văn bản không thể hoàn thành!. Vui lòng kiểm tra lại`
      })
    } else {
      toastSucceed({
        summary: 'Phân phối nhiều văn bản',
        detail: 'Phân phối nhiều tất cả văn bản thành công'
      })
    }
    emit('distributeSuccess')
  }
})
// const { mutate: proposeDistribute } = useEditDistributeProposal({
//   onSuccess: () => {
//     toastSucceed({
//       detail: 'Đề xuất phân phối thành công'
//     })
//     emit('distributeSuccess')
//   }
// })

const {
  availableDistributeRoles: availableRoles,
  formDistributeInputList: formInputList,
  flowData,
  isGettingFlow,
  isGettingSystemConfigInfo
} = useFlowInfo(selectedUnitId!, () => !!selectedUnitId)

const [sendPersonal] = defineField('sendPersonal')

const selectedDistributedItems = ref<Map<string, TFormSelectDistributeItemValue>>(new Map())

const validSelectedDistributedItems = computed(() => {
  const listValidItems: TFormSelectDistributeItemValue[] = []
  selectedDistributedItems.value.forEach((item) => {
    listValidItems.push(item)
  })
  return listValidItems
})

const checkIfUnitDisabled = (unit: TSelectUnitDistributeValue) => {
  return false
}
const checkIfStaffDisabled = (staff: TSelectStaffDistributeValue) => {
  return false
}

const confirmDistribute = (values: DistributeFormValues) => {
  confirm.require({
    group: 'confirmBulkDistribute',
    message: `Thầy/Cô chắc chắn muốn phân phối nhiều văn bản?`,
    header: 'Xác nhận phân phối đồng thời',
    accept: () => {
      distributeIDs({
        ids: documentIds,
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
// const confirmProposeDistribute = (values: DistributeFormValues) => {
//   confirm.require({
//     group: 'confirm',
//     message: `Thầy/Cô chắc chắn muốn gửi đề xuất phân phối văn bản?`,
//     header: 'Tạo đề xuẩt',
//     accept: () => {
//       proposeDistribute({
//         id: documentIds,
//         body: {
//           receivers: getFormatValueDistribute(validSelectedDistributedItems.value),
//           directiveContent: values.directiveContent
//         }
//       })
//     },
//     rejectProps: {
//       label: 'Hủy',
//       severity: 'secondary',
//       outlined: true
//     },
//     acceptProps: {
//       label: 'Xác nhận',
//       severity: 'primary'
//     }
//   })
// }

const onSubmit = () => {
  if (!validSelectedDistributedItems?.value?.length) {
    return toastError({
      detail: 'Vui lòng chọn đơn vị/cá nhân để phân phối'
    })
  }
  handleSubmit((values) => {
    if (!flowData?.value) return
    // if (flowData?.value?.enablePropose) confirmProposeDistribute(values)
    // else
    confirmDistribute(values)
  })()
}
</script>
<template>
  <div class="flex h-full flex-col px-4 py-2">
    <form @submit.prevent="onSubmit">
      <DistributeIDTree
        tree-class="h-[400px]!"
        :distributeUnitID="selectedUnitId"
        :isPersonalDistribute="!!sendPersonal"
        :check-if-unit-disabled="checkIfUnitDisabled"
        :check-if-staff-disabled="checkIfStaffDisabled"
        :availableRoles
        :formInputList
        :flowData
        :isGettingFlow
        :isGettingSystemConfigInfo
        v-model="selectedDistributedItems"
      />
      <div class="mt-6 grid shrink-0 grid-cols-2 gap-4">
        <div class="col-span-2 flex items-center gap-2">
          <label class="text-primary font-semibold" for="sendPersonal">Gửi cá nhân</label>
          <br />
          <Checkbox v-model="sendPersonal" name="sendPersonal" :binary="true" />
        </div>
        <!-- <template v-if="flowData?.enablePropose"> -->
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
        <!-- </template> -->
        <AppTextarea
          class="col-span-2"
          name="directiveContent"
          label="Nội dung chỉ đạo"
          :rows="APP_TEXTAREA_LARGE_ROW"
          :limitNumber="250"
          placeholder="Nhập nội dung chỉ đạo"
        />
      </div>
      <div class="mt-2 flex h-10 items-center justify-end gap-2">
        <Button
          class="min-w-[100px]"
          label="Huỷ"
          severity="secondary"
          variant="outlined"
          :disabled="isPending"
          @click="emit('goToSelectDocStep')"
        />
        <Button
          type="submit"
          class="min-w-[100px]"
          label="Xác nhận"
          severity="primary"
          :loading="isPending"
        />
      </div>
    </form>
    <ConfirmDialog group="confirmBulkDistribute" class="w-[600px]">
      <template #message>
        <div class="w-full">
          <div
            v-for="(distributedItems, roleName) in getGroupDistributedItemsByRole(
              validSelectedDistributedItems
            )"
            :key="roleName"
          >
            <div v-if="distributedItems.length" class="py-0.5">
              <DistributeRoleTag :role="roleName" />
              :
              <span>
                {{
                  distributedItems
                    ?.slice(0, 2)
                    .map((item) => item?.name)
                    .join(', ')
                }}
              </span>
              <span v-if="distributedItems?.length > 2">
                <span class="text-primary cursor-pointer" @click="(e) => toggle(e, `${roleName}`)">
                  {{ ` và ${distributedItems?.length - 2} đơn vị, người khác` }}
                </span>
                <Popover ref="toggleViewMorRef" :id="`${roleName}`">
                  <div class="flex h-[300px] flex-col gap-4 overflow-y-auto">
                    <ul class="m-0 flex list-none flex-col p-0">
                      <li
                        v-for="(distributedItem, idx) in distributedItems"
                        :key="idx"
                        class="rounded-border w-[220px] cursor-pointer gap-2 px-0.5 py-1"
                      >
                        {{ distributedItem?.name }}
                      </li>
                    </ul>
                  </div>
                </Popover>
              </span>
            </div>
          </div>
        </div>
      </template>
    </ConfirmDialog>
  </div>
</template>
