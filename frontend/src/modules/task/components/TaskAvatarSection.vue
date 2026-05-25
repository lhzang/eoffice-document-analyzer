<script setup lang="ts">
import Avatar from "primevue/avatar";
import AvatarGroup from "primevue/avatargroup";
import { computed, ref, watch } from "vue";
import { displayedAvatars } from "@/shared/utils/common";
import type { TaskStaffVM } from "@/shared/services/api";
import InternalStaffListSelect from "./tree/InternalStaffListSelect.vue";
import type {
  TStaffSelectValue,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode,
} from "@/shared/models/organization/unit";

interface Props {
  label: string;
  staffSet?: Set<TaskStaffVM>;
  avatarSize?: "normal" | "small";
  gap?: string;
  modalLabel: string;
  otherStaffSet?: Set<TaskStaffVM>;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  avatarSize: "normal",
  gap: "gap-3",
  readonly: false,
});

const emit = defineEmits<{
  "update:value": [value: TStaffSelectValue[] | null | undefined];
}>();

type StaffModalRef = InstanceType<typeof InternalStaffListSelect>;
const modalRef = ref<StaffModalRef | null>(null);

// Convert Set<TaskStaffVM> to array of TaskStaffVM objects
const getStaffArray = (staffSet: Set<TaskStaffVM> | undefined): TaskStaffVM[] => {
  if (!staffSet) return [];
  return Array.from(staffSet);
};

// Convert Set<TaskStaffVM> to array of names
const getStaffNames = (staffSet: Set<TaskStaffVM> | undefined): string[] => {
  if (!staffSet) return [];
  return Array.from(staffSet).map((staff) => staff.name || "");
};

// Convert TaskStaffVM to TStaffSelectValue
const convertTaskStaffVMToSelectValue = (staff: TaskStaffVM): TStaffSelectValue => {
  return {
    positionId: staff.staffId || "",
    displayName: `${staff.titleAbbr ?? ""} ${staff.name ?? ""}`.trim(),
  };
};

// Convert Set<TaskStaffVM> to TStaffSelectValue[]
const convertStaffSetToSelectValues = (
  staffSet: Set<TaskStaffVM> | undefined
): TStaffSelectValue[] => {
  if (!staffSet) return [];
  return Array.from(staffSet).map(convertTaskStaffVMToSelectValue);
};

const staffArray = computed(() => getStaffArray(props.staffSet));
const staffNames = computed(() => getStaffNames(props.staffSet));
const avatars = computed(() => displayedAvatars(staffNames.value, 3));
const otherStaffSelections = computed(() =>
  props.otherStaffSet ? convertStaffSetToSelectValues(props.otherStaffSet) : []
);

// Get remaining staff names
const remainingStaffNames = computed(() => {
  if (!props.staffSet || staffArray.value.length <= 3) return null;
  const names = staffArray.value
    .slice(3)
    .map((staff) => staff.name || "")
    .filter((name) => name)
    .join(", ");
  console.log("remainingStaffNames:", names);
  return names || null;
});

const currentValue = ref<TStaffSelectValue[] | null>(
  convertStaffSetToSelectValues(props.staffSet)
);

watch(
  () => props.staffSet,
  (newStaffSet) => {
    currentValue.value = convertStaffSetToSelectValues(newStaffSet);
  },
  { immediate: true }
);

const openModal = () => {
  currentValue.value = convertStaffSetToSelectValues(props.staffSet);
  modalRef.value?.openModal();
};

const checkIfStaffDisabled = (staff: TTreeStaffNodeNew): boolean => {
  if (!staff?.positionId || otherStaffSelections.value.length === 0) return false;

  return otherStaffSelections.value.some((item) => item.positionId === staff.positionId);
};

// Check if unit should be disabled
const checkIfUnitDisabled = (unit: TTreeUnitWithStaffNode): boolean => {
  if (!unit?.staffs || unit.staffs.length === 0) return false;
  const allStaffsDisabled = unit.staffs.every((staff) => checkIfStaffDisabled(staff));
  return allStaffsDisabled;
};

const handleConfirm = (value: TStaffSelectValue[] | null | undefined) => {
  currentValue.value = value ?? null;
  emit("update:value", value);
};
</script>

<template>
  <div :class="`flex items-center ${props.gap}`">
    <div class="text-gray-600 font-medium">{{ props.label }}:</div>
    <template v-if="staffArray.length > 0">
      <AvatarGroup>
        <template v-for="(avatar, idx) in avatars" :key="idx">
          <Avatar
            :label="avatar.label"
            v-tippy="staffArray[idx]?.name"
            v-if="!avatar.label.startsWith('+')"
            :style="{ backgroundColor: avatar.color, color: 'white' }"
            shape="circle"
            :size="avatarSize"
          />
            <Avatar
              v-else
              v-tippy="remainingStaffNames"
              :label="avatar.label"
              :style="{ backgroundColor: avatar.color, color: 'white' }"
              shape="circle"
              :size="avatarSize"
              :class="{ 'cursor-pointer': !props.readonly }"
              @click="!props.readonly && openModal()"
            />
        </template>
        <Avatar
          v-if="!props.readonly"
          label="+"
          :style="{
            backgroundColor: 'transparent',
            color: '#007BFF',
            border: '2px dashed #007BFF',
          }"
          shape="circle"
          :size="avatarSize"
          class="cursor-pointer"
          @click="openModal"
        />
      </AvatarGroup>
    </template>
    <template v-else>
      <AvatarGroup>
        <Avatar
          v-if="!props.readonly"
          label="+"
          v-tippy="'Chọn người tham gia'"
          :style="{
            backgroundColor: 'transparent',
            color: '#007BFF',
            border: '2px dashed #007BFF',
          }"
          shape="circle"
          :size="avatarSize"
          class="cursor-pointer"
          @click="openModal"
        />
      </AvatarGroup>
    </template>

    <!-- Staff Selection Modal -->
    <InternalStaffListSelect
      ref="modalRef"
      :model-value="currentValue"
      :modal-label="modalLabel"
      :check-if-staff-disabled="checkIfStaffDisabled"
      :check-if-unit-disabled="checkIfUnitDisabled"
      @update:model-value="handleConfirm"
    />
  </div>
</template>
