create extension if not exists vector;

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  session_id text not null,
  page_number int not null default 1,
  chunk_index int not null default 0,
  chunk_text text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.document_chunks to authenticated;
grant select, insert, update, delete on public.document_chunks to anon;
grant all on public.document_chunks to service_role;

alter table public.document_chunks enable row level security;

create policy "Anyone can read chunks" on public.document_chunks for select to anon, authenticated using (true);
create policy "Anyone can insert chunks" on public.document_chunks for insert to anon, authenticated with check (true);
create policy "Anyone can delete chunks" on public.document_chunks for delete to anon, authenticated using (true);

create index if not exists document_chunks_doc_idx on public.document_chunks(document_id);
create index if not exists document_chunks_session_idx on public.document_chunks(session_id);
create index if not exists document_chunks_embedding_idx on public.document_chunks using hnsw (embedding vector_cosine_ops);

create or replace function public.match_document_chunks(
  query_embedding vector(1536),
  match_session_id text,
  match_count int default 6
)
returns table (
  id uuid,
  document_id uuid,
  page_number int,
  chunk_index int,
  chunk_text text,
  similarity float
)
language sql stable
set search_path = public
as $$
  select c.id, c.document_id, c.page_number, c.chunk_index, c.chunk_text,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  where c.session_id = match_session_id
    and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;