begin;

select plan(19);

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '90000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'quote-admin@example.test',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now()
);

insert into public.profiles (user_id, organization_id, display_name, status)
values (
  '90000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'Quote Admin',
  'active'
);

insert into public.user_permissions (user_id, permission_code, granted_by)
values (
  '90000000-0000-4000-8000-000000000001',
  'perm.create_order',
  '90000000-0000-4000-8000-000000000001'
);

select has_function(
  'public',
  'save_quote_tx',
  array['uuid', 'uuid', 'jsonb'],
  'quote save transaction rpc exists'
);

select has_function(
  'public',
  'revise_quote_tx',
  array['uuid', 'uuid', 'uuid', 'jsonb'],
  'quote revision transaction rpc exists'
);

create temporary table quote_results (
  name text primary key,
  result jsonb not null
) on commit drop;

insert into quote_results (name, result)
values (
  'base_quote',
  public.save_quote_tx(
    '90000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'customer_id', null,
      'customer_snapshot', jsonb_build_object('type', 'retail', 'name', 'Khach le'),
      'items', jsonb_build_array(
        jsonb_build_object(
          'product_id', '00000000-0000-4000-8000-000000000303',
          'quantity', 1,
          'unit_price', 180000,
          'discount_amount', 10000,
          'price_source', 'manual',
          'note', 'Bao gia test'
        )
      ),
      'note', 'Bao gia phase 3A'
    )
  )
);

select ok(
  (select result->>'order_code' from quote_results where name = 'base_quote') like 'BG%',
  'save quote creates BG code'
);

select is(
  (select order_type from public.orders where id = ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid)),
  'quote',
  'saved order is quote'
);

select is(
  (select status from public.orders where id = ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid)),
  'active',
  'quote starts active'
);

select is(
  (select payment_status from public.orders where id = ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid)),
  'not_applicable',
  'quote payment status is not applicable'
);

select is(
  (select total_amount from public.orders where id = ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid)),
  170000::numeric,
  'quote stores server-calculated total after line discount'
);

select is(
  (select count(*)::integer from public.stock_movements where order_id = ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid)),
  0,
  'quote creates no stock movement'
);

select is(
  (select count(*)::integer from public.payment_receipts where order_id = ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid)),
  0,
  'quote creates no payment receipt'
);

select is(
  (select count(*)::integer from public.customer_debt_entries where order_id = ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid)),
  0,
  'quote creates no debt entry'
);

insert into quote_results (name, result)
values (
  'quote_revision',
  public.revise_quote_tx(
    '90000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid),
    jsonb_build_object(
      'customer_id', null,
      'customer_snapshot', jsonb_build_object('type', 'retail', 'name', 'Khach le'),
      'items', jsonb_build_array(
        jsonb_build_object(
          'product_id', '00000000-0000-4000-8000-000000000303',
          'quantity', 2,
          'unit_price', 180000,
          'discount_amount', 0,
          'price_source', 'manual'
        )
      ),
      'note', 'Bao gia sua'
    )
  )
);

select ok(
  (select result->>'order_code' from quote_results where name = 'quote_revision') like 'BG%.01',
  'revision creates BG .01 code'
);

select is(
  (select status from public.orders where id = ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid)),
  'cancelled',
  'old quote is cancelled after revision'
);

select is(
  (select cancel_reason_type from public.orders where id = ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid)),
  'revised',
  'old quote cancel reason is revised'
);

select throws_ok(
  $$ select public.revise_quote_tx(
    '90000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    ((select result->>'order_id' from quote_results where name = 'base_quote')::uuid),
    jsonb_build_object(
      'customer_id', null,
      'customer_snapshot', jsonb_build_object('type', 'retail', 'name', 'Khach le'),
      'items', jsonb_build_array(jsonb_build_object('product_id', '00000000-0000-4000-8000-000000000303', 'quantity', 1, 'unit_price', 180000, 'discount_amount', 0, 'price_source', 'manual'))
    )
  ) $$,
  '22023',
  null,
  'cancelled quote cannot be revised again'
);

insert into quote_results (name, result)
values (
  'invoice_from_quote',
  public.checkout_order_tx(
    '90000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'source_quote_id', ((select result->>'order_id' from quote_results where name = 'quote_revision')::uuid),
      'customer_id', null,
      'items', jsonb_build_array(
        jsonb_build_object(
          'product_id', '00000000-0000-4000-8000-000000000303',
          'quantity', 1,
          'unit_price', 180000,
          'discount_amount', 0,
          'price_source', 'manual'
        )
      ),
      'payment', jsonb_build_object(
        'cash_amount', 180000,
        'bank_amount', 0,
        'old_debt_payment_amount', 0,
        'change_returned_amount', 0
      )
    )
  )
);

select is(
  (select status from public.orders where id = ((select result->>'order_id' from quote_results where name = 'quote_revision')::uuid)),
  'converted',
  'checkout converts quote'
);

select is(
  (select source_quote_id from public.orders where id = ((select result->>'order_id' from quote_results where name = 'invoice_from_quote')::uuid)),
  ((select result->>'order_id' from quote_results where name = 'quote_revision')::uuid),
  'invoice stores source quote id'
);

select is(
  (select source_quote_code from public.orders where id = ((select result->>'order_id' from quote_results where name = 'invoice_from_quote')::uuid)),
  (select result->>'order_code' from quote_results where name = 'quote_revision'),
  'invoice stores source quote code'
);

select is(
  (select count(*)::integer from public.order_status_history where order_id = ((select result->>'order_id' from quote_results where name = 'quote_revision')::uuid) and to_status = 'converted'),
  1,
  'quote conversion writes status history'
);

select throws_ok(
  $$ select public.checkout_order_tx(
    '90000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'source_quote_id', ((select result->>'order_id' from quote_results where name = 'quote_revision')::uuid),
      'customer_id', null,
      'items', jsonb_build_array(jsonb_build_object('product_id', '00000000-0000-4000-8000-000000000303', 'quantity', 1, 'unit_price', 180000, 'discount_amount', 0, 'price_source', 'manual')),
      'payment', jsonb_build_object('cash_amount', 180000, 'bank_amount', 0, 'old_debt_payment_amount', 0, 'change_returned_amount', 0)
    )
  ) $$,
  '22023',
  null,
  'converted quote cannot be checked out again'
);

select * from finish();
rollback;
