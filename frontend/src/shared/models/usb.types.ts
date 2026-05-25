// src/services/usb-plugin/types.ts

import type { TSignatureImageTypes } from '../constants/usb'

export interface ISignHashPayload {
  alias: string
  message: string
  algo: string
  options?: TSignOption
  metadata?: string
}

export interface ISignPdfPayload {
  alias: string
  pdfFile: File | Blob
  options?: TSignOption
  metadata?: string
}

export interface ISignVisibleWithTextPayload extends ISignPdfPayload {
  text: string
  placeholder: TPlaceholder
}

export interface ISignVisibleWithImagePayload extends ISignPdfPayload {
  imageFile: File | Blob
  placeholder: TPlaceholder
}

export interface ISignVisibleImageLeftTextRightPayload extends ISignVisibleWithImagePayload {
  text: string
}

export interface ISignMultiplePayload {
  alias: string
  pdfFile: File | Blob
  placeholders: TPlaceholder[]
  metadata?: string
}
export type TUpdateDisplayAlias = {
  alias: string
  name: string
}

export type TUsbAlias = {
  alias: string
  name?: string
}
// new here

export type TPlaceholder = {
  x: number
  y: number
  widht: number
  height: number
  pageIndex: number
  pageHeight: number
  fieldName: string
}

export type TAlignment = 'LEFT' | 'CENTER' | 'RIGHT'
export type TVerticalAlignment = 'TOP' | 'MIDDLE' | 'BOTTOM'
export type THorizontalAlignment = 'LEFT' | 'CENTER' | 'RIGHT'

export type TTextStyle = {
  font: string
  size: number
  italic: boolean
  alignment: TAlignment
  verticalAlignment: TVerticalAlignment
}

export type TImageStyle = {
  horizontalAlignment: THorizontalAlignment
  verticalAlignment: TVerticalAlignment
  pl: number
  pr: number
}

export type TSignOption = {
  certify: string
  contact: string
  location: string
  reason: string
  leftCellWidthPercent: number
  textStyle: TTextStyle
  imageStyle: TImageStyle
}
export type TBaseUsb = {
  id: string
  correlationId: string
  name: string
  signerId: string
  type: 'usb_sign_request'
  file: string
}

export type TVisibleWithImageSign = TBaseUsb & {
  typeSign: 'VISIBLE_WITH_IMAGE'
  signatureImageType: TSignatureImageTypes
  placeholder: TPlaceholder
}
export type TVisibleWithTextSign = TBaseUsb & {
  typeSign: 'VISIBLE_WITH_TEXT'
  text: string
  options: TSignOption
  signatureImageType: TSignatureImageTypes
  placeholder: TPlaceholder
}

export type TVisibleImageAndTextSign = TBaseUsb & {
  text: string
  typeSign: 'VISIBLE_IMAGE_AND_TEXT'
  options: TSignOption
  signatureImageType: TSignatureImageTypes
  placeholder: TPlaceholder
} & (
    | { image: string; imageUrl: string; mode: 'IMAGE_LEFT_TEXT_RIGHT' }
    | { mode: 'IMAGE_BELOW_TEXT_ABOVE' }
  )

export type TVisibleMultipleSign = TBaseUsb & {
  typeSign: 'MULTI_SIGN_VISIBLE'
  placeholders: TPlaceholder[]
}

export type TUsbSignsNoti =
  | TVisibleWithImageSign
  | TVisibleWithTextSign
  | TVisibleImageAndTextSign
  | TVisibleMultipleSign
