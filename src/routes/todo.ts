import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  CreateTodoSchema,
  UpdateTodoSchema,
  ReorderTodosSchema,
  TodoParamsSchema,
} from "../validators/todoValidator";
import asyncHandler from "../utils/asyncHandler";

// Prismaクライアントの初期化
const prisma = new PrismaClient();

/**
 * GET /todos/all - 全タスク取得
 */
const getAllTodos = asyncHandler(async (_req: Request, res: Response) => {
  const tasks = await prisma.task.findMany({
    orderBy: [{ columnId: "asc" }, { position: "asc" }],
  });

  res.status(200).json(tasks);
});

/**
 * POST /todos - タスク作成
 */
const createTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, priority, columnId, position } =
    CreateTodoSchema.parse(req.body);

  const newTodo = await prisma.task.create({
    data: { title, description, priority, columnId, position },
  });

  res.status(201).json(newTodo);
});

/**
 * PATCH /todos/:id - タスク更新
 */
const editTodo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = TodoParamsSchema.parse(req.params);
  const updateData = UpdateTodoSchema.parse(req.body);

  // タスクの存在確認
  const existingTodo = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTodo) {
    res.status(404).json({ error: "タスクが見つかりません" });
  }

  const updatedTodo = await prisma.task.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json(updatedTodo);
});

/**
 * PATCH /todos/reorder - タスク並び替え
 */
const reorderTodos = asyncHandler(async (req: Request, res: Response) => {
  const { tasks } = ReorderTodosSchema.parse(req.body);

  // 全てのタスクIDが存在するかチェック
  const taskIds = tasks.map((task) => task.id);
  const existingTasks = await prisma.task.findMany({
    where: { id: { in: taskIds } },
    select: { id: true },
  });

  if (existingTasks.length !== taskIds.length) {
    res.status(400).json({ error: "有効なタスクリストを指定してください" });
  }

  // トランザクションで一括更新
  await prisma.$transaction(
    tasks.map((task) =>
      prisma.task.update({
        where: { id: task.id },
        data: { position: task.position },
      })
    )
  );

  res.status(200).json({ message: "タスクの並び替えが完了しました" });
});

/**
 * DELETE /todos/:id - タスク削除
 */
const deleteTodo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = TodoParamsSchema.parse(req.params);

  // タスクの存在確認
  const existingTodo = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTodo) {
    res.status(404).json({ error: "タスクが見つかりません" });
  }

  await prisma.task.delete({
    where: { id },
  });

  res.status(204).json();
});

// ルーティング設定
const router = Router();
router.get("/all", getAllTodos);
router.post("/create", createTodo);
router.patch("/edit/:id", editTodo);
router.patch("/reorder", reorderTodos);
router.delete("/delete/:id", deleteTodo);

export default router;
