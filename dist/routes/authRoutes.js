"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middlewares/validation");
const authSchemas_1 = require("../schemas/authSchemas");
const router = express_1.default.Router();
// ===== 認証ルート =====
// ユーザー登録
router.post("/register", (0, validation_1.validateBody)(authSchemas_1.RegisterSchema), authController_1.register);
// ログイン（レート制限付き）
router.post("/login", (0, validation_1.validateBody)(authSchemas_1.LoginSchema), authController_1.login);
exports.default = router;
