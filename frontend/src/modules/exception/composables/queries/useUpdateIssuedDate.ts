import { useMutation, type MutationOptions } from "@tanstack/vue-query";
import type { TUpdateIssuedDatePayload } from "../../models/updateIssuedDoc";
import { exceptionServices } from "../../services/updateIssuedDoc";
import { notifyError } from "@/shared/utils/common";

export const useUpdateIssuedDate =
    (option?: MutationOptions<void, TUpdateIssuedDatePayload, TServerError>) =>
        useMutation({
            mutationFn: (payload) => exceptionServices.updateIssuedDate(payload),
            onError: (e) => notifyError(e as TServerError, 'Cập nhật ngày phát hành văn bản thất bại'),
            ...option
        })