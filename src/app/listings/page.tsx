import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { formatDate } from '@/lib/utils'
import { MapPin, Calendar, Users, Search } from 'lucide-react'
import { LISTING_CATEGORIES } from '@/types'
import type { Listing } from '@/types'

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function ListingsPage({ searchParams }: Props) {
  const { category, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'open')
    .order('event_date', { ascending: true })

  if (category) query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: listings } = await query

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">募集案件一覧</h1>

      {/* 検索・フィルタ */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="案件名で検索..."
              className="pl-9"
            />
          </div>
          <select name="category" defaultValue={category || ''}>
            <option value="">すべてのカテゴリ</option>
            {LISTING_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-[#C0391B] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#a83016] transition-colors whitespace-nowrap"
          >
            検索
          </button>
        </form>

        {/* カテゴリタブ */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Link
            href="/listings"
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              !category ? 'bg-[#C0391B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </Link>
          {LISTING_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/listings?category=${encodeURIComponent(c)}`}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                category === c ? 'bg-[#C0391B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      {/* 案件リスト */}
      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {listings.map((listing: Listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <div className="bg-white rounded-xl p-5 hover:shadow-md transition-all border border-gray-100 hover:border-[#C0391B]/30 h-full">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {listing.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    締切: {formatDate(listing.application_deadline)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-3 text-sm leading-relaxed">{listing.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{listing.description}</p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C0391B] flex-shrink-0" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C0391B] flex-shrink-0" />
                    <span>
                      {formatDate(listing.event_date)}
                      {listing.event_end_date && ` 〜 ${formatDate(listing.event_end_date)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C0391B] flex-shrink-0" />
                    <span>募集台数: {listing.max_applicants}台</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p>該当する案件が見つかりません</p>
          {(category || q) && (
            <Link href="/listings" className="text-[#C0391B] text-sm mt-2 inline-block hover:underline">
              条件をリセット
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
