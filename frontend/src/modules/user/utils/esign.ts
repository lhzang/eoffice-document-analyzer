import type { TUserInfo } from "../models/types"

export type SimpleOption = {
  label: string
  value: string
}

export function getESignOptionsFromUser(user: TUserInfo | null | undefined): SimpleOption[] {
  if (!user) return []
  const map = user.esignConfigMap || {}
  return Object.keys(map)
    .filter((key) => !!map[key])
    .map((key) => ({ label: key, value: key }))
}

export function getDefaultESignProvider(user: TUserInfo | null | undefined): string | null {
  return user?.defaultESignConfigProvider ?? null
}



