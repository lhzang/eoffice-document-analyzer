<script setup lang="ts">
import { computed } from "vue";
import type { SubtaskVM, TaskVM } from "@/shared/services/api";
import TaskStatusCard from "./TaskStatusCard.vue";
import { SUBTASK_STATE } from "../constants/task";

interface Props {
  subtasks: SubtaskVM[];
  task?: TaskVM;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "lastSubtaskDeleted"): void;
}>();

function handleLastSubtaskDeleted() {
  emit("lastSubtaskDeleted");
}

const totalSubtasksCount = computed(() => props.subtasks.length);

const executingSubtasks = computed(() =>
  props.subtasks.filter((s) => s.state === SUBTASK_STATE.executing)
);

const pendingSubtasks = computed(() =>
  props.subtasks.filter((s) => s.state === SUBTASK_STATE.evaluationPending)
);

const completedSubtasks = computed(() =>
  props.subtasks.filter((s) => s.state === SUBTASK_STATE.accepted)
);
</script>

<template>
  <div class="w-full overflow-x-auto overflow-y-hidden">
    <div
      class="grid grid-cols-3 gap-4 h-[600px] min-w-[calc(3*300px+2*1rem)]"
    >
      <div class="flex flex-col card min-w-[300px] h-full min-h-0">
        <div class="flex items-center gap-2 mb-4">
          <i class="icon-[tabler--progress] text-xl"></i>
          <div class="font-semibold text-xl">Đang thực hiện</div>
        </div>
        <div class="flex-1 overflow-y-auto space-y-3 pr-2">
          <TaskStatusCard
            v-for="subtask in executingSubtasks"
            :key="subtask.id"
            :subtask="subtask"
            :task="task"
            :total-subtasks-count="totalSubtasksCount"
            @lastSubtaskDeleted="handleLastSubtaskDeleted"
          />
        </div>
      </div>

      <div class="flex flex-col card min-w-[300px] h-full min-h-0">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-clock"></i>
          <div class="font-semibold text-xl">Chờ duyệt</div>
        </div>
        <div class="flex-1 overflow-y-auto space-y-3 pr-2">
          <TaskStatusCard
            v-for="subtask in pendingSubtasks"
            :key="subtask.id"
            :subtask="subtask"
            :task="task"
            :total-subtasks-count="totalSubtasksCount"
            @lastSubtaskDeleted="handleLastSubtaskDeleted"
          />
        </div>
      </div>

      <div class="flex flex-col card min-w-[300px] h-full min-h-0">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-check-circle"></i>
          <div class="font-semibold text-xl">Đã hoàn thành</div>
        </div>
        <div class="flex-1 overflow-y-auto space-y-3 pr-2">
          <TaskStatusCard
            v-for="subtask in completedSubtasks"
            :key="subtask.id"
            :subtask="subtask"
            :task="task"
            :total-subtasks-count="totalSubtasksCount"
            @lastSubtaskDeleted="handleLastSubtaskDeleted"
          />
        </div>
      </div>
    </div>
  </div>
</template>
