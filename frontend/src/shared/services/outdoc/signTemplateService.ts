import { OutDocApi, type CreateFlowSignTemplateCommand } from '../api'
import { apiClientConfig } from '../apiClientConfig'

const outDocApi = new OutDocApi(apiClientConfig)
export const signTepmplateService = {
  getListAllSignTemplates: async () => {
    const res = await outDocApi.getFlowSignTemplates()
    return res.data
  },
  getListUnitSignTemplates: async (untiId: string, type: 'internal' | 'out') => {
    const res = await outDocApi.getFlowSignTemplatesByUnitId(untiId)
    return res.data?.filter((template) =>
      type === 'internal'
        ? template?.type === 'INTERNAL_DOCUMENT'
        : template.type === 'OUT_DOCUMENT' || template?.type === 'PAPER_OUT_DOCUMENT'
    )
  },
  createSignTemplate: async (payload: CreateFlowSignTemplateCommand) => {
    const res = await outDocApi.createFlowSignTemplate(payload)
    return res.data
  },
  deleteSignTemplate: async (id: string) => {
    const res = await outDocApi.deleteFlowSignTemplate(id)
    return res.data
  }
}
