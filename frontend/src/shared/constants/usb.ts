export const USB_SIGN_TYPES = {
  visibleWithText: 'VISIBLE_WITH_TEXT',
  visibleWithImage: 'VISIBLE_WITH_IMAGE',
  multiSign: 'MULTI_SIGN_VISIBLE',
  visibleWithImageAndText: 'VISIBLE_IMAGE_AND_TEXT'
} as const
export type TUsbSignTypes = (typeof USB_SIGN_TYPES)[keyof typeof USB_SIGN_TYPES]

export const IMAGE_AND_TEXT_ALIGN = {
  horizontal: 'IMAGE_LEFT_TEXT_RIGHT',
  vertical: 'IMAGE_BELOW_TEXT_ABOVE'
} as const
export type TImageAndTextAlign = (typeof IMAGE_AND_TEXT_ALIGN)[keyof typeof IMAGE_AND_TEXT_ALIGN]

export const SIGNATURE_IMAGE_TYPES = {
  major: 'major',
  minor: 'minor'
} as const
export type TSignatureImageTypes =
  (typeof SIGNATURE_IMAGE_TYPES)[keyof typeof SIGNATURE_IMAGE_TYPES]
