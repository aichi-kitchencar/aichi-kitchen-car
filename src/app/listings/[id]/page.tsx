'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { MapPin, Calendar, Users, ArrowLeft, Clock, Banknote, FileText } from 'lucide-react'
import type { Listing, Profile } from '@/types'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [applied, setApplied] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [applyModal, setApplyModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: listingData } = await supabase.from('listings').select('*').eq('id', id).single()
      setListing(listingData)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        setProfile(profileData)
        const { data: appData } = await supabase.from('applications').select('id').eq('listing_id', id).eq('applicant_id', user.id).maybeSingle()
        setApplied(!!appData)
      }
    }
    load()
  }, [id])

  const handleApply = async () => {
    if (!profile) { router.push('/auth/login'); return }
    if (profile.status !== 'approved') { setError('会員審査が完了していないと応募できません'); return }

    setLoading(true)
    setError('')
    const { error } = await supabase.from('applications').insert({
      listing_id: id,
      applicant_id: profile.id,
      message,
    })

    if (error) {
      setError('応募に失敗しました')
    } else {
      setApplied(true)
      setApplyModal(false)
      setSuccess('応募しました！審査結果をお待ちください。')
    }
    setLoading(false)
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center text-gray-500">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/listings" className="flex items-center gap-1 text-gray-500 hover:text-[#1D9E75] text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        案件一覧に戻る
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1D9E75] to-[#178a63] p-6 text-white">
          <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
            {listing.category}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">{listing.title}</h1>
        </div>

        <div className="p-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-6">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          {/* 基本情報 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { icon: <MapPin className="w-4 h-4 text-[#1D9E75]" />, label: '開催場所', value: listing.location },
              { icon: <Calendar className="w-4 h-4 text-[#1D9E75]" />, label: 'イベント日', value: `${formatDate(listing.event_date)}${listing.event_end_date ? ` 〜 ${formatDate(listing.event_end_date)}` : ''}` },
              { icon: <Clock className="w-4 h-4 text-[#1D9E75]" />, label: '応募締切', value: formatDate(listing.application_deadline) },
              { icon: <Users className="w-4 h-4 text-[#1D9E75]" />, label: '募集台数', value: `${listing.max_applicants}台` },
              ...(listing.fee ? [{ icon: <Banknote className="w-4 h-4 text-[#1D9E75]" />, label: '出店料', value: listing.fee }] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
                  <div className="text-sm font-medium text-gray-800">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 詳細 */}
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1D9E75]" />
                案件詳細
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {listing.requirements && (
              <div>
                <h2 className="font-bold text-gray-800 mb-2">応募条件・注意事項</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.requirements}</p>
              </div>
            )}

            {listing.contact_info && (
              <div>
                <h2 className="font-bold text-gray-800 mb-2">お問い合わせ</h2>
                <p className="text-sm text-gray-600">{listing.contact_info}</p>
              </div>
            )}
          </div>

          {/* 応募ボタン */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            {listing.status !== 'open' ? (
              <div className="text-center text-gray-500 text-sm">この案件の募集は締め切られました</div>
            ) : applied ? (
              <div className="text-center bg-green-50 rounded-lg py-4 text-green-700 text-sm font-medium">
                応募済みです
              </div>
            ) : (
              <Button onClick={() => setApplyModal(true)} className="w-full" size="lg">
                この案件に応募する
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 応募モーダル */}
      {applyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4">応募する</h2>
            <p className="text-sm text-gray-600 mb-4">「{listing.title}」に応募します</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ（任意）</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="自己PRや質問などをご記入ください"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setApplyModal(false)}>キャンセル</Button>
              <Button className="flex-1" onClick={handleApply} disabled={loading}>
                {loading ? '送信中...' : '応募する'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
