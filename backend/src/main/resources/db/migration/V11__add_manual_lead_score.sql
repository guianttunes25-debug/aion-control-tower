alter table revenue_lead_memory
add column if not exists lead_score integer not null default 0,
add column if not exists instagram_abandoned boolean,
add column if not exists family_business boolean,
add column if not exists no_promotions boolean,
add column if not exists competitive_neighborhood boolean,
add column if not exists score_notes varchar(2000);

create index if not exists idx_revenue_lead_memory_lead_score on revenue_lead_memory(lead_score desc, updated_at desc);