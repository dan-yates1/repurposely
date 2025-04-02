-- Function to insert default token records for a new user (Simplified)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  free_token_amount int := 50; -- Default tokens for FREE tier
  reset_date_calc timestamp;
begin
  -- Calculate reset date (1st of next month)
  reset_date_calc := date_trunc('month', now()) + interval '1 month';

  -- Insert into token_usage table ONLY
  insert into public.token_usage (user_id, tokens_used, tokens_remaining, reset_date, updated_at)
  values (new.id, 0, free_token_amount, reset_date_calc, now());

  -- Temporarily removed insert into token_transactions table for debugging
  -- insert into public.token_transactions (user_id, amount, operation_type, operation_details, created_at)
  -- values (new.id, free_token_amount, 'ACCOUNT_INITIALIZATION', '{ "subscription_tier": "FREE" }', now());
  
  return new;
end;
$$;

-- Trigger to call the function after a new user is inserted into auth.users
-- Drop trigger first if it already exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users; 

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
