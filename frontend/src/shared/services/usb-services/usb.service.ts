// src/services/usb-plugin/usb.service.ts

import type {
  ISignHashPayload,
  ISignMultiplePayload,
  ISignPdfPayload,
  ISignVisibleImageLeftTextRightPayload,
  ISignVisibleWithImagePayload,
  ISignVisibleWithTextPayload,
  TUpdateDisplayAlias,
  TUsbAlias
} from '../../models/usb.types'
import { USBAliasApi, UsbSigningControllerApi, type USBAlias } from '../api'
import { apiClientConfig } from '../apiClientConfig'
import usbPluginAxios from './usb.axios'

const usbAliasApi = new USBAliasApi(apiClientConfig)
const usbApi = new UsbSigningControllerApi(apiClientConfig)

const usbService = {
  async getUSBAliases(): Promise<TUsbAlias[]> {
    try {
      const response = await usbPluginAxios.get('/get-usb-aliases')
      const aliasList: string[] = response?.data ?? []

      const listGetCertificates = await Promise.all(
        aliasList.map(async (alias) => {
          const form = new FormData()
          form.append('credentials', JSON.stringify({ alias }))
          const res = await usbPluginAxios.post('/get-certificates', form)
          const info = res?.data?.infos?.[0]
          return new Date(info?.validTo) > new Date() ? alias : null
        })
      )
      const listAlias = listGetCertificates?.filter((item): item is string => !!item)
      let listDisplayAlias: USBAlias[] = []
      try {
        listDisplayAlias = await this.getUsbDisplayData()
      } catch (e) {
        console.log(e)
      }
      return listAlias?.map((item) => {
        const alias = listDisplayAlias?.find((alias) => alias?.alias === item)
        return {
          alias: item,
          name: alias?.name
        }
      })
    } catch (error) {
      throw error
    }
  },

  async signHash(payload: ISignHashPayload): Promise<string> {
    const form = new FormData()
    form.append('credentials', JSON.stringify({ alias: payload.alias }))
    form.append('hashBase64', payload.message)
    form.append('algo', payload.algo)
    if (payload.options) form.append('options', JSON.stringify(payload.options))
    if (payload.metadata) form.append('metadata', payload.metadata)

    const response = await usbPluginAxios.post('/sign-hash', form)
    return response.data
  },

  async signInvisible(payload: ISignPdfPayload): Promise<Blob> {
    const form = new FormData()
    form.append('credentials', JSON.stringify({ alias: payload.alias }))
    form.append('pdfFile', payload.pdfFile)
    if (payload.options) form.append('options', JSON.stringify(payload.options))
    if (payload.metadata) form.append('metadata', payload.metadata)

    const response = await usbPluginAxios.post('/sign-invisible', form, {
      responseType: 'arraybuffer'
    })
    return response.data
  },

  async signVisibleWithText(payload: ISignVisibleWithTextPayload): Promise<ArrayBuffer> {
    const form = new FormData()
    form.append('credentials', JSON.stringify({ alias: payload.alias }))
    form.append('pdfFile', payload.pdfFile)
    form.append('text', payload.text)
    form.append('placeholder', JSON.stringify(payload.placeholder))
    if (payload.options) form.append('options', JSON.stringify(payload.options))
    if (payload.metadata) form.append('metadata', payload.metadata)

    const response = await usbPluginAxios.post('/sign-visible-with-text', form, {
      responseType: 'arraybuffer'
    })
    return response.data
  },

  async signVisibleWithImage(payload: ISignVisibleWithImagePayload): Promise<ArrayBuffer> {
    const form = new FormData()
    form.append('credentials', JSON.stringify({ alias: payload.alias }))
    form.append('pdfFile', payload.pdfFile)
    form.append('imageFile', payload.imageFile)
    form.append('placeholder', JSON.stringify(payload.placeholder))
    if (payload.options) form.append('options', JSON.stringify(payload.options))
    if (payload.metadata) form.append('metadata', payload.metadata)

    const response = await usbPluginAxios.post('/sign-visible-with-image', form, {
      responseType: 'arraybuffer'
    })
    return response.data
  },

  async signVisibleImageLeftTextRight(
    payload: ISignVisibleImageLeftTextRightPayload
  ): Promise<ArrayBuffer> {
    const form = new FormData()
    form.append('credentials', JSON.stringify({ alias: payload.alias }))
    form.append('pdfFile', payload.pdfFile)
    form.append('imageFile', payload.imageFile)
    form.append('placeholder', JSON.stringify(payload.placeholder))
    form.append('text', payload.text)
    if (payload.options) form.append('options', JSON.stringify(payload.options))
    if (payload.metadata) form.append('metadata', payload.metadata)

    const response = await usbPluginAxios.post('/sign-visible/image-left-text-right', form, {
      responseType: 'arraybuffer'
    })
    return response.data
  },

  async signVisibleImageBelowTextAbove(
    payload: ISignVisibleImageLeftTextRightPayload
  ): Promise<ArrayBuffer> {
    const form = new FormData()
    form.append('credentials', JSON.stringify({ alias: payload.alias }))
    form.append('pdfFile', payload.pdfFile)
    form.append('imageFile', payload.imageFile)
    form.append('placeholder', JSON.stringify(payload.placeholder))
    form.append('text', payload.text)
    if (payload.options) form.append('options', JSON.stringify(payload.options))
    if (payload.metadata) form.append('metadata', payload.metadata)

    const response = await usbPluginAxios.post('/sign-visible/image-below-text-above', form, {
      responseType: 'arraybuffer'
    })
    return response.data
  },

  async signVisibleDefault(payload: ISignVisibleWithImagePayload): Promise<Blob> {
    const form = new FormData()
    form.append('credentials', JSON.stringify({ alias: payload.alias }))
    form.append('pdfFile', payload.pdfFile)
    form.append('placeholder', JSON.stringify(payload.placeholder))
    if (payload.options) form.append('options', JSON.stringify(payload.options))
    if (payload.metadata) form.append('metadata', payload.metadata)

    const response = await usbPluginAxios.post('/sign-visible/default', form, {
      responseType: 'arraybuffer'
    })
    return response.data
  },

  async signMultiple(payload: ISignMultiplePayload): Promise<ArrayBuffer> {
    const form = new FormData()
    form.append('credentials', JSON.stringify({ alias: payload.alias }))
    form.append('pdfFile', payload.pdfFile)
    form.append('placeholders', JSON.stringify(payload.placeholders))
    if (payload.metadata) form.append('metadata', payload.metadata)

    const response = await usbPluginAxios.post('/multi-sign-visible', form, {
      responseType: 'arraybuffer'
    })
    return response.data
  },

  async getUsbOutOfDate(aliases: string[]): Promise<boolean[]> {
    const results: boolean[] = []

    for (const alias of aliases) {
      try {
        const form = new FormData()
        form.append('credentials', JSON.stringify({ alias }))
        const res = await usbPluginAxios.post('/get-certificates', form)
        const info = res?.data?.infos?.[0]
        results.push(new Date(info?.validTo) > new Date())
      } catch (error) {
        console.error('Lỗi kiểm tra hạn USB:', error)
        results.push(true)
      }
    }

    return results
  },

  async getUsbDisplayData() {
    const response = await usbAliasApi.getAll()
    return response?.data
  },
  async updateUsbDisplayData(payload: TUpdateDisplayAlias) {
    const response = await usbAliasApi.create(payload)
    return response?.data
  },
  async completeSignUsb(correlationId: string, file: File) {
    const response = await usbApi.complete(correlationId, file)
    return response?.data
  }
}

export default usbService
