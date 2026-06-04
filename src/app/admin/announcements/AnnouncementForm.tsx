'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function AnnouncementForm({ authorId }: { authorId: string }) {
  const [form, setForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('announcements').insert({
      title: form.title,
      content: form.content,
      author: authorId,
    })

    if (error) {
      setError('追加に失敗しました')
      setLoading(false)
      return
    }

    setForm({ title: '', content: '' })
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">{error}</div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">タイトル *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          placeholder="お知らせのタイトル"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">内容 *</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
          rows={3}
          placeholder="お知らせの内容"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0391B] resize-none"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? '追加中...' : 'お知らせを追加'}
      </Button>
    </form>
  )
}
