import { UpdateAccountRequestDefaultSigningProviderEnum } from '@/shared/services/api/api'

export const GENDER_OPTIONS = [
  { label: 'Nam', value: 'Nam' },
  { label: 'Nữ', value: 'Nữ' },
  { label: 'Khác', value: 'Khác' }
] as const

export const SIGNATURE_TYPE_OPTIONS = [
  { label: 'HMUH', value: UpdateAccountRequestDefaultSigningProviderEnum.Hmuh },
  { label: 'VNPT', value: UpdateAccountRequestDefaultSigningProviderEnum.Vnpt },
  { label: 'Viettel Remote', value: UpdateAccountRequestDefaultSigningProviderEnum.ViettelRemote },
  { label: 'Viettel Sim', value: UpdateAccountRequestDefaultSigningProviderEnum.ViettelSim },
  { label: 'Mobi Sim', value: UpdateAccountRequestDefaultSigningProviderEnum.MobiSim },
  { label: 'BSign', value: UpdateAccountRequestDefaultSigningProviderEnum.Bsign },
  { label: 'USB Token', value: UpdateAccountRequestDefaultSigningProviderEnum.Usb },
  { label: 'EasyCA', value: UpdateAccountRequestDefaultSigningProviderEnum.Easyca }
] as const
