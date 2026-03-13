-- Core extensions
create extension if not exists pgcrypto;

-- Enums
create type public.user_role as enum ('admin', 'teacher', 'class_rep', 'student');
create type public.schedule_status as enum ('Scheduled', 'Cancelled', 'Rescheduled');
create type public.announcement_priority as enum ('normal', 'important', 'urgent');
create type public.notification_type as enum ('announcement', 'test', 'schedule', 'attendance', 'class');

-- Auto-updated timestamp helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profile table backed by auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role public.user_role not null,
  first_name text,
  last_name text,
  university text,
  department text,
  phone text,
  student_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  semester_name text not null,
  department text not null,
  university text not null,
  year text not null,
  class_code text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_classrooms_updated_at
before update on public.classrooms
for each row execute function public.set_updated_at();

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (classroom_id, code)
);

create trigger trg_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  name text not null,
  student_id text not null,
  department text,
  university text,
  phone text,
  attendance_percentage numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (classroom_id, student_id)
);

create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  name text not null,
  phone text,
  course_code text,
  course_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_teachers_updated_at
before update on public.teachers
for each row execute function public.set_updated_at();

create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (classroom_id, user_id)
);

create table if not exists public.class_teachers (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (classroom_id, teacher_id)
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  course_code text not null,
  course_name text not null,
  instructor text not null,
  day text not null,
  time_slot text not null,
  room text not null,
  status public.schedule_status not null default 'Scheduled',
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_schedules_updated_at
before update on public.schedules
for each row execute function public.set_updated_at();

create table if not exists public.attendance_sheets (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  course_code text not null,
  course_name text not null,
  attendance_date date not null,
  records_by_student_id jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (classroom_id, course_id, attendance_date)
);

create trigger trg_attendance_sheets_updated_at
before update on public.attendance_sheets
for each row execute function public.set_updated_at();

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references public.attendance_sheets(id) on delete cascade,
  student_id text not null,
  present boolean not null,
  marked_at timestamptz not null default now(),
  unique (sheet_id, student_id)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  title text not null,
  body text not null,
  author_name text not null,
  author_role text not null,
  created_by uuid references public.profiles(id) on delete set null,
  priority public.announcement_priority not null default 'normal',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  payload_json jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS on all user-facing tables
alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.class_teachers enable row level security;
alter table public.schedules enable row level security;
alter table public.attendance_sheets enable row level security;
alter table public.attendance_records enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;

-- Basic policies (adjust for stricter production rules)
create policy if not exists "profiles readable by authenticated"
on public.profiles for select
using (auth.role() = 'authenticated');

create policy if not exists "profile owner upsert"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy if not exists "classrooms readable"
on public.classrooms for select
using (auth.role() = 'authenticated');

create policy if not exists "classrooms writable by teachers/cr/admin"
on public.classrooms for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
);

create policy if not exists "courses readable"
on public.courses for select using (auth.role() = 'authenticated');

create policy if not exists "courses writable by teachers/cr/admin"
on public.courses for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
);

create policy if not exists "students readable"
on public.students for select using (auth.role() = 'authenticated');

create policy if not exists "students writable by teachers/cr/admin"
on public.students for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
);

create policy if not exists "teachers readable"
on public.teachers for select using (auth.role() = 'authenticated');

create policy if not exists "teachers writable by teachers/cr/admin"
on public.teachers for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
);

create policy if not exists "schedules readable"
on public.schedules for select using (auth.role() = 'authenticated');

create policy if not exists "schedules writable by teachers/cr/admin"
on public.schedules for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
);

create policy if not exists "attendance readable"
on public.attendance_sheets for select using (auth.role() = 'authenticated');

create policy if not exists "attendance writable by teachers/cr/admin"
on public.attendance_sheets for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
);

create policy if not exists "announcement readable"
on public.announcements for select using (auth.role() = 'authenticated');

create policy if not exists "announcement writable by teachers/cr/admin"
on public.announcements for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
);

create policy if not exists "notification owner read"
on public.notifications for select
using (auth.uid() = user_id);

create policy if not exists "notification owner update"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "notification system insert"
on public.notifications for insert
with check (auth.role() = 'authenticated');

create policy if not exists "class enrollment read"
on public.class_enrollments for select
using (auth.uid() = user_id or auth.role() = 'authenticated');

create policy if not exists "class enrollment write"
on public.class_enrollments for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "class teacher read"
on public.class_teachers for select
using (auth.role() = 'authenticated');

create policy if not exists "class teacher write"
on public.class_teachers for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
);

create policy if not exists "attendance_records readable"
on public.attendance_records for select using (auth.role() = 'authenticated');

create policy if not exists "attendance_records writable"
on public.attendance_records for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('teacher', 'class_rep', 'admin')
  )
);

-- Realtime publication
alter publication supabase_realtime add table public.attendance_sheets;
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.courses;
alter publication supabase_realtime add table public.students;
alter publication supabase_realtime add table public.teachers;
alter publication supabase_realtime add table public.schedules;
alter publication supabase_realtime add table public.classrooms;
