alter table public.customers
  add column address text;

alter table public.customers
  add constraint customers_address_check
  check (address is null or char_length(btrim(address)) between 1 and 300);
