const { Priority, PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

async function main() {
  // 既存のタスクを削除
  await prisma.task.deleteMany();

  // サンプルタスクを作成
  await prisma.task.createMany({
    data: [
      {
        title: "プロジェクト企画書作成",
        description: "新しいプロジェクトの企画書を作成する",
        priority: Priority.HIGH,
        columnId: "todo",
        position: 0,
      },
      {
        title: "デザインレビュー",
        description: "UIデザインの最終確認を行う",
        priority: Priority.MEDIUM,
        columnId: "todo",
        position: 1,
      },
      {
        title: "API開発",
        description: "バックエンドAPIの実装",
        priority: Priority.HIGH,
        columnId: "inprogress",
        position: 0,
      },
      {
        title: "要件定義",
        description: "プロジェクトの要件定義書作成完了",
        priority: Priority.MEDIUM,
        columnId: "done",
        position: 0,
      },
    ],
  });

  console.log("シードデータの投入が完了しました");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
