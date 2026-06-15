import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// パスワードを scrypt でハッシュ化する。保存形式は "salt(hex):hash(hex)"。
// 平文パスワードはどこにも保存しない。
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

// 入力された平文が保存済みハッシュと一致するか、タイミング攻撃に強い比較で確認する。
export function verifyPassword(plain: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length === 0) return false;

  const actual = scryptSync(plain, salt, expected.length);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
