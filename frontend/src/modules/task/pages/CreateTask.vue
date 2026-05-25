<script setup lang="ts">
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppReferenceFile from '@/shared/components/modals/reference-file-modal/AppReferenceFile.vue'
import type { TAppTab } from '@/shared/models/common'
import type {
  FilesBySource,
  TDeviceFiles,
  TDocFiles,
  TReferenceSource,
  TTaskFiles
} from '@/shared/models/document'
import type {
  TStaffSelectValue,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode
} from '@/shared/models/organization/unit'
import { notifyError, toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, Message, useConfirm } from 'primevue'
import { useField, useFieldArray, useForm } from 'vee-validate'
import { computed, ref, useTemplateRef } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useRouter } from 'vue-router'
import { Tippy } from 'vue-tippy'
import AddTask from '../components/AddSubtask.vue'
import InternalStaffListSelect from '../components/tree/InternalStaffListSelect.vue'
import { useCreateTask } from '../composable/task/useCreateTask'
import { taskCreateSchema } from '../schemas/taskCreateSchema'

const tabList: TAppTab<TReferenceSource>[] = [
  { label: 'Từ văn bản', value: 'fromDoc' },
  { label: 'Tải file', value: 'upload' }
]

const fromDocFiles = ref<TDocFiles[]>([])
const fromTaskFiles = ref<TTaskFiles[]>([])
const uploadFiles = ref<TDeviceFiles[]>([])
const router = useRouter()
const queryClient = useQueryClient()
const confirm = useConfirm()
const schema = toTypedSchema(taskCreateSchema)

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    taskName: '',
    shortDescription: '',
    leaders: [],
    viewers: [],
    task: [
      {
        subtaskName: '',
        subExpectedDueDate: new Date(),
        note: '',
        executors: [],
        collaborators: []
      }
    ]
  }
})
const { fields, push, remove } = useFieldArray('task')

const canDeleteSubtask = computed(() => fields.value.length > 1)

type StaffModalRef = InstanceType<typeof InternalStaffListSelect>
const leadersModalRef = useTemplateRef<StaffModalRef | null>('leadersModalRef')
const viewersModalRef = useTemplateRef<StaffModalRef | null>('viewersModalRef')

// Form fields for leaders and viewers
const { value: leadersValue, errorMessage: leadersError } = useField<TStaffSelectValue[] | null>(
  'leaders',
  undefined,
  {
    syncVModel: true
  }
)

const { value: viewersValue, errorMessage: viewersError } = useField<TStaffSelectValue[] | null>(
  'viewers',
  undefined,
  {
    syncVModel: true
  }
)

// Display text showing selected staff names
const leadersDisplay = computed(() => {
  const staffs = leadersValue.value || []
  if (staffs.length === 0) return ''
  return staffs.map((staff) => staff.displayName).join(', ')
})

const viewersDisplay = computed(() => {
  const staffs = viewersValue.value || []
  if (staffs.length === 0) return ''
  return staffs.map((staff) => staff.displayName).join(', ')
})

// Check if staff should be disabled
const checkIfLeaderDisabled = (staff: TTreeStaffNodeNew): boolean => {
  if (!viewersValue.value?.length) return false
  return viewersValue.value.some((viewer) => viewer.positionId === staff.positionId)
}

const checkIfViewerDisabled = (staff: TTreeStaffNodeNew): boolean => {
  if (!leadersValue.value?.length) return false
  return leadersValue.value.some((leader) => leader.positionId === staff.positionId)
}

// Check if unit should be disabled
const checkIfLeaderUnitDisabled = (unit: TTreeUnitWithStaffNode): boolean => {
  const allStaffsDisabled = unit.staffs.every((staff) => checkIfLeaderDisabled(staff))
  return allStaffsDisabled
}

const checkIfViewerUnitDisabled = (unit: TTreeUnitWithStaffNode): boolean => {
  const allStaffsDisabled = unit.staffs.every((staff) => checkIfViewerDisabled(staff))
  return allStaffsDisabled
}

const handleAddTask = () => {
  push({
    subtaskName: '',
    subExpectedDueDate: new Date(),
    note: '',
    executors: [],
    collaborators: []
  })
}

const handleRemoveTask = (index: number) => {
  remove(index)
}

const { mutate: createTask, isPending } = useCreateTask()

const onSubmit = handleSubmit((formData) => {
  const filesBySource = {
    fromDoc: fromDocFiles.value,
    fromTask: fromTaskFiles.value,
    upload: uploadFiles.value
  }
  confirm.require({
    group: 'createTask',
    message: 'Thầy/Cô có xác nhận tạo công việc?',
    header: 'Từ chối',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      createTask(
        {
          formValues: formData,
          filesBySource: filesBySource
        },
        {
          onSuccess: () => {
            toastSucceed({ summary: 'Tạo công việc thành công!' })
            queryClient.invalidateQueries({ queryKey: ['getListTasks'] })
            router.replace('/task/list')
          },
          onError: (err) => notifyError(err as TServerError, 'Lỗi khi tạo công việc')
        }
      )
    }
  })
})
</script>

<template>
  <div class="">
    <form @submit="onSubmit" class="card">
      <div class="mb-4 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
        <AppTextInput
          name="taskName"
          label="Tên công việc"
          required
          placeholder="Nhập tên công việc..."
        />
        <AppReferenceFile
          :tabList="tabList"
          :default-files="{
            fromDoc: fromDocFiles,
            fromTask: fromTaskFiles,
            upload: uploadFiles
          }"
          @confirm="
            (files: FilesBySource) => {
              fromDocFiles = files.fromDoc
              fromTaskFiles = files.fromTask
              uploadFiles = files.upload
            }
          "
          ref="modalRef"
          class=""
        />
      </div>

      <AppTextarea
        name="shortDescription"
        label="Nội dung công việc"
        :label-class="'inline-block'"
        placeholder="Nhập nội dung công việc..."
        required
        :limit-number="250"
        class="mb-3"
      />

      <div class="mb-4 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
        <div class="h-full w-full">
          <label class="text-primary font-semibold"
            >Người chỉ đạo công việc <span class="text-red-500">*</span></label
          >
          <Tippy :max-width="300" :content="leadersDisplay">
            <div
              :class="`font-sm 0 h-10 border border-solid px-3 py-2 ${
                leadersError
                  ? 'border-(--p-inputtext-invalid-border-color)'
                  : 'border-(--p-inputtext-border-color)'
              } - all duration - 200 relative cursor-pointer rounded-md bg-(--p-inputtext-background) text-(--p-inputtext-color) transition hover:border-(--p-inputtext-border-color)`"
              @click="leadersModalRef?.openModal()"
            >
              <div v-if="leadersDisplay" class="h-full w-full truncate">
                {{ leadersDisplay }}
              </div>
              <div v-else class="h-full w-full truncate text-(--p-inputtext-disabled-color)">
                Vui lòng chọn người chỉ đạo...
              </div>
            </div>
          </Tippy>
          <Message v-if="!!leadersError" severity="error" size="small" variant="simple">
            {{ leadersError }}
          </Message>
        </div>

        <div class="h-full w-full">
          <label class="text-primary font-semibold">Người theo dõi tiến độ</label>
          <Tippy :max-width="300" :content="viewersDisplay">
            <div
              :class="`font-sm 0 h-10 border border-solid px-3 py-2 ${
                viewersError
                  ? 'border-(--p-inputtext-invalid-border-color)'
                  : 'border-(--p-inputtext-border-color)'
              } - all duration - 200 relative cursor-pointer rounded-md bg-(--p-inputtext-background) text-(--p-inputtext-color) transition hover:border-(--p-inputtext-border-color)`"
              @click="viewersModalRef?.openModal()"
            >
              <div v-if="viewersDisplay" class="h-full w-full truncate">
                {{ viewersDisplay }}
              </div>
              <div v-else class="h-full w-full truncate text-(--p-inputtext-disabled-color)">
                Vui lòng chọn người theo dõi...
              </div>
            </div>
          </Tippy>
          <Message v-if="!!viewersError" severity="error" size="small" variant="simple">
            {{ viewersError }}
          </Message>
        </div>
      </div>

      <!-- Staff Selection Modals -->
      <InternalStaffListSelect
        ref="leadersModalRef"
        v-model="leadersValue"
        modal-label="Chọn người chỉ đạo công việc"
        :check-if-staff-disabled="checkIfLeaderDisabled"
        :check-if-unit-disabled="checkIfLeaderUnitDisabled"
      />
      <InternalStaffListSelect
        ref="viewersModalRef"
        v-model="viewersValue"
        modal-label="Chọn người theo dõi tiến độ"
        :check-if-staff-disabled="checkIfViewerDisabled"
        :check-if-unit-disabled="checkIfViewerUnitDisabled"
      />

      <div class="mt-4 rounded-xl border border-gray-300 p-4">
        <div>
          <button
            type="button"
            class="text-primary mb-2 inline-flex items-center gap-2 font-semibold hover:underline"
            @click="handleAddTask"
          >
            <span class="icon-[gravity-ui--circle-plus-fill]"></span> Thêm đầu việc
          </button>
          <VueDraggable :model-value="fields" :animation="150" ghostClass="ghost">
            <AddTask
              v-for="(entry, idx) in fields"
              :key="entry.key"
              :index="idx"
              :can-delete="canDeleteSubtask"
              @delete="handleRemoveTask"
              class="mb-2"
            />
          </VueDraggable>
        </div>
      </div>

      <div class="text-primary mt-3 font-semibold">* Thông tin bắt buộc</div>

      <div class="mt-2 flex justify-end">
        <Button label="Xác nhận" :loading="isPending" type="submit" />
      </div>
    </form>
    <ConfirmDialog group="createTask" />
  </div>
</template>
