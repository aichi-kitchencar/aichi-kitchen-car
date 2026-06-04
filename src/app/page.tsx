import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/home/HeroSection'
import ServicesSection from '@/components/home/ServicesSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import ListingsPreview from '@/components/home/ListingsPreview'
import CTASection from '@/components/home/CTASection'
import type { Listing } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'open')
    .order('event_date', { ascending: true })
    .limit(3)

  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <ListingsPreview listings={(listings ?? []) as Listing[]} />
      <CTASection />
    </div>
  )
}
