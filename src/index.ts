import express from "express";
import type { Express } from "express";
import cors from "cors";
import todoRouter from "./routes/todo";
import { errorHandler } from "./middlewares/errorHandler";

// Expressアプリケーションの初期化
const app: Express = express();
const PORT = 8080;

// ミドルウェア設定
app.use(express.json()); // JSONボディのパース
app.use(cors()); // CORSを有効化
app.use("/todos", todoRouter); // 「/todos」以下のルートは、routes/todo.ts の todoRouter が処理する
app.use(errorHandler); // 共通エラーハンドリング

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
