<script setup lang="ts">
import type { TaskVM, TaskStaffVM, StaffDTO } from "@/shared/services/api";
import TaskAvatarSection from "./TaskAvatarSection.vue";
import type { TStaffSelectValue } from "@/shared/models/organization/unit";
import { useUpdateTaskInfo } from "../composable/task/useUpdateTaskInfo";
import { useQueryClient } from "@tanstack/vue-query";
import { TASK_ROLE } from "../constants/task";
import { toastSucceed, notifyError } from "@/shared/utils/common";
import { computed } from "vue";

interface Props {
  data?: TaskVM;
  readonly?: boolean;
}

const props = defineProps<Props>();

const queryClient = useQueryClient();

const { mutate: updateTaskInfo } = useUpdateTaskInfo();

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
const leadersSet = computed(() =>
  normalizeToSet(props.data?.leaders as Set<TaskStaffVM> | TaskStaffVM[] | undefined)
);
const viewersSet = computed(() =>
  normalizeToSet(props.data?.viewers as Set<TaskStaffVM> | TaskStaffVM[] | undefined)
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

// Build participants payload with leaders and viewers
const buildParticipantsPayload = (
  leaderSelections: TStaffSelectValue[] | null | undefined,
  viewerSelections: TStaffSelectValue[] | null | undefined
): StaffDTO[] => {
  const payload: StaffDTO[] = [];

  filterStaffSelections(leaderSelections).forEach((leader) =>
    payload.push({
      id: leader.positionId,
      role: TASK_ROLE.leader,
    })
  );

  filterStaffSelections(viewerSelections).forEach((viewer) =>
    payload.push({
      id: viewer.positionId,
      role: TASK_ROLE.viewer,
    })
  );

  return payload;
};

// Update task participants
const updateTaskParticipants = (
  leaderSelections: TStaffSelectValue[] | null,
  viewerSelections: TStaffSelectValue[] | null
) => {
  if (!props.data?.id) return;

  const staff = buildParticipantsPayload(leaderSelections, viewerSelections);

  updateTaskInfo(
    {
      taskId: props.data.id,
      request: {
        name: props.data?.name || "",
        content: props.data?.content || "",
        staff,
      },
    },
    {
      onSuccess: () => {
        toastSucceed({ summary: "Cập nhật người tham gia thành công!" });
        if (props.data?.id) {
          queryClient.invalidateQueries({
            queryKey: ["getTaskById", props.data.id],
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

const handleLeadersUpdate = (value: TStaffSelectValue[] | null | undefined) => {
  const viewerSelections = convertStaffSetToSelections(viewersSet.value);
  updateTaskParticipants(value ?? null, viewerSelections);
};

const handleViewersUpdate = (value: TStaffSelectValue[] | null | undefined) => {
  const leaderSelections = convertStaffSetToSelections(leadersSet.value);
  updateTaskParticipants(leaderSelections, value ?? null);
};
</script>

<template>
  <div class="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
    <TaskAvatarSection
      label="Người chỉ đạo"
      :staff-set="leadersSet"
      avatar-size="normal"
      gap="gap-3"
      modal-label="Chọn người chỉ đạo"
      :other-staff-set="viewersSet"
      duplicate-error-message="Người chỉ đạo không thể trùng với người theo dõi"
      :readonly="props.readonly"
      @update:value="handleLeadersUpdate"
    />
    <TaskAvatarSection
      label="Người theo dõi"
      :staff-set="viewersSet"
      avatar-size="small"
      gap="gap-2"
      modal-label="Chọn người theo dõi"
      :other-staff-set="leadersSet"
      duplicate-error-message="Người theo dõi không thể trùng với người chỉ đạo"
      :readonly="props.readonly"
      @update:value="handleViewersUpdate"
    />
  </div>
</template>
