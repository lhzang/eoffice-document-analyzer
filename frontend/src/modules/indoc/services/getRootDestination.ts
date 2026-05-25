import { dataDestinationID } from '../mocks/dataDestination'

import type { IRootDestination, TAssignedUserRoles } from '../models/types'

export function getRootDestination(documentId: string): Promise<IRootDestination[]> {
  const newDestinations = dataDestinationID.destinations?.reduce(
    (acc, item) => {
      const { role } = item
      if (!acc[role]) {
        acc[role] = { destinations: [], role }
      }
      acc[role].destinations.push(item)
      return acc
    },
    {} as Record<TAssignedUserRoles, IRootDestination>
  )

  return new Promise((resolve) => setTimeout(() => resolve(Object.values(newDestinations)), 100))
}
