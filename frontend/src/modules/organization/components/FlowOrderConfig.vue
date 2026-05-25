<script setup lang="ts">
import InternalStaffSelect from '@/shared/components/organization/unit/InternalStaffSelect.vue'
import type { TStaffSelectValue } from '@/shared/models/organization/unit'
import type { FlowDetailVM } from '@/shared/services/api'
import { Checkbox } from 'primevue'
import { useField } from 'vee-validate'

type TProps = {
  flowData?: FlowDetailVM
  disabled: boolean
}

const { flowData, disabled } = defineProps<TProps>()

const { value: isParallel } = useField('isParallel')
const { value: isDistributeMultipleTime } = useField('isDistributeMultipleTime')
const { value: enablePropose } = useField('enablePropose')
const { value: paperCreators, errorMessage: paperCreatorsErrMsg } =
  useField<TStaffSelectValue[]>('paperCreators')
const { value: internetReceivers, errorMessage: internetReceiversErrMsg } =
  useField<TStaffSelectValue[]>('internetReceivers')
const { value: distributors, errorMessage: distributorErrorMsg } =
  useField<TStaffSelectValue[]>('distributors')
const { value: proposeRequesters, errorMessage: proposeRequestersErrorMsg } =
  useField<TStaffSelectValue[]>('proposeRequesters')
const { value: proposeApprovers, errorMessage: proposeApproversErrMsg } =
  useField<TStaffSelectValue[]>('proposeApprovers')
</script>
<template>
  <div class="mb-4 text-2xl font-semibold">Cấu hình luồng văn bản đến</div>
  <div class="mb-3 flex items-center gap-2">
    <Checkbox
      :disabled
      v-model="isDistributeMultipleTime"
      name="isDistributeMultipleTime"
      :binary="true"
    />
    <label>Phân phối nhiều lần</label>
  </div>
  <div class="mb-3 flex items-center gap-2">
    <Checkbox :disabled v-model="isParallel" name="isParallel" :binary="true" />

    <label>Chọn trình tự song song</label>
  </div>
  <!-- flow section -->
  <div>
    <div class="relative">
      <div class="mb-4 flex items-center">
        <div
          class="border-primary text-primary bg-(var(--card-bg)) relative z-10 mr-3 flex h-8 w-8 items-center justify-center rounded-full border"
        >
          1
        </div>
        <h2 class="text-primary text-lg font-medium">Nhập số văn bản</h2>
      </div>
      <!-- Connecting line -->

      <div class="bg-primary absolute top-8 left-4 z-0 h-[calc(100%_-_(0.25rem_*_8))] w-px"></div>

      <div class="grid grid-cols-1 gap-6 pl-11 md:grid-cols-2">
        <InternalStaffSelect
          type="FULL"
          class="col-span-1 mb-4 w-full"
          label="Nhập văn bản đến giấy"
          :is-select-multiple="true"
          :errorMessage="paperCreatorsErrMsg"
          :disabled
          :model-value="paperCreators"
          @submit="
            (value) => (paperCreators = (value ?? [])?.filter((value) => 'positionId' in value))
          "
        />
        <InternalStaffSelect
          type="FULL"
          :model-value="internetReceivers"
          class="col-span-1 mb-4 w-full"
          label="Nhập văn bản đến qua mạng"
          :is-select-multiple="true"
          :disabled
          :errorMessage="internetReceiversErrMsg"
          @submit="
            (values) =>
              (internetReceivers = (values ?? [])?.filter((value) => 'positionId' in value))
          "
        />
      </div>
    </div>
    <div class="">
      <div class="relative">
        <div class="mb-4 flex items-center">
          <div
            class="bg-(var(--card-bg))border-primary text-primary relative z-10 mr-3 flex h-8 w-8 items-center justify-center rounded-full border"
          >
            2
          </div>
          <h2 class="text-primary text-lg font-medium">Phân phối văn bản</h2>
        </div>
        <!-- Connecting line -->
        <div v-if="enablePropose" class="bg-primary absolute top-8 left-4 z-0 h-full w-px"></div>
        <div class="mb-2 flex items-center gap-2 pl-11">
          <Checkbox :disabled v-model="enablePropose" name="enablePropose" :binary="true" />
          <label>Đề xuất phân phối</label>
        </div>
      </div>
      <div v-if="enablePropose" class="grid grid-cols-1">
        <div class="relative flex w-full">
          <div class="flex items-center">
            <div
              class="bg-(var(--card-bg))border-primary text-primary relative z-10 mr-3 flex h-8 w-8 items-center justify-center rounded-full border"
            >
              2.1
            </div>
          </div>
          <!-- Connecting line -->
          <!-- top = (100% - height of cỉcle)/2 + height of circle
              height = 100% - height of circle -->
          <div
            class="bg-primary absolute top-[calc((100%_-_(0.25rem_*_8))/2_+_(0.25rem_*_8))] left-4 z-0 h-[calc(100%_-_(0.25rem_*_8))] w-px"
          ></div>
          <InternalStaffSelect
            type="FULL"
            class="mb-4 w-full"
            label="Đề xuất phân phối văn bản đến"
            :model-value="proposeRequesters"
            :required="true"
            :disabled
            :is-select-multiple="true"
            :errorMessage="proposeRequestersErrorMsg"
            @submit="
              (values) =>
                (proposeRequesters = (values ?? [])?.filter((value) => 'positionId' in value))
            "
          />
        </div>
        <div class="relative flex w-full">
          <div class="flex items-center">
            <div
              class="bg-(var(--card-bg)) border-primary text-primary relative z-10 mr-3 flex h-8 w-8 items-center justify-center rounded-full border"
            >
              2.2
            </div>
          </div>
          <!-- Connecting line -->
          <!-- <div class="bg-primary absolute z-0 top-8 left-4 z-0 h-full w-px"></div> -->
          <InternalStaffSelect
            type="FULL"
            class="mb-4 w-full"
            label="Duyệt phân phối văn bản đến"
            :required="true"
            :disabled
            :model-value="proposeApprovers"
            :is-select-multiple="true"
            :errorMessage="proposeApproversErrMsg"
            @submit="
              (values) =>
                (proposeApprovers = (values ?? [])?.filter((value) => 'positionId' in value))
            "
          />
        </div>
      </div>
      <div class="mb-4 flex w-full pl-11" v-else>
        <InternalStaffSelect
          type="FULL"
          class=""
          label="Phân phối văn bản đến"
          :required="true"
          :disabled
          :is-select-multiple="true"
          :model-value="distributors"
          :errorMessage="distributorErrorMsg"
          @submit="
            (values) => (distributors = (values ?? [])?.filter((value) => 'positionId' in value))
          "
        />
      </div>
    </div>
  </div>
</template>
