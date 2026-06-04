'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export default function DeleteAnnouncementButton({ announcementId }: { announcementId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('このお知らせを削除しますか？')) return
    setLoading(true)
    await supabase.from('announcements').delete().eq('id', announcementId)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
    >
      <Trash2 className="w-3.5 h-3.5" />
      削除
    </button>
  )
}
