'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { PRODUCT_CATEGORIES, ALLERGENS } from '@/types'
import { Plus, Trash2, X, ShoppingBag } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { Product, Profile } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '主食' as Product['category'],
    allergens: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      setProfile(p)
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setProducts(prods ?? [])
    }
    load()
  }, [])

  const toggleAllergen = (allergen: string) => {
    setForm((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setLoading(true)

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: profile.id,
        name: form.name,
        price: Number(form.price),
        category: form.category,
        allergens: form.allergens,
      })
      .select()
      .single()

    if (!error && data) {
      setProducts([data, ...products])
      setModal(false)
      setForm({ name: '', price: '', category: '主食', allergens: [] })
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この商品を削除しますか？')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(products.filter((p) => p.id !== id))
  }

  if (profile?.status !== 'approved') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-6 text-sm">
        会員審査が完了すると商品の登録・管理ができます。
      </div>
    )
  }

  const categoryColors: Record<string, string> = {
    '主食': 'bg-orange-100 text-orange-700',
    'スイーツ': 'bg-pink-100 text-pink-700',
    'ドリンク': 'bg-blue-100 text-blue-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#C0391B]" />
          <h2 className="font-bold text-gray-800">商品管理</h2>
        </div>
        <Button onClick={() => setModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          商品を追加
        </Button>
      </div>

      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{product.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[product.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {product.category}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#C0391B]">{formatPrice(product.price)}</p>
                  {product.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs text-gray-400">アレルゲン:</span>
                      {product.allergens.map((a) => (
                        <span key={a} className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-3 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm">商品が登録されていません</p>
          <button onClick={() => setModal(true)} className="text-[#C0391B] text-sm mt-2 hover:underline">
            最初の商品を追加する
          </button>
        </div>
      )}

      {/* 追加モーダル */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">商品を追加</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="例: 焼きそば"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">価格（円）*</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="0"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">アレルゲン</label>
                <div className="grid grid-cols-4 gap-2">
                  {ALLERGENS.map((allergen) => (
                    <label
                      key={allergen}
                      className={`flex items-center justify-center py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        form.allergens.includes(allergen)
                          ? 'bg-red-500 text-white border-red-500'
                          : 'border-gray-200 text-gray-600 hover:border-red-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.allergens.includes(allergen)}
                        onChange={() => toggleAllergen(allergen)}
                        className="hidden"
                      />
                      {allergen}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(false)}>
                  キャンセル
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? '追加中...' : '追加する'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
