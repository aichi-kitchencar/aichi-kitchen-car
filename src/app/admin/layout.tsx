'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users, ClipboardList, FileCheck, Newspaper,
  LayoutDashboard, ChevronRight, Bell, Megaphone, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
  { href: '/admin/members', label: '会員一覧・審査', icon: Users, exact: false },
  { href: '/admin/listings', label: '案件管理', icon: ClipboardList, exact: false },
  { href: '/admin/applications', label: '応募管理', icon: FileCheck, exact: false },
  { href: '/admin/notifications', label: '通知送信', icon: Bell, exact: false },
  { href: '/admin/announcements', label: 'お知らせ管理', icon: Megaphone, exact: false },
  { href: '/admin/news', label: 'ニュース管理', icon: Newspaper, exact: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 管理者ヘッダーバー（ダークスレート） */}
      <div className="bg-[#1e293b] text-white text-xs px-4 py-2 flex items-center gap-3">
        {/* ロゴ */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo-icon.png"
            alt="あいちキッチンカー協会"
            width={160}
            height={48}
            className="h-9 w-auto object-contain"
            style={{ mixBlendMode: 'darken' }}
          />
        </Link>
        <span className="bg-[#C0391B] text-white text-xs font-bold px-2 py-0.5 rounded">ADMIN</span>
        <ChevronRight className="w-3 h-3 text-gray-500" />
        <span className="text-white">
          {navItems.find((item) =>
            item.exact ? pathname === item.href : pathname.startsWith(item.href)
          )?.label ?? 'ダッシュボード'}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* サイドナビ */}
          <aside className="md:w-56 flex-shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-bold text-gray-500 tracking-wider">ADMIN MENU</p>
              </div>
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
            <div className="mt-3 space-y-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 px-1 transition-colors"
              >
                ← サイトトップへ戻る
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-white rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                ログアウト
              </button>
            </div>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
