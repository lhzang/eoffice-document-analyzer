export type EsignProvider = 'VNPT' | 'BSIGN' | 'VIETTELSIM' | 'VIETTELREMOTE' | 'USB'

export type AccountProviderKey = "p12" | "hmuh" | "vnpt_remote" | "vt_sim" | "vt_remote";

export type EsignProviderResponse =
  | 'p12'
  | 'hmuh'
  | 'vnpt_remote'
  | 'vt_sim'
  | 'vt_remote'
  | 'usb'

export const EsignProviderConfig: {
  [key in EsignProvider]: {
    label: string
    value: key
    type: EsignProviderResponse
  }
} = {
  BSIGN: {
    label: 'BSIGN',
    value: 'BSIGN',
    type: 'p12'
  },
  VIETTELSIM: {
    label: 'Viettel Sim CA',
    value: 'VIETTELSIM',
    type: 'vt_sim'
  },
  USB: {
    label: 'USB Token',
    value: 'USB',
    type: 'usb'
  },
  VIETTELREMOTE: {
    label: 'Viettel MySign',
    value: 'VIETTELREMOTE',
    type: 'vt_remote'
  },
  VNPT: {
    label: 'VNPT SmartCA',
    value: 'VNPT',
    type: 'vnpt_remote'
  }
}
