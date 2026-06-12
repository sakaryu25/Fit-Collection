-- Fit Collection 初期スキーマ（docs/04-data-design.md 参照）
-- MVPはローカル保存で動作するため未接続。Supabase接続時にこのマイグレーションを適用する。

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default 'わたし',
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.avatars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  vibe text not null default 'casual',
  skin_color text not null default 'skin_03',
  face_shape text not null default 'face_round',
  eyes text not null default 'eyes_01',
  brows text not null default 'brows_01',
  mouth text not null default 'mouth_01',
  hair_style text not null default 'hair_short_01',
  hair_color text not null default 'hair_black',
  body_type text not null default 'normal',
  height text not null default 'mid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  layout_id text not null default 'room_default',
  theme_id text not null default 'theme_beige',
  furniture jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category text not null,
  name text,
  brand text,
  color text,
  price integer,
  url text,
  memo text,
  status text not null default 'want',
  compatibility_score integer,
  compatibility_detail jsonb,
  look jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.wishlist_items (user_id, status);

create table public.closet_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category text not null,
  name text,
  brand text,
  color text not null,
  styles text[] not null default '{}',
  seasons text[] not null default '{}',
  memo text,
  is_favorite boolean not null default false,
  source_wishlist_id uuid references public.wishlist_items(id),
  look jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.closet_items (user_id, category);

create table public.closet_item_images (
  id uuid primary key default gen_random_uuid(),
  closet_item_id uuid not null references public.closet_items(id) on delete cascade,
  storage_path text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.wishlist_item_images (
  id uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references public.wishlist_items(id) on delete cascade,
  storage_path text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default '新しいコーデ',
  scene text,
  seasons text[] not null default '{}',
  memo text,
  snapshot_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  slot text not null,
  closet_item_id uuid references public.closet_items(id) on delete set null,
  wishlist_item_id uuid references public.wishlist_items(id) on delete set null,
  created_at timestamptz not null default now(),
  check (num_nonnulls(closet_item_id, wishlist_item_id) = 1)
);

create table public.try_on_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wishlist_item_id uuid not null references public.wishlist_items(id) on delete cascade,
  combined_closet_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

-- RLS
alter table public.users enable row level security;
alter table public.avatars enable row level security;
alter table public.rooms enable row level security;
alter table public.closet_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.closet_item_images enable row level security;
alter table public.wishlist_item_images enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.try_on_history enable row level security;

create policy "own" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own" on public.avatars for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.rooms for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.closet_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.wishlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.outfits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.try_on_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own via parent" on public.closet_item_images for all
  using (exists (select 1 from public.closet_items c where c.id = closet_item_id and c.user_id = auth.uid()));
create policy "own via parent" on public.wishlist_item_images for all
  using (exists (select 1 from public.wishlist_items w where w.id = wishlist_item_id and w.user_id = auth.uid()));
create policy "own via parent" on public.outfit_items for all
  using (exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid()));

-- サインアップ時の自動プロビジョニング
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.users (id) values (new.id);
  insert into public.avatars (user_id) values (new.id);
  insert into public.rooms (user_id) values (new.id);
  return new;
end; $$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
