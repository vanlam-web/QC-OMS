begin;

select plan(41);

select has_table('public', 'products');
select has_column('public', 'products', 'organization_id');
select has_column('public', 'products', 'code');
select has_column('public', 'products', 'name');
select has_column('public', 'products', 'status');
select has_column('public', 'products', 'unit_name');
select has_column('public', 'products', 'sell_method');
select col_not_null('public', 'products', 'organization_id');
select col_not_null('public', 'products', 'code');
select col_not_null('public', 'products', 'name');
select col_not_null('public', 'products', 'status');
select col_not_null('public', 'products', 'unit_name');
select col_not_null('public', 'products', 'sell_method');
select has_index('public', 'products', 'idx_products_org_status');
select has_index('public', 'products', 'idx_products_org_code');
select has_index('public', 'products', 'idx_products_org_name');

select has_table('public', 'price_lists');
select has_column('public', 'price_lists', 'organization_id');
select has_column('public', 'price_lists', 'code');
select has_column('public', 'price_lists', 'name');
select has_column('public', 'price_lists', 'is_default');
select has_column('public', 'price_lists', 'is_active');
select col_not_null('public', 'price_lists', 'organization_id');
select col_not_null('public', 'price_lists', 'code');
select col_not_null('public', 'price_lists', 'name');
select col_not_null('public', 'price_lists', 'is_default');
select col_not_null('public', 'price_lists', 'is_active');
select has_index('public', 'price_lists', 'idx_price_lists_org_active');
select has_index('public', 'price_lists', 'idx_price_lists_org_default');

select has_table('public', 'price_list_items');
select has_column('public', 'price_list_items', 'organization_id');
select has_column('public', 'price_list_items', 'price_list_id');
select has_column('public', 'price_list_items', 'product_id');
select has_column('public', 'price_list_items', 'unit_price');
select col_not_null('public', 'price_list_items', 'organization_id');
select col_not_null('public', 'price_list_items', 'price_list_id');
select col_not_null('public', 'price_list_items', 'product_id');
select col_not_null('public', 'price_list_items', 'unit_price');
select has_index('public', 'price_list_items', 'idx_price_list_items_list_product');
select has_index('public', 'price_list_items', 'idx_price_list_items_product');

select results_eq(
  $$ select count(*)::integer from public.permissions where code = 'perm.edit_price_book' $$,
  array[1],
  'edit price book permission is seeded'
);

select finish();
rollback;
