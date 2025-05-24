import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createTodoSchema, editTodoSchema } from "../validators/todoValidator";
import asyncHandler from "../utils/asyncHandler";

// Prismaクライアントの初期化
const prisma = new PrismaClient();

/**
 * すべてのTodoを取得する
 */
const getAllTodos = asyncHandler(async (_req: Request, res: Response) => {
  const todos = await prisma.todo.findMany();
  res.json(todos);
});

/**
 * 新しいTodoを作成する
 * リクエストボディを zod でバリデーション
 */
const createTodo = asyncHandler(async (req: Request, res: Response) => {
  // バリデーション（失敗時は例外をスロー）
  const { title, isCompleted } = createTodoSchema.parse(req.body);

  const newTodo = await prisma.todo.create({
    data: { title, isCompleted },
  });
  res.status(201).json(newTodo);
});

/**
 * Todoを編集する
 * パスパラメータ id を数値に変換し、リクエストボディを zod でバリデーション
 */
const editTodo = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    const error: any = new Error("無効なIDパラメータです。");
    error.status = 400;
    throw error;
  }

  // バリデーション（失敗時は例外をスロー）
  const { title, isCompleted } = editTodoSchema.parse(req.body);

  const updatedTodo = await prisma.todo.update({
    where: { id },
    data: { title, isCompleted },
  });
  res.json(updatedTodo);
});

/**
 * Todoを削除する
 */
const deleteTodo = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    const error: any = new Error("無効なIDパラメータです。");
    error.status = 400;
    throw error;
  }

  const deletedTodo = await prisma.todo.delete({
    where: { id },
  });
  res.json(deletedTodo);
});

// ルーティング設定
const router = Router();
router.get("/all", getAllTodos);
router.post("/create", createTodo);
router.put("/edit/:id", editTodo);
router.delete("/delete/:id", deleteTodo);

export default router;
