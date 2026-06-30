insert into public.organizations (id, code, name, status)
values ('00000000-0000-4000-8000-000000000001', 'VAN-LAM', 'Xưởng Văn Lâm', 'active')
on conflict (id) do update
set code = excluded.code,
    name = excluded.name,
    status = excluded.status;

insert into public.workstations (id, organization_id, code, name, status)
values (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'POS-01',
  'Quầy thu ngân 1',
  'active'
)
on conflict (id) do update
set organization_id = excluded.organization_id,
    code = excluded.code,
    name = excluded.name,
    status = excluded.status;

insert into public.permissions (code, module, description, status)
values
  ('perm.view_shift_report', 'reports', 'View shift reports', 'active'),
  ('perm.access_admin_panel', 'administration', 'Access the administration panel', 'active'),
  ('perm.create_order', 'sales', 'Create sales orders', 'active'),
  ('perm.edit_order_locked', 'sales', 'Edit locked sales orders', 'active'),
  ('perm.apply_discount', 'sales', 'Apply discounts to sales orders', 'active'),
  ('perm.refund_order', 'sales', 'Refund sales orders', 'active'),
  ('perm.manage_inventory', 'inventory', 'Manage inventory records', 'active'),
  ('perm.edit_price_book', 'catalog', 'Manage products and price lists', 'active'),
  ('perm.manage_users', 'administration', 'Manage users and permissions', 'active')
on conflict (code) do update
set module = excluded.module,
    description = excluded.description,
    status = excluded.status;

insert into public.price_lists (id, organization_id, code, name, is_default, is_active)
values (
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000001',
  'DEFAULT',
  'Bảng giá chung',
  true,
  true
)
on conflict (id) do update
set organization_id = excluded.organization_id,
    code = excluded.code,
    name = excluded.name,
    is_default = excluded.is_default,
    is_active = excluded.is_active;

insert into public.products (id, organization_id, code, name, status, unit_name, sell_method)
values
  (
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000001',
    'MICA-3MM',
    'Mica 3mm',
    'active',
    'm',
    'linear_m'
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000001',
    'DECAL-PP',
    'Decal PP',
    'active',
    'm²',
    'area_m2'
  ),
  (
    '00000000-0000-4000-8000-000000000303',
    '00000000-0000-4000-8000-000000000001',
    'STANDEE',
    'Standee chữ X',
    'active',
    'cái',
    'quantity'
  )
on conflict (id) do update
set organization_id = excluded.organization_id,
    code = excluded.code,
    name = excluded.name,
    status = excluded.status,
    unit_name = excluded.unit_name,
    sell_method = excluded.sell_method;

insert into public.price_list_items (organization_id, price_list_id, product_id, unit_price)
values
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000301',
    120000
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000302',
    65000
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000303',
    180000
  )
on conflict (price_list_id, product_id) do update
set organization_id = excluded.organization_id,
    unit_price = excluded.unit_price;
