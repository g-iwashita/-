import Link from "next/link";
import { searchSubmissionsByAccountName } from "@/lib/db";
import styles from "./admin.module.css";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage(props: Props) {
  const sp = (await props.searchParams) ?? {};
  const q = typeof sp.q === "string" ? sp.q : "";
  const match = sp.match === "exact" ? "exact" : "partial";

  const submissions = await searchSubmissionsByAccountName({ query: q, match, limit: 300 });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            Instagram運用診断
          </Link>
          <Link className={styles.export} href="/admin/export" prefetch={false}>
            CSVを書き出す
          </Link>
          <a className={styles.export} href="/api/admin-logout">
            ログアウト
          </a>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>管理画面（回答一覧）</h1>
        <form className={styles.search} action="/admin" method="get">
          <input
            className={styles.searchInput}
            name="q"
            placeholder="アカウント名で検索（例: axis / @axisone）"
            defaultValue={q}
          />
          <label className={styles.searchToggle}>
            <input type="checkbox" name="match" value="exact" defaultChecked={match === "exact"} />{" "}
            完全一致
          </label>
          <button className={styles.searchButton} type="submit">
            検索
          </button>
          <Link className={styles.searchClear} href="/admin">
            クリア
          </Link>
        </form>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`}>
            <div>日時</div>
            <div>アカウント</div>
            <div>運用期間</div>
            <div>スコア</div>
            <div>レベル</div>
          </div>

          {submissions.length ? (
            submissions.map((s) => (
              <Link key={s.id} className={styles.row} href={`/admin/${s.id}`}>
                <div className={styles.mono}>{new Date(s.createdAt).toLocaleString()}</div>
                <div>{s.instagramAccountName}</div>
                <div>{s.operationMonths}ヶ月</div>
                <div className={styles.score}>{s.score}</div>
                <div>{s.level}</div>
              </Link>
            ))
          ) : (
            <div className={styles.empty}>
              {q ? (
                <>
                  検索結果がありません（<span className={styles.mono}>{q}</span>）。
                </>
              ) : (
                <>まだ回答データがありません。</>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

