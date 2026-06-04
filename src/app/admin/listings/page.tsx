import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate, statusLabels, statusColors } from '@/lib/utils'
import { Plus, MapPin, Calendar, Users, Pencil, Trash2 } from 'lucide-react'
import DeleteListingButton from './DeleteListingButton'
import type { Listing } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminListingsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/listings')


  const { status } = await searchParams

  let query = supabase.from('listings').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)

  const { data: listings } = await query

  const tabs = [
    { value: 'all', label: 'すべて' },
    { value: 'open', label: '募集中' },
    { value: 'closed', label: '締め切り' },
    { value: 'cancelled', label: 'キャンセル' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">案件管理</h2>
        <Link
          href="/admin/listings/create"
          className="flex items-center gap-1.5 bg-[#C0391B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#a83016] transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規案件を追加
        </Link>
      </div>

      {/* フィルタタブ */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={tab.value === 'all' ? '/admin/listings' : `/admin/listings?status=${tab.value}`}
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

      {/* 案件リスト */}
      <div className="space-y-3">
        {listings && listings.length > 0 ? listings.map((listing: Listing) => (
          <div key={listing.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[listing.status]}`}>
                    {statusLabels[listing.status]}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {listing.category}
                  </span>
                </div>
                <h3 className="font-medium text-gray-800 text-sm mb-1.5 truncate">{listing.title}</h3>
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
                  <span>締切: {formatDate(listing.application_deadline)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/admin/listings/${listing.id}/edit`}
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  編集
                </Link>
                <DeleteListingButton listingId={listing.id} />
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            <p>案件がありません</p>
            <Link href="/admin/listings/create" className="text-[#C0391B] text-sm mt-2 inline-block hover:underline">
              最初の案件を追加する
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
