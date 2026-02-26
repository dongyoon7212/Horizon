import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Hugging Face 카테고리 분류 (modelId + tags 기반 정밀 분류)
function categorize(modelId: string, tags: string[]): 'LLM' | 'Image' | 'Audio' | 'Multimodal' | 'Other' {
  const t = tags.join(' ').toLowerCase()
  const id = modelId.toLowerCase()

  // Image — 이미지 생성/분류/감지
  if (
    t.includes('text-to-image') || t.includes('image-generation') ||
    t.includes('image-classification') || t.includes('image-segmentation') ||
    t.includes('object-detection') || t.includes('depth-estimation') ||
    id.includes('stable-diffusion') || id.includes('sdxl') ||
    id.includes('dall-e') || id.includes('flux') || id.includes('controlnet')
  ) return 'Image'

  // Audio — 음성인식/TTS/오디오
  if (
    t.includes('automatic-speech-recognition') || t.includes('text-to-speech') ||
    t.includes('audio-classification') || t.includes('voice-activity') ||
    t.includes('speech') || t.includes('audio') ||
    id.includes('whisper') || id.includes('wav2vec') || id.includes('clap') ||
    id.includes('hubert') || id.includes('encodec') || id.includes('diarization')
  ) return 'Audio'

  // Multimodal — 비전+언어 복합
  if (
    t.includes('multimodal') || t.includes('image-text-to-text') ||
    t.includes('visual-question-answering') || t.includes('image-to-text') ||
    t.includes('video-classification') ||
    id.includes('llava') || id.includes('blip') || id.includes('flamingo') ||
    id.includes('idefics') || id.includes('paligemma') || id.includes('clip') ||
    id.includes('internvl') || id.includes('qwen-vl') || id.includes('minicpm') ||
    id.includes('qwen3-vl') || id.includes('qwen2-vl')
  ) return 'Multimodal'

  // LLM / NLP — 텍스트 생성
  if (
    t.includes('text-generation') || t.includes('conversational') ||
    t.includes('fill-mask') || t.includes('question-answering') ||
    t.includes('translation') || t.includes('summarization') ||
    id.includes('bert') || id.includes('gpt') || id.includes('llama') ||
    id.includes('mistral') || id.includes('gemma') || id.includes('falcon') ||
    id.includes('roberta') || id.includes('electra') || id.includes('deberta') ||
    id.includes('bart') || id.includes('albert') || id.includes('distilbert') ||
    id.includes('-t5') || id.includes('phi-') || id.includes('qwen') ||
    id.includes('deepseek') || id.includes('mixtral') || id.includes('command') ||
    id.includes('vicuna') || id.includes('solar') || id.includes('yi-') ||
    id.includes('openhermes') || id.includes('neural-chat') || id.includes('zephyr')
  ) return 'LLM'

  return 'Other'
}

// 테스트/더미/구형 모델 필터링
const BLOCKLIST_PATTERNS = [
  'trl-internal-testing',
  'tiny-qwen', 'tiny-llama', 'tiny-bert',
  'opt-125m', 'opt-350m',     // 구형 Facebook 모델
  'openai-community/gpt2',    // 2019년 구형 GPT-2
  'test-', '-test',
]

function isBlocklisted(modelId: string): boolean {
  const id = modelId.toLowerCase()
  return BLOCKLIST_PATTERNS.some(p => id.toLowerCase().includes(p.toLowerCase()))
}

// org별 최대 3개 제한 — 특정 회사 모델이 지배하는 현상 방지
function capByOrg(models: any[], maxPerOrg: number): any[] {
  const orgCount: Record<string, number> = {}
  return models.filter(m => {
    const org = (m.modelId as string).split('/')[0].toLowerCase()
    orgCount[org] = (orgCount[org] ?? 0) + 1
    return orgCount[org] <= maxPerOrg
  })
}

// HF API에서 특정 task 모델 목록 가져오기
async function fetchByTask(task: string, limit: number): Promise<any[]> {
  try {
    const res = await fetch(
      `https://huggingface.co/api/models?filter=${task}&sort=downloads&direction=-1&limit=${limit}&full=true`,
      { next: { revalidate: 0 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function GET(req: Request) {
  // Cron secret 검증 (개발 환경은 bypass)
  const secret = req.headers.get('x-cron-secret')
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  if (!db) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  try {
    // 4개 task 카테고리에서 병렬로 모델 수집
    // 각 카테고리별 상위 N개 확보 → 카테고리 균형 보장
    const [textGenModels, imageModels, audioModels, multimodalModels] = await Promise.all([
      fetchByTask('text-generation', 30),            // LLMs — 많이 가져와 필터 후 8개 확보
      fetchByTask('text-to-image', 15),               // Image generation — FLUX, SD 등
      fetchByTask('automatic-speech-recognition', 10), // ASR — Whisper 등
      fetchByTask('image-text-to-text', 10),           // Multimodal — Qwen-VL, LLaVA 등
    ])

    // 각 task별 블록리스트 필터링 + org 캡(3개) 적용 후 상위 N개 선택 (카테고리 다양성 보장)
    function topN(models: any[], n: number): any[] {
      const filtered = models.filter(
        m => m.modelId && !isBlocklisted(m.modelId) && (m.downloads ?? 0) > 0
      )
      const capped = capByOrg(filtered, 3)
      return capped.slice(0, n)
    }

    const selected = [
      ...topN(textGenModels, 9),    // LLM: 9개
      ...topN(imageModels, 5),      // Image: 5개
      ...topN(audioModels, 4),      // Audio: 4개
      ...topN(multimodalModels, 4), // Multimodal: 4개
    ]

    // model_id 기준 중복 제거
    const seen = new Set<string>()
    const unique = selected.filter(m => {
      if (seen.has(m.modelId)) return false
      seen.add(m.modelId)
      return true
    })

    // 다운로드 수 내림차순 재정렬
    unique.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))

    // 기존 데이터 (어제 기준 비교용)
    const { data: prevData } = await db
      .from('hf_models')
      .select('model_id, downloads')

    const prevMap = new Map(prevData?.map((r: any) => [r.model_id, r.downloads]) ?? [])

    const rows = unique.map((m, idx) => {
      const prev = prevMap.get(m.modelId) ?? m.downloads
      const changePct = prev > 0 ? Math.round(((m.downloads - prev) / prev) * 100) : 0
      return {
        model_id:       m.modelId,
        downloads:      m.downloads ?? 0,
        downloads_prev: prev,
        change_pct:     changePct,
        category:       categorize(m.modelId, m.tags ?? []),
        trend:          changePct > 5 ? 'rising' : changePct < -5 ? 'falling' : 'stable',
        rank:           idx + 1,
        collected_at:   new Date().toISOString(),
      }
    })

    // 기존 DB 모델 중 이번 수집에 없는 것은 삭제 (오래된 utility 모델 제거)
    const newIds = rows.map(r => r.model_id)
    const toDelete = (prevData ?? [])
      .map((r: any) => r.model_id)
      .filter((id: string) => !newIds.includes(id))

    if (toDelete.length > 0) {
      await db.from('hf_models').delete().in('model_id', toDelete)
    }

    // Upsert
    const { error } = await db
      .from('hf_models')
      .upsert(rows, { onConflict: 'model_id' })

    if (error) throw error

    // 카테고리 분포 반환 (디버깅용)
    const categoryCounts = rows.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      ok: true,
      count: rows.length,
      deleted: toDelete.length,
      categories: categoryCounts,
      models: rows.map(r => ({
        rank: r.rank,
        model_id: r.model_id,
        category: r.category,
        downloads: r.downloads,
      })),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
