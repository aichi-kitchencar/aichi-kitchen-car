import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, formatDateTime, statusLabels, statusColors } from '@/lib/utils'
import ApplicationActions from './ApplicationActions'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/applications')


  const { status } = await searchParams

  let query = supabase
    .from('applications')
    .select(`
      *,
      listing:listings(id, title, event_date, location, category),
      applicant:profiles(id, company_name, owner_name, phone, email)
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)

  const { data: applications } = await query

  const tabs = [
    { value: 'all', label: 'すべて' },
    { value: 'pending', label: '審査待ち' },
    { value: 'approved', label: '承認済み' },
    { value: 'rejected', label: '却下' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">応募管理</h2>
        <span className="text-sm text-gray-500">{applications?.length ?? 0}件</span>
      </div>

      {/* フィルタタブ */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={tab.value === 'all' ? '/admin/applications' : `/admin/applications?status=${tab.value}`}
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

      {/* 応募リスト */}
      <div className="space-y-3">
        {applications && applications.length > 0 ? applications.map((app) => (
          <div key={app.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4">
              {/* ヘッダー行 */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[app.status as keyof typeof statusColors]}`}>
                    {statusLabels[app.status as keyof typeof statusLabels]}
                  </span>
                  <span className="text-xs text-gray-400">{formatDateTime(app.created_at)}</span>
                </div>
                <ApplicationActions applicationId={app.id} currentStatus={app.status} />
              </div>

              {/* コンテンツ */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* 案件情報 */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-600 mb-1.5">応募案件</p>
                  {app.listing ? (
                    <>
                      <p className="font-medium text-gray-800 text-sm">{app.listing.title}</p>
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        <p>{app.listing.location}</p>
                        <p>{formatDate(app.listing.event_date)}</p>
                        <span className="inline-block bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">{app.listing.category}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">案件が削除されました</p>
                  )}
                </div>

                {/* 応募者情報 */}
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-green-600 mb-1.5">応募者</p>
                  {app.applicant ? (
                    <div className="text-sm space-y-0.5">
                      <p className="font-medium text-gray-800">{app.applicant.company_name}</p>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p>{app.applicant.owner_name}</p>
                        <p>{app.applicant.phone}</p>
                        <p className="truncate">{app.applicant.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">会員が削除されました</p>
                  )}
                </div>
              </div>

              {/* メッセージ */}
              {app.message && (
                <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                  <span className="font-medium text-gray-700">応募メッセージ: </span>
                  {app.message}
                </div>
              )}

              {/* 管理者コメント */}
              {app.admin_note && (
                <div className="mt-2 bg-yellow-50 rounded-lg px-3 py-2 text-xs text-yellow-700">
                  <span className="font-medium">管理者コメント: </span>
                  {app.admin_note}
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            応募がありません
          </div>
        )}
      </div>
    </div>
  )
}
