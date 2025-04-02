-- Grant necessary permissions for the handle_new_user trigger function
-- The supabase_auth_admin role executes auth triggers

grant usage on schema public to supabase_auth_admin;
grant insert on table public.token_usage to supabase_auth_admin;
grant insert on table public.token_transactions to supabase_auth_admin;

-- Grant select just in case (might not be strictly needed for insert but good practice)
grant select on table public.token_usage to supabase_auth_admin;
grant select on table public.token_transactions to supabase_auth_admin;

-- Grant usage on sequences if your primary keys use them (e.g., bigserial)
-- Replace 'token_usage_id_seq' and 'token_transactions_id_seq' with your actual sequence names if different
-- GRANT USAGE, SELECT ON SEQUENCE public.token_usage_id_seq TO supabase_auth_admin;
-- GRANT USAGE, SELECT ON SEQUENCE public.token_transactions_id_seq TO supabase_auth_admin;
