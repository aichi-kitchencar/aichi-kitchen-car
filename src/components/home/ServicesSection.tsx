'use client'

import FadeIn from './FadeIn'

const SERVICES = [
  {
    num: '01',
    title: 'キッチンカー販売\n現場の斡旋',
    desc: '愛知県内のフードフェス・マルシェ・企業イベントなど、様々な販売現場への出店機会を優先的にご紹介します。協会の豊富なネットワークを活かして、安定した収益基盤を築きましょう。',
    img: 'https://cdn.peraichi.com/userData/97174ed4-5c7f-4c1f-ba59-c53dfbee88dd/img/eaad89a0-fc23-013d-9902-0a58a9feac02/DSC00985%20(2024-11-04T07_34_15.457)%20(1).JPG',
  },
  {
    num: '02',
    title: 'キッチンカー\n開業支援',
    desc: '車両選定・許可取得・メニュー開発・集客方法まで、開業に必要なすべてをトータルサポート。経験豊富なスタッフが丁寧にアドバイスし、夢の実現をお手伝いします。',
    img: 'https://cdn.peraichi.com/userData/97174ed4-5c7f-4c1f-ba59-c53dfbee88dd/img/c777c860-fc24-013d-991b-0a58a9feac02/475118967_9086948131400186_5515584746087506902_n.jpg',
  },
  {
    num: '03',
    title: 'イベント\n企画運営',
    desc: '協会が主体となってイベントを企画・運営し、会員が活躍できる場を創出します。地域と連携したフードイベントで新たなファンを獲得し、ブランド力を高めましょう。',
    img: 'https://cdn.peraichi.com/userData/97174ed4-5c7f-4c1f-ba59-c53dfbee88dd/img/13a12000-fc23-013d-98f3-0a58a9feac02/465789230_8626853324076338_7560432051212488841_n.jpg',
  },
]

export default function ServicesSection() {
  return (
    <section className="py-24 px-4 bg-white" id="services">
      <div className="max-w-6xl mx-auto">
        {/* セクションヘッダー */}
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <span className="inline-block text-[#C0391B] text-sm font-bold tracking-[0.2em] uppercase mb-3">
              Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              3つのサービスで、<br className="sm:hidden" />あなたを支える
            </h2>
          </div>
        </FadeIn>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service, i) => (
            <FadeIn key={service.num} direction="up" delay={i * 120}>
              <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
                {/* 画像エリア */}
                <div className="relative overflow-hidden aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.img}
                    alt={service.title.replace('\n', '')}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* ナンバーバッジ */}
                  <div className="absolute top-4 left-4 bg-[#C0391B] text-white text-xs font-black px-3 py-1.5 rounded-full tracking-wider shadow-md">
                    {service.num}
                  </div>
                </div>

                {/* テキストエリア */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-gray-900 mb-3 leading-snug whitespace-pre-line">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">
                    {service.desc}
                  </p>
                  {/* オレンジアクセントライン（ホバー時に伸びる） */}
                  <div className="mt-5 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C0391B] w-0 group-hover:w-full transition-all duration-500 ease-out" />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
