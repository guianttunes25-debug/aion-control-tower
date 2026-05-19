alter table tasks
add column if not exists required_agent_type varchar(50) not null default 'CODE';

create index if not exists idx_tasks_required_agent_type_status on tasks(required_agent_type, status);