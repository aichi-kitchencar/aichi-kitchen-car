import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatDateTime, statusLabels, statusColors } from '@/lib/utils'
import { MapPin, Calendar, Users, Megaphone, ArrowRight } from 'lucide-react'
import type { Listing, Profile, Announcement } from '@/types'

export default async function MypagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  const [{ data: listings }, { data: announcements }] = await Promise.all([
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'open')
      .order('event_date', { ascending: true })
      .limit(10),
    supabase
      .from('announcements')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(3),
  ])

  return (
    <div className="space-y-6">
      {/* 会員ステータス */}
      {profile && profile.status !== 'approved' && (
        <div className={`rounded-xl p-4 text-sm ${
          profile.status === 'pending'
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <span className="font-medium">
            {profile.status === 'pending'
              ? '会員審査中です。承認後に案件への応募が可能になります。'
              : '会員審査が却下されました。事務局にお問い合わせください。'}
          </span>
        </div>
      )}

      {profile && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">{profile.company_name}</p>
              <p className="text-sm text-gray-500">{profile.owner_name}</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColors[profile.status]}`}>
              {statusLabels[profile.status]}
            </span>
          </div>
        </div>
      )}

      {/* お知らせ */}
      {announcements && announcements.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 bg-orange-50">
            <Megaphone className="w-4 h-4 text-orange-600" />
            <h2 className="font-bold text-orange-700 text-sm">お知らせ</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {announcements.map((ann: Announcement) => (
              <div key={ann.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-800 text-sm">{ann.title}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatDateTime(ann.published_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 募集案件一覧 */}
      <div>
        <h2 className="font-bold text-gray-800 mb-4">募集中の案件</h2>
        {listings && listings.length > 0 ? (
          <div className="space-y-3">
            {listings.map((listing: Listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <div className="bg-white rounded-xl p-4 hover:shadow-md transition-all border border-gray-100 hover:border-[#C0391B]/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {listing.category}
                    </span>
                    <span className="text-xs text-gray-400">締切: {formatDate(listing.application_deadline)}</span>
                  </div>
                  <h3 className="font-medium text-gray-800 text-sm mb-2">{listing.title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C0391B]" />{listing.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#C0391B]" />{formatDate(listing.event_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#C0391B]" />{listing.max_applicants}台募集
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">
            現在募集中の案件はありません
          </div>
        )}
        <Link href="/listings" className="flex items-center justify-center gap-1 text-sm text-[#C0391B] mt-3 hover:underline">
          すべての案件を見る <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
