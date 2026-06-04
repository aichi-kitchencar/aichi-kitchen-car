-- =========================================
-- schema_v2.sql: 追加機能用テーブル
-- =========================================

-- 通知テーブル
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  event_title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 既読管理テーブル
CREATE TABLE read_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);

-- 商品テーブル
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('主食', 'スイーツ', 'ドリンク')),
  allergens TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- お知らせテーブル（会員向けダッシュボード用）
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 書類テーブル
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- Row Level Security
-- =========================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- notifications: 承認済み会員のみ閲覧、管理者のみ作成
CREATE POLICY "承認済み会員は通知を閲覧可" ON notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "管理者のみ通知作成可" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- read_notifications: 自分のレコードのみ
CREATE POLICY "自分の既読レコードのみ閲覧可" ON read_notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "自分の既読レコードのみ作成可" ON read_notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "自分の既読レコードのみ削除可" ON read_notifications
  FOR DELETE USING (user_id = auth.uid());

-- products: 全員閲覧可、本人のみ作成・削除
CREATE POLICY "商品は全員閲覧可" ON products FOR SELECT USING (true);
CREATE POLICY "承認済み会員のみ商品作成可" ON products
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved')
  );
CREATE POLICY "自分の商品のみ削除可" ON products
  FOR DELETE USING (user_id = auth.uid());

-- announcements: 全員閲覧可、管理者のみ作成・削除
CREATE POLICY "お知らせは全員閲覧可" ON announcements FOR SELECT USING (true);
CREATE POLICY "管理者のみお知らせ作成可" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "管理者のみお知らせ削除可" ON announcements
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- documents: 自分の書類のみ
CREATE POLICY "自分の書類のみ閲覧可" ON documents
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "自分の書類のみ作成可" ON documents
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "自分の書類のみ削除可" ON documents
  FOR DELETE USING (user_id = auth.uid());

-- =========================================
-- Supabase Storage バケット設定
-- SupabaseダッシュボードのStorageで以下を作成：
-- バケット名: documents
-- Public: false（プライベート）
-- =========================================

-- Storage RLS (Supabase Storageの場合はダッシュボードで設定)
-- INSERT: auth.uid()::text = (storage.foldername(name))[1]
-- SELECT: auth.uid()::text = (storage.foldername(name))[1]
-- DELETE: auth.uid()::text = (storage.foldername(name))[1]
