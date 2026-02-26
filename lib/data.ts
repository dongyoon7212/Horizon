import { supabase, createServerClient } from './supabase'
import type { HFModel, KeywordTrend, DashboardStats } from './types'

// 서버 컴포넌트용: service role (RLS 우회) → anon 클라이언트 순으로 fallback
function getDb() {
  return createServerClient() ?? supabase
}

// ─── Mock 데이터 (Supabase 미연결 시 fallback) ───────────────────
const MOCK_TOP_MODELS: HFModel[] = [
  { rank: 1, model_id: 'deepseek-ai/DeepSeek-R1',              downloads: 8_420_000, change_pct: 112, category: 'LLM',        trend: 'rising' },
  { rank: 2, model_id: 'meta-llama/Llama-3.3-70B-Instruct',    downloads: 6_130_000, change_pct: 34,  category: 'LLM',        trend: 'rising' },
  { rank: 3, model_id: 'mistralai/Mistral-Small-3.1-24B',      downloads: 4_210_000, change_pct: 28,  category: 'LLM',        trend: 'rising' },
  { rank: 4, model_id: 'black-forest-labs/FLUX.1-dev',         downloads: 3_880_000, change_pct: 19,  category: 'Image',      trend: 'rising' },
  { rank: 5, model_id: 'openai/whisper-large-v3-turbo',        downloads: 2_950_000, change_pct: 41,  category: 'Audio',      trend: 'rising' },
]

const MOCK_RISING_KEYWORDS: KeywordTrend[] = [
  { keyword: 'DeepSeek R1', score: 97, change_pct: 890, trend: 'rising' },
  { keyword: 'Grok 3',      score: 88, change_pct: 440, trend: 'rising' },
  { keyword: 'Claude 3.7',  score: 85, change_pct: 310, trend: 'rising' },
  { keyword: 'Gemini 2.0',  score: 82, change_pct: 260, trend: 'rising' },
  { keyword: 'AI Agent',    score: 86, change_pct: 230, trend: 'rising' },
]

const MOCK_SETTING_KEYWORDS: KeywordTrend[] = [
  { keyword: 'GPT-4',            score: 58, change_pct: -32, trend: 'falling' },
  { keyword: 'Stable Diffusion', score: 48, change_pct: -28, trend: 'falling' },
  { keyword: 'Bard',             score: 20, change_pct: -71, trend: 'falling' },
]

const MOCK_STATS: DashboardStats = {
  risingModels: 12,
  keywordsTracked: 48,
  lastUpdatedHours: 6,
  weeklyPapers: 342,
}

// ─── 데이터 fetching 함수들 ─────────────────────────────────────

export async function getAllModels(): Promise<HFModel[]> {
  const db = getDb()
  if (!db) return MOCK_TOP_MODELS

  const { data, error } = await db
    .from('hf_models')
    .select('*')
    .order('rank', { ascending: true })

  if (error || !data?.length) return MOCK_TOP_MODELS
  return data as HFModel[]
}

export async function getModelById(modelId: string): Promise<HFModel | null> {
  const db = getDb()
  if (!db) return MOCK_TOP_MODELS.find(m => m.model_id === modelId) ?? null

  const { data, error } = await db
    .from('hf_models')
    .select('*')
    .eq('model_id', modelId)
    .single()

  if (error || !data) return null
  return data as HFModel
}

export async function getAllKeywords(): Promise<KeywordTrend[]> {
  const db = getDb()
  if (!db) return [...MOCK_RISING_KEYWORDS, ...MOCK_SETTING_KEYWORDS]

  const { data, error } = await db
    .from('keyword_trends')
    .select('*')
    .order('score', { ascending: false })

  if (error || !data?.length) return [...MOCK_RISING_KEYWORDS, ...MOCK_SETTING_KEYWORDS]
  return data as KeywordTrend[]
}

export async function getKeywordByName(keyword: string): Promise<KeywordTrend | null> {
  const db = getDb()
  if (!db) return null

  const { data, error } = await db
    .from('keyword_trends')
    .select('*')
    .eq('keyword', keyword)
    .single()

  if (error || !data) return null
  return data as KeywordTrend
}

export async function getTopModels(): Promise<HFModel[]> {
  const db = getDb()
  if (!db) return MOCK_TOP_MODELS

  const { data, error } = await db
    .from('hf_models')
    .select('*')
    .order('rank', { ascending: true })
    .limit(5)

  if (error || !data?.length) return MOCK_TOP_MODELS
  return data as HFModel[]
}

export async function getRisingKeywords(): Promise<KeywordTrend[]> {
  const db = getDb()
  if (!db) return MOCK_RISING_KEYWORDS

  const { data, error } = await db
    .from('keyword_trends')
    .select('*')
    .eq('trend', 'rising')
    .order('change_pct', { ascending: false }) // 상승률 높은 순
    .limit(5)

  if (error || !data?.length) return MOCK_RISING_KEYWORDS
  return data as KeywordTrend[]
}

export async function getSettingKeywords(): Promise<KeywordTrend[]> {
  const db = getDb()
  if (!db) return MOCK_SETTING_KEYWORDS

  // 1차: trend = 'falling' 항목
  const { data: falling, error } = await db
    .from('keyword_trends')
    .select('*')
    .eq('trend', 'falling')
    .order('change_pct', { ascending: true })
    .limit(3)

  if (!error && falling && falling.length >= 3) return falling as KeywordTrend[]

  // 2차 fallback: falling이 부족하면 change_pct 하위 3개 (상대적으로 가장 덜 오른 것)
  const { data: bottom } = await db
    .from('keyword_trends')
    .select('*')
    .order('change_pct', { ascending: true })
    .limit(3)

  if (bottom?.length) return bottom as KeywordTrend[]
  return MOCK_SETTING_KEYWORDS
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDb()
  if (!db) return MOCK_STATS

  // 병렬로 각 테이블 카운트 조회 (전체 수집 모델 수 + 키워드 수)
  const [modelsRes, keywordsRes, lastRes] = await Promise.all([
    db.from('hf_models').select('id', { count: 'exact', head: true }),
    db.from('keyword_trends').select('id', { count: 'exact', head: true }),
    db.from('hf_models').select('collected_at').order('collected_at', { ascending: false }).limit(1),
  ])

  // 마지막 수집 시간 → 몇 시간 전인지 계산
  const lastCollected = lastRes.data?.[0]?.collected_at
  const lastUpdatedHours = lastCollected
    ? Math.round((Date.now() - new Date(lastCollected).getTime()) / 3_600_000)
    : MOCK_STATS.lastUpdatedHours

  return {
    risingModels:     modelsRes.count    ?? MOCK_STATS.risingModels,
    keywordsTracked:  keywordsRes.count  ?? MOCK_STATS.keywordsTracked,
    lastUpdatedHours,
    weeklyPapers:     MOCK_STATS.weeklyPapers,
  }
}
