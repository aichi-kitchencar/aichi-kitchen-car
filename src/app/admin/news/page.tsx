import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { Plus, Pencil } from 'lucide-react'
import NewsToggleButton from './NewsToggleButton'
import DeleteNewsButton from './DeleteNewsButton'
import type { News } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function AdminNewsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/news')


  const { filter } = await searchParams

  let query = supabase.from('news').select('*').order('created_at', { ascending: false })
  if (filter === 'published') query = query.eq('published', true)
  if (filter === 'draft') query = query.eq('published', false)

  const { data: newsList } = await query

  const tabs = [
    { value: 'all', label: 'すべて' },
    { value: 'published', label: '公開中' },
    { value: 'draft', label: '下書き' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">ニュース管理</h2>
        <Link
          href="/admin/news/create"
          className="flex items-center gap-1.5 bg-[#C0391B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#a83016] transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規投稿
        </Link>
      </div>

      {/* フィルタタブ */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={tab.value === 'all' ? '/admin/news' : `/admin/news?filter=${tab.value}`}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              (filter ?? 'all') === tab.value
                ? 'bg-[#C0391B] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#C0391B] hover:text-[#C0391B]'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* ニュースリスト */}
      <div className="space-y-3">
        {newsList && newsList.length > 0 ? newsList.map((news: News) => (
          <div key={news.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between p-4 gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    news.published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {news.published ? '公開中' : '下書き'}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {news.category}
                  </span>
                  <span className="text-xs text-gray-400">{formatDateTime(news.created_at)}</span>
                </div>
                <h3 className="font-medium text-gray-800 text-sm mb-1">{news.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{news.content}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/admin/news/${news.id}/edit`}
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  編集
                </Link>
                <NewsToggleButton newsId={news.id} currentPublished={news.published} />
                <DeleteNewsButton newsId={news.id} />
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            <p>ニュースがありません</p>
            <Link href="/admin/news/create" className="text-[#C0391B] text-sm mt-2 inline-block hover:underline">
              最初のニュースを投稿する
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
