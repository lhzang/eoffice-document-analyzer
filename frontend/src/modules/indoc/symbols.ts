import type { InjectionKey } from 'vue'

import type { IFilterParams } from '@/modules/indoc/pages/DocumentReview.vue'

export const filterParamsProvideKey = Symbol('filterParams') as InjectionKey<IFilterParams>
