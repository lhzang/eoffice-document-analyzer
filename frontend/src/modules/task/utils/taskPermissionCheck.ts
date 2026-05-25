import type { SubtaskVM, TaskVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'

export const taskPermissionCheck = () => {
  const profileStore = useUserProfileStore()

  const isTaskCreator = (task?: TaskVM) => {
    if (!profileStore.user?.currentPosition?.id || !task?.creator) return false
    return task.creator.staffId === profileStore.user.currentPosition.id
  }

  const isTaskLeader = (task?: TaskVM) => {
    if (!profileStore.user?.currentPosition?.id || !task?.leaders) return false
    const currentPositionId = profileStore.user.currentPosition.id
    const leaderIds = Array.from(task.leaders).map((leader) => leader.staffId)
    return leaderIds.includes(currentPositionId)
  }

  const isSubtaskExecutor = (subtask?: SubtaskVM) => {
    if (!profileStore.user?.currentPosition?.id || !subtask?.executors) return false
    const currentPositionId = profileStore.user.currentPosition.id
    const executorIds = Array.from(subtask.executors).map((executor) => executor.staffId)
    return executorIds.includes(currentPositionId)
  }

  return {
    isTaskCreator,
    isTaskLeader,
    isSubtaskExecutor
  }
}
