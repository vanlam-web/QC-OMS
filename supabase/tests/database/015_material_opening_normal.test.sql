begin;

select plan(18);

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '20000000-0000-4000-8000-000000000715',
  'authenticated',
  'authenticated',
  'material-opening-test@qc.local',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now()
);

insert into public.profiles (user_id, organization_id, display_name)
values (
  '20000000-0000-4000-8000-000000000715',
  '00000000-0000-4000-8000-000000000001',
  'Material Opening Test User'
);

insert into public.inventory_units (id, organization_id, code, name, unit_kind, decimal_precision, is_active)
values (
  '20000000-0000-4000-8000-000000000615',
  '00000000-0000-4000-8000-000000000001',
  'RAM',
  'Ram',
  'package',
  0,
  true
);

select has_table('public', 'inventory_provisional_balances', 'inventory provisional balance table exists');
select has_table('public', 'inventory_material_openings', 'inventory material opening log table exists');
select has_column('public', 'inventory_material_openings', 'inventory_shape', 'material openings store inventory shape');
select has_column('public', 'inventory_material_openings', 'source_type', 'material openings store source type');
select has_column('public', 'inventory_material_openings', 'input_payload', 'material openings store input payload');
select has_column('public', 'inventory_material_openings', 'result_payload', 'material openings store result payload');
select has_index('public', 'inventory_material_openings', 'idx_inventory_material_openings_product_time', 'material openings product/time index exists');
select has_index('public', 'inventory_material_openings', 'idx_inventory_material_openings_created_by', 'material openings created-by index exists');

select has_function(
  'public',
  'open_normal_material_tx',
  array['uuid', 'uuid', 'jsonb'],
  'normal material opening transaction rpc exists'
);

insert into public.product_unit_conversions (
  organization_id,
  product_id,
  sale_unit_id,
  stock_unit_id,
  stock_qty_per_sale_unit,
  is_active
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000303',
  '20000000-0000-4000-8000-000000000615',
  '00000000-0000-4000-8000-000000000603',
  500,
  true
);

create temporary table material_opening_results (
  name text primary key,
  result jsonb not null
) on commit drop;

insert into material_opening_results (name, result)
values (
  'normal_conversion',
  public.open_normal_material_tx(
    '20000000-0000-4000-8000-000000000715',
    '00000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'product_id', '00000000-0000-4000-8000-000000000303',
      'inventory_shape', 'normal',
      'opened_unit_id', '20000000-0000-4000-8000-000000000615',
      'opened_qty', 1,
      'old_remaining_qty', 0,
      'note', 'Khui ram giấy'
    )
  )
);

select is(
  (select result->>'inventory_shape' from material_opening_results where name = 'normal_conversion'),
  'normal',
  'normal opening result keeps inventory shape'
);

select is(
  (select (result->>'opened_stock_qty')::numeric from material_opening_results where name = 'normal_conversion'),
  500::numeric,
  'normal opening result converts opened package to stock quantity'
);

select is(
  (select count(*)::integer from public.inventory_material_openings where id = ((select result->>'id' from material_opening_results where name = 'normal_conversion')::uuid)),
  1,
  'normal opening writes one material opening log'
);

select is(
  (select count(*)::integer from public.inventory_rolls where product_id = '00000000-0000-4000-8000-000000000303'),
  0,
  'normal opening does not create roll object'
);

select is(
  (select count(*)::integer from public.inventory_sheets where product_id = '00000000-0000-4000-8000-000000000303'),
  0,
  'normal opening does not create sheet object'
);

select is(
  (select count(*)::integer from public.stock_movements where reason = 'material_opening_normal'),
  0,
  'normal opening log-only path does not write zero-delta stock movement'
);

select throws_ok(
  $$
    select public.open_normal_material_tx(
      '20000000-0000-4000-8000-000000000715',
      '00000000-0000-4000-8000-000000000001',
      jsonb_build_object(
        'product_id', '00000000-0000-4000-8000-000000000303',
        'inventory_shape', 'normal',
        'opened_unit_id', '00000000-0000-4000-8000-000000000601',
        'opened_qty', 1
      )
    )
  $$,
  '22023',
  'active product unit conversion is required',
  'normal opening rejects opened unit without active conversion'
);

select throws_ok(
  $$
    select public.open_normal_material_tx(
      '20000000-0000-4000-8000-000000000715',
      '00000000-0000-4000-8000-000000000001',
      jsonb_build_object(
        'product_id', '00000000-0000-4000-8000-000000000302',
        'inventory_shape', 'normal',
        'opened_unit_id', '00000000-0000-4000-8000-000000000601',
        'opened_qty', 1
      )
    )
  $$,
  '22023',
  'normal material opening requires normal inventory shape',
  'normal opening rejects roll or sheet products'
);

select throws_ok(
  $$
    select public.open_normal_material_tx(
      '20000000-0000-4000-8000-000000000715',
      '00000000-0000-4000-8000-000000000001',
      jsonb_build_object(
        'product_id', '00000000-0000-4000-8000-000000000303',
        'inventory_shape', 'normal',
        'opened_unit_id', '20000000-0000-4000-8000-000000000615',
        'opened_qty', 0
      )
    )
  $$,
  '22023',
  'opened quantity must be positive',
  'normal opening rejects zero quantity'
);

select * from finish();
rollback;
