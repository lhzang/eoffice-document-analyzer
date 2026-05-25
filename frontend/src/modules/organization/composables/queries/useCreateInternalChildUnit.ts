import { useMutation } from "@tanstack/vue-query";
import type { TUnitCreatePayload } from "../../models/unit";
import unitService from '../../services/unitService'
import { notifyError } from "@/shared/utils/common";
import type { MutationOptions } from "@/shared/models/common";

export const useCreateInternalChildUnit = (
    options?: MutationOptions<void, TServerError, TUnitCreatePayload>
) =>
    useMutation<void, TServerError, TUnitCreatePayload>({
        mutationFn: (payload) => unitService.createInternalChildUnit(payload),
        onError: (e) => notifyError(e, 'Cập nhật thông tin đơn vị thất bại'),
        ...options
    })