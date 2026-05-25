<script setup lang="ts">
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useField, useForm } from 'vee-validate'
import type z from 'zod'
import CollaboratorCarRegister from '../components/CollaboratorCarRegister.vue'
import GuestCarRegister from '../components/GuestCarRegister.vue'
import StaffCarRegister from '../components/StaffCarRegister.vue'
import StudentCarRegister from '../components/StudentCarRegister.vue'
import UniCarRegister from '../components/UniCarRegister.vue'
import { useRegisterCar } from '../composables/queries/useRegisterCar'
import { CAR_LIST, CAR_TYPES } from '../constants/carType'
import type { TCarType } from '../models/common'
import { carRegisSchema } from '../schemas/carRegisterSchema'

type TFormData = z.infer<typeof carRegisSchema>

const { handleSubmit, values, handleReset, errors } = useForm({
  validationSchema: toTypedSchema(carRegisSchema),
  initialValues: {
    carTypeValue: CAR_TYPES.staff
  }
})

const notiRegisCarSuccess = () => {
  toastSucceed({
    detail: 'Đăng ký xe thành công'
  })
}

const notiNeedApproveRegisCarSuccess = () => {
  toastSucceed({
    detail: 'Đăng ký xe thành công, vui lòng chờ duyệt đơn đăng ký'
  })
}

const handleResetAfterSuccess = () => {
  const carTypeOpt = { ...carTypeSelect.value }
  const registTypeValue = 'type' in values ? values?.type : undefined
  handleReset()
  carTypeValue.value = carTypeOpt.value
  carTypeSelect.value = carTypeOpt
  if (registTypeValue) {
    registType.value = registTypeValue
  }
}

const { mutate: createRegisterFn, isPending: isRegisting } = useRegisterCar({
  onSuccess: handleResetAfterSuccess
})

const { user } = useUserProfileStore()
const { value: carTypeValue } = useField<TCarType>('carTypeValue')
const { value: carTypeSelect } = useField<TCommonSelectOptions<TCarType>>('carTypeSelect')
const { value: staffName } = useField<string>('staffName')
const { value: registType } = useField<'manual' | 'upload'>('type', undefined, {
  initialValue: 'manual'
})
const userPermission = user?.currentPermission ?? []
const confirm = useConfirm()

const handleGenCarTypeOpts = () => {
  const hasPermCarTypeList: TCarType[] = [CAR_TYPES.staff, CAR_TYPES.guest]
  userPermission?.forEach((perm) => {
    if (perm === APP_PERMISSION_VALUES.createCollaboratorCar)
      hasPermCarTypeList.push(CAR_TYPES.collaborator)
    if (perm === APP_PERMISSION_VALUES.createUniCar) hasPermCarTypeList.push(CAR_TYPES.university)
    if (perm === APP_PERMISSION_VALUES.createStudentCar) hasPermCarTypeList.push(CAR_TYPES.student)
  })
  return {
    options: CAR_LIST?.filter((carType) => hasPermCarTypeList?.includes(carType?.value)),
    hasMore: false
  }
}

const handleSelectCarType = (typeOpt: TCommonSelectOptions<TCarType>) => {
  handleReset()
  carTypeValue.value = typeOpt.value
  carTypeSelect.value = typeOpt
}

const createRegister = (formValues: TFormData) => {
  if (!('type' in formValues) || formValues?.type !== 'upload') {
    const carType = formValues?.carTypeValue
    if (carType === 'STAFF') {
      createRegisterFn(
        {
          type: 'STAFF',
          payload: {
            licensePlate: formValues?.licensePlate,
            eTag: formValues?.eTag,
            registrationFile: formValues?.registrationFile
          }
        },
        {
          onSuccess: () => {
            if (userPermission?.includes(APP_PERMISSION_VALUES.evaluateStaffCar)) {
              notiRegisCarSuccess()
            } else {
              notiNeedApproveRegisCarSuccess()
            }
            staffName.value = user?.fullName ?? ''
          }
        }
      )
    }
    if (carType === 'GUEST') {
      createRegisterFn(
        {
          type: 'GUEST',
          payload: {
            licensePlate: formValues?.licensePlate,
            ownerName: formValues?.ownerName,
            guestUnitName: formValues?.guestUnitName,
            visitUnitId: formValues?.visitUnit?.id!,
            startDate: DateTime.fromJSDate(formValues?.workPeriod?.[0]!).toISODate()!,
            endDate: DateTime.fromJSDate(formValues?.workPeriod?.[1]!).toISODate()!,
            workContent: formValues?.workContent,
            note: formValues?.note
          }
        },
        {
          onSuccess: () => {
            if (userPermission?.includes(APP_PERMISSION_VALUES.evaluateGuestCar)) {
              notiRegisCarSuccess()
            } else {
              notiNeedApproveRegisCarSuccess()
            }
          }
        }
      )
    }
    if (carType === 'UNIVERSITY') {
      createRegisterFn(
        {
          type: 'UNIVERSITY_MANUAL',
          payload: {
            licensePlate: formValues.licensePlate,
            eTag: formValues.eTag
          }
        },
        {
          onSuccess: notiRegisCarSuccess
        }
      )
    }
    if (carType === 'STUDENT') {
      createRegisterFn(
        {
          type: 'STUDENT_MANUAL',
          payload: {
            graduationDate: DateTime.fromJSDate(formValues?.graduationDate).toISODate()!,
            eTag: formValues?.eTag,
            ownerName: formValues?.ownerName,
            licensePlate: formValues?.licensePlate,
            registrationFile: formValues?.registrationFile,
            studentName: formValues?.studentName,
            studentCode: formValues?.studentCode,
            intakeCode: formValues?.intakeCode,
            className: formValues?.className,
            admissionYear: formValues?.admissionYear
              ? DateTime.fromJSDate(formValues?.admissionYear).year.toString()
              : undefined,
            email: formValues?.email
          }
        },
        { onSuccess: notiRegisCarSuccess }
      )
    }
    if (carType === 'COLLABORATOR') {
      createRegisterFn(
        {
          type: 'COLLABORATOR_MANUAL',
          payload: {
            ownerName: formValues?.ownerName,
            licensePlate: formValues?.licensePlate,
            phoneNumber: formValues?.phoneNumber,
            eTag: formValues?.eTag,
            startDate: DateTime.fromJSDate(formValues?.workPeriod?.[0]).toISODate()!,
            endDate: DateTime.fromJSDate(formValues?.workPeriod?.[1]).toISODate()!,
            registrationFile: formValues?.registrationFile
          }
        },
        { onSuccess: notiRegisCarSuccess }
      )
    }
  } else {
    const carType = formValues?.carTypeValue
    const filePayload = {
      file: formValues?.uploadFile
    }
    if (carType === 'COLLABORATOR') {
      createRegisterFn(
        {
          type: 'COLLABORATOR_UPLOAD',
          payload: filePayload
        },
        {
          onSuccess: notiRegisCarSuccess
        }
      )
    }
    if (carType === 'STUDENT') {
      createRegisterFn(
        {
          type: 'STUDENT_UPLOAD',
          payload: filePayload
        },
        {
          onSuccess: notiRegisCarSuccess
        }
      )
    }
    if (carType === 'UNIVERSITY') {
      createRegisterFn(
        {
          type: 'UNIVERSITY_UPLOAD',
          payload: filePayload
        },
        {
          onSuccess: notiRegisCarSuccess
        }
      )
    }
  }
}

const onSubmit = handleSubmit((formValues) => {
  if (!('type' in formValues) || formValues?.type !== 'upload') {
    const licensePlate = formValues?.licensePlate
    const plateRegex = /^(?:[0-9]{2}[A-Z]{0,2}[0-9]?|[A-Z]{2})-?[0-9]{3,5}(?:\.[0-9]{2})?$/
    const plates = (licensePlate || '')
      .split(';')
      .map((p) => p.trim().toUpperCase())
      .filter((p) => p !== '')
    const invalid = plates.filter((p) => !plateRegex.test(p))
    let msg = ''
    if (invalid.length > 0) {
      msg = `Biển số không đúng định dạng: ${invalid.join(', ')}. Thầy/Cô vẫn muốn sử dụng thông tin biển số trên?`
    } else {
      msg = `Thầy/Cô có chắc muốn tạo đăng ký xe cho biển số: ${plates?.join(', ')}?`
    }
    confirm.require({
      group: 'confirmRegistCar',
      message: msg,
      header: 'Tạo đăng ký',
      accept: () => {
        createRegister(formValues)
      },
      rejectProps: {
        label: 'Hủy',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: 'Xác nhận',
        severity: 'primary'
      }
    })
  } else createRegister(formValues)
})
</script>
<template>
  <form @submit="onSubmit">
    <div class="card">
      <div class="grid grid-cols-2 gap-4">
        <AppSelect
          :class="
            values?.carTypeValue === CAR_TYPES.staff || values?.carTypeValue === CAR_TYPES.guest
              ? 'col-span-1'
              : 'col-span-2'
          "
          name="carTypeSelect"
          label="Loại xe đăng ký"
          :fetch-options="handleGenCarTypeOpts"
          @select="handleSelectCarType"
          :default-value="CAR_LIST?.find((type) => type.value === CAR_TYPES.staff)"
        />

        <StaffCarRegister v-if="carTypeValue === CAR_TYPES.staff" />
        <GuestCarRegister v-if="carTypeValue === CAR_TYPES.guest" />
        <UniCarRegister v-if="carTypeValue === CAR_TYPES.university" />
        <CollaboratorCarRegister v-if="carTypeValue === CAR_TYPES.collaborator" />
        <StudentCarRegister v-if="carTypeValue === CAR_TYPES.student" />
      </div>
      <div class="mt-4 italic"><span class="text-red-500">*</span> Thông tin bắt buộc</div>
    </div>
    <div class="col-span-full flex justify-end gap-4">
      <Button
        type="submit"
        @click="console.log(errors, 'errorserrorserrors')"
        :loading="isRegisting"
        class="mt-4 w-fit"
        >Xác nhận</Button
      >
    </div>
    <ConfirmDialog group="confirmRegistCar" class="w-[600px]" />
  </form>
</template>
