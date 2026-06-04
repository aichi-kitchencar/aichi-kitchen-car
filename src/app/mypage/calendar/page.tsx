'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { Listing, Application } from '@/types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

type DotType = 'open' | 'applied' | 'confirmed'

interface EventOnDay {
  listing: Listing
  dotType: DotType
}

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed
  const [eventsMap, setEventsMap] = useState<Map<string, EventOnDay[]>>(new Map())
  const [monthListings, setMonthListings] = useState<EventOnDay[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const firstDay = new Date(year, month, 1).toISOString().split('T')[0]
    const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0]

    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .gte('event_date', firstDay)
      .lte('event_date', lastDay)
      .order('event_date', { ascending: true })

    if (!listings || listings.length === 0) {
      setEventsMap(new Map())
      setMonthListings([])
      setLoading(false)
      return
    }

    // ユーザーの応募状況を取得
    let applicationMap = new Map<string, string>() // listing_id -> status
    if (user) {
      const listingIds = listings.map((l: Listing) => l.id)
      const { data: applications } = await supabase
        .from('applications')
        .select('listing_id, status')
        .eq('applicant_id', user.id)
        .in('listing_id', listingIds)

      applicationMap = new Map(
        (applications ?? []).map((a: { listing_id: string; status: string }) => [a.listing_id, a.status])
      )
    }

    // ドット種別を判定
    const getDotType = (listing: Listing): DotType => {
      const appStatus = applicationMap.get(listing.id)
      if (appStatus === 'approved') return 'confirmed'
      if (appStatus) return 'applied'
      return 'open'
    }

    const newMap = new Map<string, EventOnDay[]>()
    const newList: EventOnDay[] = []

    listings.forEach((listing: Listing) => {
      const dotType = getDotType(listing)
      const event: EventOnDay = { listing, dotType }
      const key = listing.event_date
      if (!newMap.has(key)) newMap.set(key, [])
      newMap.get(key)!.push(event)
      newList.push(event)
    })

    setEventsMap(newMap)
    setMonthListings(newList)
    setLoading(false)
  }, [year, month])

  useEffect(() => { fetchData() }, [fetchData])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // カレンダーグリッド生成
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const dotColors: Record<DotType, string> = {
    open: 'bg-orange-400',
    applied: 'bg-red-500',
    confirmed: 'bg-yellow-400',
  }
  const dotLabels: Record<DotType, string> = {
    open: '募集中',
    applied: '申込済',
    confirmed: '確定',
  }
  const cardColors: Record<DotType, string> = {
    open: 'border-orange-300 bg-orange-50',
    applied: 'border-red-300 bg-red-50',
    confirmed: 'border-yellow-300 bg-yellow-50',
  }
  const badgeColors: Record<DotType, string> = {
    open: 'bg-orange-100 text-orange-700',
    applied: 'bg-red-100 text-red-700',
    confirmed: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-gray-800">イベントカレンダー</h2>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 月ナビゲーション */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-800 text-lg">
            {year}年{month + 1}月
          </h3>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 凡例 */}
        <div className="flex items-center gap-4 px-5 py-2 border-b border-gray-50 bg-white">
          {(Object.entries(dotLabels) as [DotType, string][]).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${dotColors[type]}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="p-3">
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#C0391B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-gray-100">
              {cells.map((day, idx) => {
                const dateStr = day
                  ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  : null
                const events = dateStr ? (eventsMap.get(dateStr) ?? []) : []
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear()
                const col = idx % 7

                return (
                  <div
                    key={idx}
                    className={`bg-white min-h-[60px] p-1 ${!day ? 'opacity-0 pointer-events-none' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full mx-auto mb-1 ${
                          isToday
                            ? 'bg-[#C0391B] text-white'
                            : col === 0 ? 'text-red-500' : col === 6 ? 'text-blue-500' : 'text-gray-700'
                        }`}>
                          {day}
                        </div>
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {events.slice(0, 3).map((e, i) => (
                            <span
                              key={i}
                              className={`w-2 h-2 rounded-full ${dotColors[e.dotType]}`}
                              title={e.listing.title}
                            />
                          ))}
                          {events.length > 3 && (
                            <span className="text-[9px] text-gray-400">+{events.length - 3}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 当月のイベントカードリスト */}
      <div>
        <h3 className="font-bold text-gray-700 text-sm mb-3">
          {month + 1}月のイベント ({monthListings.length}件)
        </h3>
        {monthListings.length > 0 ? (
          <div className="space-y-2">
            {monthListings.map(({ listing, dotType }) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <div className={`rounded-xl border p-4 hover:shadow-md transition-all ${cardColors[dotType]}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColors[dotType]}`}>
                          {dotLabels[dotType]}
                        </span>
                        <span className="text-xs text-gray-500">{listing.category}</span>
                      </div>
                      <p className="font-medium text-gray-800 text-sm truncate">{listing.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{listing.location}
                        </span>
                        <span>{formatDate(listing.event_date)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      締切 {formatDate(listing.application_deadline)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
            この月のイベントはありません
          </div>
        )}
      </div>
    </div>
  )
}
