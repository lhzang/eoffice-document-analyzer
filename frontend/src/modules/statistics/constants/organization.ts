import { GetIncomingDashboardUnitTypeEnum } from '@/shared/services/api'

export type UnitType =
  (typeof GetIncomingDashboardUnitTypeEnum)[keyof typeof GetIncomingDashboardUnitTypeEnum]

export const UNIT_TYPE_OPTIONS = [
  {
    value: GetIncomingDashboardUnitTypeEnum.All,
    label: 'Tất cả'
  },
  {
    value: GetIncomingDashboardUnitTypeEnum.Administrative,
    label: 'Hành chính'
  },
  {
    value: GetIncomingDashboardUnitTypeEnum.CommunistParty,
    label: 'Đảng ủy'
  },
  {
    value: GetIncomingDashboardUnitTypeEnum.Union,
    label: 'Công đoàn'
  },
  {
    value: GetIncomingDashboardUnitTypeEnum.YouthUnion,
    label: 'Đoàn thanh niên'
  }
]
