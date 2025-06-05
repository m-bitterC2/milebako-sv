"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const todoRouter_1 = __importDefault(require("./routes/todoRouter"));
const errorHandler_1 = require("./middlewares/errorHandler");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const hpp_1 = __importDefault(require("hpp"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// .env ファイル（開発環境）から環境変数をロード
dotenv_1.default.config();
// ─────────────────────────────────────────────────────────────────────────────
// アプリケーション設定
// ─────────────────────────────────────────────────────────────────────────────
const app = (0, express_1.default)();
const isProduction = process.env.NODE_ENV === "production";
// ─────────────────────────────────────────────────────────────────────────────
// ミドルウェア設定
// ─────────────────────────────────────────────────────────────────────────────
// JSON ボディをパース（サイズ制限付き）
app.use(express_1.default.json({ limit: "10kb" }));
// ─────────────────────────────────────────────────────────────────────────────
// HTML/JSインジェクション対策（クエリ・ボディ・パラメータのサニタイズ）
// ─────────────────────────────────────────────────────────────────────────────
function sanitizeObject(obj) {
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === "string") {
            // 文字列ならHTMLをサニタイズ（悪意あるタグやスクリプトを除去）
            obj[key] = (0, sanitize_html_1.default)(value);
        }
        else if (typeof value === "object" && value !== null) {
            // ネストされたオブジェクトや配列も再帰的にサニタイズ
            sanitizeObject(value);
        }
    }
}
// クエリ・ボディ・パラメータを対象にサニタイズ
app.use((req, _res, next) => {
    if (req.body)
        sanitizeObject(req.body); // POSTやPUTのデータ
    if (req.query)
        sanitizeObject(req.query); // クエリパラメータ（例: ?search=<script>）
    if (req.params)
        sanitizeObject(req.params); // URLパラメータ（例: /user/:id）
    // 次のミドルウェアやルートへ処理を渡す
    next();
});
// ─────────────────────────────────────────────────────────────────────────────
// HTTP ヘッダー関連のセキュリティ（Helmet）
// ─────────────────────────────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.disable("x-powered-by"); // Express バージョン情報を隠蔽
// ─────────────────────────────────────────────────────────────────────────────
// CORS（Cross-Origin Resource Sharing）設定
// ─────────────────────────────────────────────────────────────────────────────
if (!isProduction) {
    // ────────── 開発環境向け ──────────
    app.use((0, cors_1.default)({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }));
}
else {
    // ────────── 本番環境向け ──────────
    app.use((0, cors_1.default)({
        origin: process.env.ALLOWED_ORIGIN,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }));
}
// ─────────────────────────────────────────────────────────────────────────────
// リクエストパラメータ汚染対策（HPP）
// ─────────────────────────────────────────────────────────────────────────────
app.use((0, hpp_1.default)());
// ─────────────────────────────────────────────────────────────────────────────
// レートリミッター（DDoS・総当たり攻撃抑止）
// ─────────────────────────────────────────────────────────────────────────────
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 分間
    max: 100, // 同一 IP から 15 分間で最大 100 リクエスト
    message: {
        status: 429,
        error: "このIPからのリクエストが多すぎます。後でもう一度お試しください。",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/auth", apiLimiter);
app.use("/todos", apiLimiter);
// ─────────────────────────────────────────────────────────────────────────────
// HTTPS リダイレクト（本番環境のみ）
// ─────────────────────────────────────────────────────────────────────────────
if (isProduction) {
    app.set("trust proxy", 1); // 1段階目のプロキシだけを信頼する
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"] !== "https") {
            // クライアントが HTTPS 以外で来たらリダイレクト
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        next();
    });
}
// ─────────────────────────────────────────────────────────────────────────────
// ルーティング設定
// ─────────────────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes_1.default); // 認証ルート
app.use("/todos", todoRouter_1.default); // タスクルート
// ─────────────────────────────────────────────────────────────────────────────
// 共通エラーハンドリング
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─────────────────────────────────────────────────────────────────────────────
// サーバ起動
// ─────────────────────────────────────────────────────────────────────────────
app.listen(() => {
    console.log(`[${isProduction ? "Production" : "Development"}] Server is running`);
});
