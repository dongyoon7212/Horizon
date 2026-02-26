import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// 키워드 → Wikipedia 영문 제목 매핑
// Wikipedia Pageview API는 무료·공개 데이터이며 서버에서 IP 차단 없이 동작
const KEYWORD_WIKI_MAP: Record<string, string> = {
  'ChatGPT':          'ChatGPT',
  'Claude':           'Claude_(language_model)',
  'Google Gemini':    'Google_Gemini',
  'Grok':             'Grok_(chatbot)',
  'Perplexity':       'Perplexity_AI',
  'DeepSeek':         'DeepSeek',
  'NotebookLM':       'NotebookLM',
  'Mistral AI':       'Mistral_AI',
  'Llama':            'Llama_(language_model)',
  'Midjourney':       'Midjourney',
  'Stable Diffusion': 'Stable_Diffusion',
  'Sora':             'Sora_(text-to-video_model)',
  'Qwen':             'Qwen',
  'GPT-4o':           'GPT-4o',
  'DALL-E':           'DALL-E',
  'GitHub Copilot':   'GitHub_Copilot',
  'AI Agent':         'Intelligent_agent',
  'Whisper':          'Whisper_(speech_recognition_system)',
  'GPT-4':            'GPT-4',
  'GPT-3':            'GPT-3',
}

// Wikipedia Pageview API — 최근 30일 일별 조회수 가져오기
async function fetchWikiViews(wikiTitle: string): Promise<{ recent: number; prev: number } | null> {
  try {
    const end   = new Date()
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const fmt   = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')

    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${encodeURIComponent(wikiTitle)}/daily/${fmt(start)}00/${fmt(end)}00`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'HorizonAIDashboard/1.0 (https://github.com/dongyoon7212/Horizon)' },
    })
    if (!res.ok) return null

    const data = await res.json()
    const items: { views: number }[] = data.items ?? []
    if (items.length < 14) return null

    const recent = items.slice(-7).reduce((s, x) => s + x.views, 0)  // 최근 7일
    const prev   = items.slice(-14, -7).reduce((s, x) => s + x.views, 0) // 그 이전 7일

    return { recent, prev }
  } catch {
    return null
  }
}

// 퍼센타일 기반 트렌드 분류
// (AI 붐 시기에 모두 rising이 되는 문제 방지)
function assignTrends(rows: any[]): any[] {
  if (rows.length === 0) return rows
  const sorted = [...rows].sort((a, b) => a.change_pct - b.change_pct)
  const n = sorted.length
  const fallingCutoff = Math.ceil(n * 0.25)   // 하위 25% → falling
  const risingCutoff  = Math.floor(n * 0.60)  // 상위 40% → rising
  sorted.forEach((row, i) => {
    row.trend = i < fallingCutoff ? 'falling'
              : i >= risingCutoff ? 'rising'
              : 'stable'
  })
  return sorted
}

export async function GET(req: Request) {
  const isDev   = process.env.NODE_ENV === 'development'
  const secret  = req.headers.get('x-cron-secret')
  if (!isDev && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  if (!db) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const now       = new Date().toISOString()
  const weekStart = now.split('T')[0]
  const rawRows: any[] = []
  const results:  { keyword: string; status: string }[] = []

  // 최대 Wikipedia 조회수 (정규화 기준용, ChatGPT 기준)
  let maxViews = 1

  // 1차 패스: 모든 키워드 조회수 수집
  const viewData: Record<string, { recent: number; prev: number }> = {}
  for (const [keyword, wikiTitle] of Object.entries(KEYWORD_WIKI_MAP)) {
    const data = await fetchWikiViews(wikiTitle)
    if (data) {
      viewData[keyword] = data
      if (data.recent > maxViews) maxViews = data.recent
    }
    await new Promise(r => setTimeout(r, 200)) // 속도 제한
  }

  // 2차 패스: 점수 정규화 (sqrt 스케일 → 0~100)
  // sqrt 스케일을 사용해 ChatGPT 독주 효과를 완화
  const sqrtMax = Math.sqrt(maxViews)
  for (const [keyword, data] of Object.entries(viewData)) {
    const score     = Math.round((Math.sqrt(data.recent) / sqrtMax) * 100)
    const scorePrev = Math.round((Math.sqrt(data.prev)   / sqrtMax) * 100)
    const changePct = data.prev > 0
      ? Math.round(((data.recent - data.prev) / data.prev) * 100)
      : 0

    rawRows.push({
      keyword,
      score,
      score_prev:   scorePrev,
      change_pct:   changePct,
      trend:        'stable', // 아래 assignTrends에서 재계산
      week_start:   weekStart,
      collected_at: now,
    })

    results.push({
      keyword,
      status: `score:${score} views:${data.recent.toLocaleString()} (${changePct > 0 ? '+' : ''}${changePct}%)`,
    })
  }

  if (rawRows.length === 0) {
    return NextResponse.json({ ok: false, error: 'Wikipedia API returned no data', results })
  }

  // 퍼센타일 기반 트렌드 재분류
  const rows = assignTrends(rawRows)

  const { error } = await db
    .from('keyword_trends')
    .upsert(rows, { onConflict: 'keyword' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const summary = rows.reduce((acc: any, r: any) => {
    acc[r.trend] = (acc[r.trend] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    ok: true,
    source: 'Wikipedia Pageview API',
    collected: rows.length,
    skipped: Object.keys(KEYWORD_WIKI_MAP).length - rows.length,
    distribution: summary,
    results: rows
      .sort((a: any, b: any) => b.score - a.score)
      .map((r: any) => ({
        keyword: r.keyword,
        trend: r.trend,
        status: results.find(x => x.keyword === r.keyword)?.status ?? '',
      })),
  })
}
