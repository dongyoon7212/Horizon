-- ================================================================
-- Horizon AI Dashboard — Supabase Schema
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- ================================================================

-- ── HuggingFace 모델 트렌드 ──────────────────────────────────────
create table if not exists hf_models (
  id            uuid primary key default gen_random_uuid(),
  model_id      text not null unique,
  downloads     bigint not null default 0,
  downloads_prev bigint,
  change_pct    integer not null default 0,
  category      text not null default 'Other'
                check (category in ('LLM','Image','Audio','Multimodal','Other')),
  trend         text not null default 'stable'
                check (trend in ('rising','falling','stable')),
  rank          integer not null default 99,
  collected_at  timestamptz not null default now()
);

create index if not exists hf_models_rank_idx on hf_models (rank asc);
create index if not exists hf_models_trend_idx on hf_models (trend);

-- ── 키워드 트렌드 ────────────────────────────────────────────────
create table if not exists keyword_trends (
  id           uuid primary key default gen_random_uuid(),
  keyword      text not null unique,
  score        integer not null default 0 check (score between 0 and 100),
  score_prev   integer,
  change_pct   integer not null default 0,
  trend        text not null default 'stable'
               check (trend in ('rising','falling','stable')),
  week_start   date,
  collected_at timestamptz not null default now()
);

create index if not exists keyword_trends_trend_idx on keyword_trends (trend);
create index if not exists keyword_trends_score_idx on keyword_trends (score desc);

-- ── GitHub 레포지토리 트렌드 ─────────────────────────────────────
create table if not exists github_repos (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null unique,
  description  text,
  stars        integer not null default 0,
  stars_today  integer default 0,
  language     text,
  url          text not null,
  trend        text not null default 'stable'
               check (trend in ('rising','falling','stable')),
  collected_at timestamptz not null default now()
);

create index if not exists github_repos_stars_idx on github_repos (stars desc);
create index if not exists github_repos_trend_idx on github_repos (trend);

-- ── Row Level Security (공개 읽기) ───────────────────────────────
alter table hf_models     enable row level security;
alter table keyword_trends enable row level security;
alter table github_repos   enable row level security;

-- 모든 사람이 읽을 수 있도록 (anon key 사용)
create policy "Public read hf_models"
  on hf_models for select using (true);

create policy "Public read keyword_trends"
  on keyword_trends for select using (true);

create policy "Public read github_repos"
  on github_repos for select using (true);

-- Service role만 쓸 수 있도록 (cron API route가 사용)
create policy "Service write hf_models"
  on hf_models for all using (auth.role() = 'service_role');

create policy "Service write keyword_trends"
  on keyword_trends for all using (auth.role() = 'service_role');

create policy "Service write github_repos"
  on github_repos for all using (auth.role() = 'service_role');
