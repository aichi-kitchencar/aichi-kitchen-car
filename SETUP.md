# あいちキッチンカー協会 セットアップガイド

## 1. Supabaseプロジェクトの作成

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. `Settings > API` からURLとAnon Keyを取得

## 2. 環境変数の設定

`.env.local` を編集:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxx
```

## 3. データベースのセットアップ

Supabase管理画面の `SQL Editor` で `supabase/schema.sql` を実行

## 4. 管理者ユーザーの作成

1. `/auth/register` から通常登録
2. Supabase管理画面の `Table Editor > profiles` で `is_admin = true` に設定
3. `status = 'approved'` にも設定

## 5. 開発サーバーの起動

```bash
npm run dev
```

## ページ構成

| URL | 説明 |
|-----|------|
| `/` | トップページ |
| `/auth/register` | 会員登録 |
| `/auth/login` | ログイン |
| `/listings` | 募集案件一覧（カテゴリフィルタ） |
| `/listings/[id]` | 案件詳細・応募 |
| `/mypage` | 会員マイページ（募集案件） |
| `/mypage/applications` | 申込履歴 |
| `/mypage/menus` | メニュー管理 |
| `/mypage/profile` | 登録情報編集 |
| `/admin` | 管理者ダッシュボード |
| `/admin/members` | 会員審査 |
| `/admin/listings` | 案件管理 |
| `/admin/applications` | 応募管理 |
| `/admin/news` | ニュース投稿 |
