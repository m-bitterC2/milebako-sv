import { z } from "zod";

// パスワード強度チェック
const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .max(128, "パスワードは128文字以内で入力してください")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "パスワードは大文字、小文字、数字を含む必要があります"
  );

// ユーザー名バリデーション
const usernameSchema = z
  .string()
  .min(3, "ユーザー名は3文字以上で入力してください")
  .max(30, "ユーザー名は30文字以内で入力してください")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です"
  )
  .trim();

// メールアドレスバリデーション
const emailSchema = z
  .string()
  .email("有効なメールアドレスを入力してください")
  .max(254, "メールアドレスは254文字以内で入力してください")
  .toLowerCase()
  .trim();

// ユーザー登録スキーマ
export const RegisterSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// ログインスキーマ
export const LoginSchema = z.object({
  username: z.string().min(1, "ユーザー名は必須です").trim(),
  password: z.string().min(1, "パスワードは必須です"),
});

// 型定義
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
