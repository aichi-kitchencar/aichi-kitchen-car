'use client'

import Link from 'next/link'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import FadeIn from './FadeIn'
import { formatDate } from '@/lib/utils'
import type { Listing } from '@/types'

interface Props {
  listings: Listing[]
}

export default function ListingsPreview({ listings }: Props) {
  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <FadeIn direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="inline-block text-[#C0391B] text-sm font-bold tracking-[0.2em] uppercase mb-3">
                Listings
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                最新の募集案件
              </h2>
            </div>
            <Link
              href="/listings"
              className="flex items-center gap-2 text-[#C0391B] font-bold text-sm hover:gap-3 transition-all group"
            >
              すべての案件を見る
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, i) => (
              <FadeIn key={listing.id} direction="up" delay={i * 100}>
                <Link href={`/listings/${listing.id}`} className="block h-full">
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1 border border-gray-100 h-full flex flex-col overflow-hidden group">
                    {/* カラーバー */}
                    <div className="h-1.5 bg-[#C0391B]" />

                    <div className="p-6 flex flex-col flex-1">
                      {/* カテゴリバッジ */}
                      <span className="inline-block text-xs font-bold text-[#C0391B] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full mb-4 w-fit">
                        {listing.category}
                      </span>

                      {/* タイトル */}
                      <h3 className="font-black text-gray-900 text-base mb-4 leading-snug group-hover:text-[#C0391B] transition-colors flex-1">
                        {listing.title}
                      </h3>

                      {/* 詳細情報 */}
                      <div className="space-y-2 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-[#C0391B] flex-shrink-0" />
                          <span className="truncate">{listing.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-[#C0391B] flex-shrink-0" />
                          <span>{formatDate(listing.event_date)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          締切: {formatDate(listing.application_deadline)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn direction="up">
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-lg">現在募集中の案件はありません</p>
            </div>
          </FadeIn>
        )}

        {/* もっと見るボタン */}
        {listings.length > 0 && (
          <FadeIn direction="up" delay={300} className="text-center mt-12">
            <Link
              href="/listings"
              className="inline-flex items-center gap-3 bg-[#C0391B] text-white font-bold px-10 py-4 rounded-xl hover:bg-[#a83016] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
            >
              すべての案件を見る
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
