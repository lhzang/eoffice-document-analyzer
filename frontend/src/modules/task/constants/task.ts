export const SUBTASK_STATE = {
  executing: 'EXECUTING',
  evaluationPending: 'EVALUATION_PENDING',
  accepted: 'ACCEPTED',
  rejected: 'REJECTED'
} as const

export const TASK_ROLE = {
  leader: 'LEADER',
  viewer: 'VIEWER'
} as const

export const SUBTASK_ROLE = {
  executor: 'EXECUTOR',
  collaborator: 'COLLABORATOR'
} as const

export type SubtaskStateType = (typeof SUBTASK_STATE)[keyof typeof SUBTASK_STATE]
export type TaskRoleType = (typeof TASK_ROLE)[keyof typeof TASK_ROLE]
export type SubtaskRoleType = (typeof SUBTASK_ROLE)[keyof typeof SUBTASK_ROLE]

export const SUBTASK_STATE_CONFIG: Record<
  SubtaskStateType,
  {
    title: string
    severity: 'info' | 'warning' | 'success' | 'danger' | 'secondary'
  }
> = {
  EXECUTING: {
    title: 'Đang thực hiện',
    severity: 'info'
  },
  EVALUATION_PENDING: {
    title: 'Chờ phê duyệt',
    severity: 'warning'
  },
  ACCEPTED: {
    title: 'Đã duyệt',
    severity: 'success'
  },
  REJECTED: {
    title: 'Từ chối',
    severity: 'danger'
  }
} as const
