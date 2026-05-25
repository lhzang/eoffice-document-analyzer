import z from "zod";
import { EditTypesEnum } from "../constants/updateIssuedDoc";
import { requireStringSchema } from "@/shared/schemas/commonSchema";
import { MSG_REQUIRED_FILE } from "@/shared/constants/message-text";

const cancelIssuedDocSchema = z.object({
    exceptionType: z.literal(EditTypesEnum.CANCEL_ISSUE_DOCUMENT),
    exceptionSource: z.string(),
    reason: requireStringSchema,
    relatedFile: z.instanceof(File).optional(),
});

const updateIssuedDateSchema = z.object({
    exceptionType: z.literal(EditTypesEnum.UPDATE_ISSUE_DATE),
    exceptionSource: z.string(),
    reason: requireStringSchema,
    relatedFile: z.instanceof(File).optional(),
});

const replaceMainFileSchema = z.object({
    exceptionType: z.literal(EditTypesEnum.REPLACE_MAIN_FILE),
    exceptionSource: z.string(),
    newMainFile: z.file({ error: MSG_REQUIRED_FILE }),
    reason: requireStringSchema,
    relatedFile: z.instanceof(File).optional(),
});

const updateAnnexesSchema = z.object({
    exceptionType: z.literal(EditTypesEnum.UPDATE_ANNEXES),
    exceptionSource: z.string(),
    reason: requireStringSchema,
    relatedFile: z.instanceof(File).optional(),
    addAnnexes: z.array(z.instanceof(File)).optional(),
    removeAnnexes: z.array(z.string()).optional(),
});

export const exceptionSchema = z.discriminatedUnion('exceptionType', [
    cancelIssuedDocSchema,
    updateIssuedDateSchema,
    replaceMainFileSchema,
    updateAnnexesSchema,
]);