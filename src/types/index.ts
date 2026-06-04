export type ProfileStatus = 'pending' | 'approved' | 'rejected'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type ListingStatus = 'open' | 'closed' | 'cancelled'
export type ProductCategory = '主食' | 'スイーツ' | 'ドリンク'

export interface Profile {
  id: string
  email: string
  company_name: string
  owner_name: string
  phone: string
  address: string | null
  business_type: string | null
  vehicle_count: number
  description: string | null
  avatar_url: string | null
  status: ProfileStatus
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface News {
  id: string
  title: string
  content: string
  category: string
  published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  title: string
  description: string
  location: string
  prefecture: string
  category: string
  event_date: string
  event_end_date: string | null
  application_deadline: string
  max_applicants: number
  fee: string | null
  requirements: string | null
  contact_info: string | null
  status: ListingStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  listing_id: string
  applicant_id: string
  message: string | null
  status: ApplicationStatus
  admin_note: string | null
  created_at: string
  updated_at: string
  listing?: Listing
  applicant?: Profile
}

export interface Menu {
  id: string
  owner_id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  available: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  event_id: string | null
  event_title: string
  message: string
  sent_at: string
  sent_by: string | null
  is_read?: boolean
}

export interface ReadNotification {
  id: string
  user_id: string
  notification_id: string
  read_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  price: number
  category: ProductCategory
  allergens: string[]
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  published_at: string
  author: string | null
}

export interface Document {
  id: string
  user_id: string
  category: string
  file_url: string
  file_name: string
  created_at: string
}

export const LISTING_CATEGORIES = [
  'フードフェス',
  'マルシェ',
  '企業イベント',
  '地域イベント',
  'スポーツイベント',
  'その他',
] as const

export const MENU_CATEGORIES = [
  'メイン料理',
  'サイドメニュー',
  'デザート',
  'ドリンク',
  'その他',
] as const

export const PRODUCT_CATEGORIES: ProductCategory[] = ['主食', 'スイーツ', 'ドリンク']

export const ALLERGENS = ['卵', '乳', '小麦', 'えび', 'かに', 'そば', '落花生'] as const

export const DOCUMENT_CATEGORIES = [
  '車検証',
  '営業許可証',
  'PL保険',
  'キッチンカー外観',
  '商材写真',
] as const

export const BUSINESS_TYPES = [
  '和食',
  '洋食',
  '中華',
  'アジア料理',
  'カフェ・スイーツ',
  'ドリンク専門',
  'その他',
] as const
