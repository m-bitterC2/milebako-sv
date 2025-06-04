import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  editTodo,
  getAllTodos,
  reorderTodos,
} from "../controllers/todoController";
import { validateBody, validateParams } from "../middlewares/validation";
import {
  CreateTodoSchema,
  ReorderTodosSchema,
  TodoParamsSchema,
  UpdateTodoSchema,
} from "../schemas/todoSchemas";
import { authenticateToken } from "../middlewares/auth";

// ルーティング設定
const router = Router();

// ===== 全ルートに認証を適用 =====
router.use(authenticateToken);

// ===== ルート定義（認証必須） =====
router.get("/all", getAllTodos);
router.post("/create", validateBody(CreateTodoSchema), createTodo);
router.patch(
  "/edit/:id",
  validateParams(TodoParamsSchema),
  validateBody(UpdateTodoSchema),
  editTodo
);
router.patch("/reorder", validateBody(ReorderTodosSchema), reorderTodos);
router.delete("/delete/:id", validateParams(TodoParamsSchema), deleteTodo);

export default router;
