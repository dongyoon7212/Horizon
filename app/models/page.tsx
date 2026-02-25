export const dynamic = 'force-dynamic'

import { getAllModels } from '@/lib/data'
import ModelsPageClient from '@/components/sections/ModelsPageClient'

export default async function ModelsPage() {
  const models = await getAllModels()
  return <ModelsPageClient models={models} />
}
