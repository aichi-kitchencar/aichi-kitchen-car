'use client'

import FadeIn from './FadeIn'

const FEATURES = [
  {
    icon: '🎓',
    title: '会員登録無料',
    desc: '入会費・年会費は一切かかりません。まずは気軽に登録して、協会のサービスをお試しください。',
    img: 'https://cdn.peraichi.com/userData/97174ed4-5c7f-4c1f-ba59-c53dfbee88dd/img/aa725af0-fc24-013d-991a-0a58a9feac02/DSC00780%20(2024-11-04T07_14_52.079).jpg',
  },
  {
    icon: '🏆',
    title: '寝たきり社長が監修',
    desc: '逆境を乗り越えてきた「寝たきり社長」が監修。現場で使えるリアルなノウハウを惜しみなく提供します。',
    img: 'https://cdn.peraichi.com/userData/97174ed4-5c7f-4c1f-ba59-c53dfbee88dd/img/034b18f0-fcf3-013d-fee0-0a58a9feac02/482198469_9310737949021202_8852886645342970593_n.jpg',
  },
  {
    icon: '🔰',
    title: '初心者も安心',
    desc: '「何から始めれば？」そんな疑問もOK。先輩会員との交流機会も設け、一歩一歩確実にサポートします。',
    img: 'https://cdn.peraichi.com/userData/97174ed4-5c7f-4c1f-ba59-c53dfbee88dd/img/67fe4f76007da/original.png',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-[#0f172a] overflow-hidden relative">
      {/* 装飾的な背景パターン */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0391B] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C0391B] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ヘッダー */}
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <span className="inline-block text-[#C0391B] text-sm font-bold tracking-[0.2em] uppercase mb-3">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              選ばれる3つの理由
            </h2>
          </div>
        </FadeIn>

        {/* 特長グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} direction="up" delay={i * 150}>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group hover:border-[#C0391B]/50 transition-all duration-500 hover:bg-white/10">
                {/* 写真 */}
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.img}
                    alt={f.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent" />
                  {/* アイコン */}
                  <div className="absolute bottom-4 left-5 text-4xl">{f.icon}</div>
                </div>

                {/* テキスト */}
                <div className="p-6">
                  <h3 className="text-xl font-black text-white mb-3">{f.title}</h3>
                  <p className="text-sm text-white/65 leading-relaxed">{f.desc}</p>
                </div>

                {/* ホバー時のオレンジボーダー効果 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C0391B] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
