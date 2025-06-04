import express from "express";
import { register, login } from "../controllers/authController";
import { validateBody } from "../middlewares/validation";
import { RegisterSchema, LoginSchema } from "../schemas/authSchemas";

const router = express.Router();

// ===== 認証ルート =====

// ユーザー登録
router.post("/register", validateBody(RegisterSchema), register);

// ログイン（レート制限付き）
router.post("/login", validateBody(LoginSchema), login);

export default router;
