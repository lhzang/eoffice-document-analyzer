<script setup lang="ts">
import AppDateInput from "@/shared/components/form-elements/AppDateInput.vue";
import AppTextInput from "@/shared/components/form-elements/AppTextInput.vue";
import AppTextarea from "@/shared/components/form-elements/AppTextarea.vue";
import InternalStaffListSelect from "./tree/InternalStaffListSelect.vue";
import { ref, computed } from "vue";
import { useField } from "vee-validate";
import { Tippy } from "vue-tippy";
import { Message } from "primevue";
import type {
  TStaffSelectValue,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode,
} from "@/shared/models/organization/unit";

type TProps = {
  index: number;
  canDelete?: boolean;
};
const { index, canDelete = true } = defineProps<TProps>();
const emit = defineEmits<{
  delete: [idx: number];
}>();

const handleDeleteStep = () => {
  emit("delete", index);
};

const minDate = ref(new Date());

type StaffModalRef = InstanceType<typeof InternalStaffListSelect>;
const executorsModalRef = ref<StaffModalRef | null>(null);
const collaboratorsModalRef = ref<StaffModalRef | null>(null);

// Form fields for executors and collaborators
const { value: executorsValue, errorMessage: executorsError } = useField<
  TStaffSelectValue[] | null
>(`task.${index}.executors`, undefined, {
  syncVModel: true,
});

const { value: collaboratorsValue, errorMessage: collaboratorsError } = useField<
  TStaffSelectValue[] | null
>(`task.${index}.collaborators`, undefined, {
  syncVModel: true,
});

// Display text showing selected staff names
const executorsDisplay = computed(() => {
  const staffs = executorsValue.value || [];
  if (staffs.length === 0) return "";
  return staffs.map((staff) => staff.displayName).join(", ");
});

const collaboratorsDisplay = computed(() => {
  const staffs = collaboratorsValue.value || [];
  if (staffs.length === 0) return "";
  return staffs.map((staff) => staff.displayName).join(", ");
});

const checkIfExecutorDisabled = (staff: TTreeStaffNodeNew): boolean => {
  if (!collaboratorsValue.value || collaboratorsValue.value.length === 0) return false;
  return collaboratorsValue.value.some(
    (collaborator) => collaborator.positionId === staff.positionId
  );
};

const checkIfCollaboratorDisabled = (staff: TTreeStaffNodeNew): boolean => {
  if (!executorsValue.value || executorsValue.value.length === 0) return false;
  return executorsValue.value.some(
    (executor) => executor.positionId === staff.positionId
  );
};

// Check if unit should be disabled
const checkIfExecutorUnitDisabled = (unit: TTreeUnitWithStaffNode): boolean => {
  if (!unit?.staffs || unit.staffs.length === 0) return false;
  const allStaffDisabled = unit.staffs.every((staff) => checkIfExecutorDisabled(staff));
  return allStaffDisabled;
};

const checkIfCollaboratorUnitDisabled = (unit: TTreeUnitWithStaffNode): boolean => {
  if (!unit?.staffs || unit.staffs.length === 0) return false;
  const allStaffDisabled = unit.staffs.every((staff) =>
    checkIfCollaboratorDisabled(staff)
  );
  return allStaffDisabled;
};
</script>
<template>
  <div class="border-primary flex items-center gap-2 rounded-sm border p-2">
    <div
      class="item-center flex h-6 w-6 items-center justify-center bg-white font-semibold"
    >
      {{ index + 1 }}
    </div>
    <div class="w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AppTextInput
          class="w-full"
          :name="`task.${index}.subtaskName`"
          label="Tên đầu công việc"
          required
          placeholder="Nhập tên đầu công việc..."
        />
        <AppDateInput
          class="w-full"
          :name="`task.${index}.subExpectedDueDate`"
          label="Hạn dự kiến"
          placeholder="Chọn hạn dự kiến"
          :date-format="'dd/mm/yy'"
          showTime
          required
          hourFormat="24"
          :minDate="minDate"
          :manualInput="true"
        />
        <!-- Executors Input -->
        <div class="h-full w-full">
          <label class="text-primary font-semibold"
            >Người thực hiện đầu việc <span class="text-red-500">*</span></label
          >
          <Tippy :max-width="300" :content="executorsDisplay">
            <div
              :class="`font-sm 0 h-10 border border-solid px-3 py-2 ${
                executorsError
                  ? 'border-(--p-inputtext-invalid-border-color)'
                  : 'border-(--p-inputtext-border-color)'
              } rounded-md hover:border-(--p-inputtext-border-color) - all duration - 200 transition cursor-pointer bg-(--p-inputtext-background) text-(--p-inputtext-color) relative`"
              @click="executorsModalRef?.openModal()"
            >
              <div v-if="executorsDisplay" class="h-full w-full truncate">
                {{ executorsDisplay }}
              </div>
              <div
                v-else
                class="h-full w-full truncate text-(--p-inputtext-disabled-color)"
              >
                Vui lòng chọn người thực hiện...
              </div>
            </div>
          </Tippy>
          <Message v-if="!!executorsError" severity="error" size="small" variant="simple">
            {{ executorsError }}
          </Message>
        </div>

        <!-- Collaborators Input -->
        <div class="h-full w-full">
          <label class="text-primary font-semibold">Người phối hợp thực hiện</label>
          <Tippy :max-width="300" :content="collaboratorsDisplay">
            <div
              :class="`font-sm 0 h-10 border border-solid px-3 py-2 ${
                collaboratorsError
                  ? 'border-(--p-inputtext-invalid-border-color)'
                  : 'border-(--p-inputtext-border-color)'
              } rounded-md hover:border-(--p-inputtext-border-color) - all duration - 200 transition cursor-pointer bg-(--p-inputtext-background) text-(--p-inputtext-color) relative`"
              @click="collaboratorsModalRef?.openModal()"
            >
              <div v-if="collaboratorsDisplay" class="h-full w-full truncate">
                {{ collaboratorsDisplay }}
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
            v-if="!!collaboratorsError"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ collaboratorsError }}
          </Message>
        </div>

        <AppTextarea
          class="w-full col-span-2"
          :name="`task.${index}.note`"
          placeholder="Nhập ghi chú.."
          label="Ghi chú"
        />
      </div>
    </div>
    <div
      v-if="canDelete"
      class="item-center flex h-6 w-6 cursor-pointer items-center justify-center bg-white font-semibold text-gray-400 transition hover:text-red-400"
    >
      <span class="icon-[tabler--trash] text-2xl" @click="handleDeleteStep"></span>
    </div>
    <div
      v-else
      class="item-center flex h-6 w-6 items-center justify-center bg-white font-semibold text-gray-300"
    >
      <span class="icon-[tabler--lock] text-2xl"></span>
    </div>

    <!-- Staff Selection Modals -->
    <InternalStaffListSelect
      ref="executorsModalRef"
      v-model="executorsValue"
      modal-label="Chọn người thực hiện đầu việc"
      :check-if-staff-disabled="checkIfExecutorDisabled"
      :check-if-unit-disabled="checkIfExecutorUnitDisabled"
    />
    <InternalStaffListSelect
      ref="collaboratorsModalRef"
      v-model="collaboratorsValue"
      modal-label="Chọn người phối hợp thực hiện"
      :check-if-staff-disabled="checkIfCollaboratorDisabled"
      :check-if-unit-disabled="checkIfCollaboratorUnitDisabled"
    />
  </div>
</template>
