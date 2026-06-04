import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { Plus } from 'lucide-react'
import AnnouncementForm from './AnnouncementForm'
import DeleteAnnouncementButton from './DeleteAnnouncementButton'
import type { Announcement } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/announcements')


  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('published_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">お知らせ管理</h2>
        <span className="text-sm text-gray-500">{announcements?.length ?? 0}件</span>
      </div>

      {/* 新規追加フォーム */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-[#C0391B]" />
          <h3 className="font-bold text-gray-700 text-sm">お知らせを追加</h3>
        </div>
        <AnnouncementForm authorId={user.id} />
      </div>

      {/* お知らせリスト */}
      <div className="space-y-3">
        {announcements && announcements.length > 0 ? (
          announcements.map((ann: Announcement) => (
            <div key={ann.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-800 text-sm">{ann.title}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDateTime(ann.published_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{ann.content}</p>
                </div>
                <DeleteAnnouncementButton announcementId={ann.id} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200">
            お知らせがありません
          </div>
        )}
      </div>
    </div>
  )
}
