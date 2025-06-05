"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todoController_1 = require("../controllers/todoController");
const validation_1 = require("../middlewares/validation");
const todoSchemas_1 = require("../schemas/todoSchemas");
const auth_1 = require("../middlewares/auth");
// ルーティング設定
const router = (0, express_1.Router)();
// ===== 全ルートに認証を適用 =====
router.use(auth_1.authenticateToken);
// ===== ルート定義（認証必須） =====
router.get("/all", todoController_1.getAllTodos);
router.post("/create", (0, validation_1.validateBody)(todoSchemas_1.CreateTodoSchema), todoController_1.createTodo);
router.patch("/edit/:id", (0, validation_1.validateParams)(todoSchemas_1.TodoParamsSchema), (0, validation_1.validateBody)(todoSchemas_1.UpdateTodoSchema), todoController_1.editTodo);
router.patch("/reorder", (0, validation_1.validateBody)(todoSchemas_1.ReorderTodosSchema), todoController_1.reorderTodos);
router.delete("/delete/:id", (0, validation_1.validateParams)(todoSchemas_1.TodoParamsSchema), todoController_1.deleteTodo);
exports.default = router;
