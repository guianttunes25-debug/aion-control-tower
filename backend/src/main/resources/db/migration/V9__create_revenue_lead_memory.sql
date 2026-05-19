create table if not exists revenue_lead_memory (
    id bigserial primary key,
    lead_name varchar(255) not null unique,
    niche varchar(255) not null,
    product_offer varchar(255) not null,
    target_monthly_price varchar(50) not null,
    website varchar(500),
    instagram varchar(500),
    objections varchar(2000),
    competitors varchar(2000),
    campaign_history varchar(2000),
    behavior_notes varchar(2000),
    revenue_generated numeric(12, 2) not null default 0,
    meetings_booked integer not null default 0,
    offers_accepted integer not null default 0,
    monthly_recurring_revenue numeric(12, 2) not null default 0,
    created_at timestamp(6) with time zone not null,
    updated_at timestamp(6) with time zone not null
);

create index if not exists idx_revenue_lead_memory_niche on revenue_lead_memory(niche);
create index if not exists idx_revenue_lead_memory_updated_at on revenue_lead_memory(updated_at);