"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoParamsSchema = exports.ReorderTodosSchema = exports.UpdateTodoSchema = exports.CreateTodoSchema = exports.ColumnIdSchema = exports.PrioritySchema = void 0;
const zod_1 = require("zod");
// 優先度のenum
exports.PrioritySchema = zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]);
// カラムIDのenum
exports.ColumnIdSchema = zod_1.z.enum(["todo", "inprogress", "done"]);
// タスク作成用スキーマ
exports.CreateTodoSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "タイトルは必須です")
        .max(100, "タイトルは100文字以内で入力してください")
        .trim(),
    description: zod_1.z
        .string()
        .max(500, "説明は500文字以内で入力してください")
        .trim()
        .optional()
        .default(""),
    priority: exports.PrioritySchema.optional().default("MEDIUM"),
    columnId: exports.ColumnIdSchema,
    position: zod_1.z
        .number()
        .int("位置は整数で指定してください")
        .min(0, "位置は0以上で指定してください")
        .optional()
        .default(0),
});
// タスク更新用スキーマ
exports.UpdateTodoSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "タイトルは必須です")
        .max(100, "タイトルは100文字以内で入力してください")
        .trim()
        .optional(),
    description: zod_1.z
        .string()
        .max(500, "説明は500文字以内で入力してください")
        .trim()
        .optional(),
    priority: exports.PrioritySchema.optional(),
    columnId: exports.ColumnIdSchema.optional(),
    position: zod_1.z
        .number()
        .int("位置は整数で指定してください")
        .min(0, "位置は0以上で指定してください")
        .optional(),
});
// 並び替え用スキーマ
exports.ReorderTodosSchema = zod_1.z.object({
    tasks: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string().min(1, "IDは必須です"),
        position: zod_1.z
            .number()
            .int("位置は整数で指定してください")
            .min(0, "位置は0以上で指定してください"),
    }))
        .min(1, "タスクリストは空にできません"),
});
// パラメータ用スキーマ
exports.TodoParamsSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "IDは必須です"),
});
