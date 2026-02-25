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
    id.includes('hubert') || id.includes('encodec')
  ) return 'Audio'

  // Multimodal — 비전+언어 복합
  if (
    t.includes('multimodal') || t.includes('image-text-to-text') ||
    t.includes('visual-question-answering') || t.includes('image-to-text') ||
    t.includes('video-classification') ||
    id.includes('llava') || id.includes('blip') || id.includes('flamingo') ||
    id.includes('idefics') || id.includes('paligemma') || id.includes('clip')
  ) return 'Multimodal'

  // LLM / NLP — 텍스트 생성, 임베딩, 분류, 번역 등
  if (
    t.includes('text-generation') || t.includes('conversational') ||
    t.includes('feature-extraction') || t.includes('fill-mask') ||
    t.includes('text-classification') || t.includes('token-classification') ||
    t.includes('sentence-similarity') || t.includes('question-answering') ||
    t.includes('translation') || t.includes('summarization') ||
    t.includes('zero-shot-classification') || t.includes('natural-language') ||
    id.includes('bert') || id.includes('gpt') || id.includes('llama') ||
    id.includes('mistral') || id.includes('gemma') || id.includes('falcon') ||
    id.includes('sentence-transformer') || id.includes('roberta') ||
    id.includes('electra') || id.includes('deberta') || id.includes('xlnet') ||
    id.includes('bart') || id.includes('albert') || id.includes('distilbert') ||
    id.includes('minilm') || id.includes('mpnet') || id.includes('-t5') ||
    id.includes('phi-') || id.includes('qwen') || id.includes('deepseek') ||
    id.includes('mixtral') || id.includes('command') || id.includes('nsfw')
  ) return 'LLM'

  return 'Other'
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
    // HF API — 상위 20개 모델 (다운로드 기준)
    const res = await fetch(
      'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=20&full=true',
      { next: { revalidate: 0 } }
    )
    const models: any[] = await res.json()

    // 기존 데이터 (어제 기준 비교용)
    const { data: prevData } = await db
      .from('hf_models')
      .select('model_id, downloads')

    const prevMap = new Map(prevData?.map((r: any) => [r.model_id, r.downloads]) ?? [])

    const rows = models.map((m, idx) => {
      const prev = prevMap.get(m.modelId) ?? m.downloads
      const changePct = prev > 0 ? Math.round(((m.downloads - prev) / prev) * 100) : 0
      return {
        model_id:      m.modelId,
        downloads:     m.downloads ?? 0,
        downloads_prev: prev,
        change_pct:    changePct,
        category:      categorize(m.modelId, m.tags ?? []),
        trend:         changePct > 5 ? 'rising' : changePct < -5 ? 'falling' : 'stable',
        rank:          idx + 1,
        collected_at:  new Date().toISOString(),
      }
    })

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

    return NextResponse.json({ ok: true, count: rows.length, categories: categoryCounts })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
