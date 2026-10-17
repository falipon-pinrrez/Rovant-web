-- ============================================================
-- ROVANT - Tablas de Tareas
-- Ejecutar UNA vez en Supabase > SQL Editor
-- (la app usa login propio con la clave anon, por eso las
--  políticas RLS permiten al rol anon, igual que el resto de tablas)
-- ============================================================

create table if not exists public.tareas_rovant (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  etiqueta    text not null default 'Frontend',
  estado      text not null default 'iniciar'
              check (estado in ('iniciar','proceso','revision','terminada')),
  fecha       date,
  dias        integer not null default 1 check (dias >= 1),
  asignados   uuid[] not null default '{}',   -- ids de usuarios_rovant
  creado_por  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.comentarios_tarea (
  id          uuid primary key default gen_random_uuid(),
  tarea_id    uuid not null references public.tareas_rovant(id) on delete cascade,
  user_id     uuid,
  autor       text not null,
  texto       text not null,
  created_at  timestamptz not null default now()
);
create index if not exists comentarios_tarea_tarea_idx on public.comentarios_tarea(tarea_id);

alter table public.tareas_rovant     enable row level security;
alter table public.comentarios_tarea enable row level security;

drop policy if exists tareas_anon_all on public.tareas_rovant;
create policy tareas_anon_all on public.tareas_rovant
  for all to anon, authenticated using (true) with check (true);

drop policy if exists comentarios_anon_all on public.comentarios_tarea;
create policy comentarios_anon_all on public.comentarios_tarea
  for all to anon, authenticated using (true) with check (true);

-- Tarea de ejemplo (asignada a todos los usuarios actuales)
insert into public.tareas_rovant (titulo, etiqueta, estado, fecha, dias, asignados)
select 'Ejemplo', 'Frontend', 'iniciar', current_date, 3,
       coalesce((select array_agg(id) from public.usuarios_rovant), '{}')
where not exists (select 1 from public.tareas_rovant);

-- Permisos de tabla para la clave anon (sin esto da "permission denied")
grant select, insert, update, delete on public.tareas_rovant     to anon, authenticated;
grant select, insert, update, delete on public.comentarios_tarea to anon, authenticated;
