import {
  CarApi,
  type AssignDeletePermissionCommand,
  type AssignPermissionCommand,
  type AssignRegisterPermissionCommand,
  type AssignViewPermissionCommand,
  type Pageable
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { mappingServerPaginatedData } from '@/shared/utils/common'
import type {
  TCarRegisterPayload,
  TCarRegisterPayloadMap,
  TCarRegisterType
} from '../models/carRegister'
import type { TCarStatus, TCarType, TDetailCarPayload, TDetailCarResponse } from '../models/common'

const carApi = new CarApi(apiClientConfig)
export const carRegisterService = {
  register: async <T extends TCarRegisterType>(params: TCarRegisterPayload<T>) => {
    const { type, payload } = params
    switch (type) {
      case 'STAFF': {
        const { licensePlate, eTag, registrationFile } = payload as TCarRegisterPayloadMap['STAFF']
        const result = await carApi.registerStaffCar(licensePlate, eTag, registrationFile)
        return result.data
      }
      case 'GUEST': {
        const result = await carApi.registerGuestCar(payload as TCarRegisterPayloadMap['GUEST'])
        return result.data
      }
      case 'STUDENT_MANUAL': {
        const {
          graduationDate,
          eTag,
          ownerName,
          licensePlate,
          registrationFile,
          studentName,
          studentCode,
          intakeCode,
          className,
          admissionYear,
          email
        } = payload as TCarRegisterPayloadMap['STUDENT_MANUAL']
        const result = await carApi.registerStudentCar(
          graduationDate,
          eTag,
          ownerName,
          licensePlate,
          registrationFile,
          studentName,
          studentCode,
          intakeCode,
          className,
          admissionYear,
          email
        )
        return result.data
      }
      case 'STUDENT_UPLOAD': {
        const { file } = payload as TCarRegisterPayloadMap['STUDENT_UPLOAD']
        const result = await carApi.registerStudentCarExcelUpload(file)
        return result.data
      }
      case 'COLLABORATOR_MANUAL': {
        const { ownerName, licensePlate, phoneNumber, eTag, startDate, endDate, registrationFile } =
          payload as TCarRegisterPayloadMap['COLLABORATOR_MANUAL']
        const result = await carApi.registerCollaboratorCar(
          ownerName,
          licensePlate,
          phoneNumber,
          eTag,
          startDate,
          endDate,
          registrationFile
        )
        return result.data
      }
      case 'COLLABORATOR_UPLOAD': {
        const { file } = payload as TCarRegisterPayloadMap['COLLABORATOR_UPLOAD']
        const resust = await carApi.registerCollaboratorCarExcelUpload(file)
        return resust.data
      }
      case 'UNIVERSITY_MANUAL': {
        const result = await carApi.registerUniversityCarManual(
          payload as TCarRegisterPayloadMap['UNIVERSITY_MANUAL']
        )
        return result.data
      }
      case 'UNIVERSITY_UPLOAD': {
        const { file } = payload as TCarRegisterPayloadMap['UNIVERSITY_UPLOAD']
        const result = await carApi.registerUniversityCarExcelUpload(file)
        return result.data
      }
    }
  },

  //get list
  getStaffCarList: async (staffGetListPayload: Pageable, search?: string) => {
    const result = await carApi.getStaffCars(staffGetListPayload, search || undefined)
    return mappingServerPaginatedData(result?.data)
  },
  getGuestCarList: async (guestGetListPayload: Pageable, search?: string) => {
    const result = await carApi.getGuestCars(guestGetListPayload, search || undefined)
    return mappingServerPaginatedData(result?.data)
  },
  getStudentCarList: async (studentGetListPayload: Pageable, search?: string) => {
    const result = await carApi.getStudentCars(studentGetListPayload, search || undefined)
    return mappingServerPaginatedData(result?.data)
  },
  getCollaboratorCarList: async (collaboratorGetListPayload: Pageable, search?: string) => {
    const result = await carApi.getCollaboratorCars(collaboratorGetListPayload, search || undefined)
    return mappingServerPaginatedData(result?.data)
  },
  getRequestStaffCarList: async (
    getListPaylaod: Pageable,
    search?: string,
    status?: TCarStatus[]
  ) => {
    const result = await carApi.getStaffCarRequests(getListPaylaod, search || undefined, status)
    return mappingServerPaginatedData(result?.data)
  },
  getRequestGuestCarList: async (
    getListPaylaod: Pageable,
    search?: string,
    status?: TCarStatus[]
  ) => {
    const result = await carApi.getGuestCarRequests(getListPaylaod, search || undefined, status)
    return mappingServerPaginatedData(result?.data)
  },
  getCreatedStaffCarList: async (
    getListPaylaod: Pageable,
    search?: string,
    status?: TCarStatus[]
  ) => {
    const result = await carApi.getStaffCarCreated(getListPaylaod, search || undefined, status)
    return mappingServerPaginatedData(result?.data)
  },
  getCreatedGuestCarList: async (
    getListPaylaod: Pageable,
    search?: string,
    status?: TCarStatus[]
  ) => {
    const result = await carApi.getCreatedGuestCars(getListPaylaod, search || undefined, status)
    return mappingServerPaginatedData(result?.data)
  },
  getUniCarList: async (uniGetListPayload: Pageable, search?: string) => {
    const result = await carApi.getUniversityCars(uniGetListPayload, search || undefined)
    return mappingServerPaginatedData(result?.data)
  },
  getDetailCar: async <T extends TCarType>(payload: TDetailCarPayload<T>) => {
    const { id, type } = payload
    switch (type) {
      case 'STAFF': {
        const res = await carApi.getStaffCarDetail(id)
        return res.data as TDetailCarResponse[T]
      }
      case 'GUEST': {
        const res = await carApi.getGuestCarDetail(id)
        return res.data as TDetailCarResponse[T]
      }
      case 'STUDENT': {
        const res = await carApi.getStudentCarDetail(id)
        return res.data as TDetailCarResponse[T]
      }
      case 'COLLABORATOR': {
        const res = await carApi.getCollaboratorCarDetail(id)
        return res.data as TDetailCarResponse[T]
      }
      case 'UNIVERSITY': {
        const res = await carApi.getUniversityCarDetail(id)
        return res.data as TDetailCarResponse[T]
      }
    }
  },
  getDetailStaffCar: async (id: string) => {
    const res = await carApi.getStaffCarDetail(id)
    return res.data
  },
  getDetailGuestCar: async (id: string) => {
    const res = await carApi.getGuestCarDetail(id)
    return res.data
  },
  getDetailStudentCar: async (id: string) => {
    const res = await carApi.getStudentCarDetail(id)
    return res.data
  },
  getDetailCollaboratorCar: async (id: string) => {
    const res = await carApi.getCollaboratorCarDetail(id)
    return res.data
  },
  getDetailUniCar: async (id: string) => {
    const res = await carApi.getUniversityCarDetail(id)
    return res.data
  },
  exportStaffCarData: async () => {
    const res = await carApi.exportStaffCars({
      responseType: 'blob'
    })
    return res.data
  },
  //mutate
  deleteCar: async (id: string) => {
    const res = await carApi.deleteUniversityCar(id)
    return res.data
  },
  rejectStaffCar: async (id: string, reason: string) => {
    const res = await carApi.rejectStaffCarRegistration(id, reason)
    return res.data
  },
  rejectGuestCar: async (id: string, reason: string) => {
    const res = await carApi.rejectGuestCarRegistration(id, reason)
    return res.data
  },
  approveStaffCar: async (id: string) => {
    const res = await carApi.acceptStaffCarRegistration(id)
    return res.data
  },
  approveGuestCar: async (id: string) => {
    const res = await carApi.acceptGuestCarRegistration(id)
    return res.data
  },
  updateStaffCar: async (id: string, eTag: string) => {
    const res = await carApi.updateETag(id, eTag)
    return res.data
  },
  grantStaffPerm: async (unitId: string, payload: AssignPermissionCommand) => {
    const res = await carApi.assignCarStaffPermission(unitId, payload)
    return res.data
  },
  revokeStaffPerm: async (id: string, type: TCarType, unitId: string) => {
    const res = await carApi.revokeCarStaffPermission(id, type, unitId)
    return res.data
  },
  getStaffsWithRegisterAndApproveCarInUnit: async (unitId: string) => {
    const res = await carApi.getCanEvaluatingStaffs(unitId)
    return res?.data
  },
  getStaffsWithGlobalViewStaffCar: async () => {
    const res = await carApi.getStaffsHaveViewPermission()
    return res?.data
  },
  getStaffsWithGlobalDeleteCar: async () => {
    const res = await carApi.getStaffsHaveDeletePermission()
    return res.data
  },
  getStaffsWithCreateAndAppoveCarInUnitByAdmin: async (unitId: string) => {
    const res = await carApi.getStaffsHaveRegisterPermissionInUnit(unitId)
    return res.data
  },
  assignGlobalViewCarPermissions: async (payload: AssignViewPermissionCommand) => {
    const res = await carApi.assignViewCarPermissions(payload)
    return res.data
  },
  assignGlobalDeleteCarPermissions: async (payload: AssignDeletePermissionCommand) => {
    const res = await carApi.assignDeleteCarPermissions(payload)
    return res.data
  },
  assignGlobalRegisterAndApproveCarPermissions: async (
    payload: AssignRegisterPermissionCommand
  ) => {
    const res = await carApi.assignEvaluateAndRegisterCarPermissions(payload)
    return res.data
  },
  revokeGlobalViewCarPermissions: async (staffId: string, carType: TCarType) => {
    const res = await carApi.revokeViewCarPermissions(staffId, carType)
    return res.data
  },
  revokeGlobalRegisterAndApproveCarPermissions: async (
    unitId: string,
    staffId: string,
    carType: TCarType
  ) => {
    const res = await carApi.revokeEvaluateAndRegisterCarPermissions(unitId, staffId, carType)
    return res.data
  },
  revokeGlobalDeleteCarPermissions: async (staffId: string, carType: TCarType) => {
    const res = await carApi.revokeDeleteCarPermissions(staffId, carType)
    return res.data
  }
}
