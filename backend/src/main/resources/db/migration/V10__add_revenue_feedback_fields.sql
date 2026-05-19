alter table revenue_lead_memory
add column if not exists objection_category varchar(100),
add column if not exists response_latency_minutes integer,
add column if not exists interest_level varchar(50),
add column if not exists meeting_outcome varchar(100),
add column if not exists business_pain_level varchar(50),
add column if not exists decision_maker_present boolean,
add column if not exists budget_range varchar(100),
add column if not exists follow_up_count integer not null default 0;

create index if not exists idx_revenue_lead_memory_interest_level on revenue_lead_memory(interest_level);
create index if not exists idx_revenue_lead_memory_objection_category on revenue_lead_memory(objection_category);