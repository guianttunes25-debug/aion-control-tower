alter table tasks
    add column if not exists updated_at timestamp(6) with time zone;

update tasks
set updated_at = created_at
where updated_at is null;

alter table tasks
    alter column updated_at set not null;