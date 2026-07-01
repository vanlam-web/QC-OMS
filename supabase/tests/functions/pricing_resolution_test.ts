import { assertEquals } from "jsr:@std/assert@1";
import { resolvePriceRows } from "../../functions/api/repositories/foundation-repository.ts";

Deno.test("price resolution keeps default zero as declared price", () => {
  const items = resolvePriceRows({
    productIds: ["p-1"],
    defaultPriceListId: "pl-default",
    customerPriceListId: null,
    priceRows: [
      { product_id: "p-1", price_list_id: "pl-default", unit_price: 0 },
    ],
    latestPurchaseCosts: new Map(),
  });

  assertEquals(items, [
    {
      product_id: "p-1",
      unit_price: 0,
      price_source: "default_price_list",
      price_list_id: "pl-default",
    },
  ]);
});

Deno.test("price resolution uses missing latest cost source for customer group zero", () => {
  const items = resolvePriceRows({
    productIds: ["p-1"],
    defaultPriceListId: "pl-default",
    customerPriceListId: "pl-group",
    priceRows: [
      { product_id: "p-1", price_list_id: "pl-group", unit_price: 0 },
      { product_id: "p-1", price_list_id: "pl-default", unit_price: 120000 },
    ],
    latestPurchaseCosts: new Map(),
  });

  assertEquals(items, [
    {
      product_id: "p-1",
      unit_price: 0,
      price_source: "latest_purchase_cost_missing_zero",
      price_list_id: "pl-group",
    },
  ]);
});

Deno.test("price resolution falls back to default only when customer group row is missing", () => {
  const items = resolvePriceRows({
    productIds: ["p-1"],
    defaultPriceListId: "pl-default",
    customerPriceListId: "pl-group",
    priceRows: [
      { product_id: "p-1", price_list_id: "pl-default", unit_price: 120000 },
    ],
    latestPurchaseCosts: new Map(),
  });

  assertEquals(items, [
    {
      product_id: "p-1",
      unit_price: 120000,
      price_source: "fallback_default_price_list",
      price_list_id: "pl-default",
    },
  ]);
});

Deno.test("price resolution uses latest purchase cost when group row is zero and cost exists", () => {
  const items = resolvePriceRows({
    productIds: ["p-1"],
    defaultPriceListId: "pl-default",
    customerPriceListId: "pl-group",
    priceRows: [
      { product_id: "p-1", price_list_id: "pl-group", unit_price: 0 },
      { product_id: "p-1", price_list_id: "pl-default", unit_price: 120000 },
    ],
    latestPurchaseCosts: new Map([["p-1", 88000]]),
  });

  assertEquals(items, [
    {
      product_id: "p-1",
      unit_price: 88000,
      price_source: "latest_purchase_cost",
      price_list_id: "pl-group",
    },
  ]);
});
