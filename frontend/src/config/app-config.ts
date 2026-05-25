import { z } from 'zod'

export const validEnvs = [
  'development',
  'hust_staging',
  'hmu_staging',
  'hmuh_staging',
  'prod_hust',
  'prod_hmu',
  'prod_hmuh',
  'mock'
] as const

export type TEnvs = (typeof validEnvs)[number]

export const AppConfigSchema = z.object({
  VITE_ENV_NAME: z.enum(validEnvs),
  VITE_APP_NAME: z.string(),
  VITE_API_SERVER: z.string().url(),
  VITE_ESIGN_API_SERVER: z.string().url(),
  VITE_TEMPLATE_DOC_URL: z.string().url(),
  VITE_SIGNATURE_URL: z.string().url(),
  VITE_SIGNATURE_VERIFY_URL: z.string().url(),
  VITE_APP_PRIMARY_COLOR: z.string(),
  VITE_APP_BACKGROUND_COLOR: z.string(),
  VITE_ESIGN_PROVIDER_LABEL: z.string(),
  VITE_ESIGN_REDIRECT_URL: z.string().url()
})

export const appConfig = AppConfigSchema.parse(import.meta.env)
