'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function GrantAdminButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGrant = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: true, status: 'approved' })
      .eq('id', userId)

    if (error) {
      alert(`エラー: ${error.message}`)
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
    router.refresh()
  }

  if (done) {
    return (
      <p className="text-green-700 text-sm font-bold">
        ✅ is_admin = true に設定しました。ページをリロードしてください。
      </p>
    )
  }

  return (
    <button
      onClick={handleGrant}
      disabled={loading}
      className="bg-yellow-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
    >
      {loading ? '設定中...' : '自分を管理者に設定する (is_admin = true)'}
    </button>
  )
}
