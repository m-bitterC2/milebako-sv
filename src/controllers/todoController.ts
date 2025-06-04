import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";
import type {
  CreateTodoInput,
  UpdateTodoInput,
  ReorderTodosInput,
} from "../schemas/todoSchemas";

// Prismaクライアントの初期化
const prisma = new PrismaClient();

/**
 * GET /todos/all - 全タスク取得
 */
export const getAllTodos = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("認証が必要です", 401);
    }

    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: [{ columnId: "asc" }, { position: "asc" }],
    });

    res.status(200).json(tasks);
  }
);

/**
 * POST /todos - タスク作成
 */
export const createTodo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("認証が必要です", 401);
    }

    const {
      title,
      description,
      priority,
      columnId,
      position,
    }: CreateTodoInput = req.body;

    const newTodo = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        columnId,
        position,
        userId: req.user.id,
      },
    });

    res.status(201).json(newTodo);
  }
);

/**
 * PATCH /todos/:id - タスク更新
 */
export const editTodo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("認証が必要です", 401);
    }

    const { id } = req.params;
    const updateData: UpdateTodoInput = req.body;

    // タスクの存在確認
    const existingTodo = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      throw new AppError("タスクが見つかりません", 404);
    }

    if (existingTodo.userId !== req.user.id) {
      throw new AppError("このタスクを編集する権限がありません", 403);
    }

    const updatedTodo = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedTodo);
  }
);

/**
 * PATCH /todos/reorder - タスク並び替え
 */
export const reorderTodos = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("認証が必要です", 401);
    }

    const { tasks }: ReorderTodosInput = req.body;

    // 全てのタスクIDが存在するかチェック
    const taskIds = tasks.map((task) => task.id);
    const existingTasks = await prisma.task.findMany({
      where: { id: { in: taskIds }, userId: req.user.id },
      select: { id: true },
    });

    if (existingTasks.length !== taskIds.length) {
      throw new AppError(
        "存在しないタスクIDまたは権限のないタスクが含まれています",
        400
      );
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
  }
);

/**
 * DELETE /todos/:id - タスク削除
 */
export const deleteTodo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("認証が必要です", 401);
    }

    const { id } = req.params;

    // タスクの存在確認
    const existingTodo = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      throw new AppError("タスクが見つかりません", 404);
    }

    if (existingTodo.userId !== req.user.id) {
      throw new AppError("このタスクを削除する権限がありません", 403);
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(204).json();
  }
);
