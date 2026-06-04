'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { BUSINESS_TYPES } from '@/types'
import type { Profile } from '@/types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({
    company_name: '',
    owner_name: '',
    phone: '',
    address: '',
    business_type: '',
    vehicle_count: '1',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({
          company_name: data.company_name || '',
          owner_name: data.owner_name || '',
          phone: data.phone || '',
          address: data.address || '',
          business_type: data.business_type || '',
          vehicle_count: String(data.vehicle_count || 1),
          description: data.description || '',
        })
      }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error } = await supabase.from('profiles').update({
      company_name: form.company_name,
      owner_name: form.owner_name,
      phone: form.phone,
      address: form.address,
      business_type: form.business_type,
      vehicle_count: Number(form.vehicle_count),
      description: form.description,
    }).eq('id', profile.id)

    if (error) {
      setError('更新に失敗しました')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (!profile) {
    return <div className="text-center py-10 text-gray-500 text-sm">読み込み中...</div>
  }

  return (
    <div>
      <h2 className="font-bold text-gray-800 mb-4">登録情報</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#C0391B] text-white flex items-center justify-center text-lg font-bold">
            {profile.company_name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-800">{profile.email}</p>
            <p className="text-xs text-gray-500">登録日: {new Date(profile.created_at).toLocaleDateString('ja-JP')}</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
            登録情報を更新しました
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">屋号・店名 *</label>
              <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">代表者名 *</label>
              <input type="text" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">キッチンカー台数</label>
              <input type="number" value={form.vehicle_count} onChange={e => setForm({...form, vehicle_count: e.target.value})} min="1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">業態</label>
              <select value={form.business_type} onChange={e => setForm({...form, business_type: e.target.value})}>
                <option value="">選択してください</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
              <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="愛知県名古屋市..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介・PR</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={3}
              placeholder="キッチンカーの特徴や得意料理などをご記入ください"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0391B] resize-none"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '変更を保存'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
