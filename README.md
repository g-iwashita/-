Instagramの運用診断ツール（叩き台）です。

## Getting Started

### ローカル起動

まず依存を入れて、環境変数を設定し、開発サーバーを起動します。

```bash
npm install
cp .env.example .env.local
# .env.local を編集して SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

### 使い方（動線）

- 公開側（回答者）
  - トップ: `/`
  - 診断フォーム: `/diagnose?url=https://配布元URL`（`url` は任意）
  - 結果: `/result/:id`（回答後に自動遷移）
  - Axis配布用: `/axis`、`/axis/diagnose`、`/axis/result/:id`
- 開発者側（管理）
  - 一覧: `/admin`
  - 詳細: `/admin/:id`
  - CSV: `/admin/export`

### 管理画面のBasic認証

デフォルトは `admin / admin` です。環境変数で変更できます。

```bash
export ADMIN_USER="your-user"
export ADMIN_PASS="your-pass"
```

### データ保存

回答データは **Supabase（Postgres）** の `submissions` テーブルに保存されます。

## Supabase セットアップ（無料）

1) Supabaseで新規プロジェクトを作成  
2) SupabaseのSQL Editorで `supabase/schema.sql` を実行  
3) Project Settings → API から以下を取得し、`.env.local` に設定  
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`（※サーバー専用。絶対に公開しない）

## 公開URL（社外OK）で配布する（Vercel）

1) Vercelにこのリポジトリ/フォルダをインポートしてデプロイ  
2) Vercelの Environment Variables に以下を設定して再デプロイ  
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USER`
   - `ADMIN_PASS`

配布は `https://<your-app>.vercel.app/axis` を使うのが簡単です。
