import { RecordCategoryApi } from '@/shared/services/api'
import { ref } from 'vue'
import { createApiConfig } from '../schemas/apiClient'

/* ===== TYPES ===== */

export type ArchiveDurationValue = number | 'PERMANENT'

export type SelectOption<T> = {
  label: string
  value: T
}

export type CreateRecordCategoryFormValues = {
  name: string
  code: string
  parentId: SelectOption<string> | null
  unit: string
  archiveDuration: SelectOption<ArchiveDurationValue> | null
  archiveLevel: SelectOption<'UNIT' | 'UNIVERSITY'> | null
  archivistIds: SelectOption<string>[]
  note?: string
}

/* ===== COMPOSABLE ===== */

export const useCreateRecordCategory = () => {
  const api = new RecordCategoryApi(createApiConfig())
  const isSubmitting = ref(false)

  const submit = async (values: CreateRecordCategoryFormValues) => {
    isSubmitting.value = true

    try {
      const durationValue = values.archiveDuration?.value
      const isPermanent = durationValue === 'PERMANENT'

      const payload = {
        actorId: '121231231',

        name: values.name,
        code: values.code,

        parentId: values.parentId!.value,
        unit: values.unit,

        archiveDuration: isPermanent ? 0 : (durationValue as number),

        archiveLevel: values.archiveLevel!.value,

        archivistIds: values.archivistIds.map((u) => u.value),

        isPermanent,

        expirationDate: isPermanent ? '9999-12-31' : new Date().toISOString().slice(0, 10),

        note: values.note ?? ''
      }

      await api.createRecordCategory(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    submit,
    isSubmitting
  }
}
