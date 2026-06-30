begin;

select plan(33);

select has_table('public', 'customer_groups', 'customer_groups table exists');
select has_column('public', 'customer_groups', 'organization_id', 'customer_groups.organization_id exists');
select has_column('public', 'customer_groups', 'code', 'customer_groups.code exists');
select has_column('public', 'customer_groups', 'name', 'customer_groups.name exists');
select has_column('public', 'customer_groups', 'price_list_id', 'customer_groups.price_list_id exists');
select has_column('public', 'customer_groups', 'is_active', 'customer_groups.is_active exists');
select col_not_null('public', 'customer_groups', 'organization_id', 'customer_groups.organization_id is not null');
select col_not_null('public', 'customer_groups', 'code', 'customer_groups.code is not null');
select col_not_null('public', 'customer_groups', 'name', 'customer_groups.name is not null');
select col_not_null('public', 'customer_groups', 'price_list_id', 'customer_groups.price_list_id is not null');
select col_not_null('public', 'customer_groups', 'is_active', 'customer_groups.is_active is not null');
select has_index('public', 'customer_groups', 'idx_customer_groups_org_active', 'customer_groups has org/active index');
select has_index('public', 'customer_groups', 'idx_customer_groups_org_price_list', 'customer_groups has org/price-list index');

select has_table('public', 'customers', 'customers table exists');
select has_column('public', 'customers', 'organization_id', 'customers.organization_id exists');
select has_column('public', 'customers', 'code', 'customers.code exists');
select has_column('public', 'customers', 'name', 'customers.name exists');
select has_column('public', 'customers', 'phone', 'customers.phone exists');
select has_column('public', 'customers', 'phone_normalized', 'customers.phone_normalized exists');
select has_column('public', 'customers', 'customer_group_id', 'customers.customer_group_id exists');
select col_not_null('public', 'customers', 'organization_id', 'customers.organization_id is not null');
select col_not_null('public', 'customers', 'code', 'customers.code is not null');
select col_not_null('public', 'customers', 'name', 'customers.name is not null');
select has_index('public', 'customers', 'idx_customers_org_name', 'customers has org/name index');
select has_index('public', 'customers', 'idx_customers_org_code', 'customers has org/code index');
select has_index('public', 'customers', 'idx_customers_org_group', 'customers has org/group index');
select has_index('public', 'customers', 'idx_customers_org_phone_normalized', 'customers has org/phone index');

select has_function('public', 'normalize_customer_phone', array['text'], 'phone normalizer exists');
select has_function('public', 'next_customer_code', array['uuid'], 'customer code generator exists');

select is(
  public.normalize_customer_phone(' 090 123-4567 '),
  '0901234567',
  'phone normalization keeps digits'
);

select ok(
  public.next_customer_code('00000000-0000-4000-8000-000000000001') ~ '^KH[0-9]{6}$',
  'next customer code uses KH000001 format'
);

insert into public.customer_groups (id, organization_id, code, name, price_list_id)
values (
  '00000000-0000-4000-8000-000000000402',
  '00000000-0000-4000-8000-000000000001',
  'TEST',
  'Nhom test',
  '00000000-0000-4000-8000-000000000201'
);

insert into public.customers (organization_id, code, name, phone, customer_group_id)
values (
  '00000000-0000-4000-8000-000000000001',
  'KH900001',
  'Cong ty ABC',
  '090 123 4567',
  '00000000-0000-4000-8000-000000000402'
);

select is(
  (select phone_normalized from public.customers where code = 'KH900001'),
  '0901234567',
  'customer phone_normalized is generated'
);

select throws_ok(
  $$ insert into public.customers (organization_id, code, name, phone)
     values ('00000000-0000-4000-8000-000000000001', 'KH000002', 'Khach trung SDT', '0901234567') $$,
  '23505',
  'duplicate key value violates unique constraint "customers_org_phone_normalized_key"',
  'duplicate normalized phone is rejected'
);

select * from finish();
rollback;
