import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export class UserModel {
  // ユーザー作成
  static async create(
    userData: CreateUserInput
  ): Promise<Omit<User, "password">> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      },
    });

    // パスワードを除外して返す
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ユーザー名でユーザー検索
  static async findByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  // IDでユーザー検索（パスワード除外）
  static async findById(id: string): Promise<Omit<User, "password"> | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // パスワード検証
  static async validatePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // ユーザー名またはメールの重複チェック
  static async checkDuplicate(
    username: string,
    email: string
  ): Promise<{ username: boolean; email: boolean }> {
    const [existingUsername, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { username } }),
      prisma.user.findUnique({ where: { email } }),
    ]);

    return {
      username: !!existingUsername,
      email: !!existingEmail,
    };
  }
}
