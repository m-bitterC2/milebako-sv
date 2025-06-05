"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.reorderTodos = exports.editTodo = exports.createTodo = exports.getAllTodos = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errorHandler_1 = require("../middlewares/errorHandler");
// Prismaクライアントの初期化
const prisma = new client_1.PrismaClient();
/**
 * GET /todos/all - 全タスク取得
 */
exports.getAllTodos = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError("認証が必要です", 401);
    }
    const tasks = await prisma.task.findMany({
        where: { userId: req.user.id },
        orderBy: [{ columnId: "asc" }, { position: "asc" }],
    });
    res.status(200).json(tasks);
});
/**
 * POST /todos - タスク作成
 */
exports.createTodo = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError("認証が必要です", 401);
    }
    const { title, description, priority, columnId, position, } = req.body;
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
});
/**
 * PATCH /todos/:id - タスク更新
 */
exports.editTodo = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError("認証が必要です", 401);
    }
    const { id } = req.params;
    const updateData = req.body;
    // タスクの存在確認
    const existingTodo = await prisma.task.findUnique({
        where: { id },
    });
    if (!existingTodo) {
        throw new errorHandler_1.AppError("タスクが見つかりません", 404);
    }
    if (existingTodo.userId !== req.user.id) {
        throw new errorHandler_1.AppError("このタスクを編集する権限がありません", 403);
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
exports.reorderTodos = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError("認証が必要です", 401);
    }
    const { tasks } = req.body;
    // 全てのタスクIDが存在するかチェック
    const taskIds = tasks.map((task) => task.id);
    const existingTasks = await prisma.task.findMany({
        where: { id: { in: taskIds }, userId: req.user.id },
        select: { id: true },
    });
    if (existingTasks.length !== taskIds.length) {
        throw new errorHandler_1.AppError("存在しないタスクIDまたは権限のないタスクが含まれています", 400);
    }
    // トランザクションで一括更新
    await prisma.$transaction(tasks.map((task) => prisma.task.update({
        where: { id: task.id },
        data: { position: task.position },
    })));
    res.status(200).json({ message: "タスクの並び替えが完了しました" });
});
/**
 * DELETE /todos/:id - タスク削除
 */
exports.deleteTodo = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError("認証が必要です", 401);
    }
    const { id } = req.params;
    // タスクの存在確認
    const existingTodo = await prisma.task.findUnique({
        where: { id },
    });
    if (!existingTodo) {
        throw new errorHandler_1.AppError("タスクが見つかりません", 404);
    }
    if (existingTodo.userId !== req.user.id) {
        throw new errorHandler_1.AppError("このタスクを削除する権限がありません", 403);
    }
    await prisma.task.delete({
        where: { id },
    });
    res.status(204).json();
});
