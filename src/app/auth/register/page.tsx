'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Plus, X, FileText, ChevronLeft } from 'lucide-react'

type UploadCategory = '車検証' | '営業許可証' | 'PL保険' | 'キッチンカー外観' | '商材の写真'

interface FileEntry {
  file: File
  preview: string
}

const UPLOAD_CONFIGS: { category: UploadCategory; label: string; max: number }[] = [
  { category: '車検証', label: '車検証', max: 10 },
  { category: '営業許可証', label: '営業許可証', max: 10 },
  { category: 'PL保険', label: 'PL保険', max: 1 },
  { category: 'キッチンカー外観', label: 'キッチンカー外観', max: 1 },
  { category: '商材の写真', label: '商材の写真', max: 3 },
]

const ACTIVITY_AREAS = ['名古屋市内', '尾張（名古屋市外）', '三河地域', '愛知県全域']

const EMPTY_FILES: Record<UploadCategory, FileEntry[]> = {
  '車検証': [],
  '営業許可証': [],
  'PL保険': [],
  'キッチンカー外観': [],
  '商材の写真': [],
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    sei: '',
    mei: '',
    company_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    activity_area: '',
    description: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [files, setFiles] = useState<Record<UploadCategory, FileEntry[]>>(EMPTY_FILES)
  const fileInputRefs = useRef<Partial<Record<UploadCategory, HTMLInputElement>>>({})
  const supabase = createClient()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileSelect = (category: UploadCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    const config = UPLOAD_CONFIGS.find((c) => c.category === category)!
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    const existing = files[category]
    const remaining = config.max - existing.length
    const toAdd = selected.slice(0, remaining).map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    }))

    setFiles((prev) => ({ ...prev, [category]: [...existing, ...toAdd] }))
    e.target.value = ''
  }

  const handleRemoveFile = (category: UploadCategory, index: number) => {
    setFiles((prev) => {
      const updated = [...prev[category]]
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return { ...prev, [category]: updated }
    })
  }

  const uploadAllFiles = async (userId: string) => {
    for (const config of UPLOAD_CONFIGS) {
      for (const entry of files[config.category]) {
        const ext = entry.file.name.split('.').pop()
        const filePath = `${userId}/${config.category}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, entry.file, { upsert: false })
        if (uploadError) continue
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)
        await supabase.from('documents').insert({
          user_id: userId,
          category: config.category,
          file_url: publicUrl,
          file_name: entry.file.name,
        })
      }
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }
    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      setLoading(false)
      return
    }

    const owner_name = `${formData.sei} ${formData.mei}`.trim()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          company_name: formData.company_name,
          owner_name,
          phone: formData.phone,
          activity_area: formData.activity_area,
          description: formData.description,
        },
      },
    })

    if (signUpError) {
      setError(
        signUpError.message === 'User already registered'
          ? 'このメールアドレスは既に登録されています'
          : '登録に失敗しました。もう一度お試しください。'
      )
      setLoading(false)
      return
    }

    if (data.user) {
      await uploadAllFiles(data.user.id)
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo-icon.png"
                alt="あいちキッチンカー協会"
                width={200}
                height={60}
                className="h-14 w-auto object-contain"
                style={{ mixBlendMode: 'darken' }}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">登録申請を受け付けました</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              確認メールをお送りしました。メール内のリンクをクリックしてメールアドレスを確認してください。
              その後、担当者による審査（約3営業日）が完了すると出店案件への応募が可能になります。
            </p>
            <Link href="/" className="text-[#ea580c] font-medium hover:underline text-sm">
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          トップに戻る
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <Image
              src="/logo-icon.png"
              alt="あいちキッチンカー協会"
              width={240}
              height={72}
              className="h-16 w-auto object-contain"
              style={{ mixBlendMode: 'darken' }}
              priority
            />
            <span className="text-sm font-medium text-gray-700">一般社団法人 あいちキッチンカー協会</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">新規会員登録</h1>
            <p className="text-sm text-gray-500 mt-1">入会費・年会費無料でご利用いただけます</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* 姓・名 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sei"
                  value={formData.sei}
                  onChange={handleChange}
                  required
                  placeholder="山田"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mei"
                  value={formData.mei}
                  onChange={handleChange}
                  required
                  placeholder="太郎"
                />
              </div>
            </div>

            {/* 屋号・ビジネス名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                屋号・ビジネス名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="○○キッチンカー"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
              />
            </div>

            {/* 電話番号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="090-0000-0000"
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="8文字以上"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* パスワード（確認） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="パスワードを再入力"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 活動エリア */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動エリア <span className="text-xs text-gray-400">（任意）</span>
              </label>
              <select
                name="activity_area"
                value={formData.activity_area}
                onChange={handleChange}
              >
                <option value="">選択してください</option>
                {ACTIVITY_AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* 書類・写真アップロード */}
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-base font-semibold text-gray-800 mb-1">書類・写真のアップロード</h2>
              <p className="text-xs text-gray-500 mb-4">
                JPG・PNG・PDF形式、各ファイル10MB以内。登録後にマイページから追加・変更もできます。
              </p>

              <div className="space-y-5">
                {UPLOAD_CONFIGS.map((config) => {
                  const entries = files[config.category]
                  const canAdd = entries.length < config.max
                  const maxLabel =
                    config.max === 1 ? '（1枚）' : config.max === 3 ? '（3枚まで）' : '（複数可）'

                  return (
                    <div key={config.category}>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {config.label}
                        <span className="text-xs text-gray-400 ml-1">{maxLabel}</span>
                      </p>

                      {entries.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {entries.map((entry, idx) => (
                            <div key={idx} className="relative group">
                              {entry.preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={entry.preview}
                                  alt={entry.file.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center gap-1">
                                  <FileText className="w-5 h-5 text-gray-400" />
                                  <span className="text-[10px] text-gray-400">PDF</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(config.category, idx)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {canAdd && (
                        <>
                          <input
                            ref={(el) => {
                              if (el) fileInputRefs.current[config.category] = el
                            }}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            multiple={config.max > 1}
                            onChange={(e) => handleFileSelect(config.category, e)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[config.category]?.click()}
                            className="flex items-center gap-1.5 text-sm text-[#ea580c] border border-dashed border-[#ea580c] rounded-lg px-3 py-2.5 hover:bg-orange-50 transition-colors w-full justify-center"
                          >
                            <Plus className="w-4 h-4" />
                            タップして選択
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 店舗PR */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗PR <span className="text-xs text-gray-400">（任意）</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="お店のPRや特徴をご記入ください"
              />
            </div>

            {/* 審査の注意書き */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-xs text-orange-800 leading-relaxed">
              登録後、担当者による審査（約3営業日）が完了すると出店案件への応募が可能になります。
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ea580c] text-white rounded-lg py-3 text-base font-semibold hover:bg-[#c2410c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登録中...' : '会員登録する（無料）'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            既に会員の方は{' '}
            <Link href="/auth/login" className="text-[#ea580c] font-medium hover:underline">
              ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
