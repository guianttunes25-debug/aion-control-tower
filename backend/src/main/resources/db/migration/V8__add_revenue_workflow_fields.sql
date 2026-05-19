alter table tasks
add column if not exists workflow_id varchar(80),
add column if not exists workflow_step integer,
add column if not exists blocked_by_task_id bigint references tasks(id);

create index if not exists idx_tasks_workflow_id_step on tasks(workflow_id, workflow_step);
create index if not exists idx_tasks_blocked_by_task_id on tasks(blocked_by_task_id);