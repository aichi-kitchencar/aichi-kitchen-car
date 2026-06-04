-- ================================================================
-- テスト用アカウント 確認・プロフィール設定SQL
-- Supabase ダッシュボード → SQL Editor で実行してください
-- ================================================================

-- Step 1: メール確認済みにする
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email IN (
  'test@aichi-kitchencar.com',
  'admin@aichi-kitchencar.com'
);

-- Step 2: profilesテーブルにupsert（トリガー未設定の場合も対応）
INSERT INTO profiles (id, email, company_name, owner_name, phone, status, is_admin, address, business_type)
VALUES
  (
    '101115e8-c037-467a-9e4c-b6cabf383c8c',
    'test@aichi-kitchencar.com',
    'テストキッチンカー',
    'テスト 太郎',
    '090-0000-0001',
    'approved',
    false,
    '愛知県名古屋市中区',
    '和食'
  ),
  (
    'e63a08f8-8151-465c-9697-7b8434fc9922',
    'admin@aichi-kitchencar.com',
    '協会事務局',
    '協会 管理者',
    '052-000-0000',
    'approved',
    true,
    '愛知県名古屋市',
    'その他'
  )
ON CONFLICT (id) DO UPDATE SET
  company_name  = EXCLUDED.company_name,
  owner_name    = EXCLUDED.owner_name,
  phone         = EXCLUDED.phone,
  status        = EXCLUDED.status,
  is_admin      = EXCLUDED.is_admin,
  address       = EXCLUDED.address,
  business_type = EXCLUDED.business_type,
  updated_at    = NOW();

-- Step 3: 結果確認
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  p.company_name,
  p.owner_name,
  p.status,
  p.is_admin
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN (
  'test@aichi-kitchencar.com',
  'admin@aichi-kitchencar.com'
);
