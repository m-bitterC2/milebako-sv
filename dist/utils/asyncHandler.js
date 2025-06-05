"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 非同期ルートハンドラーをラップして、エラーを自動的に next に渡す。
 *
 * Express は async/await のエラーを自動で補足しないため、
 * すべての非同期関数に try-catch を書く代わりにこの関数を使用する。
 *
 * @param fn 非同期関数（req, res, next）を引数に取るハンドラー
 * @returns エラーを next に渡す安全なラップ関数
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.default = asyncHandler;
