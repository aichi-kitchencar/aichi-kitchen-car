'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

const NEWS_CATEGORIES = ['お知らせ', 'イベント情報', '会員向け', '協会からのお知らせ']

export default function EditNewsPage() {
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState({ title: '', content: '', category: 'お知らせ', published: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('news').select('*').eq('id', id).single()
      if (data) setForm({ title: data.title, content: data.content, category: data.category, published: data.published })
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('news').update(form).eq('id', id)
    if (error) {
      setError('更新に失敗しました')
      setLoading(false)
      return
    }
    router.push('/admin/news')
  }

  return (
    <div>
      <Link href="/admin/news" className="flex items-center gap-1 text-gray-500 hover:text-[#1D9E75] text-sm mb-4">
        <ArrowLeft className="w-4 h-4" />戻る
      </Link>
      <h2 className="font-bold text-gray-800 mb-4">ニュース編集</h2>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4 accent-[#1D9E75]" />
                公開する
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">本文 *</label>
            <textarea
              value={form.content}
              onChange={e => setForm({...form, content: e.target.value})}
              required
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Link href="/admin/news">
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
