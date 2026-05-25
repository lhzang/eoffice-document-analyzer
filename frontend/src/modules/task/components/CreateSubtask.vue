<script setup lang="ts">
import AppModal from "@/shared/components/modals/AppModal.vue";
import AppTextarea from "@/shared/components/form-elements/AppTextarea.vue";
import AppTextInput from "@/shared/components/form-elements/AppTextInput.vue";
import AppDateInput from "@/shared/components/form-elements/AppDateInput.vue";
import InternalStaffListSelect from "./tree/InternalStaffListSelect.vue";
import Button from "primevue/button";
import { ref, useTemplateRef, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useField } from "vee-validate";
import { Tippy } from "vue-tippy";
import { Message } from "primevue";
import { useCreateSubtask } from "../composable/subtask/useCreateSubtask";
import { createSubtaskSchema } from "../schemas/taskCreateSchema";
import { notifyError, toastSucceed } from "@/shared/utils/common";
import { useQueryClient } from "@tanstack/vue-query";
import type {
  TStaffSelectValue,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode,
} from "@/shared/models/organization/unit";
import type { CreateSubtaskRequest, StaffDTO } from "@/shared/services/api";
import { SUBTASK_ROLE } from "../constants/task";
import type { CreateSubtaskFormData } from "../models/type";
import { DateTime } from "luxon";

interface Props {
  taskId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  success: [];
  close: [];
}>();

const queryClient = useQueryClient();

type Modal = InstanceType<typeof AppModal>;
const modalRef = useTemplateRef<Modal | null>("modalRef");

type StaffModalRef = InstanceType<typeof InternalStaffListSelect>;
const executorModalRef = useTemplateRef<StaffModalRef | null>("executorModalRef");
const collaboratorModalRef = useTemplateRef<StaffModalRef | null>("collaboratorModalRef");

const schema = toTypedSchema(createSubtaskSchema);

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    subTaskName: "",
    executor: [],
    collaborator: [],
    expectedDueDate: new Date(),
    subTaskDescription: "",
  },
});

// Form fields for executor and collaborator
const { value: executorValue, errorMessage: executorError } = useField<
  TStaffSelectValue[] | null
>("executor", undefined, {
  syncVModel: true,
});

const { value: collaboratorValue, errorMessage: collaboratorError } = useField<
  TStaffSelectValue[] | null
>("collaborator", undefined, {
  syncVModel: true,
});

// Display text showing selected staff names
const executorDisplay = computed(() => {
  const staffs = executorValue.value;
  if (staffs?.length === 0) return "";
  return staffs?.map((staff) => staff.displayName).join(", ");
});

const collaboratorDisplay = computed(() => {
  const staffs = collaboratorValue.value;
  if (staffs?.length === 0) return "";
  return staffs?.map((staff) => staff.displayName).join(", ");
});

// Check if staff should be disabled
const checkIfExecutorDisabled = (staff: TTreeStaffNodeNew): boolean => {
  if (!collaboratorValue.value?.length) return false;
  return collaboratorValue.value.some(
    (collaborator) => collaborator.positionId === staff.positionId
  );
};

const checkIfCollaboratorDisabled = (staff: TTreeStaffNodeNew): boolean => {
  if (!executorValue.value?.length) return false;
  return executorValue.value.some((executor) => executor.positionId === staff.positionId);
};

// Check if unit should be disabled
const checkIfExecutorUnitDisabled = (unit: TTreeUnitWithStaffNode): boolean => {
  const allStaffsDisabled = unit.staffs.every((staff) => checkIfExecutorDisabled(staff));
  return allStaffsDisabled;
};

const checkIfCollaboratorUnitDisabled = (unit: TTreeUnitWithStaffNode): boolean => {
  const allStaffsDisabled = unit.staffs.every((staff) =>
    checkIfCollaboratorDisabled(staff)
  );
  return allStaffsDisabled;
};

const minDate = ref(new Date());

const { mutate: createSubtask, isPending: isCreatingSubtask } = useCreateSubtask({
  onSuccess: () => {
    toastSucceed({ summary: "Tạo đầu công việc thành công!" });
    modalRef.value?.closeModal();
    queryClient.invalidateQueries({ queryKey: ["getTaskById", props.taskId] });
    queryClient.invalidateQueries({ queryKey: ["getListTasks"] });
    emit("success");
  },
  onError: (error) => {
    notifyError(error as TServerError, "Lỗi khi tạo đầu công việc");
  },
});

// Transform formData to CreateSubtaskRequest
const transformFormDataToRequest = (
  formData: CreateSubtaskFormData
): CreateSubtaskRequest => {
  const staff: StaffDTO[] = [];

  const executor = formData.executor || [];
  const collaborator = formData.collaborator || [];

  executor
    .filter((item) => !!item.positionId)
    .forEach((staffItem) => {
      staff.push({
        id: staffItem.positionId,
        role: SUBTASK_ROLE.executor,
      });
    });

  collaborator
    .filter((item) => !!item.positionId)
    .forEach((staffItem) => {
      staff.push({
        id: staffItem.positionId,
        role: SUBTASK_ROLE.collaborator,
      });
    });

  return {
    name: formData.subTaskName,
    content: formData.subTaskDescription || "",
    staff: staff,
    deadline: DateTime.fromJSDate(formData.expectedDueDate).toISO({ includeOffset: false }) || ''
  };
};

const handleCreateSubtask = handleSubmit((formData) => {
  const request = transformFormDataToRequest(formData);
  createSubtask({
    taskId: props.taskId,
    request,
  });
});

const openModal = () => {
  // Reset form to initial values when opening modal
  resetForm();
  modalRef.value?.openModal();
};

const closeModal = () => {
  modalRef.value?.closeModal();
  emit("close");
};

defineExpose({
  openModal,
  closeModal,
});
</script>

<template>
  <AppModal
    ref="modalRef"
    :wrapper-style="{ width: '400px' }"
    title="Tạo thêm đầu công việc"
    @close="closeModal"
  >
    <form @submit="handleCreateSubtask" class="text-primary">
      <AppTextInput
        name="subTaskName"
        label="Tên đầu công việc"
        placeholder="Nhập tên đầu việc"
        class="w-full mb-4"
        required
      />

      <div class="h-full w-full mb-4">
        <label class="text-primary font-semibold"
          >Người thực hiện công việc <span class="text-red-500">*</span></label
        >
        <Tippy :max-width="300" :content="executorDisplay">
          <div
            :class="`font-sm 0 h-10 border border-solid px-3 py-2 ${
              executorError
                ? 'border-(--p-inputtext-invalid-border-color)'
                : 'border-(--p-inputtext-border-color)'
            } rounded-md hover:border-(--p-inputtext-border-color) - all duration - 200 transition cursor-pointer bg-(--p-inputtext-background) text-(--p-inputtext-color) relative`"
            @click="executorModalRef?.openModal()"
          >
            <div v-if="executorDisplay" class="h-full w-full truncate">
              {{ executorDisplay }}
            </div>
            <div
              v-else
              class="h-full w-full truncate text-(--p-inputtext-disabled-color)"
            >
              Vui lòng chọn người thực hiện...
            </div>
          </div>
        </Tippy>
        <Message v-if="!!executorError" severity="error" size="small" variant="simple">
          {{ executorError }}
        </Message>
      </div>

      <div class="h-full w-full mb-4">
        <label class="text-primary font-semibold">Người phối hợp thực hiện</label>
        <Tippy :max-width="300" :content="collaboratorDisplay">
          <div
            :class="`font-sm 0 h-10 border border-solid px-3 py-2 ${
              collaboratorError
                ? 'border-(--p-inputtext-invalid-border-color)'
                : 'border-(--p-inputtext-border-color)'
            } rounded-md hover:border-(--p-inputtext-border-color) - all duration - 200 transition cursor-pointer bg-(--p-inputtext-background) text-(--p-inputtext-color) relative`"
            @click="collaboratorModalRef?.openModal()"
          >
            <div v-if="collaboratorDisplay" class="h-full w-full truncate">
              {{ collaboratorDisplay }}
            </div>
            <div
              v-else
              class="h-full w-full truncate text-(--p-inputtext-disabled-color)"
            >
              Vui lòng chọn người phối hợp...
            </div>
          </div>
        </Tippy>
        <Message
          v-if="!!collaboratorError"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ collaboratorError }}
        </Message>
      </div>

      <AppDateInput
        name="expectedDueDate"
        label="Hạn dự kiến"
        placeholder="Chọn hạn dự kiến"
        :date-format="'dd/mm/yy'"
        showTime
        required
        hourFormat="24"
        :minDate="minDate"
        :append-to="'body'"
        auto-z-index
        class="mb-4"
        :manualInput="true" 
      />

      <AppTextarea
        name="subTaskDescription"
        label="Nội dung công việc"
        placeholder="Nhập mô tả đầu công việc"
        class="w-full mt-4"
      />

      <div class="text-primary font-semibold mt-2">* Thông tin bắt buộc</div>

      <div class="mt-4 flex w-full justify-end gap-4">
        <Button label="Hủy bỏ" type="button" @click="closeModal" />
        <Button :loading="isCreatingSubtask" label="Xác nhận" type="submit" />
      </div>
    </form>

    <!-- Staff Selection Modals -->
    <InternalStaffListSelect
      ref="executorModalRef"
      v-model="executorValue"
      modal-label="Chọn người thực hiện công việc"
      :check-if-staff-disabled="checkIfExecutorDisabled"
      :check-if-unit-disabled="checkIfExecutorUnitDisabled"
    />
    <InternalStaffListSelect
      ref="collaboratorModalRef"
      v-model="collaboratorValue"
      modal-label="Chọn người phối hợp thực hiện"
      :check-if-staff-disabled="checkIfCollaboratorDisabled"
      :check-if-unit-disabled="checkIfCollaboratorUnitDisabled"
    />
  </AppModal>
</template>
