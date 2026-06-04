'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  ClipboardList, History, UtensilsCrossed, User,
  Bell, CalendarDays, ShoppingBag, FileText, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/mypage', label: '募集案件', icon: ClipboardList, exact: true },
  { href: '/mypage/calendar', label: 'カレンダー', icon: CalendarDays, exact: false },
  { href: '/mypage/notifications', label: '通知', icon: Bell, exact: false },
  { href: '/mypage/applications', label: '申込履歴', icon: History, exact: false },
  { href: '/mypage/products', label: '商品管理', icon: ShoppingBag, exact: false },
  { href: '/mypage/menus', label: 'メニュー管理', icon: UtensilsCrossed, exact: false },
  { href: '/mypage/documents', label: '書類管理', icon: FileText, exact: false },
  { href: '/mypage/profile', label: '登録情報', icon: User, exact: false },
]

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Image
            src="/logo-icon.png"
            alt="あいちキッチンカー協会"
            width={240}
            height={72}
            className="h-14 w-auto object-contain"
            style={{ mixBlendMode: 'darken' }}
          />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 mt-3">マイページ</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        {/* サイドバー */}
        <aside className="md:w-52 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                    isActive
                      ? 'bg-[#C0391B] text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[#C0391B]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* ログアウトボタン */}
          <button
            onClick={handleSignOut}
            className="mt-3 w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            ログアウト
          </button>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
