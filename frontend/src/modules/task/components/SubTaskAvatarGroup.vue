<script setup lang="ts">
import type { SubtaskVM, StaffDTO, TaskStaffVM } from "@/shared/services/api";
import TaskAvatarSection from "./TaskAvatarSection.vue";
import type { TStaffSelectValue } from "@/shared/models/organization/unit";
import { useUpdateSubtask } from "../composable/subtask/useUpdateSubtask";
import { useQueryClient } from "@tanstack/vue-query";
import { SUBTASK_ROLE } from "../constants/task";
import { toastSucceed, notifyError } from "@/shared/utils/common";
import { computed } from "vue";

interface Props {
  subtask: SubtaskVM;
  readonly?: boolean;
}

const props = defineProps<Props>();

const queryClient = useQueryClient();

const { mutate: updateSubtask } = useUpdateSubtask();

// Convert Array or Set to Set<TaskStaffVM>
const normalizeToSet = (
  value: Set<TaskStaffVM> | TaskStaffVM[] | undefined | null
): Set<TaskStaffVM> | undefined => {
  if (!value) return undefined;
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  return undefined;
};

// Computed properties to ensure Set type
const executorsSet = computed(() =>
  normalizeToSet(props.subtask?.executors as Set<TaskStaffVM> | TaskStaffVM[] | undefined)
);
const collaboratorsSet = computed(() =>
  normalizeToSet(
    props.subtask?.collaborators as Set<TaskStaffVM> | TaskStaffVM[] | undefined
  )
);

// Convert to TStaffSelectValue[]
const convertStaffSetToSelections = (
  staffSet?: Set<TaskStaffVM>
): TStaffSelectValue[] => {
  if (!staffSet) return [];
  const array = staffSet instanceof Set ? Array.from(staffSet) : staffSet;
  return array
    .map((staff) => ({
      positionId: staff?.staffId ?? "",
      displayName: staff?.name ?? "",
    }))
    .filter((item) => !!item.positionId);
};

// Filter staff selections to remove invalid items
const filterStaffSelections = (
  selections: TStaffSelectValue[] | null | undefined
): TStaffSelectValue[] => (selections ?? []).filter((item) => !!item?.positionId);

// Build participants payload with executors and collaborators
const buildParticipantsPayload = (
  executorSelections: TStaffSelectValue[] | null | undefined,
  collaboratorSelections: TStaffSelectValue[] | null | undefined
): StaffDTO[] => {
  const payload: StaffDTO[] = [];

  filterStaffSelections(executorSelections).forEach((executor) =>
    payload.push({
      id: executor.positionId,
      role: SUBTASK_ROLE.executor,
    })
  );

  filterStaffSelections(collaboratorSelections).forEach((collaborator) =>
    payload.push({
      id: collaborator.positionId,
      role: SUBTASK_ROLE.collaborator,
    })
  );

  return payload;
};

// Update subtask participants
const updateSubtaskParticipants = (
  executorSelections: TStaffSelectValue[] | null,
  collaboratorSelections: TStaffSelectValue[] | null
) => {
  if (!props.subtask?.id) return;

  const staff = buildParticipantsPayload(executorSelections, collaboratorSelections);

  updateSubtask(
    {
      subtaskId: props.subtask.id,
      request: {
        name: props.subtask?.name || "",
        content: props.subtask?.content || "",
        staff,
      },
    },
    {
      onSuccess: () => {
        toastSucceed({ summary: "Cập nhật người tham gia thành công!" });
        if (props.subtask?.taskId) {
          queryClient.invalidateQueries({
            queryKey: ["getTaskById", props.subtask.taskId],
          });
        }
        queryClient.invalidateQueries({ queryKey: ["getListTasks"] });
      },
      onError: (error) => {
        notifyError(error as TServerError, "Lỗi khi cập nhật người tham gia");
      },
    }
  );
};

const handleExecutorsUpdate = (value: TStaffSelectValue[] | null | undefined) => {
  const collaboratorSelections = convertStaffSetToSelections(collaboratorsSet.value);
  updateSubtaskParticipants(value ?? null, collaboratorSelections);
};

const handleCollaboratorsUpdate = (value: TStaffSelectValue[] | null | undefined) => {
  const executorSelections = convertStaffSetToSelections(executorsSet.value);
  updateSubtaskParticipants(executorSelections, value ?? null);
};
</script>

<template>
  <div class="mb-6">
    <div class="grid grid-cols-1 gap-6">
      <TaskAvatarSection
        label="Người thực hiện"
        :staff-set="executorsSet"
        avatar-size="small"
        gap="gap-2"
        modal-label="Chọn người thực hiện"
        :other-staff-set="collaboratorsSet"
        duplicate-error-message="Người thực hiện không thể trùng với người phối hợp"
        :readonly="props.readonly"
        @update:value="handleExecutorsUpdate"
      />
      <TaskAvatarSection
        label="Người phối hợp"
        :staff-set="collaboratorsSet"
        avatar-size="small"
        gap="gap-2"
        modal-label="Chọn người phối hợp"
        :other-staff-set="executorsSet"
        duplicate-error-message="Người phối hợp không thể trùng với người thực hiện"
        :readonly="props.readonly"
        @update:value="handleCollaboratorsUpdate"
      />
    </div>
  </div>
</template>
