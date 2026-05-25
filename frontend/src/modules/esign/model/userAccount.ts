export type UserAccountResponse = {
  _id: string
  accountId: string
  roles: string[]
  info: {
    name: string
    organization: string
    country: string
    province: string
    locality: string
    email: string
    phone?: string
    unit?: string
  }
  hasChangedPassword: boolean
  initialPassword: string
}

export type EditUserAccountRequest = {
  info: {
    email: string
    phone: string
  }
}
