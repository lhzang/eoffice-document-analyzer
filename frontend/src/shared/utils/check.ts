export function isImage(fileName: string): boolean {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'].includes(ext ?? '')
}
export function isPdf(fileName: string): boolean {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  return ['pdf'].includes(ext ?? '')
}

export function isDoc(fileName: string): boolean {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  return ['docx', 'doc'].includes(ext ?? '')
}

export function isExternalLink(url: string): boolean {
  return url.startsWith('http')
}
