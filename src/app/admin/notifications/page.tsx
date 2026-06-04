import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { Bell, Send } from 'lucide-react'
import SendNotificationForm from './SendNotificationForm'
import type { Listing, Notification } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/notifications')


  const [{ data: listings }, { data: notifications }] = await Promise.all([
    supabase.from('listings').select('id, title, event_date').eq('status', 'open').order('event_date'),
    supabase.from('notifications').select('*').order('sent_at', { ascending: false }).limit(20),
  ])

  // 通知ごとの既読数を取得
  const notifIds = (notifications ?? []).map((n: Notification) => n.id)
  let readCountMap = new Map<string, number>()
  if (notifIds.length > 0) {
    const { data: readRecords } = await supabase
      .from('read_notifications')
      .select('notification_id')
      .in('notification_id', notifIds)

    readRecords?.forEach((r) => {
      readCountMap.set(r.notification_id, (readCountMap.get(r.notification_id) ?? 0) + 1)
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-[#C0391B]" />
        <h2 className="text-lg font-bold text-gray-800">案件通知送信</h2>
      </div>

      {/* 通知送信フォーム */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-4 h-4 text-[#C0391B]" />
          <h3 className="font-bold text-gray-700 text-sm">全正会員へ一斉通知</h3>
        </div>
        <SendNotificationForm listings={listings ?? []} sentBy={user.id} />
      </div>

      {/* 送信済み通知履歴 */}
      <div>
        <h3 className="font-bold text-gray-700 text-sm mb-3">送信履歴</h3>
        <div className="space-y-3">
          {notifications && notifications.length > 0 ? (
            notifications.map((notif: Notification) => (
              <div key={notif.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-gray-800 text-sm">{notif.event_title}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatDateTime(notif.sent_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{notif.message}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    既読: {readCountMap.get(notif.id) ?? 0}人
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm bg-white rounded-xl border border-gray-200">
              送信履歴がありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
