create table if not exists tasks (
    id bigserial primary key,
    title varchar(255) not null,
    description varchar(2000),
    status varchar(50) not null,
    created_at timestamp(6) with time zone not null
);