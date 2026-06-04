'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, X, RotateCcw } from 'lucide-react'
import type { ProfileStatus } from '@/types'

interface Props {
  memberId: string
  currentStatus: ProfileStatus
}

export default function MemberActions({ memberId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const updateStatus = async (status: ProfileStatus) => {
    setLoading(true)
    await supabase.from('profiles').update({ status }).eq('id', memberId)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {currentStatus !== 'approved' && (
        <button
          onClick={() => updateStatus('approved')}
          disabled={loading}
          className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          承認
        </button>
      )}
      {currentStatus !== 'rejected' && (
        <button
          onClick={() => updateStatus('rejected')}
          disabled={loading}
          className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
          却下
        </button>
      )}
      {currentStatus !== 'pending' && (
        <button
          onClick={() => updateStatus('pending')}
          disabled={loading}
          className="flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          戻す
        </button>
      )}
    </div>
  )
}
