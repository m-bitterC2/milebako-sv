"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// ===== カスタムエラークラス =====
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * 共通エラーハンドリングミドルウェア
 * @param err
 * @param _req
 * @param res
 * @param _next
 */
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    // Zodのバリデーションエラー
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: "バリデーションに失敗しました。",
            details: err.errors,
        });
    }
    // Prismaのエラー（例: 一意制約違反など）
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({
            error: err.message,
            code: err.code,
        });
    }
    // AppErrorの処理
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
        });
    }
    // その他の予期しないエラー
    if (err instanceof Error) {
        res.status(500).json({
            error: err.message,
        });
    }
    // 型が不明なエラー
    res.status(500).json({ error: "不明なエラーが発生しました。" });
};
exports.errorHandler = errorHandler;
