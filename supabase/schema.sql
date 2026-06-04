-- あいちキッチンカー協会 データベーススキーマ

-- プロフィールテーブル（auth.usersを拡張）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  business_type TEXT,
  vehicle_count INTEGER DEFAULT 1,
  description TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ニューステーブル
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'お知らせ',
  published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 募集案件テーブル
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  prefecture TEXT NOT NULL DEFAULT '愛知県',
  category TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_end_date DATE,
  application_deadline DATE NOT NULL,
  max_applicants INTEGER NOT NULL DEFAULT 1,
  fee TEXT,
  requirements TEXT,
  contact_info TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 応募テーブル
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, applicant_id)
);

-- メニューテーブル
CREATE TABLE menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- profiles ポリシー
CREATE POLICY "プロフィールは全員閲覧可" ON profiles FOR SELECT USING (true);
CREATE POLICY "自分のプロフィールのみ更新可" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "サインアップ時にプロフィール作成可" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- news ポリシー
CREATE POLICY "公開ニュースは全員閲覧可" ON news FOR SELECT USING (published = true OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));
CREATE POLICY "管理者のみニュース作成可" ON news FOR INSERT WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()));
CREATE POLICY "管理者のみニュース更新可" ON news FOR UPDATE USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));
CREATE POLICY "管理者のみニュース削除可" ON news FOR DELETE USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- listings ポリシー
CREATE POLICY "公開案件は全員閲覧可" ON listings FOR SELECT USING (true);
CREATE POLICY "管理者のみ案件作成可" ON listings FOR INSERT WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()));
CREATE POLICY "管理者のみ案件更新可" ON listings FOR UPDATE USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));
CREATE POLICY "管理者のみ案件削除可" ON listings FOR DELETE USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- applications ポリシー
CREATE POLICY "承認済み会員のみ応募閲覧可" ON applications FOR SELECT USING (
  applicant_id = auth.uid() OR (SELECT is_admin FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "承認済み会員のみ応募可" ON applications FOR INSERT WITH CHECK (
  auth.uid() = applicant_id AND
  (SELECT status FROM profiles WHERE id = auth.uid()) = 'approved'
);
CREATE POLICY "自分の応募のみキャンセル可" ON applications FOR UPDATE USING (applicant_id = auth.uid() OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));
CREATE POLICY "自分の応募のみ削除可" ON applications FOR DELETE USING (applicant_id = auth.uid() OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- menus ポリシー
CREATE POLICY "メニューは全員閲覧可" ON menus FOR SELECT USING (true);
CREATE POLICY "承認済み会員のみメニュー作成可" ON menus FOR INSERT WITH CHECK (
  auth.uid() = owner_id AND
  (SELECT status FROM profiles WHERE id = auth.uid()) = 'approved'
);
CREATE POLICY "自分のメニューのみ更新可" ON menus FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "自分のメニューのみ削除可" ON menus FOR DELETE USING (owner_id = auth.uid());

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- auth.usersのサインアップ時にprofilesを作成するトリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, company_name, owner_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'owner_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
