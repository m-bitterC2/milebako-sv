"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = exports.JWT_CONFIG = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// 環境変数からJWTシークレットを取得
const JWT_SECRET = process.env.JWT_SECRET;
// JWT設定
exports.JWT_CONFIG = {
    secret: JWT_SECRET,
    expiresIn: "7d", // 7日間有効
    issuer: "task-board-app",
    audience: "task-board-users",
};
class JWTService {
    // トークン生成
    static generateToken(payload) {
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not set");
        }
        if (JWT_SECRET.length < 32) {
            throw new Error("JWT_SECRET must be at least 32 characters long");
        }
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: exports.JWT_CONFIG.expiresIn,
            issuer: exports.JWT_CONFIG.issuer,
            audience: exports.JWT_CONFIG.audience,
        });
    }
    // トークン検証
    static verifyToken(token) {
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not set");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, {
                issuer: exports.JWT_CONFIG.issuer,
                audience: exports.JWT_CONFIG.audience,
            });
            // jwt.verify の戻り値は string | JwtPayload なので型チェックが必要
            if (typeof decoded === "string") {
                throw new Error("Invalid token format");
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error("トークンの有効期限が切れています");
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error("無効なトークンです");
            }
            if (error instanceof jsonwebtoken_1.default.NotBeforeError) {
                throw new Error("トークンはまだ有効ではありません");
            }
            throw new Error("トークンの検証に失敗しました");
        }
    }
    // トークンの有効期限をチェック（検証なし）
    static isTokenExpired(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            return Date.now() >= decoded.exp * 1000;
        }
        catch {
            return true;
        }
    }
}
exports.JWTService = JWTService;
