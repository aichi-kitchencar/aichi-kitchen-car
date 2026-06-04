'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { MENU_CATEGORIES } from '@/types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import type { Menu, Profile } from '@/types'

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [modal, setModal] = useState(false)
  const [editMenu, setEditMenu] = useState<Menu | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', available: true })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      setProfile(p)
      const { data: m } = await supabase.from('menus').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
      setMenus(m || [])
    }
    load()
  }, [])

  const openCreate = () => {
    setEditMenu(null)
    setForm({ name: '', description: '', price: '', category: '', available: true })
    setModal(true)
  }

  const openEdit = (menu: Menu) => {
    setEditMenu(menu)
    setForm({ name: menu.name, description: menu.description || '', price: String(menu.price), category: menu.category, available: menu.available })
    setModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setLoading(true)

    const payload = { name: form.name, description: form.description, price: Number(form.price), category: form.category, available: form.available, owner_id: profile.id }

    if (editMenu) {
      const { data } = await supabase.from('menus').update(payload).eq('id', editMenu.id).select().single()
      if (data) setMenus(menus.map(m => m.id === editMenu.id ? data : m))
    } else {
      const { data } = await supabase.from('menus').insert(payload).select().single()
      if (data) setMenus([data, ...menus])
    }

    setModal(false)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このメニューを削除しますか？')) return
    await supabase.from('menus').delete().eq('id', id)
    setMenus(menus.filter(m => m.id !== id))
  }

  if (profile?.status !== 'approved') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-6 text-sm">
        会員審査が完了するとメニューの登録・管理ができます。
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-800">メニュー管理</h2>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          メニュー追加
        </Button>
      </div>

      {menus.length > 0 ? (
        <div className="space-y-3">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800 text-sm">{menu.name}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{menu.category}</span>
                  {!menu.available && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">非公開</span>}
                </div>
                <p className="text-xs text-gray-500 mb-1">{menu.description}</p>
                <p className="text-sm font-bold text-[#C0391B]">{formatPrice(menu.price)}</p>
              </div>
              <div className="flex gap-2 ml-3 flex-shrink-0">
                <button onClick={() => openEdit(menu)} className="p-1.5 text-gray-400 hover:text-[#C0391B] transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(menu.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">
          <p className="text-sm">メニューが登録されていません</p>
          <button onClick={openCreate} className="text-[#C0391B] text-sm mt-2 hover:underline">
            最初のメニューを追加する
          </button>
        </div>
      )}

      {/* モーダル */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">{editMenu ? 'メニュー編集' : 'メニュー追加'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メニュー名 *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="例: 焼きそば" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">価格（円）*</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="0" placeholder="500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                    <option value="">選択</option>
                    {MENU_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} placeholder="メニューの説明" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0391B] resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="available" checked={form.available} onChange={e => setForm({...form, available: e.target.checked})} className="w-4 h-4 accent-[#C0391B]" />
                <label htmlFor="available" className="text-sm text-gray-700">公開する</label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(false)}>キャンセル</Button>
                <Button type="submit" className="flex-1" disabled={loading}>{loading ? '保存中...' : '保存する'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
