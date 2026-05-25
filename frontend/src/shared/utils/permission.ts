//use this to check if user ACL has permission with some features

import type { TAppFeatureKey } from '../constants/permission'

//update the APP_PERMISSIONS_LIST manually whenever app permissions has been modified
export const checkIfUserHasPermission = (
  userRoles: TAppFeatureKey[],
  featureKey: TAppFeatureKey
) => {
  return userRoles?.includes(featureKey)
}
