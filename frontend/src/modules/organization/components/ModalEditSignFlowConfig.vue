<script setup lang="ts">
import DocumentSignTemplateFlowItem from '@/shared/components/document/DocumentSignTemplateFlowItem.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import { DOCUMENT_TYPES } from '@/shared/constants/document'
import {
  OD_INTERNAL_DOC_SIGN_TYPE_OPTS,
  OD_SIGN_TYPE_LABELS,
  OD_SIGN_TYPES,
  type TODSignTypes
} from '@/shared/constants/sign'
import type { FlowSignTemplateVM } from '@/shared/services/api'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useFieldArray, useForm } from 'vee-validate'
import { ref, watchEffect } from 'vue'
import { VueDraggable, type SortableEvent } from 'vue-draggable-plus'
import type z from 'zod'
import { DOC_TYPE_LIST } from '../constants/flow'
import { createSignFlowConfigSchema, signFlowSchema } from '../schemas/signFlowTemplateSchmema'

const emit = defineEmits<{
  (e: 'createConfig'): void
}>()
const isVisible = ref(false)
const flow = ref<FlowSignTemplateVM>()

const confirm = useConfirm()

const { values, handleSubmit, resetField, handleReset, setValues, setFieldValue } = useForm({
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

const handleOpendModal = (selectedFlow: FlowSignTemplateVM) => {
  flow.value = selectedFlow
  setValues({
    name: selectedFlow?.name,
    type: DOC_TYPE_LIST?.find((type) => type.value === selectedFlow?.type),
    appliedUnit: {
      id: selectedFlow?.unit?.id,
      name: selectedFlow?.unit?.name
    },
    signFlow: selectedFlow?.steps?.map((step) => ({
      signType: {
        label: OD_SIGN_TYPE_LABELS?.[step?.signType as TODSignTypes],
        value: step?.signType as TODSignTypes
      },
      staffs: step?.permittedStaff?.map((staff) => ({
        positionId: staff?.id,
        displayName: staff?.name
      }))
    }))
  })
  isVisible.value = true
}
watchEffect(() => {
  console.log(values, 'fsadfasdfasdfasdasfdfasd')
})
const handleCloseModal = () => {
  isVisible.value = false
}

const reset = () => {
  flow.value = undefined
  handleReset()
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) {
    reset()
  }
}

const handleGenDocumentTypeOpts = () => {
  return {
    options: [
      {
        label: 'Văn bản nội bộ',
        value: DOCUMENT_TYPES.internalDoc
      },
      {
        label: 'Văn bản đi',
        value: DOCUMENT_TYPES.outDoc
      }
    ],
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

const handleChangeDocType = () => {
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

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    group: 'updateFlow',
    message: 'Thầy/Cô có xác nhận cập nhật mẫu trình tự ký?',
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
    accept: () => {}
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
          <AppTextInput name="name" disabled required label="Tên mẫu" placeholder="Nhập tên mẫu" />
          <AppSelect
            name="type"
            required
            disabled
            label="Loại văn bản"
            placeholder="Chọn loại văn bản"
            :multiple="false"
            :fetch-options="handleGenDocumentTypeOpts"
            @select="handleChangeDocType"
          />
          <InternalUnitSelect
            :default-value="values?.appliedUnit"
            disabled
            label="Chọn đơn vị áp dụng"
            modalLabel="Chọn đơn vị"
            :is-select-multiple="false"
            type="FULL"
          />
        </div>
        <div class="mt-10">
          <Button
            class="mb-4 inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline"
            @click="handleAddSignFlow"
            variant="text"
          >
            <span class="icon-[gravity-ui--circle-plus-fill]"></span> Thêm trình tự ký
          </Button>
          <VueDraggable
            :model-value="fields"
            :animation="150"
            ghostClass="ghost"
            :disabled="true"
            @end="handleChangeOrder"
            filter=".filtered-out"
          >
            <DocumentSignTemplateFlowItem
              v-for="(entry, idx) in fields"
              :key="entry.key"
              disabled
              :isSelectTypeDisabled="idx === fields?.length - 1"
              documentType="OUT_DOCUMENT"
              :index="idx"
              :formName="`signFlow`"
              @delete="remove"
              class="mb-2"
              :class="{ 'filtered-out': idx === fields?.length - 1 }"
            />
          </VueDraggable>
        </div>
      </form>
    </div>
    <ConfirmDialog group="updateFlow" />
  </AppModal>
</template>
