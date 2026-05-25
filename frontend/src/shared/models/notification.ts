export type TGetInfinityNotificationsPayload = {
  pageSize: number
  isRead?: boolean
  publishedBefore: string
}

export type TGetNotificationsPayload = {
  pageSize: number
  page: number
  isRead?: boolean
  publishedBefore: string
}

// export type TNoficationContent = {
//   summary: string
//   detail: string
//   reason?: string
// }
