'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { LISTING_CATEGORIES } from '@/types'
import { ArrowLeft } from 'lucide-react'

export default function CreateListingPage() {
  const [form, setForm] = useState({
    title: '', description: '', location: '', prefecture: '愛知県',
    category: '', event_date: '', event_end_date: '', application_deadline: '',
    max_applicants: '1', fee: '', requirements: '', contact_info: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('listings').insert({
      ...form,
      max_applicants: Number(form.max_applicants),
      event_end_date: form.event_end_date || null,
      fee: form.fee || null,
      requirements: form.requirements || null,
      contact_info: form.contact_info || null,
      created_by: user.id,
      status: 'open',
    })

    if (error) {
      setError('案件の作成に失敗しました')
      setLoading(false)
      return
    }

    router.push('/admin/listings')
  }

  const f = (field: string, value: string) => setForm({...form, [field]: value})

  return (
    <div>
      <Link href="/admin/listings" className="flex items-center gap-1 text-gray-500 hover:text-[#C0391B] text-sm mb-4">
        <ArrowLeft className="w-4 h-4" />戻る
      </Link>
      <h2 className="font-bold text-gray-800 mb-4">新規案件作成</h2>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">案件タイトル *</label>
            <input type="text" value={form.title} onChange={e => f('title', e.target.value)} required placeholder="例: 〇〇フードフェス出店者募集" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">詳細説明 *</label>
            <textarea value={form.description} onChange={e => f('description', e.target.value)} required rows={4} placeholder="イベントの詳細、特徴などをご記入ください" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0391B] resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開催場所 *</label>
              <input type="text" value={form.location} onChange={e => f('location', e.target.value)} required placeholder="例: 名古屋市中区久屋大通公園" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
              <select value={form.category} onChange={e => f('category', e.target.value)} required>
                <option value="">選択してください</option>
                {LISTING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">イベント開始日 *</label>
              <input type="date" value={form.event_date} onChange={e => f('event_date', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">イベント終了日</label>
              <input type="date" value={form.event_end_date} onChange={e => f('event_end_date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">応募締切 *</label>
              <input type="date" value={form.application_deadline} onChange={e => f('application_deadline', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">募集台数 *</label>
              <input type="number" value={form.max_applicants} onChange={e => f('max_applicants', e.target.value)} required min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出店料</label>
              <input type="text" value={form.fee} onChange={e => f('fee', e.target.value)} placeholder="例: 無料 / 5,000円/日" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">応募条件・注意事項</label>
            <textarea value={form.requirements} onChange={e => f('requirements', e.target.value)} rows={3} placeholder="必要な許可証、設備要件など" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0391B] resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">問い合わせ先</label>
            <input type="text" value={form.contact_info} onChange={e => f('contact_info', e.target.value)} placeholder="担当者名・連絡先など" />
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/admin/listings">
              <Button type="button" variant="secondary">キャンセル</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? '作成中...' : '案件を作成する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
