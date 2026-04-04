-- StudyFlow — Supabase şeması (SQL Editor'da çalıştırın)
-- https://supabase.com/dashboard/project/_/sql

create extension if not exists "pgcrypto";

-- Profiller (auth.users ile eşleşir)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text default '' not null,
  university text,
  department text,
  website text,
  created_at timestamptz not null default now()
);

create index profiles_username_lower on public.profiles (lower(username));

-- Gönderiler
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  content_type text not null default 'mixed',
  visibility text not null default 'public',
  tags text[] not null default '{}',
  series_id uuid,
  created_at timestamptz not null default now()
);

create index posts_user_id_idx on public.posts (user_id);
create index posts_created_at_idx on public.posts (created_at desc);
create index posts_tags_idx on public.posts using gin (tags);

-- Eğitim serileri
create table public.series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text default '' not null,
  thumbnail_url text,
  category text not null default 'Genel',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.posts
  add constraint posts_series_id_fkey foreign key (series_id) references public.series (id) on delete set null;

create index series_user_id_idx on public.series (user_id);

-- Sosyal tablolar
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.post_reposts (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.post_saves (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_post_id_idx on public.comments (post_id);

create table public.series_followers (
  series_id uuid not null references public.series (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (series_id, user_id)
);

-- Sayılı akış görünümü
create or replace view public.posts_feed as
select
  p.*,
  coalesce(lc.cnt, 0)::int as like_count,
  coalesce(cc.cnt, 0)::int as comment_count,
  coalesce(rc.cnt, 0)::int as repost_count
from public.posts p
left join (
  select post_id, count(*)::int as cnt from public.post_likes group by post_id
) lc on lc.post_id = p.id
left join (
  select post_id, count(*)::int as cnt from public.comments group by post_id
) cc on cc.post_id = p.id
left join (
  select post_id, count(*)::int as cnt from public.post_reposts group by post_id
) rc on rc.post_id = p.id;

-- Yeni kullanıcı → profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  n int := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '_', 'g'));
  if base_username is null or length(trim(base_username)) < 2 then
    base_username := 'user';
  end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    n := n + 1;
    final_username := base_username || '_' || n::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      initcap(replace(base_username, '_', ' '))
    ),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id::text
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.series enable row level security;
alter table public.follows enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_reposts enable row level security;
alter table public.post_saves enable row level security;
alter table public.comments enable row level security;
alter table public.series_followers enable row level security;

-- Profiller
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Gönderiler
create policy "posts_select_public_or_own" on public.posts for select
  using (
    visibility = 'public'
    or auth.uid() = user_id
    or (
      visibility = 'followers'
      and exists (
        select 1
        from public.follows f
        where f.follower_id = auth.uid()
          and f.following_id = posts.user_id
      )
    )
  );
create policy "posts_insert_own" on public.posts for insert
  with check (auth.uid() = user_id);
create policy "posts_update_own" on public.posts for update using (auth.uid() = user_id);
create policy "posts_delete_own" on public.posts for delete using (auth.uid() = user_id);

-- Seriler
create policy "series_select_all" on public.series for select using (true);
create policy "series_insert_own" on public.series for insert with check (auth.uid() = user_id);
create policy "series_update_own" on public.series for update using (auth.uid() = user_id);
create policy "series_delete_own" on public.series for delete using (auth.uid() = user_id);

-- Takip
create policy "follows_select_all" on public.follows for select using (true);
create policy "follows_insert_self" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete_self" on public.follows for delete using (auth.uid() = follower_id);

-- Beğeni / repost / kayıt
create policy "post_likes_select_all" on public.post_likes for select using (true);
create policy "post_likes_insert_self" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "post_likes_delete_self" on public.post_likes for delete using (auth.uid() = user_id);

create policy "post_reposts_select_all" on public.post_reposts for select using (true);
create policy "post_reposts_insert_self" on public.post_reposts for insert with check (auth.uid() = user_id);
create policy "post_reposts_delete_self" on public.post_reposts for delete using (auth.uid() = user_id);

create policy "post_saves_select_self" on public.post_saves for select using (auth.uid() = user_id);
create policy "post_saves_insert_self" on public.post_saves for insert with check (auth.uid() = user_id);
create policy "post_saves_delete_self" on public.post_saves for delete using (auth.uid() = user_id);

-- Yorumlar (görülebilir gönderi için)
create policy "comments_select" on public.comments for select using (
  exists (
    select 1 from public.posts p
    where p.id = comments.post_id
      and (p.visibility = 'public' or p.user_id = auth.uid())
  )
);
create policy "comments_insert_auth" on public.comments for insert
  with check (auth.uid() = user_id);
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = user_id);

-- Seri takipçileri
create policy "series_followers_select" on public.series_followers for select using (true);
create policy "series_followers_insert_self" on public.series_followers for insert with check (auth.uid() = user_id);
create policy "series_followers_delete_self" on public.series_followers for delete using (auth.uid() = user_id);

-- posts_feed görünümü için (temel tablo RLS uygulanır)
grant select on public.posts_feed to anon, authenticated;
