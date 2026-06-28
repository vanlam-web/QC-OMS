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
  ('perm.edit_price_book', 'pricing', 'Edit price books', 'active'),
  ('perm.manage_users', 'administration', 'Manage users and permissions', 'active')
on conflict (code) do update
set module = excluded.module,
    description = excluded.description,
    status = excluded.status;
