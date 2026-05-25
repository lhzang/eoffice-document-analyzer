// Removed conflicting import from luxon

interface CertInfo {
  subject: {
    common_name: string
    country: string
    organization: string
    locality: string
    province: string
    names: string[]
  }
  issuer: {
    common_name: string
    country: string
    organization: string
    locality: string
    province: string
    names: string[]
  }
  serial_number: string
  not_before: string
  not_after: string
  sigalg: string
  authority_key_id: string
  subject_key_id: string
}

interface Device {
  pushNotificationToken: string
  publicKeyPem: string
  deviceInfo: {
    platform: string
    model: string
    name: string
    id: string
    version: string
  }
  id: string
  timestamp: number
}

interface CreatedBy {
  user?: string
  roles: string[]
  iat: number
  accountId?: string
  info?: {
    name: string
  }
  exp?: number
}

export interface Account {
  _id: string
  userId: string
  accountId: string
  certificate?: string
  certInfo?: CertInfo
  status?: string
  createdAt: number
  createdBy: CreatedBy
  devices?: Device[]
  username?: string
  certIdentifier?: string
  pems?: string[]
  infos?: {
    serialNumber: string
    issuerDN: string
    subjectDN: string
    validFrom: string
    validTo: string
  }[]
  valid?: boolean
  msisdn?: string
}

interface SignatureImage {
  fileDest: string
  state: string
  signedURL: string
}

export interface GetEsignAccountResponse {
  accounts: {
    p12: Account | null
    hmuh: Account | null
    vnpt_remote: Account | null
    vt_sim: Account | null
    vt_remote: Account | null
    usb: boolean
  }
  signatureImages: {
    minorSignatureImage: SignatureImage
  }
}

export interface CreateEsignAccountRequest {
  accountId: string
  phone?: string
  simType: string
  cccd?: string
  username?: string
  certIdentifier?: string
  infos?: Info[]
}

export interface Info {
  serialNumber: string
  issuerDN: string
  subjectDN: string
}

export interface ToggleUsbAccountRequest {
  accountId: string
  message: string
  usbToken: boolean
}
