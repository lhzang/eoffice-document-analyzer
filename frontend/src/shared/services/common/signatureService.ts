import { appConfig } from '@/config/app-config'

export const signatureService = {
  convertDocxIntoPdf: async (file: File, fileName?: string, signal?: AbortSignal) => {
    try {
      const formData = new FormData()
      const modifiedFile = new File([file], encodeURIComponent(file?.name ?? fileName ?? ''))
      formData.append('doc_file', modifiedFile)
      const response = await fetch(`${appConfig.VITE_SIGNATURE_URL}/convert/`, {
        method: 'POST',
        signal: signal,
        body: formData
      })
      const fileBuffer = await response?.arrayBuffer()
      const _file = new File([fileBuffer], file?.name || 'file_van-ban.pdf', {
        type: 'application/pdf'
      })
      return _file
    } catch (e) {
      //handle case when preview take too much time and user close preview modal
      //or sth like that, then cancel pending request
      if (e instanceof DOMException && e.name === 'AbortError') {
        // swallow abort
        return
      }
      throw e
    }
  }
}
