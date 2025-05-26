## Milebako - Backend

**Milebako**は、シンプルなタスク管理アプリです。

このリポジトリでは、バックエンドのソースコードを管理します。

---

### 技術スタック

| 分類               | 使用技術             |
| ------------------ | -------------------- |
| 言語/実行環境      | TypeScript, Node.js  |
| Web フレームワーク | Express              |
| バリデーション     | Zod                  |
| ORM/DB             | Prisma + PostgreSQL  |
| エラーハンドラ     | カスタムミドルウェア |

---

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/m-bitterC2/milebako-sv.git
cd milebako-sv
```

### 2. 依存パッケージをインストール

```bash
npm install express cors zod prisma @prisma/client
npm install --save-dev typescript ts-node nodemon @types/express @types/cors @types/node
```

### 3. Prisma セットアップとダミーデータ挿入

```bash
npx prisma init --datasource-provider sqlite
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

### 4. サーバー起動

```bash
npm run dev
# または
npx ts-node-dev src/index.ts
```

---

## ディレクトリ構成

```
milebako-sv/
├── prisma/
│   └── schema.prisma         # Prismaデータモデル
├── src/
│   ├── middlewares/
│   │   └── errorHandler.ts   # 共通エラーハンドリング
│   ├── routes/
│   │   └── todo.ts           # /todos に関するルート定義
│   ├── utils/
│   │   └── asyncHandler.ts   # 非同期ルート用ラッパー
│   ├── validators/
│   │   └── todoValidator.ts  # Zodバリデーションスキーマ
│   └── index.ts              # エントリーポイント
└── README.md
```

---

## 開発のポイント

- エラーハンドリング共通化
- `asyncHandler` を通してすべての非同期処理のエラーを統一的に扱う。
- `Zod` によるバリデーション。
- ファイルを用途別に分割し、**保守性の高い構成**に。
