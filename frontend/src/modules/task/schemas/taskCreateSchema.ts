import { MSG_REQUIRED_FIELD } from "@/shared/constants/message-text";
import { z } from "zod";

const internalStaffSchema =
  z.object({
    positionId: z.string(),
    displayName: z.string(),
  });

const subtaskSchema = z.object({
  subtaskName: z
    .string()
    .trim()
    .min(1, { error: MSG_REQUIRED_FIELD })
    .describe("Tên đầu công việc"),
  subExpectedDueDate: z
    .date({ error: "Vui lòng chọn hạn dự kiến" })
    .refine((val) => val !== null, { error: "Vui lòng chọn hạn dự kiến" })
    .describe("Hạn dự kiến"),
  note: z
    .string()
    .optional()
    .describe("Ghi chú"),
  executors: z
    .array(internalStaffSchema)
    .min(1, { error: "Vui lòng chọn ít nhất một người thực hiện" })
    .describe("Người thực hiện"),
  collaborators: z
    .array(internalStaffSchema)
    .optional()
    .describe("Người phối hợp"),
});

export const taskCreateSchema = z.object({
  shortDescription: z.string().trim().min(1, { error: MSG_REQUIRED_FIELD }),
  taskName: z.string().trim().min(1, { error: MSG_REQUIRED_FIELD }),
  leaders: z
    .array(internalStaffSchema)
    .min(1, { error: "Vui lòng chọn ít nhất một người chỉ đạo" }),
  viewers: z.array(internalStaffSchema).optional(),
  task: z
    .array(subtaskSchema)
    .min(1, { error: "Vui lòng thêm ít nhất một đầu công việc" }),
});

export const createSubtaskSchema = z.object({
  subTaskName: z
    .string({ error: MSG_REQUIRED_FIELD })
    .min(1, { error: MSG_REQUIRED_FIELD }),
  executor: z
    .array(internalStaffSchema)
    .min(1, { error: "Vui lòng chọn ít nhất một người thực hiện" }),
  collaborator: z.array(internalStaffSchema).optional(),
  expectedDueDate: z.date({ error: MSG_REQUIRED_FIELD }),
  subTaskDescription: z
    .string()
    .optional(),
});