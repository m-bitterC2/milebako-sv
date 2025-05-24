import { z } from "zod";

// 作成時のリクエストボディバリデーション
export const createTodoSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です。" }),
  isCompleted: z.boolean(),
});

// 更新時のリクエストボディバリデーション
export const editTodoSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です。" }),
  isCompleted: z.boolean(),
});
