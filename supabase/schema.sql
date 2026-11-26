-- ============================================================
--  EcoPuntos Unicórdoba · esquema de base de datos (Supabase)
--  Pégalo completo en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Perfil de cada usuario (1 fila por cuenta de Auth)
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  nombre             text not null,
  usuario            text not null unique,
  puntos             integer not null default 100 check (puntos >= 0),
  co2_total          numeric(8,2) not null default 0,
  reciclajes_totales integer not null default 0,
  codigo_referido    text not null unique,
  double_points      boolean not null default false,
  referido_por       text,   -- código de quien te invitó (solo se puede poner una vez)
  created_at         timestamptz not null default now()
);

-- (Si ya habías ejecutado el SQL antes, esta línea agrega la columna nueva)
alter table public.profiles add column if not exists referido_por text;

-- 2) Historial de movimientos (reciclajes y canjes)
create table if not exists public.movimientos (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  titulo     text not null,
  puntos     integer not null,
  created_at timestamptz not null default now()
);
create index if not exists movimientos_user_idx on public.movimientos (user_id, created_at desc);

-- 3) Seguridad: cada usuario solo ve y modifica SUS datos (RLS)
alter table public.profiles    enable row level security;
alter table public.movimientos enable row level security;

drop policy if exists "perfil: ver el propio"        on public.profiles;
drop policy if exists "perfil: actualizar el propio" on public.profiles;
drop policy if exists "mov: ver los propios"         on public.movimientos;
drop policy if exists "mov: insertar los propios"    on public.movimientos;

create policy "perfil: ver el propio"        on public.profiles    for select using (auth.uid() = id);
create policy "perfil: actualizar el propio" on public.profiles    for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "mov: ver los propios"         on public.movimientos for select using (auth.uid() = user_id);
create policy "mov: insertar los propios"    on public.movimientos for insert with check (auth.uid() = user_id);

-- 4) Al registrarse: crea el perfil, el bono de +100 y detecta código de referido
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario text := coalesce(nullif(new.raw_user_meta_data->>'usuario', ''), split_part(new.email, '@', 1));
  v_ref     text := upper(coalesce(new.raw_user_meta_data->>'ref', ''));
begin
  insert into public.profiles (id, nombre, usuario, codigo_referido, double_points, referido_por)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nombre', ''), 'Estudiante Unicórdoba'),
    v_usuario,
    upper(v_usuario) || '-26',
    v_ref <> '' and exists (select 1 from public.profiles where codigo_referido = v_ref),
    case when v_ref <> '' and exists (select 1 from public.profiles where codigo_referido = v_ref) then v_ref end
  );

  insert into public.movimientos (user_id, titulo, puntos)
  values (new.id, 'Bono de bienvenida Campus Unicórdoba', 100);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Ingresar un código de referido desde Perfil (una sola vez)
create or replace function public.canjear_referido(p_codigo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(p_codigo));
  v_me   public.profiles;
begin
  select * into v_me from public.profiles where id = auth.uid();
  if v_me.id is null then raise exception 'no_autenticado'; end if;
  if v_me.referido_por is not null then raise exception 'ya_tiene_referido'; end if;
  if v_code = v_me.codigo_referido then raise exception 'codigo_propio'; end if;
  if not exists (select 1 from public.profiles where codigo_referido = v_code) then
    raise exception 'codigo_invalido';
  end if;

  update public.profiles set referido_por = v_code, double_points = true where id = auth.uid();
end;
$$;

revoke all on function public.canjear_referido(text) from public;
grant execute on function public.canjear_referido(text) to authenticated;
