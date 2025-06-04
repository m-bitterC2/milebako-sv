import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// ===== カスタムエラークラス =====
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 共通エラーハンドリングミドルウェア
 * @param err
 * @param _req
 * @param res
 * @param _next
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  // Zodのバリデーションエラー
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "バリデーションに失敗しました。",
      details: err.errors,
    });
  }

  // Prismaのエラー（例: 一意制約違反など）
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
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
