-- Skills table for freelancers
create table public.freelancer_skills (
  id uuid default gen_random_uuid() primary key,
  freelancer_id uuid references public.freelancer_profiles(id) 
    on delete cascade,
  skill text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table public.freelancer_skills enable row level security;

create policy "Skills are viewable by everyone"
  on public.freelancer_skills for select using (true);

create policy "Freelancers can manage their own skills"
  on public.freelancer_skills for all using (
    auth.uid() = (
      select p.id from public.profiles p
      join public.freelancer_profiles fp on fp.user_id = p.id
      where fp.id = freelancer_id
    )
  );
