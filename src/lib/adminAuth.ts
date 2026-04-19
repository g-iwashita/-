/**
 * 管理画面でログイン可能なユーザー一覧を返す。
 * 環境変数 ADMIN_USERS が「user1:pass1,user2:pass2」形式なら複数ユーザー、
 * 未設定なら ADMIN_USER + ADMIN_PASS の1件。
 */
export function getAllowedCredentials(): Array<{ user: string; pass: string }> {
  const multi = process.env.ADMIN_USERS?.trim();
  if (multi) {
    return multi
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const [u, p] = pair.split(":").map((x) => x.trim());
        return { user: u ?? "", pass: p ?? "" };
      })
      .filter((c) => c.user && c.pass);
  }
  const user = process.env.ADMIN_USER ?? "admin";
  const pass = process.env.ADMIN_PASS ?? "admin";
  return [{ user, pass }];
}

export function checkCredentials(user: string, pass: string): boolean {
  const allowed = getAllowedCredentials();
  return allowed.some((c) => c.user === user && c.pass === pass);
}
