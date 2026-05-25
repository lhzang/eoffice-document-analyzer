<script setup lang="ts">
import DocumentSignTemplateFlowItem from '@/shared/components/document/DocumentSignTemplateFlowItem.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import {
  OD_EXTERNAl_SIGN_TYPE_OPTS,
  OD_INTERNAL_DOC_SIGN_TYPE_OPTS,
  OD_SIGN_TYPE_LABELS,
  OD_SIGN_TYPES
} from '@/shared/constants/sign'
import type { TUnitSelectValue } from '@/shared/models/organization/unit'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useFieldArray, useForm } from 'vee-validate'
import { ref } from 'vue'
import { VueDraggable, type SortableEvent } from 'vue-draggable-plus'
import type z from 'zod'
import { useCreateSignFlowTemplate } from '../composables/queries/signFlow/useCreateSignFlowTemplate'
import { DOC_TYPE_LIST } from '../constants/flow'
import { createSignFlowConfigSchema, signFlowSchema } from '../schemas/signFlowTemplateSchmema'

const emit = defineEmits<{
  (e: 'createConfig'): void
}>()
const isVisible = ref(false)

const confirm = useConfirm()

const { handleSubmit, values, resetField, handleReset, setFieldValue } = useForm({
  validationSchema: toTypedSchema(createSignFlowConfigSchema),
  initialValues: {
    type: DOC_TYPE_LIST[0],
    signFlow: [
      {
        signType: {
          label: OD_INTERNAL_DOC_SIGN_TYPE_OPTS.MAJOR_SIGNER,
          value: OD_SIGN_TYPES.majorSigner
        },
        staffs: []
      }
    ]
  }
})
const { fields, insert, remove, move } = useFieldArray<z.infer<typeof signFlowSchema>>('signFlow')

const { mutate: createSignFlow, isPending: isCreatingSignFlow } = useCreateSignFlowTemplate({
  onSuccess: () => {
    toastSucceed({ detail: 'Tạo mẫu trình tự ký thành công' })
    handleCloseModal()
    emit('createConfig')
  }
})

const handleOpendModal = () => {
  handleReset()
  isVisible.value = true
}

const handleCloseModal = () => {
  isVisible.value = false
}

const reset = () => {}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) {
    reset()
  }
}

const handleGenDocumentTypeOpts = () => {
  return {
    options: DOC_TYPE_LIST,
    hasMore: false
  }
}

const handleAddSignFlow = () => {
  // if (fields.value.length >= OD_SIGN_TYPE_OPT_LIST.length) return
  insert(fields?.value?.length - 1, {
    signType: undefined!,
    staffs: null
  })
}

const handleChangeOrder = (evt: SortableEvent) => {
  if (evt.oldIndex != null && evt.newIndex != null && evt.newIndex !== fields?.value?.length - 1) {
    console.log('[handleChangeOrder] oldIndex:', evt.oldIndex, 'newIndex:', evt.newIndex)
    move(evt.oldIndex, evt.newIndex)
  }
}

const handleChangeDocType = (value: TCommonSelectOptions<'OUT_DOCUMENT' | 'INTERNAL_DOCUMENT'>) => {
  resetField('signFlow', {
    value: [
      {
        signType: {
          label: OD_SIGN_TYPE_LABELS.MAJOR_SIGNER,
          value: OD_SIGN_TYPES.majorSigner
        },
        staffs: []
      }
    ]
  })
}

const handleSetUnitValue = (selectedUnit: TUnitSelectValue | null) => {
  if (!selectedUnit) return
  setFieldValue('appliedUnit', {
    id: selectedUnit?.id,
    name: selectedUnit?.name
  })
}

const onSubmit = handleSubmit((formValues) => {
  console.log(formValues, 'formValues')
  confirm.require({
    group: 'modalAddSignFlowConfig',
    message: 'Thầy/Cô có xác nhận tạo mẫu trình tự ký?',
    header: 'Tạo trình tự ký',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    },
    accept: () => {
      createSignFlow(
        cleanObject({
          flowStepTemplate: formValues?.signFlow?.map((step) => ({
            signType: step?.signType?.value,
            actorIds: step?.staffs?.map((staff) => staff?.positionId) ?? []
          })),
          unitId: formValues?.appliedUnit?.id,
          name: formValues?.name,
          type: formValues?.type?.value
        })
      )
    }
  })
})

defineExpose({
  openModal: handleOpendModal,
  closeModal: handleCloseModal
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    @update:visible="handleVisibleChange"
    :footer="false"
    :wrapper-style="{ width: '680px', overflow: 'hidden' }"
    :classContent="'!overflow-auto !pt-0 !p-0 h-full'"
    title="Cấu hình mẫu trình tự ký"
  >
    <div class="relative h-full overflow-auto p-4">
      <form @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <AppTextInput name="name" required label="Tên mẫu" placeholder="Nhập tên mẫu" />
          <AppSelect
            name="type"
            required
            label="Loại văn bản"
            placeholder="Chọn loại văn bản"
            :multiple="false"
            :fetch-options="handleGenDocumentTypeOpts"
            @select="handleChangeDocType"
          />
          <InternalUnitSelect
            :default-value="null"
            label="Chọn đơn vị áp dụng"
            modalLabel="Chọn đơn vị"
            :is-select-multiple="false"
            type="FULL"
            @submit="handleSetUnitValue"
          />
        </div>
        <div class="mt-10">
          <Button
            class="mb-4 inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline"
            @click="handleAddSignFlow"
            variant="text"
            :disabled="fields?.length >= Object.entries(OD_EXTERNAl_SIGN_TYPE_OPTS)?.length"
          >
            <span class="icon-[gravity-ui--circle-plus-fill]"></span> Thêm trình tự ký
          </Button>
          <VueDraggable
            :model-value="fields"
            :animation="150"
            ghostClass="ghost"
            @end="handleChangeOrder"
            filter=".filtered-out"
          >
            <DocumentSignTemplateFlowItem
              v-for="(entry, idx) in fields"
              :key="entry.key"
              :isSelectTypeDisabled="idx === fields?.length - 1"
              :documentType="values?.type?.value!"
              :index="idx"
              :formName="`signFlow`"
              @delete="remove"
              class="mb-2"
              :class="{ 'filtered-out': idx === fields?.length - 1 }"
            />
          </VueDraggable>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <Button
            class="min-w-[100px]"
            label="Huỷ"
            severity="secondary"
            variant="outlined"
            :disabled="isCreatingSignFlow"
            @click="isVisible = false"
          />
          <Button
            class="min-w-[100px]"
            :loading="isCreatingSignFlow"
            type="submit"
            label="Xác nhận"
          />
        </div>
      </form>
    </div>
    <ConfirmDialog group="modalAddSignFlowConfig" />
  </AppModal>
</template>
