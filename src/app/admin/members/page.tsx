import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { statusLabels, statusColors } from '@/lib/utils'
import MemberActions from './MemberActions'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminMembersPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/members')


  const { status } = await searchParams

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('is_admin', false)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: members } = await query

  const tabs = [
    { value: 'all', label: 'すべて' },
    { value: 'pending', label: '審査待ち' },
    { value: 'approved', label: '承認済み' },
    { value: 'rejected', label: '却下' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">会員一覧・審査</h2>
        <span className="text-sm text-gray-500">{members?.length ?? 0}件</span>
      </div>

      {/* フィルタタブ */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={tab.value === 'all' ? '/admin/members' : `/admin/members?status=${tab.value}`}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              (status ?? 'all') === tab.value
                ? 'bg-[#C0391B] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#C0391B] hover:text-[#C0391B]'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* 会員リスト */}
      <div className="space-y-3">
        {members && members.length > 0 ? members.map((member: Profile) => (
          <div key={member.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800 truncate">{member.company_name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[member.status]}`}>
                    {statusLabels[member.status]}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-xs text-gray-500 mt-1">
                  <span>代表者: <span className="text-gray-700">{member.owner_name}</span></span>
                  <span>電話: <span className="text-gray-700">{member.phone}</span></span>
                  <span>業態: <span className="text-gray-700">{member.business_type || '未設定'}</span></span>
                  <span className="sm:col-span-2">メール: <span className="text-gray-700">{member.email}</span></span>
                  <span>登録: <span className="text-gray-700">{formatDateTime(member.created_at)}</span></span>
                </div>
                {member.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-1 bg-gray-50 rounded px-2 py-1">
                    {member.description}
                  </p>
                )}
              </div>
              <MemberActions memberId={member.id} currentStatus={member.status} />
            </div>
          </div>
        )) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            該当する会員がいません
          </div>
        )}
      </div>
    </div>
  )
}
