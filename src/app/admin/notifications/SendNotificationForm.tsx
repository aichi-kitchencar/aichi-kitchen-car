'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Send } from 'lucide-react'

interface Props {
  listings: { id: string; title: string; event_date: string }[]
  sentBy: string
}

export default function SendNotificationForm({ listings, sentBy }: Props) {
  const [form, setForm] = useState({ event_id: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const selectedListing = listings.find((l) => l.id === form.event_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.event_id || !form.message.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.from('notifications').insert({
      event_id: form.event_id,
      event_title: selectedListing?.title ?? '',
      message: form.message,
      sent_by: sentBy,
    })

    if (error) {
      setError('通知の送信に失敗しました')
      setLoading(false)
      return
    }

    setSuccess('全正会員へ通知を送信しました')
    setForm({ event_id: '', message: '' })
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          対象案件 <span className="text-red-500">*</span>
        </label>
        <select
          value={form.event_id}
          onChange={(e) => setForm({ ...form, event_id: e.target.value })}
          required
        >
          <option value="">案件を選択してください</option>
          {listings.map((listing) => (
            <option key={listing.id} value={listing.id}>
              {listing.title}
            </option>
          ))}
        </select>
        {listings.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">募集中の案件がありません</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メッセージ <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          rows={4}
          placeholder="会員に送るメッセージを入力してください（全正会員に送信されます）"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0391B] resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={loading || !form.event_id || !form.message.trim()}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? '送信中...' : '全正会員へ通知を送信'}
        </Button>
        <p className="text-xs text-gray-400">※ 承認済みの全会員に送信されます</p>
      </div>
    </form>
  )
}
