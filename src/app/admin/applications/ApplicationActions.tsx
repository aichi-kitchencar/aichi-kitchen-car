'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, X, RotateCcw, MessageSquare } from 'lucide-react'
import type { ApplicationStatus } from '@/types'

interface Props {
  applicationId: string
  currentStatus: ApplicationStatus
}

export default function ApplicationActions({ applicationId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const updateStatus = async (status: ApplicationStatus) => {
    setLoading(true)
    await supabase
      .from('applications')
      .update({ status, admin_note: note || null })
      .eq('id', applicationId)
    setLoading(false)
    setShowNote(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      {showNote && (
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="コメントを入力（任意）"
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C0391B] w-48"
          autoFocus
        />
      )}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowNote(!showNote)}
          className="flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
          title="コメントを追加"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
        {currentStatus !== 'approved' && (
          <button
            onClick={() => updateStatus('approved')}
            disabled={loading}
            className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            確定
          </button>
        )}
        {currentStatus !== 'rejected' && (
          <button
            onClick={() => updateStatus('rejected')}
            disabled={loading}
            className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            否認
          </button>
        )}
        {currentStatus !== 'pending' && (
          <button
            onClick={() => updateStatus('pending')}
            disabled={loading}
            className="flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
