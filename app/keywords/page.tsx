export const dynamic = 'force-dynamic'

import { getAllKeywords } from '@/lib/data'
import KeywordsPageClient from '@/components/sections/KeywordsPageClient'

export default async function KeywordsPage() {
  const keywords = await getAllKeywords()
  return <KeywordsPageClient keywords={keywords} />
}
