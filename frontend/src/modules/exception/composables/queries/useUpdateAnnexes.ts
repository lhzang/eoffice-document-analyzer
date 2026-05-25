import { useMutation, type MutationOptions } from "@tanstack/vue-query";
import type { TUpdateAnnexesPayload } from "../../models/updateIssuedDoc";
import { exceptionServices } from "../../services/updateIssuedDoc";
import { notifyError } from "@/shared/utils/common";

export const useUpdateAnnexes =
    (option?: MutationOptions<void, TUpdateAnnexesPayload, TServerError>) =>
        useMutation({
            mutationFn: (payload) => exceptionServices.updateAnnexes(payload),
            onError: (e) => notifyError(e as TServerError, 'Cập nhật phụ lục văn bản thất bại'),
            ...option
        })