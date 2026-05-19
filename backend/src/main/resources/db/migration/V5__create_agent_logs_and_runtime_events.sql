create table if not exists agent_execution_logs (
    id bigserial primary key,
    agent_id bigint references agents(id),
    task_id bigint references tasks(id),
    level varchar(20) not null,
    message varchar(2000) not null,
    timestamp timestamp(6) with time zone not null
);

create table if not exists runtime_events (
    id bigserial primary key,
    type varchar(80) not null,
    agent_id bigint references agents(id),
    task_id bigint references tasks(id),
    message varchar(2000) not null,
    timestamp timestamp(6) with time zone not null
);

create index if not exists idx_agent_execution_logs_agent_id on agent_execution_logs(agent_id);
create index if not exists idx_agent_execution_logs_task_id on agent_execution_logs(task_id);
create index if not exists idx_agent_execution_logs_timestamp on agent_execution_logs(timestamp);
create index if not exists idx_runtime_events_type on runtime_events(type);
create index if not exists idx_runtime_events_task_id on runtime_events(task_id);
create index if not exists idx_runtime_events_timestamp on runtime_events(timestamp);