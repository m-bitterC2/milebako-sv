import jwt from "jsonwebtoken";

// 環境変数からJWTシークレットを取得
const JWT_SECRET = process.env.JWT_SECRET;

// JWT設定
export const JWT_CONFIG = {
  secret: JWT_SECRET,
  expiresIn: "7d", // 7日間有効
  issuer: "task-board-app",
  audience: "task-board-users",
} as const;

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export class JWTService {
  // トークン生成
  static generateToken(
    payload: Omit<JWTPayload, "iat" | "exp" | "iss" | "aud">
  ): string {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }

    if (JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters long");
    }

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });
  }

  // トークン検証
  static verifyToken(token: string): JWTPayload {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
      });

      // jwt.verify の戻り値は string | JwtPayload なので型チェックが必要
      if (typeof decoded === "string") {
        throw new Error("Invalid token format");
      }

      return decoded as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("トークンの有効期限が切れています");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("無効なトークンです");
      }
      if (error instanceof jwt.NotBeforeError) {
        throw new Error("トークンはまだ有効ではありません");
      }
      throw new Error("トークンの検証に失敗しました");
    }
  }

  // トークンの有効期限をチェック（検証なし）
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload | null;
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }
}
