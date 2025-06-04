// JWT_SECRET生成スクリプト
// 使用方法: node scripts/generate-jwt-secret.js

const crypto = require("crypto");

function generateJWTSecret(length = 64) {
  return crypto.randomBytes(length).toString("hex");
}

const secret = generateJWTSecret();
console.log("Generated JWT_SECRET:");
console.log(secret);
