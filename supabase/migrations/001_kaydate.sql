create extension if not exists "pgcrypto";

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade, username text unique, display_name text, avatar_url text, bio text, created_at timestamptz not null default now()
);
create table if not exists public.places (
 id uuid primary key default gen_random_uuid(), name text not null, city text, country text default 'TR', category text, description text, address text, latitude double precision, longitude double precision, maps_url text, source_url text, cover_url text, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.saved_places (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, place_id uuid not null references public.places(id) on delete cascade, status text not null default 'want' check(status in ('want','planned','visited')), note text, visit_date date, rating smallint check(rating between 1 and 5), created_at timestamptz not null default now(), unique(user_id,place_id)
);
create table if not exists public.lists (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, description text, is_public boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.list_items (
 list_id uuid not null references public.lists(id) on delete cascade, place_id uuid not null references public.places(id) on delete cascade, position integer not null default 0, primary key(list_id,place_id)
);
create table if not exists public.friendships (
 requester_id uuid not null references auth.users(id) on delete cascade, addressee_id uuid not null references auth.users(id) on delete cascade, status text not null default 'pending' check(status in ('pending','accepted','blocked')), created_at timestamptz not null default now(), primary key(requester_id,addressee_id), check(requester_id<>addressee_id)
);
alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.saved_places enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.friendships enable row level security;
create policy "profiles readable" on public.profiles for select using (true);
create policy "own profile insert" on public.profiles for insert with check (auth.uid()=id);
create policy "own profile update" on public.profiles for update using (auth.uid()=id);
create policy "places readable" on public.places for select using (true);
create policy "signed users create places" on public.places for insert with check (auth.uid() is not null);
create policy "own places update" on public.places for update using (auth.uid()=created_by);
create policy "own places delete" on public.places for delete using (auth.uid()=created_by);
create policy "own saved readable" on public.saved_places for select using (auth.uid()=user_id);
create policy "own saved insert" on public.saved_places for insert with check (auth.uid()=user_id);
create policy "own saved update" on public.saved_places for update using (auth.uid()=user_id);
create policy "own saved delete" on public.saved_places for delete using (auth.uid()=user_id);
create policy "public lists readable" on public.lists for select using (is_public or auth.uid()=user_id);
create policy "own lists insert" on public.lists for insert with check (auth.uid()=user_id);
create policy "own lists update" on public.lists for update using (auth.uid()=user_id);
create policy "own lists delete" on public.lists for delete using (auth.uid()=user_id);
create policy "list items readable" on public.list_items for select using (exists(select 1 from public.lists l where l.id=list_id and (l.is_public or l.user_id=auth.uid())));
create policy "own list items insert" on public.list_items for insert with check (exists(select 1 from public.lists l where l.id=list_id and l.user_id=auth.uid()));
create policy "own list items delete" on public.list_items for delete using (exists(select 1 from public.lists l where l.id=list_id and l.user_id=auth.uid()));
create policy "own friendships readable" on public.friendships for select using (auth.uid()=requester_id or auth.uid()=addressee_id);
create policy "own friendship create" on public.friendships for insert with check (auth.uid()=requester_id);
create policy "friendship update" on public.friendships for update using (auth.uid()=requester_id or auth.uid()=addressee_id);
create policy "friendship delete" on public.friendships for delete using (auth.uid()=requester_id or auth.uid()=addressee_id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1))); return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();