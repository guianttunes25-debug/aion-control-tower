alter table tasks
    add column if not exists retry_count integer not null default 0,
    add column if not exists max_retries integer not null default 3,
    add column if not exists last_failure_reason varchar(2000),
    add column if not exists next_retry_at timestamp(6) with time zone,
    add column if not exists started_at timestamp(6) with time zone,
    add column if not exists completed_at timestamp(6) with time zone;

update tasks
set completed_at = updated_at
where status = 'COMPLETED' and completed_at is null;

create index if not exists idx_tasks_status_next_retry_at on tasks(status, next_retry_at);
create index if not exists idx_tasks_status_updated_at on tasks(status, updated_at);