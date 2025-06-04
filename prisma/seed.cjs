const { Priority, PrismaClient } = require("../node_modules/.prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 シードデータの投入を開始します...");

  // 既存のデータを削除
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log("📝 既存のデータを削除しました");

  // ===== ゲストユーザーの作成（DBには最小限のデータのみ） =====
  const saltRounds = 12;
  const guestPassword = await bcrypt.hash("guest123", saltRounds);

  const guestUser = await prisma.user.create({
    data: {
      username: "guest",
      email: "guest@example.com",
      password: guestPassword,
    },
  });

  console.log("👤 ゲストユーザーを作成しました:", guestUser.username);
  console.log(
    "ℹ️  ゲストユーザーのタスクはフロントエンドで管理されます（DB保存なし）"
  );

  // ===== デモユーザーの作成 =====
  const demoPassword = await bcrypt.hash("Demo123!", saltRounds);

  const demoUser = await prisma.user.create({
    data: {
      username: "demo_user",
      email: "demo@example.com",
      password: demoPassword,
    },
  });

  console.log("👤 デモユーザーを作成しました:", demoUser.username);

  // ===== デモユーザー用のサンプルタスク（DBに保存） =====
  const demoTasks = [
    {
      title: "🚀 新機能リリース準備",
      description: "次回リリースに向けた新機能の最終テストと準備",
      priority: Priority.HIGH,
      columnId: "todo",
      position: 0,
      userId: demoUser.id,
    },
    {
      title: "📈 パフォーマンス分析",
      description: "アプリケーションのパフォーマンス指標を分析し、改善点を特定",
      priority: Priority.MEDIUM,
      columnId: "todo",
      position: 1,
      userId: demoUser.id,
    },
    {
      title: "🐛 バグ修正",
      description: "ユーザーから報告されたバグの調査と修正",
      priority: Priority.HIGH,
      columnId: "inprogress",
      position: 0,
      userId: demoUser.id,
    },
    {
      title: "📚 技術調査",
      description: "新しい技術スタックの調査と検証",
      priority: Priority.MEDIUM,
      columnId: "inprogress",
      position: 1,
      userId: demoUser.id,
    },
    {
      title: "✅ パフォーマンス改善",
      description: "アプリケーションの読み込み速度を改善",
      priority: Priority.MEDIUM,
      columnId: "done",
      position: 0,
      userId: demoUser.id,
    },
    {
      title: "✅ セキュリティ更新",
      description: "依存関係のセキュリティアップデートを適用",
      priority: Priority.HIGH,
      columnId: "done",
      position: 1,
      userId: demoUser.id,
    },
  ];

  // デモタスクを一括作成
  await prisma.task.createMany({
    data: demoTasks,
  });

  console.log(`📋 ${demoTasks.length}個のデモタスクを作成しました`);

  // ===== 作成されたデータの確認 =====
  const totalUsers = await prisma.user.count();
  const totalTasks = await prisma.task.count();

  console.log("✨ シードデータの投入が完了しました");
  console.log(`👥 作成されたユーザー数: ${totalUsers}`);
  console.log(`📝 作成されたタスク数: ${totalTasks}`);
  console.log("");
  console.log("🎮 ゲストアカウント情報:");
  console.log("   ユーザー名: guest");
  console.log("   パスワード: guest123");
  console.log("   ※ タスクデータはフロントエンドで独立管理");
  console.log("");
  console.log("🎭 デモアカウント情報:");
  console.log("   ユーザー名: demo_user");
  console.log("   パスワード: Demo123!");
  console.log("   ※ タスクデータはDBに保存");
}

main()
  .catch((e) => {
    console.error("❌ シードデータの投入中にエラーが発生しました:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
