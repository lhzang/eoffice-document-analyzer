<script setup lang="ts">
import AppLongText from '@/shared/components/AppLongText.vue'
import DumbFilePreviewLabel from '@/shared/components/DumbFilePreviewLabel.vue'
import ModalPreviewFile from '@/shared/components/ModalPreviewFile.vue'
import { SIGN_PROVIDER_LABEL } from '@/shared/constants/sign'
import {
  OUT_DOC_PROCESS_STEP_LABEL,
  OUT_DOC_PROCESS_STEP_VALUES
} from '@/shared/models/outDoc/document'
import type { ProcessingStepVM } from '@/shared/services/api'
import { getDisplayTypeLabel } from '@/shared/utils/outDoc/signer'
import { DateTime } from 'luxon'
import { Timeline } from 'primevue'
import { ref } from 'vue'
import { Tippy } from 'vue-tippy'
import { useGetODProcessHistory } from '../composables/queries/useGetODProcessHistory'

type TProps = {
  documentId: string
}
type TPreviewModalRef = InstanceType<typeof ModalPreviewFile>

const { documentId } = defineProps<TProps>()

const previewModalRef = ref<TPreviewModalRef | null>(null)

const {
  data: processHistory,
  error: getProcessHistoryError,
  isLoading: isGettingProcessHistory
} = useGetODProcessHistory(() => documentId)
</script>
<template>
  <div
    class="flex h-full w-full items-center justify-center px-4 py-2"
    v-if="isGettingProcessHistory"
  >
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div
    v-else-if="getProcessHistoryError"
    class="flex h-full w-full items-center justify-center px-4 py-2"
  >
    {{
      getProcessHistoryError?.response?.data?.detail ??
      getProcessHistoryError?.message ??
      'Đã có lỗi trong quá trình lấy lịch sử xử lý của văn bản'
    }}
  </div>
  <div
    v-else-if="!processHistory?.processingAttempts?.length"
    class="flex h-full w-full items-center justify-center px-4 py-2"
  >
    Chưa có lịch sử xử lý của văn bản
  </div>
  <div class="px-4 py-2" v-else>
    <div
      v-for="(attemp, idx) in [...processHistory?.processingAttempts]?.reverse()"
      :key="idx"
      class="mb-6"
    >
      <div class="text-primary mb-4 font-semibold">Lần {{ attemp?.attemptNumber }}:</div>
      <Timeline
        :value="attemp?.processingSteps"
        align="left"
        class="customized-timeline"
        :pt="{
          eventContent: {
            class: 'w-full'
          }
        }"
      >
        <template #marker>
          <span class="bg-primary z-10 flex h-4 w-4 items-center justify-center rounded-full">
          </span>
        </template>
        <template #content="slotProps">
          <div class="mb-4">
            <template v-if="(slotProps?.item as ProcessingStepVM)?.processingStaffs?.length">
              <div
                v-for="(staff, idx) in (slotProps?.item as ProcessingStepVM)?.processingStaffs"
                :key="idx"
              >
                <div class="text-primary flex items-center gap-2 font-semibold">
                  <div>{{ staff?.staffUnit?.name }}</div>
                  <span
                    v-if="staff?.status && staff?.processTime"
                    class="icon-[icon-park-solid--check-one]"
                  ></span>
                </div>
                <div>
                  {{ staff?.name }}
                </div>
                <div v-if="staff?.status && staff?.processTime">
                  <div class="flex items-center justify-between gap-2">
                    <div
                      v-tippy="
                        staff?.status === OUT_DOC_PROCESS_STEP_VALUES.Signed
                          ? getDisplayTypeLabel(staff?.signType)
                          : ''
                      "
                    >
                      {{ OUT_DOC_PROCESS_STEP_LABEL?.[staff?.status] }}
                      <span
                        v-if="
                          (staff?.status === OUT_DOC_PROCESS_STEP_VALUES.Signed ||
                            staff?.status === OUT_DOC_PROCESS_STEP_VALUES.Stamped ||
                            staff?.status === OUT_DOC_PROCESS_STEP_VALUES.Issued) &&
                          staff?.signingProvider
                        "
                      >
                        với {{ SIGN_PROVIDER_LABEL?.[staff?.signingProvider] }}</span
                      >
                    </div>

                    <span
                      >lúc
                      <span class="font-semibold">{{
                        DateTime.fromISO(staff?.processTime).toFormat('HH:mm - dd/MM/yyyy')
                      }}</span></span
                    >
                  </div>
                  <!-- (staff?.status === OUT_DOC_PROCESS_STEP_VALUES.Returned ||
                    staff?.status === OUT_DOC_PROCESS_STEP_VALUES.Revoked) && -->
                  <div v-if="staff?.message || staff?.files?.length">
                    <Tippy
                      content="Đã để lại ý kiến"
                      class="flex items-start gap-2"
                      placement="left-start"
                    >
                      <span class="icon-[hugeicons--message-01] mt-1.5 inline-block"></span>
                      <AppLongText is-show-read-more is-show-tooltips :text="staff?.message" />
                    </Tippy>
                    <div class="max-h-[200px] w-full truncate overflow-auto">
                      <DumbFilePreviewLabel
                        v-for="(file, idx) in staff?.files"
                        :key="idx"
                        :relative-url="file"
                        :show-preview="true"
                        labelClass="flex-initial! text-undeline text-primary italic"
                        @show-preview="
                          (url, name) => {
                            previewModalRef?.openModal(url, name)
                          }
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="text-primary flex items-center gap-2 font-semibold">
              <div>{{ (slotProps?.item as ProcessingStepVM)?.stepUnit?.name }}</div>
              <!-- <span class="icon-[icon-park-solid--check-one]"></span> -->
            </div>
          </div>
        </template>
      </Timeline>
    </div>
    <ModalPreviewFile ref="previewModalRef" />
  </div>
</template>
<style lang="css" scoped>
::v-deep(.customized-timeline) {
  .p-timeline-event {
    min-height: auto !important;
  }
  .p-timeline-event > .p-timeline-event-content {
    margin-top: -4px;
  }
  .p-timeline-event-opposite {
    padding: 0;
    flex: 0;
  }
}
</style>
