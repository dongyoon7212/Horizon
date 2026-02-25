export type Trend = 'rising' | 'falling' | 'stable'

export interface HFModel {
  id?: string
  model_id: string
  downloads: number
  downloads_prev?: number
  change_pct: number
  category: 'LLM' | 'Image' | 'Audio' | 'Multimodal' | 'Other'
  trend: Trend
  rank: number
  collected_at?: string
}

export interface KeywordTrend {
  id?: string
  keyword: string
  score: number
  score_prev?: number
  change_pct: number
  trend: Trend
  week_start?: string
  collected_at?: string
}

export interface GithubRepo {
  id?: string
  full_name: string
  description?: string
  stars: number
  stars_today?: number
  language?: string
  url: string
  trend: Trend
  collected_at?: string
}

export interface DashboardStats {
  risingModels: number
  keywordsTracked: number
  lastUpdatedHours: number
  weeklyPapers: number
}
