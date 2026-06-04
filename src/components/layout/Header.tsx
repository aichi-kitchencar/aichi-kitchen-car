'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, ChevronDown } from 'lucide-react'
import NotificationBell from './NotificationBell'
import type { Profile } from '@/types'

export default function Header() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    }
    getProfile()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { getProfile() })
    return () => subscription.unsubscribe()
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'shadow-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ロゴ */}
          <Link href="/" className="flex flex-col leading-tight">
            <span style={{ fontSize: '11px', color: '#888888', fontWeight: 400 }}>一般社団法人</span>
            <span style={{ fontSize: '16px', color: '#111111', fontWeight: 700 }}>あいちキッチンカー協会</span>
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/listings" className="text-[#333333] hover:text-[#C0391B] transition-colors text-sm font-medium">
              募集案件
            </Link>
            <Link href="/#about" className="text-[#333333] hover:text-[#C0391B] transition-colors text-sm font-medium">
              協会について
            </Link>
            <Link href="/#news" className="text-[#333333] hover:text-[#C0391B] transition-colors text-sm font-medium">
              お知らせ
            </Link>
          </nav>

          {/* 右側メニュー */}
          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <>
                {profile.status === 'approved' && (
                  <NotificationBell userId={profile.id} />
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-[#333333] hover:text-[#C0391B] transition-colors ml-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#C0391B] text-white flex items-center justify-center text-xs font-bold">
                      {profile.company_name?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-24 truncate">{profile.company_name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                      <Link href="/mypage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50" onClick={() => setIsUserMenuOpen(false)}>
                        マイページ
                      </Link>
                      <Link href="/mypage/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50" onClick={() => setIsUserMenuOpen(false)}>
                        登録情報
                      </Link>
                      <Link href="/mypage/notifications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50" onClick={() => setIsUserMenuOpen(false)}>
                        通知
                      </Link>
                      {profile.is_admin && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-[#C0391B] font-medium hover:bg-orange-50" onClick={() => setIsUserMenuOpen(false)}>
                          管理者画面
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-[#333333] hover:text-[#C0391B] transition-colors">
                  ログイン
                </Link>
                <Link href="/auth/register" className="bg-[#C0391B] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#a83016] transition-colors">
                  会員登録
                </Link>
              </>
            )}
          </div>

          {/* モバイル: 通知ベル + ハンバーガー */}
          <div className="md:hidden flex items-center gap-1">
            {profile?.status === 'approved' && (
              <NotificationBell userId={profile.id} />
            )}
            <button className="p-2 text-[#333333]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-md">
          <Link href="/listings" className="block py-2 text-[#333333] font-medium hover:text-[#C0391B]" onClick={() => setIsMenuOpen(false)}>募集案件</Link>
          <Link href="/#about" className="block py-2 text-[#333333] font-medium hover:text-[#C0391B]" onClick={() => setIsMenuOpen(false)}>協会について</Link>
          <Link href="/#news" className="block py-2 text-[#333333] font-medium hover:text-[#C0391B]" onClick={() => setIsMenuOpen(false)}>お知らせ</Link>
          <hr className="border-gray-100" />
          {profile ? (
            <>
              <Link href="/mypage" className="block py-2 text-[#333333] font-medium hover:text-[#C0391B]" onClick={() => setIsMenuOpen(false)}>マイページ</Link>
              <Link href="/mypage/notifications" className="block py-2 text-[#333333] font-medium hover:text-[#C0391B]" onClick={() => setIsMenuOpen(false)}>通知</Link>
              {profile.is_admin && (
                <Link href="/admin" className="block py-2 text-[#C0391B] font-medium" onClick={() => setIsMenuOpen(false)}>管理者画面</Link>
              )}
              <button onClick={handleSignOut} className="block py-2 text-red-600 font-medium w-full text-left">ログアウト</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block py-2 text-[#333333] font-medium hover:text-[#C0391B]" onClick={() => setIsMenuOpen(false)}>ログイン</Link>
              <Link href="/auth/register" className="block mt-2 text-center bg-[#C0391B] text-white font-bold py-2 rounded-lg hover:bg-[#a83016]" onClick={() => setIsMenuOpen(false)}>会員登録</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
