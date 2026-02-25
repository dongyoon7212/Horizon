export const dynamic = 'force-dynamic'

import HeroSection from '@/components/sections/HeroSection'
import StatsBar from '@/components/sections/StatsBar'
import RisingTopics from '@/components/sections/RisingTopics'
import SettingTopics from '@/components/sections/SettingTopics'
import TopModels from '@/components/sections/TopModels'
import SectionLabel from '@/components/ui/SectionLabel'
import { getTopModels, getRisingKeywords, getSettingKeywords, getDashboardStats } from '@/lib/data'

export default async function HomePage() {
  const [topModels, risingKeywords, settingKeywords, stats] = await Promise.all([
    getTopModels(),
    getRisingKeywords(),
    getSettingKeywords(),
    getDashboardStats(),
  ])

  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* StatsBar — Hero 페이드 영역 안으로 끌어올려 연속성 확보 */}
      <div style={{ marginTop: '-5rem', position: 'relative', zIndex: 20 }}>
        <StatsBar stats={stats} />
      </div>

      {/* AI Trends */}
      <div className="max-w-6xl mx-auto px-6 mb-5 mt-2">
        <SectionLabel>AI Trends</SectionLabel>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10">
          <RisingTopics topics={risingKeywords} />
          <SettingTopics topics={settingKeywords} />
        </div>
      </div>

      {/* Top Models */}
      <div className="max-w-6xl mx-auto px-6 mb-5 mt-10">
        <SectionLabel>Top Models</SectionLabel>
      </div>

      <TopModels models={topModels} />
    </>
  )
}
