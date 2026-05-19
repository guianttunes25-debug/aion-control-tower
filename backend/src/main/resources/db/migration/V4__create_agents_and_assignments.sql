update tasks
set status = 'PENDING'
where status = 'OPEN';

create table if not exists agents (
    id bigserial primary key,
    name varchar(255) not null unique,
    type varchar(50) not null,
    status varchar(50) not null,
    last_heartbeat timestamp(6) with time zone,
    created_at timestamp(6) with time zone not null
);

create table if not exists task_assignments (
    id bigserial primary key,
    task_id bigint not null references tasks(id),
    agent_id bigint not null references agents(id),
    assigned_at timestamp(6) with time zone not null
);

create index if not exists idx_tasks_status_created_at on tasks(status, created_at);
create index if not exists idx_agents_status_last_heartbeat on agents(status, last_heartbeat);
create index if not exists idx_task_assignments_task_id on task_assignments(task_id);
create index if not exists idx_task_assignments_agent_id on task_assignments(agent_id);