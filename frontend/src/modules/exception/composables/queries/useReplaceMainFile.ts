import { useMutation, type MutationOptions } from "@tanstack/vue-query";
import type { TReplaceMainFilePayload } from "../../models/updateIssuedDoc";
import { exceptionServices } from "../../services/updateIssuedDoc";
import { notifyError } from "@/shared/utils/common";

export const useReplaceMainFile =
    (option?: MutationOptions<void, TReplaceMainFilePayload, TServerError>) =>
        useMutation({
            mutationFn: (payload) => exceptionServices.replaceMainFile(payload),
            onError: (e) => notifyError(e as TServerError, 'Thay thế file chính văn bản thất bại'),
            ...option
        })
