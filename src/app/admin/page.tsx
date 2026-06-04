import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, ClipboardList, FileCheck, Newspaper, TrendingUp, AlertTriangle } from 'lucide-react'
import GrantAdminButton from './GrantAdminButton'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin')

  // プロフィールを取得（is_admin チェックは一時無効化）
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // デバッグ: 統計（テーブルが存在しない場合 null になる）
  const [
    { count: pendingMembers },
    { count: approvedMembers },
    { count: openListings },
    { count: pendingApplications },
    { count: approvedApplications },
    { count: unpublishedNews },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('is_admin', false),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved').eq('is_admin', false),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('news').select('*', { count: 'exact', head: true }).eq('published', false),
  ])

  const stats = [
    { label: '審査待ち会員', value: pendingMembers ?? 0, sub: `承認済み: ${approvedMembers ?? 0}名`, icon: Users, href: '/admin/members', color: 'border-yellow-400 bg-yellow-50', textColor: 'text-yellow-700', badge: (pendingMembers ?? 0) > 0 ? 'bg-yellow-400' : undefined },
    { label: '募集中の案件', value: openListings ?? 0, sub: '案件管理はこちら', icon: ClipboardList, href: '/admin/listings', color: 'border-blue-400 bg-blue-50', textColor: 'text-blue-700' },
    { label: '審査待ち応募', value: pendingApplications ?? 0, sub: `承認済み: ${approvedApplications ?? 0}件`, icon: FileCheck, href: '/admin/applications', color: 'border-orange-400 bg-orange-50', textColor: 'text-orange-700', badge: (pendingApplications ?? 0) > 0 ? 'bg-orange-400' : undefined },
    { label: '未公開ニュース', value: unpublishedNews ?? 0, sub: 'ニュース管理はこちら', icon: Newspaper, href: '/admin/news', color: 'border-purple-400 bg-purple-50', textColor: 'text-purple-700' },
  ]

  return (
    <div className="space-y-6">
      {/* ===== デバッグパネル ===== */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h2 className="font-bold text-yellow-800">🔍 デバッグ情報（テスト中）</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-yellow-700">認証ユーザー</p>
            <p className="text-yellow-600 font-mono text-xs break-all">ID: {user.id}</p>
            <p className="text-yellow-600">Email: {user.email}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-yellow-700">profiles テーブルの値</p>
            {profileError ? (
              <p className="text-red-600 text-xs">❌ エラー: {profileError.message}</p>
            ) : profile ? (
              <>
                <p className="text-yellow-600">is_admin: <strong className={profile.is_admin ? 'text-green-600' : 'text-red-600'}>{String(profile.is_admin)}</strong></p>
                <p className="text-yellow-600">status: <strong>{profile.status}</strong></p>
                <p className="text-yellow-600">company: {profile.company_name}</p>
              </>
            ) : (
              <p className="text-red-600">❌ プロフィールが存在しません（schema.sql 未実行 or トリガー未発火）</p>
            )}
          </div>
        </div>

        {/* is_admin が false の場合：ボタンで即設定 */}
        {profile && !profile.is_admin && (
          <div className="mt-4 pt-4 border-t border-yellow-300">
            <p className="text-sm text-yellow-700 mb-2">
              ⚠️ is_admin が false です。このボタンで自分を管理者に設定できます。
            </p>
            <GrantAdminButton userId={user.id} />
          </div>
        )}

        {/* プロフィールが存在しない場合 */}
        {!profile && (
          <div className="mt-4 pt-4 border-t border-yellow-300">
            <p className="text-sm text-red-700 mb-2">
              ⚠️ profiles テーブルにレコードがありません。<br />
              Supabase SQL Editor で <code className="bg-red-100 px-1 rounded">scripts/confirm-test-accounts.sql</code> を実行してください。
            </p>
          </div>
        )}
      </div>
      {/* ===== /デバッグパネル ===== */}

      {/* ウェルカムバナー */}
      <div className="bg-gradient-to-r from-[#C0391B] to-[#a83016] text-white rounded-xl p-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 opacity-80" />
          <div>
            <h1 className="text-xl font-bold">管理者ダッシュボード</h1>
            <p className="text-green-100 text-sm mt-0.5">
              ようこそ、{profile?.company_name ?? user.email} さん
            </p>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Link key={i} href={stat.href}>
              <div className={`relative rounded-xl p-5 border-l-4 ${stat.color} hover:shadow-md transition-shadow cursor-pointer`}>
                {'badge' in stat && stat.badge && stat.value > 0 && (
                  <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${stat.badge} animate-pulse`} />
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${stat.textColor} opacity-75`}>{stat.label}</p>
                    <p className={`text-4xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.textColor} opacity-60`}>{stat.sub}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.textColor} opacity-40`} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* クイックアクセス */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-700 text-sm mb-4">クイックアクション</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '会員を承認する', href: '/admin/members', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
            { label: '案件を追加する', href: '/admin/listings/create', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { label: '応募を審査する', href: '/admin/applications', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
            { label: 'ニュースを投稿', href: '/admin/news/create', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          ].map((action) => (
            <Link key={action.href} href={action.href} className={`text-center py-3 px-2 rounded-lg text-xs font-medium transition-colors ${action.color}`}>
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
