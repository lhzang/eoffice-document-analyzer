import type { NotificationDTO } from '@/shared/services/api'

export const getObjectLabel = (objectValue: string) => {
  switch (objectValue) {
    case 'indoc':
      return 'Văn bản đến'
    case 'internal_doc':
      return 'Văn bản nội bộ'
    case 'outdoc':
      return 'Văn bản đi'
    case 'subtask':
    case 'task':
      return 'Công việc'
    case 'carregistration':
      return 'Đăng ký xe'
    case 'signature':
      return 'Chũ ký'
    case 'certificate':
      return 'Chứng thư'
    case 'usb_sign_request':
      return 'Yêu cầu ký'
    default:
      return ''
  }
}
export const getNotificationSummary = (noti: NotificationDTO): string => {
  const objectType = noti?.object?.type
  const actionType = noti?.activityType
  //indoc
  if (objectType === 'indoc') {
    if (
      ['sign', 'distribute', 'assign', 'propose', 'accept', 'send', 'register']?.includes(
        actionType
      )
    )
      return `${noti?.actor?.name} đã gửi văn bản mới`
    if (['revoke']?.includes(actionType))
      return `${noti?.actor?.name} đã thu hồi quyền truy cập văn bản`
    if (['reject']?.includes(actionType)) return `${noti?.actor?.name} đã trả lại văn bản`
  }
  //
  if (objectType === 'outdoc' || objectType === 'internal_doc') {
    if (['sign', 'evaluate', 'stamp', 'create']?.includes(actionType))
      return `${noti?.actor?.name} đã gửi văn bản cần xử lý`
    if (['revoke']?.includes(actionType)) return `${noti?.actor?.name} đã thu hồi văn bản`
    if (['reject']?.includes(actionType)) return `${noti?.actor?.name} đã trả lại văn bản`
  }
  //task
  if (objectType === 'task' || objectType === 'subtask') {
    if (['delete']?.includes(actionType))
      return `${noti?.actor?.name} đã xóa ${objectType === 'subtask' ? 'đầu việc' : 'công việc'}`
  }
  if (objectType === 'task') {
    if (actionType === 'create') return `${noti?.actor?.name} đã tạo công việc mới`
    if (actionType === 'finish') return `${noti?.actor?.name} đã hoàn thành công việc`
  }
  if (objectType === 'subtask') {
    if (actionType === 'assign') return `${noti?.actor?.name} đã giao đầu việc mới`
    if (actionType === 'accept') return `${noti?.actor?.name} đã phê duyệt đầu việc`
    if (actionType === 'reject') return `${noti?.actor?.name} đã từ chối đầu việc`
  }

  //record

  //car
  if (objectType === 'carregistration') {
    if (actionType === 'register')
      return `${noti?.actor?.name} đã gửi đơn đăng ký xe ${noti?.object?.properties?.carType === 'STAFF' ? 'cán bộ' : 'khách'}`
    if (actionType === 'reject') return `${noti?.actor?.name} đã từ chối duyệt đơn`
    if (actionType === 'accept') return `${noti?.actor?.name} đã duyệt đơn`
  }
  if (objectType === 'usb_sign_request') {
    if (actionType === 'send') return `${noti?.actor?.name} đã gửi yêu cầu ký`
  }
  return ''
}
// export const getObjectLabel = (objectValue: string) => {
//   switch (objectValue) {
//     case 'indoc':
//       return 'văn bản đến'
//     case 'internal_doc':
//       return 'văn bản nội bộ'
//     case 'outdoc':
//       return 'văn bản đi'
//     case 'work':
//       return 'công việc'
//     case 'carregistration':
//       return 'đăng ký xe'
//     case 'signature':
//       return 'chũ ký'
//     case 'certificate':
//       return 'chứng thư'
//   }
// }
