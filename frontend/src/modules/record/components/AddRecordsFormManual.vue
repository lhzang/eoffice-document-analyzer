<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { useCreateRecordCategory } from '../composables/useCreateRecordCategoryForm'

type ArchiveDurationValue = number | 'PERMANENT'

type SelectOption<T = string> = {
  label: string
  value: T
}

const selectOptionSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    label: z.string(),
    value: valueSchema
  })

const formSchema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  code: z.string().min(1, 'Bắt buộc'),

  parentId: selectOptionSchema(z.string())
    .nullable()
    .refine((val) => val !== null, {
      message: 'Bắt buộc chọn đề mục lớn'
    }),

  unit: z.string().min(1, 'Bắt buộc'),

  archiveDuration: selectOptionSchema(z.union([z.number(), z.literal('PERMANENT')])).nullable(),

  archiveLevel: selectOptionSchema(z.enum(['UNIT', 'UNIVERSITY'])).nullable(),

  archivistIds: z.array(selectOptionSchema(z.string())).min(1, 'Chọn ít nhất 1 cán bộ'),

  note: z.string().optional()
})

const staticFetch = <T,>(data: SelectOption<T>[]) => {
  return async () => ({
    options: data,
    hasMore: false
  })
}

const parentOptions: SelectOption<string>[] = [
  { label: 'Đề mục A', value: 'A' },
  { label: 'Đề mục B', value: 'B' }
]

const archiveDurationOptions: SelectOption<ArchiveDurationValue>[] = [
  { label: 'Vĩnh viễn', value: 'PERMANENT' },
  { label: '5 năm', value: 5 },
  { label: '10 năm', value: 10 }
]

const archiveLevelOptions: SelectOption<'UNIT' | 'UNIVERSITY'>[] = [
  { label: 'Đơn vị', value: 'UNIT' },
  { label: 'Đại học', value: 'UNIVERSITY' }
]

const archivistOptions: SelectOption<string>[] = [
  { label: 'Nguyễn Văn A', value: 'u1' },
  { label: 'Trần Thị B', value: 'u2' }
]

/* ================= FORM ================= */

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    name: '',
    code: '',
    parentId: null,
    unit: '',
    archiveDuration: null,
    archiveLevel: null,
    archivistIds: [],
    note: ''
  }
})

const toast = useToast()

const { submit, isSubmitting } = useCreateRecordCategory()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const onSubmit = handleSubmit(async (values) => {
  try {
    await submit(values)

    toast.add({
      severity: 'success',
      summary: 'Tạo đề mục thành công',
      life: 3000
    })

    emit('success')
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Tạo đề mục thất bại',
      life: 3000
    })
  }
})
</script>

<template>
  <form @submit="onSubmit">
    <div class="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border p-6">
      <AppTextInput
        name="name"
        label="Tên đề mục"
        required
        :error-message="errors.name"
        placeholder="Nhập tên đề mục"
      />

      <AppTextInput
        name="code"
        label="Số hiệu đề mục"
        required
        :error-message="errors.code"
        placeholder="Nhập số hiệu đề mục"
      />

      <AppSelect
        name="parentId"
        label="Đề mục lớn"
        required
        :fetchOptions="staticFetch(parentOptions)"
        :error-message="errors.parentId"
      />

      <AppTextInput
        name="unit"
        label="Đơn vị lập"
        required
        :error-message="errors.unit"
        placeholder="Nhập đơn vị lập đề mục"
      />

      <AppSelect
        name="archiveDuration"
        label="Thời gian bảo quản"
        :fetchOptions="staticFetch(archiveDurationOptions)"
        :error-message="errors.archiveDuration"
      />

      <AppSelect
        name="archiveLevel"
        label="Nơi bảo quản"
        required
        :fetchOptions="staticFetch(archiveLevelOptions)"
        :error-message="errors.archiveLevel"
      />

      <AppSelect
        name="archivistIds"
        label="Cán bộ lưu trữ"
        multiple
        :fetchOptions="staticFetch(archivistOptions)"
        :error-message="errors.archivistIds"
      />

      <AppTextInput name="note" label="Ghi chú" placeholder="Nhập ghi chú" />
    </div>

    <div class="mt-4 flex justify-end">
      <Button label="Lưu" type="submit" :loading="isSubmitting" :disabled="isSubmitting" />
    </div>
  </form>
</template>
