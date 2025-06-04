import type { Request, Response, NextFunction } from "express";
import { JWTService } from "../config/jwt";
import { UserModel } from "../models/user";

// 認証済みリクエストの型拡張
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// JWT認証ミドルウェア
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      res.status(401).json({ error: "認証トークンが必要ですaaa" });
      return;
    }

    // トークンの有効期限を事前チェック
    if (JWTService.isTokenExpired(token)) {
      res.status(401).json({ error: "トークンの有効期限が切れています" });
      return;
    }

    // トークン検証
    const payload = JWTService.verifyToken(token);

    // ユーザー存在確認
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: "ユーザーが見つかりません" });
      return;
    }

    // リクエストにユーザー情報を追加
    req.user = user;
    next();
  } catch (error) {
    // JWTエラーの詳細ログ（開発環境のみ）
    if (process.env.NODE_ENV === "development") {
      console.error("JWT Authentication Error:", error);
    }

    res.status(401).json({ error: "認証に失敗しました" });
  }
};
