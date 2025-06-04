import type { Request, Response } from "express";
import { UserModel } from "../models/user";
import { JWTService } from "../config/jwt";
import { AppError } from "../middlewares/errorHandler";
import type { RegisterInput, LoginInput } from "../schemas/authSchemas";
import asyncHandler from "../utils/asyncHandler";

// ===== 認証コントローラー =====

// ユーザー登録
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password }: RegisterInput = req.body;

  // 重複チェック
  const duplicates = await UserModel.checkDuplicate(username, email);

  if (duplicates.username) {
    throw new AppError("このユーザー名は既に使用されています", 409);
  }

  if (duplicates.email) {
    throw new AppError("このメールアドレスは既に使用されています", 409);
  }

  // ユーザー作成
  const user = await UserModel.create({ username, email, password });

  // JWTトークン生成
  try {
    const token = JWTService.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.status(201).json({
      message: "ユーザー登録が完了しました",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (jwtError) {
    console.error("JWT generation error:", jwtError);
    throw new AppError("認証トークンの生成に失敗しました", 500);
  }
});

// ログイン
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password }: LoginInput = req.body;

  // ユーザー検索
  const user = await UserModel.findByUsername(username);
  if (!user) {
    throw new AppError("ユーザー名またはパスワードが正しくありません", 401);
  }

  // パスワード検証
  const isValidPassword = await UserModel.validatePassword(
    password,
    user.password
  );
  if (!isValidPassword) {
    throw new AppError("ユーザー名またはパスワードが正しくありません", 401);
  }

  // JWTトークン生成
  try {
    const token = JWTService.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.status(200).json({
      message: "ログインしました",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (jwtError) {
    console.error("JWT generation error:", jwtError);
    throw new AppError("認証トークンの生成に失敗しました", 500);
  }
});
