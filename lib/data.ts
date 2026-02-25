import { supabase, createServerClient } from './supabase'
import type { HFModel, KeywordTrend, DashboardStats } from './types'

// 서버 컴포넌트용: service role (RLS 우회) → anon 클라이언트 순으로 fallback
function getDb() {
  return createServerClient() ?? supabase
}

// ─── Mock 데이터 (Supabase 미연결 시 fallback) ───────────────────
const MOCK_TOP_MODELS: HFModel[] = [
  { rank: 1, model_id: 'meta-llama/Llama-3.2-11B-Vision',    downloads: 4_820_000, change_pct: 23,  category: 'Multimodal', trend: 'rising' },
  { rank: 2, model_id: 'mistralai/Mistral-7B-Instruct-v0.3', downloads: 3_410_000, change_pct: 18,  category: 'LLM',        trend: 'rising' },
  { rank: 3, model_id: 'stabilityai/stable-diffusion-3',     downloads: 2_950_000, change_pct: 31,  category: 'Image',      trend: 'rising' },
  { rank: 4, model_id: 'openai/whisper-large-v3',            downloads: 2_100_000, change_pct: 9,   category: 'Audio',      trend: 'rising' },
  { rank: 5, model_id: 'google/gemma-2-9b-it',               downloads: 1_870_000, change_pct: 15,  category: 'LLM',        trend: 'rising' },
]

const MOCK_RISING_KEYWORDS: KeywordTrend[] = [
  { keyword: 'Claude 3.5',        score: 98, change_pct: 234, trend: 'rising' },
  { keyword: 'Gemini Flash',      score: 91, change_pct: 187, trend: 'rising' },
  { keyword: 'Llama 3.2',         score: 85, change_pct: 142, trend: 'rising' },
  { keyword: 'Stable Diffusion 3',score: 79, change_pct: 98,  trend: 'rising' },
  { keyword: 'Mistral Large',     score: 72, change_pct: 76,  trend: 'rising' },
]

const MOCK_SETTING_KEYWORDS: KeywordTrend[] = [
  { keyword: 'GPT-3',   score: 62, change_pct: -45, trend: 'falling' },
  { keyword: 'DALL-E 2',score: 50, change_pct: -38, trend: 'falling' },
  { keyword: 'PaLM 2',  score: 40, change_pct: -29, trend: 'falling' },
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
    .order('score', { ascending: false })
    .limit(5)

  if (error || !data?.length) return MOCK_RISING_KEYWORDS
  return data as KeywordTrend[]
}

export async function getSettingKeywords(): Promise<KeywordTrend[]> {
  const db = getDb()
  if (!db) return MOCK_SETTING_KEYWORDS

  const { data, error } = await db
    .from('keyword_trends')
    .select('*')
    .eq('trend', 'falling')
    .order('change_pct', { ascending: true })
    .limit(3)

  if (error || !data?.length) return MOCK_SETTING_KEYWORDS
  return data as KeywordTrend[]
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
