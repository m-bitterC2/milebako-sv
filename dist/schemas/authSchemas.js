"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
// パスワード強度チェック
const passwordSchema = zod_1.z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .max(128, "パスワードは128文字以内で入力してください")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "パスワードは大文字、小文字、数字を含む必要があります");
// ユーザー名バリデーション
const usernameSchema = zod_1.z
    .string()
    .min(3, "ユーザー名は3文字以上で入力してください")
    .max(30, "ユーザー名は30文字以内で入力してください")
    .regex(/^[a-zA-Z0-9_-]+$/, "ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です")
    .trim();
// メールアドレスバリデーション
const emailSchema = zod_1.z
    .string()
    .email("有効なメールアドレスを入力してください")
    .max(254, "メールアドレスは254文字以内で入力してください")
    .toLowerCase()
    .trim();
// ユーザー登録スキーマ
exports.RegisterSchema = zod_1.z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});
// ログインスキーマ
exports.LoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "ユーザー名は必須です").trim(),
    password: zod_1.z.string().min(1, "パスワードは必須です"),
});
