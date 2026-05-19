create table if not exists system_checkpoint (
    id bigserial primary key,
    marker varchar(255) not null,
    created_at timestamp(6) with time zone not null
);