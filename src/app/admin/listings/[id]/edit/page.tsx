'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { LISTING_CATEGORIES } from '@/types'
import { ArrowLeft, Plus, X } from 'lucide-react'
import type { Listing } from '@/types'

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState({
    title: '', description: '', location: '', prefecture: '愛知県',
    category: '', application_deadline: '',
    max_applicants: '1', fee: '', requirements: '', contact_info: '', status: 'open',
  })
  const [eventDates, setEventDates] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).maybeSingle() as { data: Listing | null }
      if (data) {
        setForm({
          title: data.title, description: data.description, location: data.location,
          prefecture: data.prefecture, category: data.category,
          application_deadline: data.application_deadline,
          max_applicants: String(data.max_applicants), fee: data.fee || '',
          requirements: data.requirements || '', contact_info: data.contact_info || '',
          status: data.status,
        })
        setEventDates(
          data.event_dates && data.event_dates.length > 0
            ? data.event_dates
            : [data.event_date]
        )
      }
    }
    load()
  }, [id])

  const addDate = () => setEventDates([...eventDates, ''])
  const removeDate = (i: number) => setEventDates(eventDates.filter((_, idx) => idx !== i))
  const updateDate = (i: number, val: string) => {
    const next = [...eventDates]
    next[i] = val
    setEventDates(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const sortedDates = [...eventDates].filter(d => d).sort()
    if (sortedDates.length === 0) {
      setError('出店日程を1つ以上入力してください')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('listings').update({
      ...form,
      event_date: sortedDates[0],
      event_end_date: sortedDates.length > 1 ? sortedDates[sortedDates.length - 1] : null,
      event_dates: sortedDates,
      max_applicants: Number(form.max_applicants),
      fee: form.fee || null,
      requirements: form.requirements || null,
      contact_info: form.contact_info || null,
    }).eq('id', id)

    if (error) {
      setError('更新に失敗しました')
      setLoading(false)
      return
    }
    router.push('/admin/listings')
  }

  const f = (field: string, value: string) => setForm({...form, [field]: value})

  return (
    <div>
      <Link href="/admin/listings" className="flex items-center gap-1 text-gray-500 hover:text-[#1D9E75] text-sm mb-4">
        <ArrowLeft className="w-4 h-4" />戻る
      </Link>
      <h2 className="font-bold text-gray-800 mb-4">案件編集</h2>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select value={form.status} onChange={e => f('status', e.target.value)}>
              <option value="open">募集中</option>
              <option value="closed">締め切り</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">案件タイトル *</label>
            <input type="text" value={form.title} onChange={e => f('title', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">詳細説明 *</label>
            <textarea value={form.description} onChange={e => f('description', e.target.value)} required rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開催場所 *</label>
              <input type="text" value={form.location} onChange={e => f('location', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
              <select value={form.category} onChange={e => f('category', e.target.value)} required>
                <option value="">選択してください</option>
                {LISTING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">出店日程 *</label>
            <div className="space-y-2">
              {eventDates.map((date, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={e => updateDate(i, e.target.value)}
                    required
                    className="flex-1"
                  />
                  {eventDates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDate(i)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="この日付を削除"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDate}
                className="flex items-center gap-1 text-sm text-[#C0391B] hover:underline mt-1"
              >
                <Plus className="w-4 h-4" />
                日付を追加
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">応募締切 *</label>
              <input type="date" value={form.application_deadline} onChange={e => f('application_deadline', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">募集台数 *</label>
              <input type="number" value={form.max_applicants} onChange={e => f('max_applicants', e.target.value)} required min="1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出店料</label>
            <input type="text" value={form.fee} onChange={e => f('fee', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">応募条件・注意事項</label>
            <textarea value={form.requirements} onChange={e => f('requirements', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">問い合わせ先</label>
            <input type="text" value={form.contact_info} onChange={e => f('contact_info', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Link href="/admin/listings">
              <Button type="button" variant="secondary">キャンセル</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? '更新中...' : '変更を保存する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
