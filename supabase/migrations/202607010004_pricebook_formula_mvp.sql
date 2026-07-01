alter table public.products
  add column if not exists latest_purchase_cost numeric(12,0),
  add column if not exists latest_purchase_cost_at timestamptz,
  add column if not exists latest_purchase_cost_updated_by uuid references public.profiles(user_id) on delete set null;

alter table public.products
  drop constraint if exists products_latest_purchase_cost_check;

alter table public.products
  add constraint products_latest_purchase_cost_check check (
    latest_purchase_cost is null or latest_purchase_cost >= 0
  );

create table if not exists public.price_formula_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  product_filter jsonb not null default '{}'::jsonb,
  cost_formula jsonb not null,
  profit_formula jsonb not null,
  price_list_adjustments jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(user_id) on delete set null,
  updated_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_formula_rules_name_check check (char_length(btrim(name)) between 1 and 120),
  constraint price_formula_rules_product_filter_object_check check (jsonb_typeof(product_filter) = 'object'),
  constraint price_formula_rules_cost_formula_object_check check (jsonb_typeof(cost_formula) = 'object'),
  constraint price_formula_rules_profit_formula_object_check check (jsonb_typeof(profit_formula) = 'object'),
  constraint price_formula_rules_adjustments_object_check check (jsonb_typeof(price_list_adjustments) = 'object')
);

create index if not exists idx_price_formula_rules_org_active
  on public.price_formula_rules (organization_id, is_active);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_price_formula_rules_updated_at'
  ) then
    create trigger set_price_formula_rules_updated_at
    before update on public.price_formula_rules
    for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.price_formula_rules enable row level security;

grant select, insert, update, delete on public.price_formula_rules to service_role;

alter table public.price_list_items
  add column if not exists pricing_mode text not null default 'manual',
  add column if not exists formula_rule_id uuid references public.price_formula_rules(id) on delete set null;

alter table public.price_list_items
  alter column unit_price drop not null;

alter table public.price_list_items
  drop constraint if exists price_list_items_unit_price_check,
  drop constraint if exists price_list_items_pricing_mode_check,
  drop constraint if exists price_list_items_price_mode_value_check;

alter table public.price_list_items
  add constraint price_list_items_pricing_mode_check check (pricing_mode in ('manual', 'formula')),
  add constraint price_list_items_price_mode_value_check check (
    (
      pricing_mode = 'manual'
      and unit_price is not null
      and unit_price >= 0
    )
    or (
      pricing_mode = 'formula'
      and formula_rule_id is not null
    )
  );
