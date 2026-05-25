import type { TDocumentType } from '@/shared/constants/document'
import type { DocumentDTO, ListDocumentDTO } from '@/shared/services/api'
import type { IInDocumentDetail } from '../models/types'

export type TSource = {
  type: TDocumentType
  docId: string
}
export type TDocumentInDoc = ListDocumentDTO & {
  source?: TSource
}

export const dataIDWaitForReview: IInDocumentDetail[] = [
  {
    _id: '67b6dbe487db371dd941e73e',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] test1 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    dueDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/k335wCoeeP/001 To trinh CSTD 2024-in.docx',
    attachmentFilePdfPath:
      'https://eoffice-be-hust-staging.bkfin.tech/api/v2/files/private?accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJJbmNvbWluZ0RvY3VtZW50L1FNbTRQOS1HRmMvMDAxIFRvIHRyaW5oIENTVEQgMjAyNC1pbi5wZGYiLCJpYXQiOjE3NDQ4NjU5NDksImV4cCI6MTc0NjY2NTk0OX0.h5X5wPPEVw0aZ5OiFUkIX752CGtrO-mx_pDGwrDHN_cVtL4orYEV781TAdpQ5Hv5C6KS4nEAAdzWcov1dqNKhP45u3r6jXE_srTeGQmv-v8Z-VyNE4YDDYdHMJvJbBXOsY8dBl7hfvsm1pmWzlujCLXu2CtzdbBVNbb1V1u8AgXwhkiSt60D6AdZXzLP5ivLj8hERZAKUwlX9Iq68Fguut5XhUgjrY8OFkUl4arA6JQDO2Gymgdyp9xUCxCah_fAfS8f7kHINK40IVbLS_2MzHdamJ-KmlNvscB2LYVhakvZQ6c9MdiWEKRmxfLfrqHR7Iy133btlv2Y9LX3hKYKbPeAOFwOo-8nLHSD1vPkn4rpcs5xJAsUrLeit4L2CMVfAV8Z07s3EZNybEJ8Q5r2PIrrRPHYcIrNQT8bld13JRL3nxrCw7xT2tZ9Acxt9V1fGLEBPSru-Ou9Ml08QyuHaxDVyZnmkn-0LzxyZyRutZ7Wxvj92sXtDDN-RknZSyTqxG02_LHksv7a0W9Pz9fffrOJqVOymOk52C7XUbSK5yTtyh9YloQOtHIU-sBHPxLmyFdQ16msANReZrtiIVVSsYbGdktPOHFHWYjeaUGcWLOTg6D-QbuhIGjZ5P_B77RgLdsc8DFMRxquvo5FeiTn8cqNuStWc3zKkSsTWXT4wCI',
    attachmentSignedURL:
      'https://eoffice-be-hust-staging.bkfin.tech/api/v2/files/private?accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJJbmNvbWluZ0RvY3VtZW50L1FNbTRQOS1HRmMvMDAxIFRvIHRyaW5oIENTVEQgMjAyNC1pbi5wZGYiLCJpYXQiOjE3NDQ4NjU5NDksImV4cCI6MTc0NjY2NTk0OX0.h5X5wPPEVw0aZ5OiFUkIX752CGtrO-mx_pDGwrDHN_cVtL4orYEV781TAdpQ5Hv5C6KS4nEAAdzWcov1dqNKhP45u3r6jXE_srTeGQmv-v8Z-VyNE4YDDYdHMJvJbBXOsY8dBl7hfvsm1pmWzlujCLXu2CtzdbBVNbb1V1u8AgXwhkiSt60D6AdZXzLP5ivLj8hERZAKUwlX9Iq68Fguut5XhUgjrY8OFkUl4arA6JQDO2Gymgdyp9xUCxCah_fAfS8f7kHINK40IVbLS_2MzHdamJ-KmlNvscB2LYVhakvZQ6c9MdiWEKRmxfLfrqHR7Iy133btlv2Y9LX3hKYKbPeAOFwOo-8nLHSD1vPkn4rpcs5xJAsUrLeit4L2CMVfAV8Z07s3EZNybEJ8Q5r2PIrrRPHYcIrNQT8bld13JRL3nxrCw7xT2tZ9Acxt9V1fGLEBPSru-Ou9Ml08QyuHaxDVyZnmkn-0LzxyZyRutZ7Wxvj92sXtDDN-RknZSyTqxG02_LHksv7a0W9Pz9fffrOJqVOymOk52C7XUbSK5yTtyh9YloQOtHIU-sBHPxLmyFdQ16msANReZrtiIVVSsYbGdktPOHFHWYjeaUGcWLOTg6D-QbuhIGjZ5P_B77RgLdsc8DFMRxquvo5FeiTn8cqNuStWc3zKkSsTWXT4wCI',

    appendixFilePaths: [
      'IncomingDocument/k335wCoeeP/001 To trinh CSTD 2024-in.docx',
      'IncomingDocument/5d_fQUmoNB/PL dang ky dieu chinh KHDTC 2025.signed.pdf'
    ],
    listAppendixSignedURL: [
      'https://eoffice-be-hust-staging.bkfin.tech/api/v2/files/private?accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJJbmNvbWluZ0RvY3VtZW50L1FNbTRQOS1HRmMvMDAxIFRvIHRyaW5oIENTVEQgMjAyNC1pbi5wZGYiLCJpYXQiOjE3NDQ4NjU5NDksImV4cCI6MTc0NjY2NTk0OX0.h5X5wPPEVw0aZ5OiFUkIX752CGtrO-mx_pDGwrDHN_cVtL4orYEV781TAdpQ5Hv5C6KS4nEAAdzWcov1dqNKhP45u3r6jXE_srTeGQmv-v8Z-VyNE4YDDYdHMJvJbBXOsY8dBl7hfvsm1pmWzlujCLXu2CtzdbBVNbb1V1u8AgXwhkiSt60D6AdZXzLP5ivLj8hERZAKUwlX9Iq68Fguut5XhUgjrY8OFkUl4arA6JQDO2Gymgdyp9xUCxCah_fAfS8f7kHINK40IVbLS_2MzHdamJ-KmlNvscB2LYVhakvZQ6c9MdiWEKRmxfLfrqHR7Iy133btlv2Y9LX3hKYKbPeAOFwOo-8nLHSD1vPkn4rpcs5xJAsUrLeit4L2CMVfAV8Z07s3EZNybEJ8Q5r2PIrrRPHYcIrNQT8bld13JRL3nxrCw7xT2tZ9Acxt9V1fGLEBPSru-Ou9Ml08QyuHaxDVyZnmkn-0LzxyZyRutZ7Wxvj92sXtDDN-RknZSyTqxG02_LHksv7a0W9Pz9fffrOJqVOymOk52C7XUbSK5yTtyh9YloQOtHIU-sBHPxLmyFdQ16msANReZrtiIVVSsYbGdktPOHFHWYjeaUGcWLOTg6D-QbuhIGjZ5P_B77RgLdsc8DFMRxquvo5FeiTn8cqNuStWc3zKkSsTWXT4wCI',
      'https://eoffice-be-staging.bkfin.tech/api/v2/files/private?accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJJbmNvbWluZ0RvY3VtZW50LzVkX2ZRVW1vTkIvUEwgZGFuZyBreSBkaWV1IGNoaW5oIEtIRFRDIDIwMjUuc2lnbmVkLnBkZiIsImlhdCI6MTc0NDg2MDk1NywiZXhwIjoxNzQ2NjYwOTU3fQ.IYxXn33rX8mTgSFuEzC1XddniWaXubQ-iQJj6GRIqkMHztPsddRr-SpamkWfnN6nQ5EOpdeM8ghaFzOIkEDGp6W55gX_a6TIGp6wM4uDfse2k8ZDEAUIfXtYYn1j-OE58azwr5ZRYj9LNaiIheGhdXEIVsXWkQ0KulQ-F1TNb21FpbGfE9RxwbbmIr11O81pxGkm22TBmaUSTYfDWjmB1PcB9g8l_wUHr-3jICORelxoXqJyKPWdAvELat3zx1Fdk_NTASiGUcs_cfqvLtMtYb_Ne3ym4ygvfJ0QeRXBmTpQtSiA4AXwTlj7HY7oaj_6WUKxQw2VsSrKIEJYYLj75w5a8jEWgbmsigfgPDtA6xegp1aKdyc-SozNpsSQGYUewX8IWCzdla7P3G1CECZQ2KSY97x6B23eKLWtoIRL-haA0VGfpyqeS9V7aZlnnP8aY4bUD04wCSCONZDOGvTxkz6K6FVVAG8NoAm0RAwstzrKVv9oGCEgO88tOLCvy3uCWc53m4-Ph2z8fxr9w55MqBvfr97ANtF30Knkt9rSSC0G3M3Zdw2NOBY-3TuX1O8U-zRcLn9HHfgKwBE8M6Wlxa2yCES233yY6zBFohf6Lzg3SpwuDk1FnCJVs1R3MR2AJMM_dwJ1pq-VKJlBxkv2rZg02pLtxfr1opPDLHXfC7M'
    ],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e12q',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Normal',
    shortDescription:
      '[Thông báo] test2 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e34r',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] test3 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e23e',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Normal',
    shortDescription:
      '[Thông báo] test4 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e54t',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] test5 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e23f',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Important',
    shortDescription:
      '[Thông báo] test6 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e34g',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] test7 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e54g',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Important',
    shortDescription:
      '[Thông báo] test8 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e21d',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] test9 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e1zx',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] test11 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e1qw',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] test12 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e1as',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] Lỗi13 hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e1nh',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] test14 Lỗi hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  },
  {
    _id: '67b6dbe487db371dd941e1mn',
    documentTypeId: '66c8440c20f7d0cfe5844603',
    priorityLevel: 'Low',
    shortDescription:
      '[Thông báo] Lỗi15 hiển thị thông báo sau khi đã đổi cấu hình kí số VB đến giấy',
    documentCode: '120',
    documentStatus: 'Finish',
    issueUnit: {
      type: 'OutOrg',
      outOrgId: '66d1724a72876eb0f73bf060',
      name: '\tLiên đoàn Lao động tỉnh Nghệ An - Tỉnh Nghệ An'
    },
    arrivalDate: 1739503150132,
    attachmentSign: true,
    appendixSign: false,
    documentType: {
      _id: '66c8440c20f7d0cfe5844603',
      name: 'Biên bản',
      shortName: 'BB',
      expiredDate: 14
    },
    attachmentFilePath: 'IncomingDocument/fKqXCreJA_/Annual-Sustainability-Report-2021-22_1.pdf',
    attachmentFilePdfPath: 'IncomingDocument/ZzRUzO_Ibk/Annual-Sustainability-Report-2021-22_1.pdf',
    appendixFilePaths: [],
    flowId: '66c811c3d677c8ade9ae5e8b',
    source: {
      type: 'InDoc',
      docId: '67aeb676e7af55c49c80b124'
    },
    inDocId: '67b6dbe487db371dd941e73e'
  }
]

export const dataMockToProcessInDoc: TDocumentInDoc[] = Array.from({ length: 200 }).map(
  (_, index) => ({
    id: index.toString(),
    priorityLevel: 'CRITICAL',
    shortDescription: `test${index} van ban qua dai khong can phai duoc rut ngan lai ${index}`,
    documentCode: `${index + 1}/GD-SDT`,
    arrivalDate: '2025-05-20T11:31:00.000-04:00',
    issuer: {
      type: index % 2 === 0 ? 'EXTERNAL' : 'INTERNAL',
      id: `OutOrg${index}`
    },
    dueDate: '2025-05-20T11:31:00.000-04:00',
    inOrdinal: 12 + index,
    source: {
      type: index % 2 === 0 ? 'INCOMING_DOCUMENT' : 'OUTGOING_DOCUMENT',
      docId: index % 2 === 0 ? `INCOMING_DOCUMENT${index + 1}` : `OUTGOING_DOCUMENT${index + 1}`
    }
  })
)

export const dataMockPendingReceive: DocumentDTO[] = Array.from({ length: 200 }).map(
  (_, index) => ({
    id: index.toString(),
    status: 'WAIT_FOR_RECEIVE',
    shortDescription: `test${index} van ban qua dai khong can phai duoc rut ngan lai ${index}`,
    documentCode: `${index + 1}/GD-SDT`,
    arrivalDate: '2025-05-20T11:31:00.000-04:00',
    dueDate: '2025-05-20T11:31:00.000-04:00',
    issuer: {
      type: index % 2 === 0 ? 'EXTERNAL' : 'INTERNAL',
      id: `OutOrg${index}`
    }
  })
)
