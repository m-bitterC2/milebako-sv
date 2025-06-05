"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwt_1 = require("../config/jwt");
const user_1 = require("../models/user");
// JWT認証ミドルウェア
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"
        if (!token) {
            res.status(401).json({ error: "認証トークンが必要ですaaa" });
            return;
        }
        // トークンの有効期限を事前チェック
        if (jwt_1.JWTService.isTokenExpired(token)) {
            res.status(401).json({ error: "トークンの有効期限が切れています" });
            return;
        }
        // トークン検証
        const payload = jwt_1.JWTService.verifyToken(token);
        // ユーザー存在確認
        const user = await user_1.UserModel.findById(payload.userId);
        if (!user) {
            res.status(401).json({ error: "ユーザーが見つかりません" });
            return;
        }
        // リクエストにユーザー情報を追加
        req.user = user;
        next();
    }
    catch (error) {
        // JWTエラーの詳細ログ（開発環境のみ）
        if (process.env.NODE_ENV === "development") {
            console.error("JWT Authentication Error:", error);
        }
        res.status(401).json({ error: "認証に失敗しました" });
    }
};
exports.authenticateToken = authenticateToken;
