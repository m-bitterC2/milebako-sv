import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

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

  // その他の予期しないエラー
  if (err instanceof Error) {
    res.status(500).json({
      error: err.message,
    });
  }

  // 型が不明なエラー
  res.status(500).json({ error: "不明なエラーが発生しました。" });
};
