import roleHandlers from './role'
import unitHandlers from './unit'

export const organizationHandlers = [...unitHandlers, ...roleHandlers]
export default organizationHandlers
