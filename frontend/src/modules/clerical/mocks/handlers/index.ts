import { handlers as adminDocTypeHandlers } from './adminDocTypeHandlers'
import { handlers as documentBookHandlers } from './documentBookHandlers'
export const handlers = [...adminDocTypeHandlers, ...documentBookHandlers]
