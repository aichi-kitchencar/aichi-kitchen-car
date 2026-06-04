'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DOCUMENT_CATEGORIES } from '@/types'
import { Upload, Trash2, FileText, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Document, Profile } from '@/types'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [uploading, setUploading] = useState<string | null>(null) // category being uploaded
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadCategory, setUploadCategory] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setDocuments(docs ?? [])
    }
    load()
  }, [])

  const handleUploadClick = (category: string) => {
    setUploadCategory(category)
    setError('')
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile || !uploadCategory) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('ファイルサイズは10MB以内にしてください')
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      setError('JPG・PNG・WebP・PDFファイルのみアップロードできます')
      return
    }

    setUploading(uploadCategory)
    setError('')

    const ext = file.name.split('.').pop()
    const filePath = `${profile.id}/${uploadCategory}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { upsert: false })

    if (uploadError) {
      setError(`アップロードに失敗しました: ${uploadError.message}`)
      setUploading(null)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)

    const { data: docRecord } = await supabase
      .from('documents')
      .insert({
        user_id: profile.id,
        category: uploadCategory,
        file_url: publicUrl,
        file_name: file.name,
      })
      .select()
      .single()

    if (docRecord) {
      setDocuments([docRecord, ...documents])
    }

    setUploading(null)
    e.target.value = ''
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm(`「${doc.file_name}」を削除しますか？`)) return

    // Storageからも削除
    const urlParts = doc.file_url.split('/storage/v1/object/public/documents/')
    if (urlParts[1]) {
      await supabase.storage.from('documents').remove([urlParts[1]])
    }

    await supabase.from('documents').delete().eq('id', doc.id)
    setDocuments(documents.filter((d) => d.id !== doc.id))
  }

  const getDocsByCategory = (category: string) =>
    documents.filter((d) => d.category === category)

  const isImage = (fileName: string) =>
    /\.(jpg|jpeg|png|webp)$/i.test(fileName)

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <FileText className="w-5 h-5 text-[#C0391B]" />
        <h2 className="font-bold text-gray-800">書類管理</h2>
      </div>

      <p className="text-xs text-gray-500 mb-5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        JPG・PNG・PDF形式、各ファイル10MB以内でアップロードできます。
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* 非表示ファイルインプット */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="space-y-4">
        {DOCUMENT_CATEGORIES.map((category) => {
          const docs = getDocsByCategory(category)
          const isUploading = uploading === category

          return (
            <div key={category} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C0391B]" />
                  <span className="font-medium text-sm text-gray-800">{category}</span>
                  <span className="text-xs text-gray-400">({docs.length}件)</span>
                </div>
                <button
                  onClick={() => handleUploadClick(category)}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#C0391B] hover:bg-green-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <><span className="w-3.5 h-3.5 border border-[#C0391B] border-t-transparent rounded-full animate-spin" />アップロード中...</>
                  ) : (
                    <><Upload className="w-3.5 h-3.5" />アップロード</>
                  )}
                </button>
              </div>

              {docs.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {isImage(doc.file_name) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={doc.file_url}
                            alt={doc.file_name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-gray-800 truncate font-medium">{doc.file_name}</p>
                          <p className="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-[#C0391B] transition-colors"
                          title="開く"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-xs text-gray-400 text-center">
                  まだアップロードされていません
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
