import { appConfig } from '@/config/app-config'
import { OutDocApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const outdocApi = new OutDocApi(apiClientConfig)

export const verifyServices = {
  getSignaturesInfoOfDocument: async (file: File) => {
    const url = appConfig.VITE_SIGNATURE_VERIFY_URL ?? ''
    const newFile = new File([file], encodeURIComponent(file?.name ?? 'document.pdf'))
    const formData = new FormData()
    formData.append('pdfFile', newFile)
    const certificeList = await fetch(url, {
      method: 'POST',
      body: formData
    })
    return certificeList?.json()
  },
  downloadLatestFileByQrCode: async (id: string) => {
    const res = await outdocApi.downloadLatestFileByQrCode(id, {
      responseType: 'arraybuffer',
      headers: {
        'Access-Control-Expose-Headers': 'Content-Disposition'
      }
    })
    //handle file name from response disposition
    const disposition = res.headers['content-disposition']

    let fileName = 'File_van_ban.pdf'

    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/)
      if (match) fileName = match[1]
    }

    const file = new File([res.data], fileName, {
      type: res.headers['content-type'] || 'application/pdf'
    })

    return file
  }
}
