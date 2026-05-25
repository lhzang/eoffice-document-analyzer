<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import { isDoc, isPdf } from '@/shared/utils/check'
import { cleanObject, getFileName, getFullFileUrl } from '@/shared/utils/common'
import { Column, DataTable } from 'primevue'
import { computed, ref } from 'vue'
import { useGetExceptionHistory } from '../composables/queries/useGetExceptionHistory'
import { DOCUMENT_SOURCES, EDIT_TYPES } from '../constants/updateIssuedDoc'

const expandedRows = ref({})
const filetoPreview = ref<string | null>(null)
const selectedFileForPreview = ref(false)

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: DEFAULT_PAGE_SIZE,
  isMemorizedPage: true
})

const exceptionHistoryPayload = computed(() =>
  cleanObject({
    page: tablePagination.value.current,
    pageSize: tablePagination.value.pageSize
  })
)

const { data: IssuedDocEditHistory, isLoading } = useGetExceptionHistory(exceptionHistoryPayload)

const EDIT_TYPE_MAP = Object.fromEntries(EDIT_TYPES.map((item) => [item.value, item.title]))

const SOURCE_MAP = Object.fromEntries(DOCUMENT_SOURCES.map((item) => [item.value, item.title]))

const formatDateTime = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN', {
    hour12: false
  })
}
</script>

<template>
  <div>
    <div class="card">
      <DataTable
        :loading="isLoading"
        v-model:expandedRows="expandedRows"
        :value="IssuedDocEditHistory?.items"
        :empty="!isLoading && IssuedDocEditHistory?.totalItems === 0"
        dataKey="documentCode"
        tableStyle="min-width: 60rem"
        paginator
        :always-show-paginator="true"
        :totalRecords="IssuedDocEditHistory?.totalItems"
        :lazy="true"
        :rows="tablePagination.pageSize"
        :rowsPerPageOptions="tablePagination.pageSizeOptions"
        :first="tablePagination.current * tablePagination.pageSize"
        @page="({ page, rows }) => updateCurrentPage(page, rows)"
        @update:rows="updatePageSize"
        :pt="{
          tbody: { class: isLoading ? 'h-[300px]' : '' },
          emptymessage: { class: 'h-[300px]' }
        }"
      >
        <Column field="index" header="STT">
          <template #body="slotProps">
            <span>{{ slotProps.index + 1 }}</span>
          </template>
        </Column>
        <Column field="documentCode" header="Số hiệu văn bản" />
        <Column field="eventType" header="Loại cập nhật">
          <template #body="{ data }">
            {{ EDIT_TYPE_MAP[data.eventType] }}
          </template>
        </Column>

        <Column field="occurredOn" header="Thời gian">
          <template #body="{ data }">
            {{ formatDateTime(data.occurredOn) }}
          </template>
        </Column>

        <Column header="Người thực hiện">
          <template #body="{ data }">
            {{ data.actor?.name || '-' }}
          </template>
        </Column>
        <Column field="reason" header="Lý do" />
        <Column field="documentType" header="Loại văn bản">
          <template #body="{ data }">
            {{ SOURCE_MAP[data.documentType] }}
          </template>
        </Column>
        <Column expander style="width: 8rem" />
        <template #expansion="{ data }">
          <div class="mx-20">
            <div class="mb-2 grid grid-cols-2 gap-2">
              <span class="font-semibold">Lý do chỉnh sửa văn bản:</span>
              <span>{{ data.reason }}</span>
            </div>
            <div v-if="data.oldMainFile">
              <hr class="my-2 border-gray-200" />
              <div class="grid grid-cols-2 gap-2">
                <span class="font-semibold">File văn bản trước khi được cập nhật:</span>
                <div class="flex items-center">
                  {{ getFileName(data.oldMainFile) }}
                  <span
                    v-if="isDoc(data.oldMainFile) || isPdf(data.oldMainFile)"
                    class="icon-[mdi--eye] text-primary ml-2 cursor-pointer text-xl"
                    @click="
                      () => {
                        filetoPreview = data.oldMainFile
                        selectedFileForPreview = true
                      }
                    "
                  ></span>
                </div>
              </div>
            </div>
            <div v-if="data.replacedMainFile">
              <hr class="my-2 border-gray-200" />
              <div class="grid grid-cols-2 gap-2">
                <span class="font-semibold">File văn bản sau khi được cập nhật:</span>
                <div class="flex items-center">
                  {{ getFileName(data.replacedMainFile) }}
                  <span
                    v-if="isDoc(data.replacedMainFile) || isPdf(data.replacedMainFile)"
                    class="icon-[mdi--eye] text-primary ml-2 cursor-pointer text-xl"
                    @click="
                      () => {
                        filetoPreview = data.replacedMainFile
                        selectedFileForPreview = true
                      }
                    "
                  ></span>
                </div>
              </div>
            </div>
            <div v-if="data.oldAnnexes">
              <hr class="my-2 border-gray-200" />
              <div class="grid grid-cols-2 gap-2">
                <span class="font-semibold">Danh sách file đính kèm trước khi cập nhật:</span>
                <ul class="list-disc pl-4">
                  <li
                    v-for="(item, index) in data.oldAnnexes || []"
                    :key="index"
                    class="flex items-center"
                  >
                    {{ getFileName(item) }}
                    <span
                      v-if="canPreviewOrDownload(item)"
                      class="icon-[mdi--eye] text-primary ml-2 cursor-pointer text-xl"
                      @click="
                        () => {
                          filetoPreview = item
                          selectedFileForPreview = true
                        }
                      "
                    ></span>
                  </li>
                </ul>
              </div>
            </div>
            <div v-if="data.newAnnexes">
              <hr class="my-2 border-gray-200" />
              <div class="grid grid-cols-2 gap-2">
                <span class="font-semibold">Danh sách file đính kèm sau khi cập nhật:</span>
                <ul class="list-disc pl-4">
                  <li
                    v-for="(item, index) in data.newAnnexes || []"
                    :key="index"
                    class="flex items-center"
                  >
                    {{ getFileName(item) }}
                    <span
                      v-if="canPreviewOrDownload(item)"
                      class="icon-[mdi--eye] text-primary ml-2 cursor-pointer text-xl"
                      @click="
                        () => {
                          filetoPreview = item
                          selectedFileForPreview = true
                        }
                      "
                    ></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
        <template #loading>
          <div class="flex items-center justify-center p-4">
            <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
          </div>
        </template>
        <template #empty>
          <div v-show="!isLoading" class="flex flex-col items-center justify-center p-4">
            <span class="icon-[mdi--flask-empty-remove-outline] text-5xl text-gray-400"></span>
            <span class="text-2xl font-medium text-gray-400">No data</span>
          </div>
        </template>
      </DataTable>
      <!-- PDF Preview Modal -->
      <AppModal
        v-model:visible="selectedFileForPreview"
        :wrapper-style="{ width: '60%' }"
        title="File văn bản"
        @close="
          () => {
            selectedFileForPreview = false
            filetoPreview = null
          }
        "
      >
        <PdfViewer
          v-if="filetoPreview"
          :src="getFullFileUrl(filetoPreview)"
          :container-class="'h-full'"
        />
      </AppModal>
    </div>
  </div>
</template>

<style lang="css" scoped>
::v-deep(.p-icon.p-datatable-row-toggle-icon) {
  display: none;
}

::v-deep(.p-datatable-row-toggle-button::after) {
  content: 'Xem chi tiết';
  font-size: 14px;
  font-weight: 500;
}

::v-deep(.p-datatable-row-toggle-button[aria-label='Row Expanded']::after) {
  content: 'Ẩn chi tiết';
}

::v-deep(.p-datatable-row-toggle-button) {
  padding: 10px 7.5px;
  height: 35px;
  width: 100px;
  border: 1px solid #b91c1c;
  border-radius: 5px;
  background-color: #b91c1c;
  color: #ffffff;
}

::v-deep(.p-datatable-row-toggle-button:enabled:hover) {
  background-color: #7f1d1d;
  color: #ffffff;
  border: 1px solid #7f1d1d;
}

::v-deep(ul) {
  list-style: none;
  padding-left: 0;
}
</style>
