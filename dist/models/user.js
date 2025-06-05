"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
class UserModel {
    // ユーザー作成
    static async create(userData) {
        const saltRounds = 12;
        const hashedPassword = await bcrypt_1.default.hash(userData.password, saltRounds);
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
    static async findByUsername(username) {
        return await prisma.user.findUnique({
            where: { username },
        });
    }
    // IDでユーザー検索（パスワード除外）
    static async findById(id) {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user)
            return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    // パスワード検証
    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt_1.default.compare(plainPassword, hashedPassword);
    }
    // ユーザー名またはメールの重複チェック
    static async checkDuplicate(username, email) {
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
exports.UserModel = UserModel;
