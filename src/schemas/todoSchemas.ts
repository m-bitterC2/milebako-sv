import { z } from "zod";

// 優先度のenum
export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

// カラムIDのenum
export const ColumnIdSchema = z.enum(["todo", "inprogress", "done"]);

// タスク作成用スキーマ
export const CreateTodoSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください")
    .trim(),
  description: z
    .string()
    .max(500, "説明は500文字以内で入力してください")
    .trim()
    .optional()
    .default(""),
  priority: PrioritySchema.optional().default("MEDIUM"),
  columnId: ColumnIdSchema,
  position: z
    .number()
    .int("位置は整数で指定してください")
    .min(0, "位置は0以上で指定してください")
    .optional()
    .default(0),
});

// タスク更新用スキーマ
export const UpdateTodoSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "説明は500文字以内で入力してください")
    .trim()
    .optional(),
  priority: PrioritySchema.optional(),
  columnId: ColumnIdSchema.optional(),
  position: z
    .number()
    .int("位置は整数で指定してください")
    .min(0, "位置は0以上で指定してください")
    .optional(),
});

// 並び替え用スキーマ
export const ReorderTodosSchema = z.object({
  tasks: z
    .array(
      z.object({
        id: z.string().min(1, "IDは必須です"),
        position: z
          .number()
          .int("位置は整数で指定してください")
          .min(0, "位置は0以上で指定してください"),
      })
    )
    .min(1, "タスクリストは空にできません"),
});

// パラメータ用スキーマ
export const TodoParamsSchema = z.object({
  id: z.string().min(1, "IDは必須です"),
});

// ===== 型定義（Zodスキーマから生成） =====
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
export type ReorderTodosInput = z.infer<typeof ReorderTodosSchema>;
export type TodoParams = z.infer<typeof TodoParamsSchema>;
