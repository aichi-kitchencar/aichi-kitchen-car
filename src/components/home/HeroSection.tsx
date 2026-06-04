'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

const HERO_BG =
  'https://cdn.peraichi.com/userData/97174ed4-5c7f-4c1f-ba59-c53dfbee88dd/img/13a12000-fc23-013d-98f3-0a58a9feac02/465789230_8626853324076338_7560432051212488841_n.jpg'

export default function HeroSection() {
  const [offsetY, setOffsetY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setOffsetY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative overflow-hidden" style={{ height: '100svh', minHeight: '600px' }}>
      {/* パララックス背景 */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: '-30%',
          bottom: '-30%',
          transform: mounted ? `translateY(${offsetY * 0.35}px)` : 'none',
          willChange: 'transform',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_BG}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/75 z-10" />

      {/* コンテンツ */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4 pb-16">

        {/* キャッチコピー */}
        <h1
          className="text-white font-black leading-tight mb-5"
          style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
          }}
        >
          キッチンカーで、<br />
          <span className="text-[#C0391B]">愛知</span>を動かそう。
        </h1>

        {/* サブテキスト */}
        <p
          className="text-white/80 text-base sm:text-xl mb-10 max-w-2xl leading-relaxed"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s',
          }}
        >
          出店機会の発掘から開業支援まで。<br className="hidden sm:block" />
          一般社団法人あいちキッチンカー協会が、あなたのビジネスを全力サポートします。
        </p>

        {/* CTAボタン */}
        <div
          className="flex flex-col sm:flex-row gap-4"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s',
          }}
        >
          <Link
            href="/auth/register"
            className="bg-[#C0391B] text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-[#a83016] transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md"
          >
            無料で会員登録する
          </Link>
          <Link
            href="/listings"
            className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-white hover:text-[#C0391B] transition-all duration-300"
          >
            募集案件を見る
          </Link>
        </div>
      </div>

      {/* スクロール促進矢印 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/60" strokeWidth={1.5} />
      </div>
    </section>
  )
}
