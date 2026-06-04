'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import FadeIn from './FadeIn'

const CTA_BG =
  'https://cdn.peraichi.com/userData/97174ed4-5c7f-4c1f-ba59-c53dfbee88dd/img/c777c860-fc24-013d-991b-0a58a9feac02/475118967_9086948131400186_5515584746087506902_n.jpg'

export default function CTASection() {
  const [offsetY, setOffsetY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setOffsetY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative overflow-hidden py-32 px-4">
      {/* パララックス背景 */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: '-30%',
          bottom: '-30%',
          transform: mounted ? `translateY(${(offsetY - 1000) * 0.2}px)` : 'none',
          willChange: 'transform',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CTA_BG} alt="" className="w-full h-full object-cover" />
      </div>

      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-[#C0391B]/85" />

      {/* コンテンツ */}
      <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
        <FadeIn direction="up">
          <p className="text-sm font-bold tracking-[0.25em] uppercase opacity-75 mb-4">
            Join Us
          </p>
          <h2
            className="font-black leading-tight mb-6"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            今すぐ、<br className="sm:hidden" />
            一歩を踏み出そう。
          </h2>
          <p className="text-white/80 text-base sm:text-xl mb-10 leading-relaxed max-w-xl mx-auto">
            登録は完全無料。審査完了後からすべての機能をご利用いただけます。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-white text-[#C0391B] font-black px-10 py-5 rounded-xl text-lg hover:bg-orange-50 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              今すぐ無料登録
            </Link>
            <Link
              href="/listings"
              className="border-2 border-white text-white font-bold px-8 py-5 rounded-xl text-base hover:bg-white/10 transition-all duration-300"
            >
              案件を見る
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
