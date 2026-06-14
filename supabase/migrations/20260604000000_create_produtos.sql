create table public.produtos (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  sku text not null,
  produto text not null,
  categoria text not null default 'Importado NF-e',
  quantidade numeric not null default 0,
  valor numeric not null default 0,
  status text not null default 'Em estoque',
  created_at timestamptz default now()
);

alter table public.produtos enable row level security;

create policy "Usuário vê seus produtos"
  on public.produtos for select
  using (auth.uid() = user_id);

create policy "Usuário insere seus produtos"
  on public.produtos for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza seus produtos"
  on public.produtos for update
  using (auth.uid() = user_id);

create policy "Usuário deleta seus produtos"
  on public.produtos for delete
  using (auth.uid() = user_id);
