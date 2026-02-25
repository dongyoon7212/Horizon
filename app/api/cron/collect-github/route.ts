import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const secret = req.headers.get('x-cron-secret')
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  if (!db) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    // AI/ML 관련 트렌딩 레포지토리
    const res = await fetch(
      'https://api.github.com/search/repositories?q=topic:machine-learning+topic:artificial-intelligence&sort=stars&order=desc&per_page=20',
      { headers, next: { revalidate: 0 } }
    )
    const json = await res.json()
    const repos: any[] = json.items ?? []

    // 기존 데이터 (스타 비교용)
    const { data: prevData } = await db
      .from('github_repos')
      .select('full_name, stars')

    const prevMap = new Map(prevData?.map((r: any) => [r.full_name, r.stars]) ?? [])

    const rows = repos.map((r) => {
      const prev = prevMap.get(r.full_name) ?? r.stargazers_count
      const starsToday = r.stargazers_count - prev
      return {
        full_name:   r.full_name,
        description: r.description ?? '',
        stars:       r.stargazers_count,
        stars_today: starsToday,
        language:    r.language ?? 'Unknown',
        url:         r.html_url,
        trend:       starsToday > 50 ? 'rising' : starsToday < -20 ? 'falling' : 'stable',
        collected_at: new Date().toISOString(),
      }
    })

    const { error } = await db
      .from('github_repos')
      .upsert(rows, { onConflict: 'full_name' })

    if (error) throw error

    return NextResponse.json({ ok: true, count: rows.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
