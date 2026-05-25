import { ref } from 'vue'

export const DETAIL_DOCUMENT_TABS = {
  info: 'Thông tin văn bản',
  procedure: 'Lịch sử xử lý',
  distribute: 'Phân phối',
  createdProcess: 'Lịch sử tạo',
  inputInDoc: 'Thêm VB vào sổ',
  updateDoc: 'Cập nhật văn bản',
  destination: 'Nơi nhận'
}

export type TDetailDocumentTabs = keyof typeof DETAIL_DOCUMENT_TABS

export const useTabModalDetail = () => {
  const selectedTab = ref<TDetailDocumentTabs>('info')

  const updateSelectedTab = (tab: TDetailDocumentTabs) => {
    selectedTab.value = tab as TDetailDocumentTabs
  }

  return { selectedTab, updateSelectedTab }
}
