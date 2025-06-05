"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const user_1 = require("../models/user");
const jwt_1 = require("../config/jwt");
const errorHandler_1 = require("../middlewares/errorHandler");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
// ===== 認証コントローラー =====
// ユーザー登録
exports.register = (0, asyncHandler_1.default)(async (req, res) => {
    const { username, email, password } = req.body;
    // 重複チェック
    const duplicates = await user_1.UserModel.checkDuplicate(username, email);
    if (duplicates.username) {
        throw new errorHandler_1.AppError("このユーザー名は既に使用されています", 409);
    }
    if (duplicates.email) {
        throw new errorHandler_1.AppError("このメールアドレスは既に使用されています", 409);
    }
    // ユーザー作成
    const user = await user_1.UserModel.create({ username, email, password });
    // JWTトークン生成
    try {
        const token = jwt_1.JWTService.generateToken({
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
    }
    catch (jwtError) {
        console.error("JWT generation error:", jwtError);
        throw new errorHandler_1.AppError("認証トークンの生成に失敗しました", 500);
    }
});
// ログイン
exports.login = (0, asyncHandler_1.default)(async (req, res) => {
    const { username, password } = req.body;
    // ユーザー検索
    const user = await user_1.UserModel.findByUsername(username);
    if (!user) {
        throw new errorHandler_1.AppError("ユーザー名またはパスワードが正しくありません", 401);
    }
    // パスワード検証
    const isValidPassword = await user_1.UserModel.validatePassword(password, user.password);
    if (!isValidPassword) {
        throw new errorHandler_1.AppError("ユーザー名またはパスワードが正しくありません", 401);
    }
    // JWTトークン生成
    try {
        const token = jwt_1.JWTService.generateToken({
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
    }
    catch (jwtError) {
        console.error("JWT generation error:", jwtError);
        throw new errorHandler_1.AppError("認証トークンの生成に失敗しました", 500);
    }
});
