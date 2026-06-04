import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatDateTime, statusLabels, statusColors } from '@/lib/utils'
import { MapPin, Calendar } from 'lucide-react'

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: applications } = await supabase
    .from('applications')
    .select('*, listing:listings(*)')
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h2 className="font-bold text-gray-800 mb-4">申込履歴</h2>
      {applications && applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[app.status as keyof typeof statusColors]}`}>
                  {statusLabels[app.status as keyof typeof statusLabels]}
                </span>
                <span className="text-xs text-gray-400">{formatDateTime(app.created_at)}</span>
              </div>
              {app.listing && (
                <Link href={`/listings/${app.listing_id}`} className="block group">
                  <h3 className="font-medium text-gray-800 text-sm mb-2 group-hover:text-[#C0391B] transition-colors">
                    {app.listing.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C0391B]" />{app.listing.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#C0391B]" />{formatDate(app.listing.event_date)}
                    </span>
                  </div>
                </Link>
              )}
              {app.admin_note && (
                <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                  <span className="font-medium">管理者コメント: </span>{app.admin_note}
                </div>
              )}
              {app.message && (
                <div className="mt-3 text-xs text-gray-500">
                  <span className="font-medium">送信メッセージ: </span>{app.message}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">
          <p>応募履歴はありません</p>
          <Link href="/listings" className="text-[#C0391B] text-sm mt-2 inline-block hover:underline">
            案件を探す
          </Link>
        </div>
      )}
    </div>
  )
}
