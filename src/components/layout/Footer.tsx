import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 団体情報 */}
          <div>
            <div className="mb-4">
              <Image
                src="/logo-icon.png"
                alt="一般社団法人あいちキッチンカー協会"
                width={200}
                height={60}
                className="h-10 w-auto object-contain"
                style={{ mixBlendMode: 'darken' }}
              />
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C0391B] flex-shrink-0 mt-0.5" />
                <div>
                  <p>〒450-0002</p>
                  <p>愛知県名古屋市中村区名駅３丁目４番１０号</p>
                  <p>アルティメイト名駅１ｓｔ２階</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C0391B] flex-shrink-0" />
                <a
                  href="mailto:info@aichi-kitchencar.com"
                  className="hover:text-[#C0391B] transition-colors"
                >
                  info@aichi-kitchencar.com
                </a>
              </div>
            </div>
          </div>

          {/* サービス */}
          <div>
            <h3 className="text-white font-semibold mb-3">サービス</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/listings" className="hover:text-[#C0391B] transition-colors">
                  募集案件一覧
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#C0391B] transition-colors">
                  会員登録
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[#C0391B] transition-colors">
                  ログイン
                </Link>
              </li>
            </ul>
          </div>

          {/* 協会について */}
          <div>
            <h3 className="text-white font-semibold mb-3">協会について</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              愛知県のキッチンカー事業者を支援する協会です。
              イベント出店機会の提供や会員同士の交流を促進しています。
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-sm text-gray-500">
            © 2024 一般社団法人あいちキッチンカー協会 All rights reserved.
          </span>
          <Link
            href="/auth/login"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            管理者ログイン
          </Link>
        </div>
      </div>
    </footer>
  )
}
