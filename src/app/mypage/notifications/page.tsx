'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import { Bell, CheckCheck, Megaphone } from 'lucide-react'
import Link from 'next/link'
import type { Notification } from '@/types'

interface NotifWithRead extends Notification {
  is_read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotifWithRead[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 通知一覧を取得
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false })

      if (!notifs || notifs.length === 0) {
        setLoading(false)
        return
      }

      // 既読済みIDを取得
      const { data: readRecords } = await supabase
        .from('read_notifications')
        .select('notification_id')
        .eq('user_id', user.id)

      const readIds = new Set((readRecords ?? []).map((r) => r.notification_id))

      const enriched: NotifWithRead[] = notifs.map((n) => ({
        ...n,
        is_read: readIds.has(n.id),
      }))
      setNotifications(enriched)
      setLoading(false)

      // 未読を全て既読にする
      const unreadIds = notifs
        .filter((n) => !readIds.has(n.id))
        .map((n) => ({ user_id: user.id, notification_id: n.id }))

      if (unreadIds.length > 0) {
        await supabase.from('read_notifications').upsert(unreadIds, { onConflict: 'user_id,notification_id' })
        // 既読にしたのでis_readをtrueに更新
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      }
    }
    load()
  }, [])

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const unread = notifications.filter((n) => !n.is_read)
    if (unread.length === 0) return
    const records = unread.map((n) => ({ user_id: user.id, notification_id: n.id }))
    await supabase.from('read_notifications').upsert(records, { onConflict: 'user_id,notification_id' })
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#C0391B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#C0391B]" />
          <h2 className="font-bold text-gray-800">通知</h2>
          {unreadCount > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}件未読
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#C0391B] transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            すべて既読にする
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">通知はありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                !notif.is_read
                  ? 'border-orange-300 border-l-4 border-l-orange-500'
                  : 'border-gray-100'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Megaphone className="w-4 h-4 text-[#C0391B] flex-shrink-0" />
                    <span className="font-medium text-gray-800 text-sm">{notif.event_title}</span>
                    {!notif.is_read && (
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatDateTime(notif.sent_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-6">{notif.message}</p>
                {notif.event_id && (
                  <div className="pl-6 mt-2">
                    <Link
                      href={`/listings/${notif.event_id}`}
                      className="text-xs text-[#C0391B] hover:underline"
                    >
                      案件を見る →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
