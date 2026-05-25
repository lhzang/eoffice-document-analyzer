import { handlers as clericalHandlers } from '@/modules/clerical/mocks/handlers'
import { handlers as inDocHandler } from '@/modules/indoc/mocks/handlers'
import organizationHandlers from '@/modules/organization/mocks/handlers'
import { handlers as userHandler } from '@/modules/user/mocks/handlers'
import { handlers as esignHandlers } from '@/modules/esign/mocks/handlers'
import { handlers as docFromTaskHandlers } from '@/shared/mocks/handlers/task/handlers'
import { handlers as  docFromIndocHandlers} from '@/shared/mocks/handlers/indoc/handlers'
import { handlers as  docFromOutdocHandlers} from '@/shared/mocks/handlers/outdoc/handlers'
import { handlers as  docFromInternaldocHandlers} from '@/shared/mocks/handlers/internaldoc/handlers'

export const handlers = [
  ...userHandler,
  ...inDocHandler,
  ...clericalHandlers,
  ...organizationHandlers,
  ...esignHandlers,
  ...docFromTaskHandlers,
  ...docFromIndocHandlers,
  ...docFromOutdocHandlers,
  ...docFromInternaldocHandlers
]
