<script setup lang="ts">
import IcLoading from '@/assets/icons/IcLoading.vue'
import { useWindowSize } from '@vueuse/core'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import * as pdfjsLib from 'pdfjs-dist'
import type { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api'
import { Button, Divider, InputNumber, Popover, useToast } from 'primevue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Tippy } from 'vue-tippy'
import { FALLBACK_DOC_FILE_NAME, PDF_FILE_TYPE } from '../constants/document'
import { OUT_DOC_STATUS_VALUES } from '../models/outDoc/document'
import type {
  DetailDocumentVM,
  InDocumentFileVM,
  OutDocumentFileVM,
  UploadedFileVM
} from '../services/api'
import { useUserProfileStore } from '../stores/userProfileStore'
import {
  getFileName as getFileNameFromPath,
  getFullFileUrl,
  handlePrintFile,
  isOverflowing
} from '../utils/common'
import { addPdfExtension, downLoadDocumentFileViaUrl, isPdfOrDocxFilename } from '../utils/document'

type TScaleOption = 'PageWidth' | 'PageFit' | 'ActualSize' | number

type Page = {
  rendered: boolean
  height: number
  pageIndex: number
  scale: number
}

type TProps = {
  containerClass?: string
  src: string | File
  srcFileName?: string
  initialScale?: TScaleOption
  supportMultipleDownload?: boolean
  documentInfo?: DetailDocumentVM
  loading?: boolean
  isDownloadDisabled?: boolean
}

type TEmits = {
  (event: 'resetFileReadState'): void
  (event: 'readAll'): void
}

const {
  initialScale = 'PageWidth',
  supportMultipleDownload = false,
  isDownloadDisabled = false,
  srcFileName,
  documentInfo,
  containerClass,
  loading = false,
  ...props
} = defineProps<TProps>()

const emit = defineEmits<TEmits>()

// Load PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs'

const canvasRefs = ref<Map<number, HTMLCanvasElement>>(new Map())
const placeholderRefs = ref<Map<number, HTMLDivElement>>(new Map())
const textLayerRefs = ref<Map<number, HTMLDivElement>>(new Map())
const annotationLayerRefs = ref<Map<number, HTMLDivElement>>(new Map())
const scaleOption = ref(initialScale || 1)
const scaleLabel = ref('100%')

const containerRef = ref<HTMLElement | null>(null)
const pageNum = ref(1)
const pageCount = ref(0)
const error = ref<string | null>(null)
const isLoading = ref(false)
const scaleOptRef = ref()
const downLoadRef = ref()
const pages = ref<Page[]>([])

const toast = useToast()
const { width, height } = useWindowSize()

const originalFileName = computed(() =>
  documentInfo?.documentFiles?.mainFile
    ? getFileNameFromPath(documentInfo?.documentFiles?.mainFile)
    : ''
)

let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null
let observer: IntersectionObserver | null = null

const scaleOptionsSpecial = ref([
  { label: 'Actual Size', value: 'ActualSize' },
  { label: 'Page Width', value: 'PageWidth' },
  { label: 'Page Fit', value: 'PageFit' }
])
const scaleOptionsNumber = ref([
  { label: '40%', value: 0.4 },
  { label: '80%', value: 0.8 },
  { label: '100%', value: 1 },
  { label: '120%', value: 1.2 },
  { label: '160%', value: 1.6 },
  { label: '240%', value: 2.4 },
  { label: '320%', value: 3.2 }
])

const toggleScale = (event: MouseEvent) => {
  scaleOptRef.value.toggle(event)
}

const handleSelectScaleSize = (scaleValue: TScaleOption) => {
  scaleOptRef.value.hide()
  scaleOption.value = scaleValue
}

const toggleDownload = (event: MouseEvent) => {
  downLoadRef.value.toggle(event)
}

const getFileName = (isNonStamp: boolean, isUseForZipDownload?: boolean) => {
  if (
    documentInfo?.documentStatus === OUT_DOC_STATUS_VALUES.completed &&
    documentInfo?.documentCode
  ) {
    let formatedName = documentInfo?.documentCode
    if (isUseForZipDownload)
      formatedName = formatedName ? formatedName?.replace(/\//g, '_') : 'all-file'
    if (isNonStamp) {
      formatedName += '-print'
    }
    return addPdfExtension(formatedName)
  } else if (srcFileName) {
    return isPdfOrDocxFilename(srcFileName) ? srcFileName : addPdfExtension(srcFileName)
  } else if (props?.src instanceof File && props?.src?.name) {
    return addPdfExtension(props.src.name)
  } else return addPdfExtension(FALLBACK_DOC_FILE_NAME)
}

const handleDownloadOriginalFile = async () => {
  if (!documentInfo?.documentCode || !documentInfo?.documentFiles?.mainFile) return
  downLoadDocumentFileViaUrl(
    getFullFileUrl(documentInfo?.documentFiles?.mainFile),
    originalFileName?.value
  )
}

const downloadPdfFile = async () => {
  if (!pdfDoc) return
  const pdfData = await pdfDoc.getData()
  const blob = new Blob([pdfData.buffer], { type: PDF_FILE_TYPE })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = getFileName(true)
  a.click()
  URL.revokeObjectURL(url)
}

const downloadAllFiles = async () => {
  const token = useUserProfileStore()?.accessToken
  if (!pdfDoc || !documentInfo || !token) return
  const listAnnexesFilesData = documentInfo?.documentFiles?.annexes?.map((annexFile) => ({
    name: getFileNameFromPath(annexFile),
    url: getFullFileUrl(annexFile)
  }))
  const listRelatedDocsData = [...(documentInfo?.documentFiles?.relatedFiles?.values() ?? [])]
    ?.filter(
      (related) =>
        related?.type === 'INDOC' ||
        related?.type === 'OUTDOC' ||
        related?.type === 'INTERNAL_DOC' ||
        related?.type === 'UPLOADED'
    )
    ?.map((relatedDoc: InDocumentFileVM | OutDocumentFileVM | UploadedFileVM) =>
      'mainFiles' in relatedDoc
        ? {
            name: getFileNameFromPath(relatedDoc?.mainFiles!),
            url: getFullFileUrl(relatedDoc?.mainFiles!)
          }
        : {
            name: getFileNameFromPath((relatedDoc as UploadedFileVM)?.path!),
            url: getFullFileUrl((relatedDoc as UploadedFileVM)?.path!)
          }
    )

  const listOriginalAndRelatedFilesData = [
    {
      name: originalFileName?.value,
      url: getFullFileUrl(documentInfo?.documentFiles?.mainFile)
    },
    ...listAnnexesFilesData,
    ...listRelatedDocsData
  ]

  const zip = new JSZip()
  try {
    for (const data of listOriginalAndRelatedFilesData) {
      if (!data.url || !data.name) continue
      const response = await fetch(data.url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const blob = await response?.blob()
      zip.file(data.name, blob)
    }

    // Add currently signed file
    const pdfData = await pdfDoc.getData()
    zip.file(getFileName(false, true), pdfData.buffer)

    // Add non-stamp file if exists
    if (documentInfo?.documentFiles?.unstampedFile) {
      const responseNonStamp = await fetch(
        getFullFileUrl(documentInfo?.documentFiles?.unstampedFile),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const blobNonStampDoc = await responseNonStamp.blob()
      zip.file(getFileName(true, true), blobNonStampDoc)
    }

    const zipedData = await zip.generateAsync({ type: 'blob' })
    saveAs(
      zipedData,
      documentInfo?.documentCode ? documentInfo?.documentCode.replace(/\//g, '_') : 'all-file'
    )
  } catch (error) {
    toast.add({
      summary: error instanceof Error ? error?.message : 'Có lỗi xảy ra khi tải dữ liệu',
      closable: true,
      life: 3000,
      severity: 'error'
    })
  }
}

const downLoadOptions = ref([
  {
    label: 'Tải về văn bản gốc',
    action: handleDownloadOriginalFile
  },
  {
    label: 'Tải về file đã ký hiện tại',
    action: downloadPdfFile
  },
  {
    label: 'Tải về file không đóng dấu',
    action: () => {
      if (documentInfo?.documentFiles?.unstampedFile)
        downLoadDocumentFileViaUrl(
          getFullFileUrl(documentInfo?.documentFiles?.unstampedFile),
          getFileName(true)
        )
    }
  },
  {
    label: 'Tải về tất cả các file hiện có',
    action: () => downloadAllFiles()
  }
])

const hanldleClickDownloadBtn = (e: MouseEvent) => {
  if (supportMultipleDownload) {
    toggleDownload(e)
  } else {
    downloadPdfFile()
  }
}

// set layers to ref map for pages
function setCanvasRef(el: HTMLCanvasElement | null, page: number) {
  if (el) {
    canvasRefs.value?.set(page, el)
    canvasRefs.value?.forEach((canvas, page) => {
      canvas.dataset.page = page?.toString()
      observer!.observe(canvas)
    })
  }
}

function setPlacehoderRef(el: HTMLDivElement | null, page: number) {
  if (el) placeholderRefs.value?.set(page, el)
}

function setTextLayerRef(el: HTMLDivElement | null, page: number) {
  if (el) textLayerRefs.value?.set(page, el)
}

function setAnnotationLayerRef(el: HTMLDivElement | null, page: number) {
  if (el) annotationLayerRefs.value?.set(page, el)
}

// convert scale option to number
async function calculateScale() {
  if (!pdfDoc || !containerRef?.value) {
    return 1
  }

  const page = await pdfDoc?.getPage(pageNum.value)
  const baseViewport = page?.getViewport({ scale: 1 })

  if (scaleOption.value === 'PageWidth') {
    const containerWidth = containerRef?.value?.clientWidth - 20 || 0
    return containerWidth / baseViewport?.width
  } else if (scaleOption.value === 'PageFit') {
    const containerWidth = containerRef?.value?.clientWidth || 0
    const containerHeight = containerRef?.value?.clientHeight || 0
    const scaleWidth = containerWidth / baseViewport?.width
    const scaleHeight = containerHeight / baseViewport?.height
    return Math.min(scaleWidth, scaleHeight)
  } else if (scaleOption?.value === 'ActualSize') {
    return 1
  }
  return scaleOption?.value as number
}

// Map to track the visible ratios of each page
const visibleRatios = ref(new Map<number, number>())

// IntersectionObserver callback to determine the most visible page
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    const page = Number((entry.target as HTMLElement).dataset.page)
    if (entry.isIntersecting) {
      visibleRatios.value.set(page, entry.intersectionRatio)
    } else {
      visibleRatios.value.delete(page)
    }
  })

  // Find page with the highest intersection ratio
  let maxRatio = -1
  let mostVisiblePage = pageNum.value

  visibleRatios.value.forEach((ratio, page) => {
    if (ratio > maxRatio) {
      maxRatio = ratio
      mostVisiblePage = page
    } else if (ratio === maxRatio && page < mostVisiblePage) {
      // Preference for the earlier page if ratios are tied (e.g., both 100% visible)
      mostVisiblePage = page
    }
  })

  if (mostVisiblePage !== pageNum.value) {
    pageNum.value = mostVisiblePage
  }

  // Handle lazy rendering
  entries.forEach(async (entry) => {
    if (entry.isIntersecting) {
      const page = Number((entry.target as HTMLElement).dataset.page)
      const pageData = pages.value?.[page - 1]
      if (page && pageData && !pageData.rendered) {
        pageData.rendered = true
        await renderPage(page)
      }
    }
  })
}

// Setup IntersectionObserver to detect page changes and update to view
function setupIntersectionObserver() {
  if (!containerRef.value) return

  if (observer) observer.disconnect()
  visibleRatios.value.clear()

  observer = new IntersectionObserver(handleIntersection, {
    root: containerRef.value,
    threshold: [0, 0.25, 0.5, 0.75, 1]
  })

  placeholderRefs.value.forEach((placeholder, page) => {
    placeholder.dataset.page = page.toString()
    observer!.observe(placeholder)
  })
}

const resetPagesState = async (scale: number) => {
  if (!pdfDoc || pdfDoc.numPages === undefined) return
  const newPages = await Promise.all(
    [...Array(pdfDoc.numPages)].map(async (_, index) => {
      const newPage = await pdfDoc?.getPage(index + 1)
      const viewport = newPage?.getViewport({ scale })
      return {
        rendered: false,
        height: viewport?.height!,
        pageIndex: index + 1,
        scale
      }
    })
  )
  pages.value = newPages
}

// Load PDF file
async function loadPdf(src: string | File) {
  isLoading.value = true
  try {
    error.value = null
    let pdfSrc: DocumentInitParameters | { data: Uint8Array }
    if (src instanceof File) {
      const arrayBuffer = await src.arrayBuffer()
      pdfSrc = { data: new Uint8Array(arrayBuffer) }
    } else {
      pdfSrc = {
        url: src,
        httpHeaders: {
          Authorization: `Bearer ${useUserProfileStore().accessToken}`
        }
      }
    }
    const loadingTask = pdfjsLib.getDocument(pdfSrc)
    pdfDoc = await loadingTask.promise
    pageCount.value = pdfDoc.numPages
  } catch (err) {
    if (err instanceof Error) {
      if (err?.message === 'getDocument - no `url` parameter provided.') {
        error.value = 'Không có file PDF để hiện thị'
      } else {
        error.value = getErrorMessage(err)
      }
    } else {
      error.value = `Không thể tải PDF: ${err instanceof Error ? (err as Error).message : 'Lỗi không xác định'}`
    }
  } finally {
    isLoading.value = false
  }
}

const getErrorMessage = (error: Error) => {
  switch (error?.name) {
    case 'InvalidPDFException':
      return 'Đã có lỗi hoặc định dạng file không đúng'
    case 'MissingPDFException':
      return 'Tài liệu bị mất'
    case 'UnexpectedResponseException':
      return 'File văn bản không còn tồn tại'
    default:
      return 'Không thể hiển thị tệp tin'
  }
}

function updateGlobalCssVarForLib(scale: number) {
  document.body.style.setProperty('--total-scale-factor', scale.toString())
  document.body.style.setProperty('--scale-round-y', '1')
  document.body.style.setProperty('--scale-round-x', '1')
}

async function renderPage(num: number) {
  if (!pdfDoc) return
  const pageData = pages.value?.[num - 1]
  if (pageData) {
    pageData.rendered = true
  }
  await nextTick()

  const canvas = canvasRefs.value.get(num)
  const textLayerDiv = textLayerRefs.value.get(num)
  const annotationLayerDiv = annotationLayerRefs.value.get(num)

  if (!canvas || !textLayerDiv || !annotationLayerDiv) return

  try {
    const page = await pdfDoc.getPage(num)
    const pageScale = pages.value?.[num - 1]?.scale ?? 1

    const dpr = window.devicePixelRatio || 1
    const viewport = page.getViewport({ scale: pageScale * dpr })

    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)

    canvas.style.width = `${Math.floor(viewport.width / dpr)}px`
    canvas.style.height = `${Math.floor(viewport.height / dpr)}px`

    const renderContext = {
      canvasContext: context,
      viewport
    }
    await page.render(renderContext).promise

    textLayerDiv.innerHTML = ''
    const logicalViewport = page.getViewport({ scale: pageScale })
    const textContent = await page.getTextContent()
    const textLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      viewport: logicalViewport,
      container: textLayerDiv
    })
    textLayer.render()

    textLayerDiv.style.setProperty(
      'width',
      `calc(var(--total-scale-factor) * ${logicalViewport?.viewBox?.[2]}px)`,
      'important'
    )
    textLayerDiv.style.setProperty(
      'height',
      `calc(var(--total-scale-factor) * ${logicalViewport?.viewBox?.[3]}px)`,
      'important'
    )

    const annotations = await page.getAnnotations()
    const annoationLayers = new pdfjsLib.AnnotationLayer({
      div: annotationLayerDiv,
      page,
      viewport: logicalViewport,
      accessibilityManager: null,
      annotationCanvasMap: new Map(),
      annotationEditorUIManager: null,
      structTreeLayer: null
    })
    annoationLayers.render({
      viewport: logicalViewport,
      div: annotationLayerDiv,
      annotations,
      page,
      linkService: {
        getDestinationHash: () => '',
        getAnchorUrl: (hash) => hash,
        setHash: () => {},
        executeNamedAction: () => {},
        pagesCount: pageCount.value,
        page: pageNum.value,
        rotation: 0,
        isInPresentationMode: false,
        externalLinkEnabled: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        goToDestination: async (dest: string | any[]) => {
          const [pageRef] = dest
          const pageIndex = await pdfDoc?.getPageIndex(pageRef)
          if (pageIndex) scrollToPage(pageIndex)
        },
        goToPage: () => {},
        addLinkAttributes: (element, url) => {
          if (url) {
            element.setAttribute('href', url)
            element.setAttribute('aria-label', url)
            element.setAttribute('title', url)
            element.setAttribute('target', '_blank')
            element.setAttribute('rel', 'noopener noreferrer')
          }
        },
        executeSetOCGState: () => {}
      },
      enableScripting: false,
      hasJSActions: false,
      fieldObjects: null,
      renderForms: false
    })

    annotationLayerDiv.style.setProperty('width', '0px', 'important')
    annotationLayerDiv.style.setProperty('height', '0px', 'important')
  } catch (_err) {
    error.value = `Không thể render trang ${num}`
  }
}

function scrollToPage(num: number) {
  if (!num || !containerRef.value) return
  const canvas = canvasRefs.value.get(num)
  const placeholder = placeholderRefs.value.get(num)
  if (canvas || placeholder) {
    const targetElement = canvas || placeholder
    const container = containerRef.value
    const elementRect = targetElement!.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const targetScrollTop = container.scrollTop + (elementRect.top - containerRect.top)
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'instant'
    })
  }
}

const nextPage = () => {
  if (pageNum.value < pageCount.value) {
    pageNum.value++
    scrollToPage(pageNum.value)
  }
}

const prevPage = () => {
  if (pageNum.value > 1) {
    pageNum.value--
    scrollToPage(pageNum.value)
  }
}

const reRenderPages = async () => {
  canvasRefs.value.clear()
  textLayerRefs.value.clear()
  annotationLayerRefs.value.clear()

  const scale = await calculateScale()
  updateGlobalCssVarForLib(scale)
  await resetPagesState(scale)
  scaleLabel.value = `${(scale * 100).toFixed(0)}%`
  setupIntersectionObserver()
  emit('resetFileReadState')
}

onMounted(() => loadPdf(props.src))

watch(
  () => props.src,
  async (newSrc) => {
    canvasRefs.value.clear()
    textLayerRefs.value.clear()
    annotationLayerRefs.value.clear()
    visibleRatios.value.clear()
    pageNum.value = 1
    pageCount.value = 0
    error.value = null
    isLoading.value = false
    scaleOption.value = initialScale || 1
    await nextTick()
    loadPdf(newSrc)
  }
)

// Emit readAll when document scrolled to end
watch(
  [canvasRefs, () => props.src, error, isLoading, scaleOption, containerRef],
  async () => {
    if (!error.value && !isLoading.value && canvasRefs.value.size > 0 && containerRef.value) {
      if (!isOverflowing(containerRef.value)) {
        emit('readAll')
      }
    }
  },
  { deep: true }
)

const handleContainerScroll = () => {
  if (!containerRef.value) return
  if (
    Math.abs(
      containerRef.value.scrollHeight -
        containerRef.value.clientHeight -
        containerRef.value.scrollTop
    ) <= 1
  ) {
    emit('readAll')
  }
}

watch(
  [() => props.src, containerRef, width, height, scaleOption],
  async (
    [newSrc, newContainerRef, newWidth, newHeight, newScale],
    [oldSrc, oldContainerRef, oldWidth, oldHeight, oldScale]
  ) => {
    if (newSrc !== oldSrc || newScale !== oldScale || newContainerRef !== oldContainerRef) {
      await reRenderPages()
    } else if (
      (newWidth !== oldWidth || newHeight !== oldHeight) &&
      (newScale === 'PageWidth' || newScale === 'PageFit')
    ) {
      await reRenderPages()
    }
  },
  { immediate: true, deep: true }
)

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div
    v-if="isLoading || loading"
    class="border-shadow flex h-full items-center justify-center"
    ref="loadMoreRef"
  >
    <IcLoading />
  </div>
  <div
    v-else-if="error"
    class="flex h-full items-center justify-center border border-solid border-[#e1e4f3] text-[#red]"
    :class="containerClass"
  >
    <div class="flex h-10 items-center justify-center rounded-sm bg-[red] px-2 text-white">
      {{ error }}
    </div>
  </div>

  <div v-else class="h-full border border-t-0 border-solid border-[#e1e4f3]">
    <div class="sticky top-0 z-10 flex h-10 items-center justify-between bg-[#e1e4f3]">
      <div class="flex items-center">
        <button
          :class="`${pageNum <= 1 ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer'} `"
          class="flex h-6 w-6 items-center justify-center"
          @click="prevPage"
          type="button"
          :disabled="pageNum <= 1"
        >
          <span
            :class="`${pageNum <= 1 ? '' : 'hover:text-primary'} icon-[iconamoon--arrow-left-2-bold] block h-full w-full text-base transition-colors`"
            class="icon-[iconamoon--arrow-left-2-bold] block h-full w-full text-base transition-colors"
          ></span>
        </button>
        <div class="flex items-center justify-between">
          <InputNumber
            class="flex items-center"
            v-model="pageNum"
            @update:model-value="(page) => scrollToPage(page ?? 0)"
            size="small"
            :fluid="false"
            :max="pageCount"
            :inputClass="`text-sm w-12 h-6! text-center rounded-sm! mr-2`"
            @keydown.enter.prevent
          >
          </InputNumber>
          / {{ pageCount }}
        </div>
        <button
          :class="`${pageNum >= pageCount ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer'} `"
          class="flex h-6 w-6 items-center justify-center"
          @click="nextPage"
          type="button"
          :disabled="pageNum >= pageCount"
        >
          <span
            :class="`${pageNum >= pageCount ? '' : 'hover:text-primary'} icon-[iconamoon--arrow-left-2-bold] block h-full w-full text-base transition-colors`"
            class="icon-[iconamoon--arrow-right-2-bold] block h-full w-full text-base transition-colors"
          ></span>
        </button>
      </div>
      <div>
        <Button
          class="hover:bg-primary h-8 w-16 rounded-sm border-0! bg-transparent! text-current! hover:text-white"
          type="button"
          label="scale"
          @click="toggleScale"
          >{{ scaleLabel }}</Button
        >
        <Popover ref="scaleOptRef" class="p-0">
          <div
            class="hover:bg-primary flex h-8 w-30 cursor-pointer items-center rounded-xs px-2 font-medium transition-all hover:text-white"
            v-for="(spcItem, index) of scaleOptionsSpecial"
            :key="index"
            @click="() => handleSelectScaleSize(spcItem.value as TScaleOption)"
          >
            {{ spcItem.label }}
          </div>
          <Divider class="m-0!" />
          <div
            class="hover:bg-primary flex h-8 w-30 cursor-pointer items-center rounded-xs px-2 font-medium transition-all hover:text-white"
            v-for="(item, index) of scaleOptionsNumber"
            :key="index"
            @click="() => handleSelectScaleSize(item.value as TScaleOption)"
          >
            {{ item.label }}
          </div>
        </Popover>
      </div>
      <div>
        <Button
          label="Download"
          :disabled="!props.src"
          @click="handlePrintFile(props.src)"
          class="hover:bg-primary h-8 w-8 rounded-sm border-0! bg-transparent! p-1! text-current! hover:text-white"
        >
          <span class="icon-[material-symbols--print-outline-rounded] text-2xl"></span>
        </Button>
      </div>
      <div>
        <Tippy :content="`${isDownloadDisabled ? 'Không thể tải xuống' : 'Tải xuống'}`">
          <Button
            label="Download"
            :disabled="isDownloadDisabled || !props.src"
            @click="hanldleClickDownloadBtn"
            class="hover:bg-primary h-8 w-8 rounded-sm border-0! bg-transparent! p-1! text-current! hover:text-white"
          >
            <span class="icon-[material-symbols--download] text-2xl"></span>
          </Button>
        </Tippy>
        <Popover
          v-if="supportMultipleDownload && !isDownloadDisabled && !!documentInfo"
          ref="downLoadRef"
          class="p-0"
        >
          <div
            class="hover:bg-primary flex h-8 cursor-pointer items-center truncate rounded-xs px-2 font-medium transition-all hover:text-white"
            v-for="(downLoadOpt, index) of downLoadOptions"
            :key="index"
            @click="async () => await downLoadOpt.action()"
          >
            {{ downLoadOpt.label }}
          </div>
        </Popover>
      </div>
    </div>
    <div
      class="relative h-[calc(100%-(var(--spacing)*10))] gap-10 overflow-y-auto"
      @scroll="handleContainerScroll"
      :class="containerClass"
      ref="containerRef"
    >
      <div
        v-for="(page, index) in pages"
        :key="index"
        :class="{ 'mt-0': page.pageIndex === 1, 'mt-4': page.pageIndex !== 1 }"
        class="relative mx-auto flex flex-col items-center"
        :style="{ height: page.height + 'px', width: page.rendered ? 'fit-content' : '100%' }"
      >
        <div v-if="page.rendered" class="relative shadow-md">
          <canvas :ref="(el) => setCanvasRef(el as HTMLCanvasElement, page.pageIndex)"> </canvas>
          <div
            class="text-layer"
            :ref="(el) => setTextLayerRef(el as HTMLDivElement, page.pageIndex)"
          ></div>
          <div
            class="annotation-layer"
            :ref="(el) => setAnnotationLayerRef(el as HTMLDivElement, page.pageIndex)"
          ></div>
        </div>
        <div
          v-else
          class="placeholder relative flex h-full w-[calc(100%-20px)] items-center justify-center shadow-md"
          :ref="(el) => setPlacehoderRef(el as HTMLDivElement, page.pageIndex)"
        >
          <span class="icon-[line-md--loading-twotone-loop] absolute text-center text-5xl"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* avoid modify this :)) */
.text-layer {
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  opacity: 0.2;
  line-height: 1;
  z-index: 1;
}

.annotation-layer {
  pointer-events: auto;
}

.text-layer :deep(span) {
  color: transparent !important;
  position: absolute;
  white-space: pre;
  cursor: text;
  line-height: 1;

  color: #0000;
  cursor: text;
  position: absolute;
  transform-origin: 0% 0%;
  white-space: pre;
}

.text-layer :deep(span)::selection {
  background: #024bd1 !important;
}

.annotation-layer :deep(section) {
  position: absolute;
  z-index: 9 !important;
  opacity: 0.2;
}

.annotation-layer :deep(.linkAnnotation > a) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.annotation-layer :deep(.linkAnnotation > a:hover) {
  background: #024bd1;
}
</style>
