'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')

      if (!notifications || notifications.length === 0) {
        setUnreadCount(0)
        return
      }

      const notifIds = notifications.map((n) => n.id)
      const { data: read } = await supabase
        .from('read_notifications')
        .select('notification_id')
        .eq('user_id', userId)
        .in('notification_id', notifIds)

      const readIds = new Set((read ?? []).map((r) => r.notification_id))
      const unread = notifIds.filter((id) => !readIds.has(id)).length
      setUnreadCount(unread)
    }

    fetchUnread()

    // リアルタイム購読: 新通知が来たらバッジを更新
    const channel = supabase
      .channel('notifications-bell')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        setUnreadCount((c) => c + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return (
    <Link
      href="/mypage/notifications"
      className="relative p-2 text-gray-600 hover:text-[#C0391B] transition-colors"
      aria-label="通知"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
