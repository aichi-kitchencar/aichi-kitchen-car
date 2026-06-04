'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

interface Props {
  newsId: string
  currentPublished: boolean
}

export default function NewsToggleButton({ newsId, currentPublished }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleToggle = async () => {
    setLoading(true)
    await supabase.from('news').update({ published: !currentPublished }).eq('id', newsId)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
        currentPublished
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          : 'bg-green-100 text-green-700 hover:bg-green-200'
      }`}
    >
      {currentPublished ? (
        <><EyeOff className="w-3.5 h-3.5" />非公開</>
      ) : (
        <><Eye className="w-3.5 h-3.5" />公開</>
      )}
    </button>
  )
}
