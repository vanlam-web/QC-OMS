begin;

select plan(11);

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '20000000-0000-4000-8000-000000000901',
  'authenticated',
  'authenticated',
  'cashbook-voucher-test@qc.local',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now()
);

insert into public.profiles (user_id, organization_id, display_name)
values (
  '20000000-0000-4000-8000-000000000901',
  '00000000-0000-4000-8000-000000000001',
  'Cashbook Voucher Test User'
);

select has_function(
  'public',
  'create_cashbook_voucher_tx',
  array['uuid', 'uuid', 'jsonb'],
  'manual cashbook voucher transaction rpc exists'
);

select throws_ok(
  $$ select public.create_cashbook_voucher_tx(
    '20000000-0000-4000-8000-000000000901',
    '00000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'voucher_direction', 'in',
      'voucher_type', 'operating_expense',
      'finance_account_id', (select id from public.finance_accounts where organization_id = '00000000-0000-4000-8000-000000000001' and code = 'CASH'),
      'amount', 45000,
      'reason', 'Sai hướng'
    )
  ) $$,
  '22023',
  'voucher_type is invalid for direction',
  'manual cashbook voucher rejects type/direction mismatch'
);

create temporary table manual_voucher_results (
  name text primary key,
  result jsonb not null
) on commit drop;

insert into manual_voucher_results (name, result)
values (
  'expense',
  public.create_cashbook_voucher_tx(
    '20000000-0000-4000-8000-000000000901',
    '00000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'voucher_direction', 'out',
      'voucher_type', 'operating_expense',
      'finance_account_id', (select id from public.finance_accounts where organization_id = '00000000-0000-4000-8000-000000000001' and code = 'CASH'),
      'amount', 45000,
      'is_business_accounted', false,
      'counterparty_type', 'employee',
      'counterparty_name', 'Nguyen Van A',
      'counterparty_phone', '0900000000',
      'reason', 'Mua văn phòng phẩm'
    )
  )
);

select ok(
  (select result->>'code' from manual_voucher_results where name = 'expense') like 'PC______',
  'manual out voucher uses PC code'
);

select is(
  (select result->>'source_type' from manual_voucher_results where name = 'expense'),
  'manual_voucher',
  'manual voucher result identifies manual source'
);

select is(
  (
    select voucher_direction
    from public.cashbook_vouchers
    where id = ((select result->>'id' from manual_voucher_results where name = 'expense')::uuid)
  ),
  'out',
  'manual voucher stores direction'
);

select is(
  (
    select amount::integer
    from public.cashbook_vouchers
    where id = ((select result->>'id' from manual_voucher_results where name = 'expense')::uuid)
  ),
  45000,
  'manual voucher stores positive amount'
);

select is(
  (
    select is_business_accounted
    from public.cashbook_vouchers
    where id = ((select result->>'id' from manual_voucher_results where name = 'expense')::uuid)
  ),
  false,
  'manual voucher stores business-accounted flag'
);

select is(
  (
    select counterparty_name
    from public.cashbook_vouchers
    where id = ((select result->>'id' from manual_voucher_results where name = 'expense')::uuid)
  ),
  'Nguyen Van A',
  'manual voucher stores counterparty name'
);

select is(
  (
    select count(*)::integer
    from public.cashbook_entries
    where cashbook_voucher_id = ((select result->>'id' from manual_voucher_results where name = 'expense')::uuid)
  ),
  1,
  'manual voucher creates one cashbook entry'
);

select is(
  (
    select amount_delta::integer
    from public.cashbook_entries
    where cashbook_voucher_id = ((select result->>'id' from manual_voucher_results where name = 'expense')::uuid)
  ),
  -45000,
  'manual out voucher creates negative cashbook delta'
);

select is(
  (
    select is_business_accounted
    from public.cashbook_entries
    where cashbook_voucher_id = ((select result->>'id' from manual_voucher_results where name = 'expense')::uuid)
  ),
  false,
  'manual voucher mirrors business-accounted flag to entry'
);

select * from finish();
rollback;
