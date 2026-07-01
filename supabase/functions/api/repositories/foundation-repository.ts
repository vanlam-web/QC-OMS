import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.108.2";
import type {
  CashbookBalanceData,
  CashbookEntryData,
  CashbookEntryDetailData,
  CashbookListData,
  CashbookVoucherData,
  CheckoutResultData,
  CustomerData,
  CustomerDebtDetailData,
  CustomerDebtSummaryData,
  CustomerGroupData,
  CurrentUserRecord,
  DebtCollectionResultData,
  FinanceAccountData,
  FoundationRepository,
  GetCurrentUserInput,
  InventoryProductData,
  PermissionCode,
  PermissionData,
  PaymentReceiptAllocationData,
  PaymentReceiptDetailData,
  PriceFormulaPreviewData,
  PriceListData,
  ProductData,
  ProductionQueueDraftPayloadData,
  ProductionQueueItemData,
  QuoteReopenPayloadData,
  QuoteSummaryData,
  ReconciliationData,
  ResolvedPriceData,
  SalesDocumentDetailData,
  SalesDocumentListItemData,
  StockMovementData,
  StocktakeData,
  UserListItem,
  WorkstationData,
} from "../contracts.ts";

type DatabaseClient = SupabaseClient;

interface PriceRow {
  product_id: string;
  unit_price: number | string | null;
  price_list_id: string;
  pricing_mode?: "manual" | "formula";
  formula_rule_id?: string | null;
}

interface PriceFormulaRuleRow {
  cost_formula: PriceFormulaCost;
  profit_formula: PriceFormulaProfit;
  price_list_adjustments: Record<string, PriceFormulaAdjustment>;
}

interface FormulaProductRow {
  id: string;
  code: string;
  name: string;
  latest_purchase_cost: number | string | null;
}

interface FormulaPriceListRow {
  id: string;
  name: string;
}

interface FormulaPriceItemRow {
  product_id: string;
  price_list_id: string;
  unit_price: number | string | null;
  pricing_mode: "manual" | "formula";
}

export type PriceFormulaCost =
  | { type: "fixed"; amount: number }
  | { type: "amount_plus_percent"; amount?: number; percent_of_latest_purchase_cost?: number };

export type PriceFormulaTier =
  | {
    operator: "<" | "<=" | ">" | ">=" | "=";
    value: number;
    amount?: number;
    percent?: number;
  }
  | {
    from_exclusive?: number;
    from_inclusive?: number;
    to_exclusive?: number;
    to_inclusive?: number;
    amount?: number;
    percent?: number;
  };

export type PriceFormulaProfit =
  | { type: "fixed"; amount: number; percent?: number }
  | { type: "tiers"; tiers: PriceFormulaTier[] };

export type PriceFormulaAdjustment =
  | { type: "amount"; amount: number }
  | { type: "percent"; percent: number };

export interface PriceFormulaInput {
  name: string;
  product_filter: Record<string, unknown>;
  cost_formula: PriceFormulaCost;
  profit_formula: PriceFormulaProfit;
  price_list_adjustments: Record<string, PriceFormulaAdjustment>;
}

export function computeFormulaPrice(input: {
  latestPurchaseCost: number | null;
  costFormula: PriceFormulaCost;
  profitFormula: PriceFormulaProfit;
  priceListAdjustment?: PriceFormulaAdjustment;
}): {
  latest_purchase_cost: number;
  cost_amount: number;
  profit_amount: number;
  adjustment_amount: number;
  computed_price: number;
} {
  const latestPurchaseCost = input.latestPurchaseCost ?? 0;
  const costAmount = computeFormulaCost(input.costFormula, latestPurchaseCost);
  const profitAmount = computeFormulaProfit(input.profitFormula, latestPurchaseCost);
  const basePrice = latestPurchaseCost + costAmount + profitAmount;
  const adjustmentAmount = computeFormulaAdjustment(input.priceListAdjustment, basePrice);

  return {
    latest_purchase_cost: latestPurchaseCost,
    cost_amount: costAmount,
    profit_amount: profitAmount,
    adjustment_amount: adjustmentAmount,
    computed_price: roundUpToThousand(basePrice + adjustmentAmount),
  };
}

export function validatePriceFormula(input: PriceFormulaInput): void {
  if (input.product_filter !== null && typeof input.product_filter === "object" && "group_id" in input.product_filter) {
    throw new Error("FORMULA_PRODUCT_GROUP_UNSUPPORTED");
  }

  if (input.profit_formula.type !== "tiers") {
    return;
  }

  const intervals: Array<{ min: number; max: number; tier: PriceFormulaTier }> = [];
  for (const tier of input.profit_formula.tiers) {
    const interval = tierToInterval(tier);
    if (interval === null) {
      throw new Error("FORMULA_TIER_INVALID");
    }
    if (intervals.some((existing) => intervalsOverlap(existing, interval))) {
      throw new Error("FORMULA_TIER_OVERLAP");
    }
    intervals.push({ ...interval, tier });
  }
}

function computeFormulaCost(formula: PriceFormulaCost, latestPurchaseCost: number): number {
  if (formula.type === "fixed") {
    return roundMoney(formula.amount);
  }

  return roundMoney((formula.amount ?? 0) + latestPurchaseCost * ((formula.percent_of_latest_purchase_cost ?? 0) / 100));
}

function computeFormulaProfit(formula: PriceFormulaProfit, latestPurchaseCost: number): number {
  if (formula.type === "fixed") {
    return roundMoney((formula.amount ?? 0) + latestPurchaseCost * ((formula.percent ?? 0) / 100));
  }

  const matchingTier = formula.tiers.find((tier) => tierMatches(tier, latestPurchaseCost));
  if (matchingTier === undefined) {
    return 0;
  }

  return roundMoney((matchingTier.amount ?? 0) + latestPurchaseCost * ((matchingTier.percent ?? 0) / 100));
}

function computeFormulaAdjustment(adjustment: PriceFormulaAdjustment | undefined, priceBeforeAdjustment: number): number {
  if (adjustment === undefined) {
    return 0;
  }
  if (adjustment.type === "amount") {
    return roundMoney(adjustment.amount);
  }
  return roundMoney(priceBeforeAdjustment * (adjustment.percent / 100));
}

function roundMoney(value: number): number {
  return Math.ceil(value);
}

function roundUpToThousand(value: number): number {
  return Math.ceil(value / 1000) * 1000;
}

function tierMatches(tier: PriceFormulaTier, value: number): boolean {
  if ("operator" in tier) {
    if (tier.operator === "<") return value < tier.value;
    if (tier.operator === "<=") return value <= tier.value;
    if (tier.operator === ">") return value > tier.value;
    if (tier.operator === ">=") return value >= tier.value;
    return value === tier.value;
  }

  const aboveMin = tier.from_exclusive !== undefined
    ? value > tier.from_exclusive
    : tier.from_inclusive !== undefined
    ? value >= tier.from_inclusive
    : true;
  const belowMax = tier.to_exclusive !== undefined
    ? value < tier.to_exclusive
    : tier.to_inclusive !== undefined
    ? value <= tier.to_inclusive
    : true;
  return aboveMin && belowMax;
}

function tierToInterval(tier: PriceFormulaTier): { min: number; max: number } | null {
  if ("operator" in tier) {
    if (tier.operator === "<" || tier.operator === "<=") return { min: Number.NEGATIVE_INFINITY, max: tier.value };
    if (tier.operator === ">" || tier.operator === ">=") return { min: tier.value, max: Number.POSITIVE_INFINITY };
    return { min: tier.value, max: tier.value };
  }

  const min = tier.from_exclusive ?? tier.from_inclusive ?? Number.NEGATIVE_INFINITY;
  const max = tier.to_exclusive ?? tier.to_inclusive ?? Number.POSITIVE_INFINITY;
  return min <= max ? { min, max } : null;
}

function intervalsOverlap(left: { min: number; max: number }, right: { min: number; max: number }): boolean {
  return left.min <= right.max && right.min <= left.max;
}

export function resolvePriceRows(input: {
  productIds: string[];
  defaultPriceListId: string;
  customerPriceListId: string | null;
  priceRows: PriceRow[];
  latestPurchaseCosts: ReadonlyMap<string, number>;
  formulaRules?: ReadonlyMap<string, PriceFormulaRuleRow>;
}): ResolvedPriceData[] {
  const customerPrices = new Map<string, ResolvedPriceData>();
  const defaultPrices = new Map<string, ResolvedPriceData>();

  for (const row of input.priceRows) {
    const formulaPrice = resolveFormulaPrice(row, input.latestPurchaseCosts, input.formulaRules);
    if (formulaPrice !== null) {
      if (row.price_list_id === input.customerPriceListId) {
        customerPrices.set(row.product_id, formulaPrice);
      } else {
        defaultPrices.set(row.product_id, {
          ...formulaPrice,
          price_source: formulaPrice.price_source,
        });
      }
      continue;
    }

    const unitPrice = Number(row.unit_price);
    if (row.price_list_id === input.customerPriceListId) {
      const hasLatestPurchaseCost = input.latestPurchaseCosts.has(row.product_id);
      const latestPurchaseCost = input.latestPurchaseCosts.get(row.product_id);
      customerPrices.set(row.product_id, {
        product_id: row.product_id,
        unit_price: unitPrice === 0 ? latestPurchaseCost ?? 0 : unitPrice,
        price_source: unitPrice === 0
          ? !hasLatestPurchaseCost
            ? "latest_purchase_cost_missing_zero"
            : "latest_purchase_cost"
          : "customer_group_price_list",
        price_list_id: row.price_list_id,
      });
      continue;
    }

    defaultPrices.set(row.product_id, {
      product_id: row.product_id,
      unit_price: unitPrice,
      price_source: input.customerPriceListId === null ? "default_price_list" : "fallback_default_price_list",
      price_list_id: row.price_list_id,
    });
  }

  return input.productIds.map((productId) =>
    customerPrices.get(productId) ?? defaultPrices.get(productId) ?? {
      product_id: productId,
      unit_price: 0,
      price_source: input.customerPriceListId === null ? "default_price_list" : "fallback_default_price_list",
      price_list_id: input.defaultPriceListId,
    }
  );
}

function resolveFormulaPrice(
  row: PriceRow,
  latestPurchaseCosts: ReadonlyMap<string, number>,
  formulaRules: ReadonlyMap<string, PriceFormulaRuleRow> | undefined,
): ResolvedPriceData | null {
  if (row.pricing_mode !== "formula" || row.formula_rule_id === null || row.formula_rule_id === undefined) {
    return null;
  }
  const rule = formulaRules?.get(row.formula_rule_id);
  if (rule === undefined) {
    return null;
  }

  const hasLatestPurchaseCost = latestPurchaseCosts.has(row.product_id);
  const computed = computeFormulaPrice({
    latestPurchaseCost: hasLatestPurchaseCost ? latestPurchaseCosts.get(row.product_id) ?? 0 : null,
    costFormula: rule.cost_formula,
    profitFormula: rule.profit_formula,
    priceListAdjustment: rule.price_list_adjustments[row.price_list_id],
  });

  return {
    product_id: row.product_id,
    unit_price: computed.computed_price,
    price_source: hasLatestPurchaseCost ? "price_formula" : "price_formula_missing_cost_zero",
    price_list_id: row.price_list_id,
  };
}

export function createFoundationRepository(client: DatabaseClient): FoundationRepository {
  return {
    async getCurrentUser(input: GetCurrentUserInput): Promise<CurrentUserRecord | null> {
      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("user_id, display_name, organization_id, organizations(id, code, name)")
        .eq("user_id", input.userId)
        .eq("status", "active")
        .maybeSingle();

      if (profileError !== null) {
        throw profileError;
      }

      if (profile === null) {
        return null;
      }

      const organization = Array.isArray(profile.organizations)
        ? profile.organizations[0]
        : profile.organizations;

      const { data: permissionRows, error: permissionError } = await client
        .from("user_permissions")
        .select("permission_code, permissions!inner(status)")
        .eq("user_id", input.userId)
        .eq("permissions.status", "active")
        .order("permission_code", { ascending: true });

      if (permissionError !== null) {
        throw permissionError;
      }

      let workstation = null;
      let workstationInvalid = false;

      if (input.workstationId !== null) {
        const { data: workstationRow, error: workstationError } = await client
          .from("workstations")
          .select("id, code, name, organization_id")
          .eq("id", input.workstationId)
          .eq("status", "active")
          .maybeSingle();

        if (workstationError !== null) {
          throw workstationError;
        }

        if (workstationRow === null || workstationRow.organization_id !== profile.organization_id) {
          workstationInvalid = true;
        } else {
          workstation = {
            id: workstationRow.id,
            code: workstationRow.code,
            name: workstationRow.name,
          };
        }
      }

      return {
        user: {
          id: input.userId,
          email: input.email,
          displayName: profile.display_name,
        },
        organization: {
          id: organization.id,
          code: organization.code,
          name: organization.name,
        },
        workstation,
        permissions: (permissionRows ?? []).map((row) => row.permission_code),
        workstationInvalid,
      };
    },
    async listWorkstations(organizationId: string): Promise<WorkstationData[]> {
      const { data, error } = await client
        .from("workstations")
        .select("id, code, name, status")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("code", { ascending: true });

      if (error !== null) {
        throw error;
      }

      return data ?? [];
    },
    async createWorkstation(input): Promise<WorkstationData> {
      const { data, error } = await client
        .from("workstations")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          status: "active",
        })
        .select("id, code, name, status")
        .single();

      if (error !== null) {
        throw error;
      }

      return data;
    },
    async updateWorkstation(input): Promise<WorkstationData | null> {
      const patch: { code?: string; name?: string; status?: "active" | "inactive" } = {};

      if (input.code !== undefined) {
        patch.code = input.code;
      }
      if (input.name !== undefined) {
        patch.name = input.name;
      }
      if (input.status !== undefined) {
        patch.status = input.status;
      }

      const { data, error } = await client
        .from("workstations")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, status")
        .maybeSingle();

      if (error !== null) {
        throw error;
      }

      return data;
    },
    async listUsers(input): Promise<{ items: UserListItem[]; total: number }> {
      let query = client
        .from("profiles")
        .select("user_id, display_name, status", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("display_name", { ascending: true })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (input.status !== undefined) query = query.eq("status", input.status);
      if (input.search !== undefined) query = query.ilike("display_name", `%${input.search}%`);

      const { data, error, count } = await query;
      if (error !== null) throw error;
      const items = await Promise.all((data ?? []).map((row) => hydrateUser(client, row, "")));
      return { items, total: count ?? 0 };
    },
    async getUser(input): Promise<UserListItem | null> {
      const { data, error } = await client
        .from("profiles")
        .select("user_id, display_name, status")
        .eq("organization_id", input.organizationId)
        .eq("user_id", input.userId)
        .maybeSingle();
      if (error !== null) throw error;
      return data === null ? null : await hydrateUser(client, data, "");
    },
    async createUser(input): Promise<UserListItem> {
      const { data: authUser, error: authError } = await client.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      });
      if (authError !== null) throw authError;
      const createdId = authUser.user.id;
      try {
        const { error } = await client.rpc("create_profile_with_permissions", {
          p_actor_user_id: input.actorUserId,
          p_user_id: createdId,
          p_display_name: input.displayName,
          p_permission_codes: input.permissions,
          p_trace_id: input.traceId,
        });
        if (error !== null) throw error;
      } catch (cause) {
        await client.auth.admin.deleteUser(createdId);
        throw cause;
      }
      return {
        id: createdId,
        email: input.email,
        display_name: input.displayName,
        status: "active",
        permissions: [...input.permissions].sort(),
      };
    },
    async updateUser(input): Promise<UserListItem | null> {
      const { error } = await client.rpc("update_profile_status", {
        p_actor_user_id: input.actorUserId,
        p_target_user_id: input.userId,
        p_display_name: input.displayName ?? null,
        p_status: input.status ?? null,
      });
      if (error !== null) throw error;
      return await this.getUser({ organizationId: input.organizationId, userId: input.userId });
    },
    async replaceUserPermissions(input): Promise<UserListItem | null> {
      const { error } = await client.rpc("replace_user_permissions", {
        p_actor_user_id: input.actorUserId,
        p_target_user_id: input.userId,
        p_permission_codes: input.permissions,
        p_trace_id: input.traceId,
      });
      if (error !== null) throw error;
      return await this.getUser({ organizationId: input.organizationId, userId: input.userId });
    },
    async listPermissions(): Promise<PermissionData[]> {
      const { data, error } = await client
        .from("permissions")
        .select("code, module, description")
        .eq("status", "active")
        .order("code", { ascending: true });
      if (error !== null) throw error;
      return (data ?? []) as PermissionData[];
    },
    async listProducts(input): Promise<{ items: ProductData[]; total: number }> {
      let query = client
        .from("products")
        .select("id, code, name, status, unit_name, sell_method, latest_purchase_cost, latest_purchase_cost_at", {
          count: "exact",
        })
        .eq("organization_id", input.organizationId)
        .order("code", { ascending: true })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (input.status !== "all") query = query.eq("status", input.status);
      if (input.search !== undefined) {
        const search = input.search.replaceAll(",", " ").replaceAll("%", "\\%");
        query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error !== null) throw error;
      return { items: (data ?? []) as ProductData[], total: count ?? 0 };
    },
    async createProduct(input): Promise<ProductData> {
      const { data, error } = await client
        .from("products")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          status: input.status,
          unit_name: input.unitName,
          sell_method: input.sellMethod,
        })
        .select("id, code, name, status, unit_name, sell_method, latest_purchase_cost, latest_purchase_cost_at")
        .single();
      if (error !== null) throw error;
      return data as ProductData;
    },
    async updateProduct(input): Promise<ProductData | null> {
      const patch: {
        code?: string;
        name?: string;
        status?: "active" | "inactive";
        unit_name?: string;
        sell_method?: string;
        latest_purchase_cost?: number | null;
        latest_purchase_cost_at?: string | null;
        latest_purchase_cost_updated_by?: string | null;
      } = {};
      if (input.code !== undefined) patch.code = input.code;
      if (input.name !== undefined) patch.name = input.name;
      if (input.status !== undefined) patch.status = input.status;
      if (input.unitName !== undefined) patch.unit_name = input.unitName;
      if (input.sellMethod !== undefined) patch.sell_method = input.sellMethod;
      if (input.latestPurchaseCost !== undefined) {
        patch.latest_purchase_cost = input.latestPurchaseCost;
        patch.latest_purchase_cost_at = new Date().toISOString();
        patch.latest_purchase_cost_updated_by = input.latestPurchaseCostUpdatedBy ?? null;
      }

      const { data, error } = await client
        .from("products")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, status, unit_name, sell_method, latest_purchase_cost, latest_purchase_cost_at")
        .maybeSingle();
      if (error !== null) throw error;
      return data as ProductData | null;
    },
    async listPriceLists(input): Promise<PriceListData[]> {
      let query = client
        .from("price_lists")
        .select("id, code, name, is_default, is_active")
        .eq("organization_id", input.organizationId)
        .order("is_default", { ascending: false })
        .order("code", { ascending: true });

      if (input.activeOnly) query = query.eq("is_active", true);

      const { data, error } = await query;
      if (error !== null) throw error;
      return (data ?? []) as PriceListData[];
    },
    async createPriceList(input): Promise<PriceListData> {
      const { data, error } = await client
        .from("price_lists")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          is_default: input.isDefault,
          is_active: true,
        })
        .select("id, code, name, is_default, is_active")
        .single();
      if (error !== null) throw error;
      return data as PriceListData;
    },
    async updatePriceList(input): Promise<PriceListData | null> {
      const patch: { code?: string; name?: string; is_default?: boolean; is_active?: boolean } = {};
      if (input.code !== undefined) patch.code = input.code;
      if (input.name !== undefined) patch.name = input.name;
      if (input.isDefault !== undefined) patch.is_default = input.isDefault;
      if (input.isActive !== undefined) patch.is_active = input.isActive;

      const { data, error } = await client
        .from("price_lists")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, is_default, is_active")
        .maybeSingle();
      if (error !== null) throw error;
      return data as PriceListData | null;
    },
    async upsertPriceListItem(input) {
      const { data, error } = await client
        .from("price_list_items")
        .upsert(
          {
            organization_id: input.organizationId,
            price_list_id: input.priceListId,
            product_id: input.productId,
            unit_price: input.unitPrice,
            pricing_mode: "manual",
            formula_rule_id: null,
          },
          { onConflict: "price_list_id,product_id" },
        )
        .select("product_id, unit_price, price_list_id")
        .single();
      if (error !== null) throw error;
      return {
        product_id: data.product_id,
        unit_price: Number(data.unit_price),
        price_source: "default_price_list",
        price_list_id: data.price_list_id,
      };
    },
    async deletePriceListItem(input): Promise<boolean> {
      const { data, error } = await client
        .from("price_list_items")
        .delete()
        .eq("organization_id", input.organizationId)
        .eq("price_list_id", input.priceListId)
        .eq("product_id", input.productId)
        .select("id");
      if (error !== null) throw error;
      return (data ?? []).length > 0;
    },
    async previewPriceFormula(input): Promise<PriceFormulaPreviewData> {
      const formula = normalizePriceFormula(input.formula);
      validatePriceFormula(formula);
      const [products, priceLists] = await Promise.all([
        loadFormulaProducts(client, input.organizationId, formula.product_filter),
        loadFormulaPriceLists(client, input.organizationId),
      ]);

      const currentItems = await loadFormulaPriceItems(
        client,
        input.organizationId,
        products.map((product) => product.id),
        priceLists.map((priceList) => priceList.id),
      );
      const adjustments = normalizePriceListAdjustments(formula.price_list_adjustments);

      return {
        affected_count: products.length,
        items: products.map((product) => {
          const latestPurchaseCost = toNullableNumber(product.latest_purchase_cost) ?? 0;
          const productItems = currentItems.get(product.id) ?? new Map();
          const firstCurrentItem = [...productItems.values()][0];

          return {
            product_id: product.id,
            product_code: product.code,
            product_name: product.name,
            latest_purchase_cost: latestPurchaseCost,
            current_mode: firstCurrentItem?.pricing_mode ?? null,
            current_unit_price: firstCurrentItem === undefined ? null : toNullableNumber(firstCurrentItem.unit_price),
            computed_prices: priceLists.map((priceList) => {
              const currentItem = productItems.get(priceList.id);
              const currentUnitPrice = currentItem === undefined ? null : toNullableNumber(currentItem.unit_price);
              const computed = computeFormulaPrice({
                latestPurchaseCost,
                costFormula: formula.cost_formula,
                profitFormula: formula.profit_formula,
                priceListAdjustment: adjustments.get(priceList.id),
              });
              return {
                price_list_id: priceList.id,
                price_list_name: priceList.name,
                current_unit_price: currentUnitPrice,
                computed_unit_price: computed.computed_price,
                delta: currentUnitPrice === null ? null : computed.computed_price - currentUnitPrice,
              };
            }),
          };
        }),
      };
    },
    async applyPriceFormula(input): Promise<{ formula_rule_id: string; affected_count: number }> {
      const formula = normalizePriceFormula(input.formula);
      validatePriceFormula(formula);
      const { data: rule, error: ruleError } = await client
        .from("price_formula_rules")
        .insert({
          organization_id: input.organizationId,
          name: formula.name,
          product_filter: formula.product_filter,
          cost_formula: formula.cost_formula,
          profit_formula: formula.profit_formula,
          price_list_adjustments: formula.price_list_adjustments,
          created_by: input.actorUserId,
          updated_by: input.actorUserId,
        })
        .select("id")
        .single();
      if (ruleError !== null) throw ruleError;

      const uniqueItems = uniqueFormulaSelections(input.selectedItems);
      const { error: itemError } = await client
        .from("price_list_items")
        .upsert(
          uniqueItems.map((item) => ({
            organization_id: input.organizationId,
            product_id: item.product_id,
            price_list_id: item.price_list_id,
            unit_price: null,
            pricing_mode: "formula",
            formula_rule_id: rule.id,
          })),
          { onConflict: "price_list_id,product_id" },
        );
      if (itemError !== null) throw itemError;

      return { formula_rule_id: rule.id, affected_count: uniqueItems.length };
    },
    async listCustomers(input): Promise<{ items: CustomerData[]; total: number }> {
      let query = client
        .from("customers")
        .select("id, code, name, phone, customer_group_id, customer_groups(id, code, name)", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("code", { ascending: true })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (input.search !== undefined) {
        const search = input.search.replaceAll(",", " ").replaceAll("%", "\\%");
        query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error !== null) throw error;
      return { items: (data ?? []).map(toCustomerData), total: count ?? 0 };
    },
    async createCustomer(input): Promise<CustomerData> {
      const code = input.code ?? await nextCustomerCode(client, input.organizationId);
      const { data, error } = await client
        .from("customers")
        .insert({
          organization_id: input.organizationId,
          code,
          name: input.name,
          phone: input.phone ?? null,
          customer_group_id: input.customerGroupId ?? null,
        })
        .select("id, code, name, phone, customer_group_id, customer_groups(id, code, name)")
        .single();
      if (error !== null) throw error;
      return toCustomerData(data);
    },
    async updateCustomer(input): Promise<CustomerData | null> {
      const patch: { code?: string; name?: string; phone?: string | null; customer_group_id?: string | null } = {};
      if (input.code !== undefined) patch.code = input.code;
      if (input.name !== undefined) patch.name = input.name;
      if (input.phone !== undefined) patch.phone = input.phone;
      if (input.customerGroupId !== undefined) patch.customer_group_id = input.customerGroupId;

      const { data, error } = await client
        .from("customers")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, phone, customer_group_id, customer_groups(id, code, name)")
        .maybeSingle();
      if (error !== null) throw error;
      return data === null ? null : toCustomerData(data);
    },
    async listCustomerGroups(input): Promise<CustomerGroupData[]> {
      let query = client
        .from("customer_groups")
        .select("id, code, name, price_list_id, is_active")
        .eq("organization_id", input.organizationId)
        .order("code", { ascending: true });

      if (input.activeOnly) query = query.eq("is_active", true);

      const { data, error } = await query;
      if (error !== null) throw error;
      return (data ?? []) as CustomerGroupData[];
    },
    async createCustomerGroup(input): Promise<CustomerGroupData> {
      const { data, error } = await client
        .from("customer_groups")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          price_list_id: input.priceListId,
          is_active: true,
        })
        .select("id, code, name, price_list_id, is_active")
        .single();
      if (error !== null) throw error;
      return data as CustomerGroupData;
    },
    async updateCustomerGroup(input): Promise<CustomerGroupData | null> {
      const patch: { code?: string; name?: string; price_list_id?: string; is_active?: boolean } = {};
      if (input.code !== undefined) patch.code = input.code;
      if (input.name !== undefined) patch.name = input.name;
      if (input.priceListId !== undefined) patch.price_list_id = input.priceListId;
      if (input.isActive !== undefined) patch.is_active = input.isActive;

      const { data, error } = await client
        .from("customer_groups")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, price_list_id, is_active")
        .maybeSingle();
      if (error !== null) throw error;
      return data as CustomerGroupData | null;
    },
    async resolvePrices(input) {
      const { data: defaultPriceList, error: defaultPriceListError } = await client
        .from("price_lists")
        .select("id")
        .eq("organization_id", input.organizationId)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();
      if (defaultPriceListError !== null) throw defaultPriceListError;
      if (defaultPriceList === null) throw new Error("DEFAULT_PRICE_LIST_REQUIRED");

      const productIds = [...new Set(input.productIds)];
      const { data: products, error: productsError } = await client
        .from("products")
        .select("id, latest_purchase_cost")
        .eq("organization_id", input.organizationId)
        .eq("status", "active")
        .in("id", productIds);
      if (productsError !== null) throw productsError;

      const activeProductIds = new Set((products ?? []).map((product) => product.id));
      if (activeProductIds.size !== productIds.length) throw new Error("PRODUCT_NOT_FOUND");
      const latestPurchaseCosts = new Map<string, number>();
      for (const product of products ?? []) {
        if (product.latest_purchase_cost !== null) {
          latestPurchaseCosts.set(product.id, Number(product.latest_purchase_cost));
        }
      }

      let customerPriceListId: string | null = null;
      if (input.customerId !== undefined) {
        const { data: customer, error: customerError } = await client
          .from("customers")
          .select("id, customer_groups!left(price_list_id, is_active)")
          .eq("id", input.customerId)
          .eq("organization_id", input.organizationId)
          .maybeSingle();
        if (customerError !== null) throw customerError;
        if (customer === null) throw new Error("CUSTOMER_NOT_FOUND");
        const group = Array.isArray(customer.customer_groups)
          ? customer.customer_groups[0]
          : customer.customer_groups;
        if (group !== null && group?.is_active === true) {
          customerPriceListId = group.price_list_id;
        }
      }

      const listIds = customerPriceListId === null
        ? [defaultPriceList.id]
        : [customerPriceListId, defaultPriceList.id];

      const { data: priceRows, error: priceRowsError } = await client
        .from("price_list_items")
        .select("product_id, unit_price, price_list_id, pricing_mode, formula_rule_id")
        .eq("organization_id", input.organizationId)
        .in("price_list_id", listIds)
        .in("product_id", productIds);
      if (priceRowsError !== null) throw priceRowsError;
      const formulaRules = await loadPriceFormulaRules(
        client,
        input.organizationId,
        [...new Set((priceRows ?? []).map((row) => row.formula_rule_id).filter(isString))],
      );

      return resolvePriceRows({
        productIds,
        defaultPriceListId: defaultPriceList.id,
        customerPriceListId,
        priceRows: priceRows ?? [],
        latestPurchaseCosts,
        formulaRules,
      });
    },
    async checkoutOrder(input): Promise<CheckoutResultData> {
      const { data, error } = await client.rpc("checkout_order_tx", {
        p_actor_user_id: input.actorUserId,
        p_organization_id: input.organizationId,
        p_payload: input.payload,
      });
      if (error !== null) throw error;
      return toCheckoutResultData(data);
    },
    async saveQuote(input): Promise<QuoteSummaryData> {
      const { data, error } = await client.rpc("save_quote_tx", {
        p_actor_user_id: input.actorUserId,
        p_organization_id: input.organizationId,
        p_payload: input.payload,
      });
      if (error !== null) throw error;
      return toQuoteSummaryData(data);
    },
    async getQuoteReopenPayload(input): Promise<QuoteReopenPayloadData | null> {
      return await loadQuoteReopenPayload(client, input.organizationId, input.quoteId);
    },
    async reviseInvoice(input): Promise<Record<string, unknown>> {
      const { data, error } = await client.rpc("revise_invoice_tx", {
        p_actor_user_id: input.actorUserId,
        p_organization_id: input.organizationId,
        p_order_id: input.orderId,
        p_payload: input.payload,
      });
      if (error !== null) throw error;
      return isRecord(data) ? data : {};
    },
    async listSalesDocuments(input): Promise<{ items: SalesDocumentListItemData[]; total: number }> {
      let query = client
        .from("orders")
        .select(
          "id, code, order_type, status, customer_snapshot, subtotal_amount, discount_amount, total_amount, paid_amount, debt_amount, payment_status, note, created_by, created_at",
          { count: "exact" },
        )
        .eq("organization_id", input.organizationId)
        .order("created_at", { ascending: false });

      if (input.type !== undefined) query = query.eq("order_type", input.type);
      if (input.status !== undefined) query = query.eq("status", input.status);
      if (input.paymentStatus !== undefined) query = query.eq("payment_status", input.paymentStatus);
      if (input.from !== undefined) query = query.gte("created_at", input.from);
      if (input.to !== undefined) query = query.lte("created_at", input.to);

      const { data, error } = await query;
      if (error !== null) throw error;

      let rows = data ?? [];
      if (input.search !== undefined) {
        const search = input.search.toLocaleLowerCase("vi");
        rows = rows.filter((row) => {
          const customer = customerSnapshot(row.customer_snapshot);
          return row.code.toLocaleLowerCase("vi").includes(search) ||
            customer.code?.toLocaleLowerCase("vi").includes(search) === true ||
            customer.name.toLocaleLowerCase("vi").includes(search) ||
            customer.phone?.toLocaleLowerCase("vi").includes(search) === true ||
            row.note?.toLocaleLowerCase("vi").includes(search) === true;
        });
      }

      const page = paginate(rows, input.page, input.pageSize);
      const sellers = await loadSellerMap(client, page.items.map((row) => row.created_by));
      return {
        items: page.items.map((row) => toSalesDocumentListItem(row, sellers)),
        total: input.search === undefined ? data?.length ?? 0 : page.total,
      };
    },
    async getSalesDocument(input): Promise<SalesDocumentDetailData | null> {
      const { data: order, error } = await client
        .from("orders")
        .select(
          "id, code, order_type, status, customer_snapshot, price_list_id, subtotal_amount, discount_amount, total_amount, paid_amount, debt_amount, change_returned_amount, payment_status, note, created_by, created_at",
        )
        .eq("organization_id", input.organizationId)
        .eq("id", input.orderId)
        .maybeSingle();
      if (error !== null) throw error;
      if (order === null) return null;

      const sellers = await loadSellerMap(client, [order.created_by]);
      const base = toSalesDocumentListItem(order, sellers);
      const [items, paymentReceipts, debtEntries, stockMovements, history, priceList] = await Promise.all([
        loadSalesDocumentItems(client, input.organizationId, input.orderId),
        loadSalesDocumentPaymentReceipts(client, input.organizationId, input.orderId),
        loadSalesDocumentDebtEntries(client, input.organizationId, input.orderId),
        loadSalesDocumentStockMovements(client, input.organizationId, input.orderId),
        loadSalesDocumentHistory(client, input.organizationId, input.orderId),
        loadSalesDocumentPriceList(client, input.organizationId, order.price_list_id),
      ]);

      return {
        ...base,
        price_list: priceList,
        change_returned_amount: Number(order.change_returned_amount),
        items,
        payment_receipts: paymentReceipts,
        debt_entries: debtEntries,
        stock_movements: stockMovements,
        history,
      };
    },
    async listFinanceAccounts(input): Promise<FinanceAccountData[]> {
      let query = client
        .from("finance_accounts")
        .select("id, code, name, account_type, is_default_cash, is_active")
        .eq("organization_id", input.organizationId)
        .order("account_type", { ascending: true })
        .order("code", { ascending: true });

      if (input.accountType !== undefined) query = query.eq("account_type", input.accountType);
      if (input.isActive !== undefined) query = query.eq("is_active", input.isActive);

      const { data, error } = await query;
      if (error !== null) throw error;
      return (data ?? []) as FinanceAccountData[];
    },
    async listCustomerDebts(input): Promise<{ items: CustomerDebtSummaryData[]; total: number }> {
      const summaries = await loadCustomerDebtSummaries(client, input.organizationId);
      const search = input.search?.toLocaleLowerCase("vi");
      const filtered = search === undefined
        ? summaries
        : summaries.filter((item) =>
          item.customer_code?.toLocaleLowerCase("vi").includes(search) === true ||
          item.customer_name.toLocaleLowerCase("vi").includes(search)
        );
      return paginate(filtered, input.page, input.pageSize);
    },
    async getCustomerDebt(input): Promise<CustomerDebtDetailData | null> {
      const { data: customer, error: customerError } = await client
        .from("customers")
        .select("id")
        .eq("id", input.customerId)
        .eq("organization_id", input.organizationId)
        .maybeSingle();
      if (customerError !== null) throw customerError;
      if (customer === null) return null;

      const invoices = await loadOpenDebtInvoices(client, input.organizationId, input.customerId);
      return {
        customer_id: input.customerId,
        total_debt: invoices.reduce((sum, invoice) => sum + invoice.remaining_debt, 0),
        invoices,
      };
    },
    async collectCustomerDebt(input): Promise<DebtCollectionResultData> {
      const { data, error } = await client.rpc("collect_customer_debt_tx", {
        p_actor_user_id: input.actorUserId,
        p_organization_id: input.organizationId,
        p_payload: input.payload,
      });
      if (error !== null) throw error;
      if (!isRecord(data)) throw new Error("DEBT_COLLECTION_RESULT_INVALID");
      return {
        payment_receipt_id: String(data.payment_receipt_id ?? ""),
        allocated_amount: Number(data.paid_amount ?? data.allocated_amount ?? 0),
      };
    },
    async listCashbookEntries(input): Promise<CashbookListData> {
      let query = client
        .from("cashbook_entries")
        .select(
          "id, finance_account_id, entry_time, source_type, payment_receipt_method_id, cashbook_voucher_id, status, direction, amount_delta, is_business_accounted, description, created_at, finance_accounts(id, code, name, account_type)",
          { count: "exact" },
        )
        .eq("organization_id", input.organizationId)
        .order("entry_time", { ascending: false });

      if (input.financeAccountId !== undefined) query = query.eq("finance_account_id", input.financeAccountId);
      if (input.direction !== undefined) query = query.eq("direction", input.direction);
      if (input.sourceType !== undefined) query = query.eq("source_type", input.sourceType);
      if (input.isBusinessAccounted !== undefined) {
        query = query.eq("is_business_accounted", input.isBusinessAccounted);
      }
      if (input.from !== undefined) query = query.gte("entry_time", input.from);
      if (input.to !== undefined) query = query.lte("entry_time", input.to);

      const { data, error } = await query;
      if (error !== null) throw error;

      let items = await Promise.all((data ?? []).map((row) => hydrateCashbookEntry(client, input.organizationId, row)));
      if (input.search !== undefined) {
        const search = input.search.toLocaleLowerCase("vi");
        items = items.filter((item) =>
          item.code.toLocaleLowerCase("vi").includes(search) ||
          item.note?.toLocaleLowerCase("vi").includes(search) === true
        );
      }

      const summaryItems = items.filter((item) => item.status === "posted");
      const totalIn = summaryItems
        .filter((item) => item.amount_delta > 0)
        .reduce((sum, item) => sum + item.amount_delta, 0);
      const totalOut = summaryItems
        .filter((item) => item.amount_delta < 0)
        .reduce((sum, item) => sum + item.amount_delta, 0);
      const page = paginate(items, input.page, input.pageSize);

      return {
        summary: {
          opening_balance: 0,
          total_in: totalIn,
          total_out: totalOut,
          ending_balance: totalIn + totalOut,
        },
        items: page.items,
        page: input.page,
        page_size: input.pageSize,
        total: page.total,
      };
    },
    async getCashbookEntry(input): Promise<CashbookEntryDetailData | null> {
      const { data, error } = await client
        .from("cashbook_entries")
        .select(
          "id, finance_account_id, entry_time, source_type, payment_receipt_method_id, cashbook_voucher_id, status, direction, amount_delta, is_business_accounted, description, created_by, created_at, finance_accounts(id, code, name, account_type)",
        )
        .eq("id", input.entryId)
        .eq("organization_id", input.organizationId)
        .maybeSingle();
      if (error !== null) throw error;
      if (data === null) return null;
      return await hydrateCashbookEntryDetail(client, input.organizationId, data);
    },
    async getPaymentReceipt(input): Promise<PaymentReceiptDetailData | null> {
      return await loadPaymentReceiptDetail(client, input.organizationId, input.receiptId);
    },
    async listCashbookBalances(input): Promise<CashbookBalanceData[]> {
      const accounts = await this.listFinanceAccounts({ organizationId: input.organizationId, isActive: true });
      const { data: entries, error } = await client
        .from("cashbook_entries")
        .select("finance_account_id, amount_delta")
        .eq("organization_id", input.organizationId)
        .eq("status", "posted");
      if (error !== null) throw error;

      const balances = new Map<string, number>();
      for (const entry of entries ?? []) {
        balances.set(entry.finance_account_id, (balances.get(entry.finance_account_id) ?? 0) + Number(entry.amount_delta));
      }

      return accounts.map((account) => ({
        finance_account_id: account.id,
        code: account.code,
        name: account.name,
        account_type: account.account_type,
        balance: balances.get(account.id) ?? 0,
      }));
    },
    async listCashbookVouchers(input): Promise<{ items: CashbookVoucherData[]; total: number }> {
      const { data, error, count } = await client
        .from("cashbook_vouchers")
        .select("id, code, status, amount", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("created_at", { ascending: false })
        .range(0, 99);
      if (error !== null) throw error;
      return {
        items: (data ?? []).map((row) => ({
          id: row.id,
          code: row.code,
          source_type: "manual_voucher",
          status: row.status,
          amount: Number(row.amount),
        })),
        total: count ?? 0,
      };
    },
    async listReconciliations(input): Promise<{ items: ReconciliationData[]; total: number }> {
      const { data, error, count } = await client
        .from("cash_reconciliations")
        .select("id, code, status, period_start, period_end", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("period_end", { ascending: false })
        .range(0, 99);
      if (error !== null) throw error;
      return { items: (data ?? []) as ReconciliationData[], total: count ?? 0 };
    },
    async listInventoryProducts(input): Promise<{ items: InventoryProductData[]; total: number }> {
      let query = client
        .from("products")
        .select("id, code, name, status", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("code", { ascending: true })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (input.status !== "all") query = query.eq("status", input.status);
      if (input.search !== undefined) {
        const search = input.search.replaceAll(",", " ").replaceAll("%", "\\%");
        query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data: products, error, count } = await query;
      if (error !== null) throw error;
      const items = await hydrateInventoryProducts(client, input.organizationId, products ?? [], input.inventoryShape);
      return { items, total: count ?? items.length };
    },
    async getInventoryProduct(input): Promise<InventoryProductData | null> {
      const { data, error } = await client
        .from("products")
        .select("id, code, name, status")
        .eq("id", input.productId)
        .eq("organization_id", input.organizationId)
        .maybeSingle();
      if (error !== null) throw error;
      if (data === null) return null;
      const [item] = await hydrateInventoryProducts(client, input.organizationId, [data]);
      return item ?? null;
    },
    async listStockMovements(input): Promise<{ items: StockMovementData[]; total: number }> {
      let query = client
        .from("stock_movements")
        .select("id, product_id, movement_type, quantity_delta, created_at", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("created_at", { ascending: false })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (input.productId !== undefined) query = query.eq("product_id", input.productId);
      if (input.orderId !== undefined) query = query.eq("order_id", input.orderId);

      const { data, error, count } = await query;
      if (error !== null) throw error;
      return {
        items: (data ?? []).map((row) => ({
          id: row.id,
          product_id: row.product_id,
          movement_type: row.movement_type,
          quantity_delta: Number(row.quantity_delta),
          created_at: row.created_at,
        })),
        total: count ?? 0,
      };
    },
    async listStocktakes(input): Promise<{ items: StocktakeData[]; total: number }> {
      let query = client
        .from("stocktakes")
        .select("id, code, status, source_type, created_at, balanced_at, note", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("created_at", { ascending: false })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (input.status !== undefined) query = query.eq("status", input.status);
      if (input.createdFrom !== undefined) query = query.gte("created_at", input.createdFrom);
      if (input.createdTo !== undefined) query = query.lte("created_at", input.createdTo);
      if (input.search !== undefined) {
        const search = input.search.replaceAll(",", " ").replaceAll("%", "\\%");
        query = query.or(`code.ilike.%${search}%,note.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error !== null) throw error;
      return { items: (data ?? []) as StocktakeData[], total: count ?? 0 };
    },
    async adjustNormalProductStock(input): Promise<StocktakeData> {
      const { data, error } = await client.rpc("adjust_normal_product_stock_tx", {
        p_actor_user_id: input.actorUserId,
        p_organization_id: input.organizationId,
        p_product_id: input.productId,
        p_actual_qty: input.actualQty,
        p_reason: input.reason,
      });
      if (error !== null) throw error;
      if (!isRecord(data)) throw new Error("STOCKTAKE_RESULT_INVALID");
      return {
        id: String(data.id),
        code: String(data.code),
        status: "balanced",
        source_type: "product_edit",
        created_at: String(data.created_at),
        balanced_at: String(data.balanced_at),
        note: data.note === null ? null : String(data.note),
      };
    },
    async listProductionQueue(input): Promise<{ items: ProductionQueueItemData[]; total: number }> {
      const { data, error, count } = await client
        .from("production_queue_items")
        .select(
          "id, raw_file_name, received_at, status, parse_status, parse_error, parsed_payload, production_machines(id, code, name)",
          { count: "exact" },
        )
        .eq("organization_id", input.organizationId)
        .eq("status", "queued")
        .order("received_at", { ascending: true })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (error !== null) throw error;
      return { items: (data ?? []).map(toProductionQueueItemData), total: count ?? 0 };
    },
    async listProductionQueueHistory(input): Promise<{ items: ProductionQueueItemData[]; total: number }> {
      const { data, error, count } = await client
        .from("production_queue_items")
        .select(
          "id, raw_file_name, received_at, status, parse_status, parse_error, parsed_payload, production_machines(id, code, name)",
          { count: "exact" },
        )
        .eq("organization_id", input.organizationId)
        .neq("status", "queued")
        .order("handled_at", { ascending: false })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (error !== null) throw error;
      return { items: (data ?? []).map(toProductionQueueItemData), total: count ?? 0 };
    },
    async addProductionQueueItemToDraft(input): Promise<ProductionQueueDraftPayloadData | null> {
      const item = await claimProductionQueueItem(client, input.organizationId, input.queueItemId, input.actorUserId, "added_to_draft");
      return item === null ? null : await toProductionQueueDraftPayload(client, input.organizationId, item);
    },
    async dismissProductionQueueItem(input): Promise<ProductionQueueItemData | null> {
      const item = await claimProductionQueueItem(client, input.organizationId, input.queueItemId, input.actorUserId, "dismissed");
      return item === null ? null : await hydrateProductionQueueItem(client, input.organizationId, String(item.id));
    },
    async restoreProductionQueueItem(input): Promise<ProductionQueueItemData | null> {
      const { data, error } = await client.rpc("restore_production_queue_item_tx", {
        p_organization_id: input.organizationId,
        p_queue_item_id: input.queueItemId,
        p_actor_user_id: input.actorUserId,
      });
      if (error !== null) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!isRecord(row)) return null;
      return await hydrateProductionQueueItem(client, input.organizationId, String(row.id));
    },
  };
}

async function claimProductionQueueItem(
  client: DatabaseClient,
  organizationId: string,
  queueItemId: string,
  actorUserId: string,
  targetStatus: "added_to_draft" | "dismissed",
): Promise<Record<string, unknown> | null> {
  const { data, error } = await client.rpc("claim_production_queue_item_tx", {
    p_organization_id: organizationId,
    p_queue_item_id: queueItemId,
    p_actor_user_id: actorUserId,
    p_target_status: targetStatus,
  });
  if (error !== null) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return isRecord(row) ? row : null;
}

async function hydrateProductionQueueItem(
  client: DatabaseClient,
  organizationId: string,
  queueItemId: string,
): Promise<ProductionQueueItemData | null> {
  const { data, error } = await client
    .from("production_queue_items")
    .select(
      "id, raw_file_name, received_at, status, parse_status, parse_error, parsed_payload, production_machines(id, code, name)",
    )
    .eq("id", queueItemId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error !== null) throw error;
  return data === null ? null : toProductionQueueItemData(data);
}

async function toProductionQueueDraftPayload(
  client: DatabaseClient,
  organizationId: string,
  item: Record<string, unknown>,
): Promise<ProductionQueueDraftPayloadData> {
  const parsed = isRecord(item.parsed_payload) ? item.parsed_payload : {};
  const productCode = String(parsed.product_code ?? "");
  if (productCode.length === 0) throw new Error("PRODUCTION_QUEUE_PRODUCT_CODE_REQUIRED");

  const { data: product, error: productError } = await client
    .from("products")
    .select("id, code, name, unit_name, sell_method")
    .eq("organization_id", organizationId)
    .eq("code", productCode)
    .eq("status", "active")
    .maybeSingle();
  if (productError !== null) throw productError;
  if (product === null) throw new Error("PRODUCT_NOT_FOUND");

  const customerCode = typeof parsed.customer_code === "string" ? parsed.customer_code.trim() : "";
  const customer = customerCode.length === 0 ? null : await loadCustomerByCode(client, organizationId, customerCode);
  const widthM = numberFromPayload(parsed.width_m) ?? cmToMeters(parsed.width_cm);
  const heightM = numberFromPayload(parsed.height_m) ?? cmToMeters(parsed.height_cm);
  const linearM = numberFromPayload(parsed.linear_m);
  const quantity = numberFromPayload(parsed.quantity) ?? 1;

  return {
    queue_item_id: String(item.id),
    customer,
    draft_line: {
      product_id: product.id,
      product_code: product.code,
      product_name: product.name,
      unit_name: product.unit_name,
      sell_method: product.sell_method,
      width_m: widthM,
      height_m: heightM,
      linear_m: linearM,
      quantity,
      source: "production_queue",
    },
  };
}

function toProductionQueueItemData(row: Record<string, unknown>): ProductionQueueItemData {
  const machine = Array.isArray(row.production_machines) ? row.production_machines[0] : row.production_machines;
  const machineRecord = isRecord(machine) ? machine : {};
  return {
    id: String(row.id),
    production_machine: {
      id: String(machineRecord.id ?? ""),
      code: String(machineRecord.code ?? ""),
      name: String(machineRecord.name ?? ""),
    },
    raw_file_name: String(row.raw_file_name),
    received_at: String(row.received_at),
    status: String(row.status) as "queued" | "added_to_draft" | "dismissed",
    parse_status: String(row.parse_status) as "pending" | "ok" | "error",
    parse_error: row.parse_error === null ? null : String(row.parse_error ?? ""),
    parsed: isRecord(row.parsed_payload) ? row.parsed_payload : {},
  };
}

async function loadCustomerByCode(
  client: DatabaseClient,
  organizationId: string,
  customerCode: string,
): Promise<{ id: string; code: string; name: string } | null> {
  const { data, error } = await client
    .from("customers")
    .select("id, code, name")
    .eq("organization_id", organizationId)
    .eq("code", customerCode)
    .maybeSingle();
  if (error !== null) throw error;
  return data;
}

function numberFromPayload(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function cmToMeters(value: unknown): number | null {
  const centimeters = numberFromPayload(value);
  return centimeters === null ? null : centimeters / 100;
}

async function nextCustomerCode(client: DatabaseClient, organizationId: string): Promise<string> {
  const { data, error } = await client.rpc("next_customer_code", { p_organization_id: organizationId });
  if (error !== null) throw error;
  if (typeof data !== "string") throw new Error("CUSTOMER_CODE_REQUIRED");
  return data;
}

function toCustomerData(row: {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  customer_group_id: string | null;
  customer_groups?: { id: string; code: string; name: string } | Array<{ id: string; code: string; name: string }> | null;
}): CustomerData {
  const group = Array.isArray(row.customer_groups) ? row.customer_groups[0] : row.customer_groups;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    phone: row.phone,
    customer_group_id: row.customer_group_id,
    customer_group: group ?? null,
  };
}

function toCheckoutResultData(value: unknown): CheckoutResultData {
  if (!isRecord(value) || !isRecord(value.order)) {
    throw new Error("CHECKOUT_RESULT_INVALID");
  }

  const paymentReceipt = isRecord(value.payment_receipt)
    ? {
      id: String(value.payment_receipt.id),
      code: String(value.payment_receipt.code),
      total_received_amount: Number(value.payment_receipt.total_received_amount),
    }
    : null;

  return {
    order: {
      id: String(value.order.id),
      code: String(value.order.code),
      order_type: "invoice",
      status: "completed",
      total_amount: Number(value.order.total_amount),
      paid_amount: Number(value.order.paid_amount),
      debt_amount: Number(value.order.debt_amount),
      payment_status: String(value.order.payment_status) as "unpaid" | "partial" | "paid",
    },
    payment_receipt: paymentReceipt,
    inventory_warnings: Array.isArray(value.inventory_warnings)
      ? value.inventory_warnings.map((warning) => {
        if (!isRecord(warning)) throw new Error("CHECKOUT_RESULT_INVALID");
        return {
          product_id: String(warning.product_id),
          code: String(warning.code),
          message: String(warning.message),
        };
      })
      : [],
  };
}

function toQuoteSummaryData(value: unknown): QuoteSummaryData {
  if (!isRecord(value) || !isRecord(value.order)) {
    throw new Error("QUOTE_RESULT_INVALID");
  }

  return {
    id: String(value.order.id),
    code: String(value.order.code),
    order_type: "quote",
    status: String(value.order.status) as QuoteSummaryData["status"],
    total_amount: Number(value.order.total_amount),
  };
}

function customerSnapshot(value: unknown): { id: string | null; code: string | null; name: string; phone: string | null } {
  const snapshot = isRecord(value) ? value : {};
  if (snapshot.type === "retail") return { id: null, code: null, name: "Khách lẻ", phone: null };
  return {
    id: typeof snapshot.id === "string" ? snapshot.id : null,
    code: typeof snapshot.code === "string" ? snapshot.code : null,
    name: typeof snapshot.name === "string" ? snapshot.name : "Khách lẻ",
    phone: typeof snapshot.phone === "string" ? snapshot.phone : null,
  };
}

async function loadQuoteReopenPayload(
  client: DatabaseClient,
  organizationId: string,
  quoteId: string,
): Promise<QuoteReopenPayloadData | null> {
  const { data: quote, error: quoteError } = await client
    .from("orders")
    .select("id, code, status, customer_id, customer_snapshot, price_list_id, subtotal_amount, discount_amount, total_amount, note")
    .eq("organization_id", organizationId)
    .eq("id", quoteId)
    .eq("order_type", "quote")
    .maybeSingle();
  if (quoteError !== null) throw quoteError;
  if (quote === null) return null;

  const { data: itemRows, error: itemsError } = await client
    .from("order_items")
    .select("id, product_id, product_snapshot, quantity, width_m, height_m, linear_m, unit_price, discount_amount, price_source, note")
    .eq("organization_id", organizationId)
    .eq("order_id", quoteId)
    .order("line_no", { ascending: true });
  if (itemsError !== null) throw itemsError;

  const productIds = [...new Set((itemRows ?? []).map((row) => row.product_id).filter((id): id is string => typeof id === "string"))];
  const products = await loadProductsById(client, organizationId, productIds);
  const defaultPrices = await loadDefaultPrices(client, organizationId, productIds);
  const customer = customerSnapshot(quote.customer_snapshot);
  const customerWarnings = await loadCustomerWarnings(client, organizationId, quote.customer_id, customer);
  const priceListInfo = await loadQuotePriceListInfo(client, organizationId, quote.price_list_id);

  return {
    quote: {
      id: quote.id,
      code: quote.code,
      status: quote.status as QuoteReopenPayloadData["quote"]["status"],
    },
    customer: {
      customer_id: quote.customer_id,
      snapshot: {
        code: customer.code,
        name: customer.name,
        phone: customer.phone,
      },
      warnings: customerWarnings,
    },
    price_list: priceListInfo,
    items: (itemRows ?? []).map((row) => {
      const snapshot = isRecord(row.product_snapshot) ? row.product_snapshot : {};
      const product = typeof row.product_id === "string" ? products.get(row.product_id) : undefined;
      const warnings: QuoteReopenPayloadData["items"][number]["warnings"] = [];

      if (typeof row.product_id !== "string" || product === undefined) {
        warnings.push({ code: "PRODUCT_MISSING", message: "Product is no longer available." });
      } else if (product.status !== "active") {
        warnings.push({ code: "PRODUCT_INACTIVE", message: "Product is inactive." });
      }

      const currentPrice = typeof row.product_id === "string" ? defaultPrices.get(row.product_id) : undefined;
      if (currentPrice !== undefined && currentPrice !== Number(row.unit_price)) {
        warnings.push({ code: "CURRENT_PRICE_DIFFERS", message: "Current price differs from quote snapshot." });
      }

      return {
        order_item_id: row.id,
        product_id: row.product_id,
        product_snapshot: {
          code: String(snapshot.code ?? ""),
          name: String(snapshot.name ?? ""),
          unit_name: String(snapshot.unit_name ?? ""),
          sell_method: String(snapshot.sell_method ?? "quantity") as QuoteReopenPayloadData["items"][number]["product_snapshot"]["sell_method"],
        },
        quantity: Number(row.quantity),
        width_m: row.width_m === null ? null : Number(row.width_m),
        height_m: row.height_m === null ? null : Number(row.height_m),
        linear_m: row.linear_m === null ? null : Number(row.linear_m),
        unit_price: Number(row.unit_price),
        discount_amount: Number(row.discount_amount),
        price_source: String(row.price_source),
        note: row.note,
        warnings,
      };
    }),
    summary: {
      subtotal_amount: Number(quote.subtotal_amount),
      discount_amount: Number(quote.discount_amount),
      total_amount: Number(quote.total_amount),
    },
    note: quote.note,
  };
}

async function loadSellerMap(client: DatabaseClient, userIds: string[]): Promise<Map<string, string>> {
  const uniqueUserIds = [...new Set(userIds.filter((id) => id.length > 0))];
  if (uniqueUserIds.length === 0) return new Map();
  const { data, error } = await client
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", uniqueUserIds);
  if (error !== null) throw error;
  return new Map((data ?? []).map((row) => [row.user_id, row.display_name]));
}

async function loadProductsById(
  client: DatabaseClient,
  organizationId: string,
  productIds: string[],
): Promise<Map<string, { id: string; status: ProductData["status"] }>> {
  if (productIds.length === 0) return new Map();
  const { data, error } = await client
    .from("products")
    .select("id, status")
    .eq("organization_id", organizationId)
    .in("id", productIds);
  if (error !== null) throw error;
  return new Map((data ?? []).map((row) => [row.id, { id: row.id, status: row.status as ProductData["status"] }]));
}

async function loadDefaultPrices(
  client: DatabaseClient,
  organizationId: string,
  productIds: string[],
): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map();
  const { data: defaultPriceList, error: priceListError } = await client
    .from("price_lists")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("is_default", true)
    .eq("is_active", true)
    .maybeSingle();
  if (priceListError !== null) throw priceListError;
  if (defaultPriceList === null) return new Map();

  const { data, error } = await client
    .from("price_list_items")
    .select("product_id, unit_price")
    .eq("organization_id", organizationId)
    .eq("price_list_id", defaultPriceList.id)
    .in("product_id", productIds);
  if (error !== null) throw error;
  return new Map((data ?? []).map((row) => [row.product_id, Number(row.unit_price)]));
}

async function loadCustomerWarnings(
  client: DatabaseClient,
  organizationId: string,
  customerId: string | null,
  snapshot: { code: string | null; name: string; phone: string | null },
): Promise<QuoteReopenPayloadData["customer"]["warnings"]> {
  if (customerId === null) return [];
  const { data, error } = await client
    .from("customers")
    .select("code, name, phone")
    .eq("organization_id", organizationId)
    .eq("id", customerId)
    .maybeSingle();
  if (error !== null) throw error;
  if (
    data === null ||
    data.code !== snapshot.code ||
    data.name !== snapshot.name ||
    data.phone !== snapshot.phone
  ) {
    return [{ code: "CUSTOMER_CHANGED", message: "Customer information changed after quote was saved." }];
  }
  return [];
}

async function loadQuotePriceListInfo(
  client: DatabaseClient,
  organizationId: string,
  priceListId: string | null,
): Promise<QuoteReopenPayloadData["price_list"]> {
  if (priceListId === null) {
    return {
      price_list_id: null,
      snapshot: { code: null, name: null },
      warnings: [],
    };
  }

  const { data, error } = await client
    .from("price_lists")
    .select("code, name, is_active")
    .eq("organization_id", organizationId)
    .eq("id", priceListId)
    .maybeSingle();
  if (error !== null) throw error;

  return {
    price_list_id: priceListId,
    snapshot: {
      code: data?.code ?? null,
      name: data?.name ?? null,
    },
    warnings: data === null || data.is_active !== true
      ? [{ code: "PRICE_LIST_INACTIVE", message: "Price list is inactive." }]
      : [],
  };
}

function toSalesDocumentListItem(
  row: Record<string, unknown>,
  sellers: Map<string, string>,
): SalesDocumentListItemData {
  const createdBy = String(row.created_by ?? "");
  return {
    id: String(row.id),
    code: String(row.code),
    order_type: String(row.order_type) as "quote" | "invoice",
    status: String(row.status) as "active" | "converted" | "completed" | "cancelled",
    created_at: String(row.created_at),
    customer: customerSnapshot(row.customer_snapshot),
    seller: { id: createdBy, name: sellers.get(createdBy) ?? createdBy },
    subtotal_amount: Number(row.subtotal_amount),
    discount_amount: Number(row.discount_amount),
    total_amount: Number(row.total_amount),
    paid_amount: Number(row.paid_amount),
    debt_amount: Number(row.debt_amount),
    payment_status: String(row.payment_status) as "not_applicable" | "unpaid" | "partial" | "paid",
    note: row.note === null ? null : String(row.note ?? ""),
  };
}

async function loadSalesDocumentItems(
  client: DatabaseClient,
  organizationId: string,
  orderId: string,
): Promise<SalesDocumentDetailData["items"]> {
  const { data, error } = await client
    .from("order_items")
    .select("id, line_no, product_id, product_snapshot, quantity, unit_price, line_subtotal_amount, discount_amount, line_total, price_source, note")
    .eq("organization_id", organizationId)
    .eq("order_id", orderId)
    .order("line_no", { ascending: true });
  if (error !== null) throw error;
  return (data ?? []).map((row) => {
    const snapshot = isRecord(row.product_snapshot) ? row.product_snapshot : {};
    return {
      id: row.id,
      line_no: Number(row.line_no),
      product: {
        id: row.product_id,
        code: String(snapshot.code ?? ""),
        name: String(snapshot.name ?? ""),
        unit_name: String(snapshot.unit_name ?? ""),
        sell_method: String(snapshot.sell_method ?? "quantity") as SalesDocumentDetailData["items"][number]["product"]["sell_method"],
      },
      quantity: Number(row.quantity),
      unit_price: Number(row.unit_price),
      line_subtotal_amount: Number(row.line_subtotal_amount),
      discount_amount: Number(row.discount_amount),
      line_total: Number(row.line_total),
      price_source: row.price_source,
      note: row.note,
    };
  });
}

async function loadSalesDocumentPaymentReceipts(
  client: DatabaseClient,
  organizationId: string,
  orderId: string,
): Promise<SalesDocumentDetailData["payment_receipts"]> {
  const { data, error } = await client
    .from("payment_receipts")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error !== null) throw error;
  const receipts = await Promise.all((data ?? []).map((row) => loadPaymentReceiptDetail(client, organizationId, row.id)));
  return receipts.filter((receipt): receipt is PaymentReceiptDetailData => receipt !== null).map((receipt) => ({
    id: receipt.id,
    code: receipt.code,
    total_received_amount: receipt.total_received_amount,
    methods: receipt.methods,
    allocations: receipt.allocations,
  }));
}

async function loadSalesDocumentDebtEntries(
  client: DatabaseClient,
  organizationId: string,
  orderId: string,
): Promise<SalesDocumentDetailData["debt_entries"]> {
  const { data, error } = await client
    .from("customer_debt_entries")
    .select("id, entry_type, amount_delta, balance_after_order, balance_after_customer, created_at")
    .eq("organization_id", organizationId)
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error !== null) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    entry_type: row.entry_type,
    amount_delta: Number(row.amount_delta),
    balance_after_order: Number(row.balance_after_order),
    balance_after_customer: Number(row.balance_after_customer),
    created_at: row.created_at,
  }));
}

async function loadSalesDocumentStockMovements(
  client: DatabaseClient,
  organizationId: string,
  orderId: string,
): Promise<StockMovementData[]> {
  const { data, error } = await client
    .from("stock_movements")
    .select("id, product_id, movement_type, quantity_delta, created_at")
    .eq("organization_id", organizationId)
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error !== null) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    product_id: row.product_id,
    movement_type: row.movement_type,
    quantity_delta: Number(row.quantity_delta),
    created_at: row.created_at,
  }));
}

async function loadSalesDocumentHistory(
  client: DatabaseClient,
  organizationId: string,
  orderId: string,
): Promise<SalesDocumentDetailData["history"]> {
  const { data, error } = await client
    .from("order_status_history")
    .select("to_status, reason, changed_by, changed_at")
    .eq("organization_id", organizationId)
    .eq("order_id", orderId)
    .order("changed_at", { ascending: true });
  if (error !== null) throw error;
  return await Promise.all((data ?? []).map(async (row) => ({
    at: row.changed_at,
    action: row.to_status,
    actor_name: await loadProfileName(client, row.changed_by),
    note: row.reason,
  })));
}

async function loadSalesDocumentPriceList(
  client: DatabaseClient,
  organizationId: string,
  priceListId: string | null,
): Promise<SalesDocumentDetailData["price_list"]> {
  if (priceListId === null) return null;
  const { data, error } = await client
    .from("price_lists")
    .select("id, code, name")
    .eq("organization_id", organizationId)
    .eq("id", priceListId)
    .maybeSingle();
  if (error !== null) throw error;
  return data;
}

async function hydrateCashbookEntry(
  client: DatabaseClient,
  organizationId: string,
  row: Record<string, unknown>,
): Promise<CashbookEntryData> {
  const account = Array.isArray(row.finance_accounts) ? row.finance_accounts[0] : row.finance_accounts;
  let code = String(row.id);
  let note = row.description === null ? null : String(row.description ?? "");

  if (row.source_type === "payment_receipt_method" && typeof row.payment_receipt_method_id === "string") {
    const receipt = await loadReceiptForPaymentMethod(client, organizationId, row.payment_receipt_method_id);
    if (receipt !== null) {
      code = receipt.code;
      note = note || `Thu ${receipt.code}`;
    }
  }

  if (row.source_type === "cashbook_voucher" && typeof row.cashbook_voucher_id === "string") {
    const { data: voucher, error } = await client
      .from("cashbook_vouchers")
      .select("code, reason")
      .eq("id", row.cashbook_voucher_id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error !== null) throw error;
    if (voucher !== null) {
      code = voucher.code;
      note = voucher.reason;
    }
  }

  return {
    id: String(row.id),
    code,
    status: String(row.status) as "posted" | "cancelled",
    direction: String(row.direction) as "in" | "out",
    amount_delta: Number(row.amount_delta),
    finance_account: toFinanceAccountRef(account),
    is_business_accounted: row.is_business_accounted !== false,
    source_type: String(row.source_type) as "payment_receipt_method" | "cashbook_voucher",
    created_at: String(row.entry_time ?? row.created_at),
    note,
  };
}

async function hydrateCashbookEntryDetail(
  client: DatabaseClient,
  organizationId: string,
  row: Record<string, unknown>,
): Promise<CashbookEntryDetailData> {
  const base = await hydrateCashbookEntry(client, organizationId, row);
  const createdBy = await loadProfileName(client, String(row.created_by));
  const detail: CashbookEntryDetailData = {
    ...base,
    created_by: { id: String(row.created_by), name: createdBy },
    counterparty: { type: "none", name: null, phone: null },
    payment_method: "manual",
    source: { type: "manual_voucher", id: String(row.cashbook_voucher_id ?? ""), code: base.code, order_code: null },
    allocations: [],
  };

  if (row.source_type === "payment_receipt_method" && typeof row.payment_receipt_method_id === "string") {
    const receiptRow = await loadReceiptForPaymentMethod(client, organizationId, row.payment_receipt_method_id);
    if (receiptRow !== null) {
      const receipt = await loadPaymentReceiptDetail(client, organizationId, receiptRow.id);
      detail.payment_method = receiptRow.method_type as "cash" | "bank_transfer";
      detail.source = {
        type: "payment_receipt",
        id: receiptRow.id,
        code: receiptRow.code,
        order_code: receipt?.source_order?.code ?? null,
      };
      detail.counterparty = {
        type: receipt?.customer === null ? "none" : "customer",
        name: receipt?.customer?.name ?? null,
        phone: null,
      };
      detail.allocations = receipt?.allocations ?? [];
    }
  }

  if (row.source_type === "cashbook_voucher" && typeof row.cashbook_voucher_id === "string") {
    const { data: voucher, error } = await client
      .from("cashbook_vouchers")
      .select("id, code, counterparty_type, counterparty_name, counterparty_phone")
      .eq("id", row.cashbook_voucher_id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error !== null) throw error;
    if (voucher !== null) {
      detail.counterparty = {
        type: voucher.counterparty_type,
        name: voucher.counterparty_name,
        phone: voucher.counterparty_phone,
      };
      detail.source = { type: "manual_voucher", id: voucher.id, code: voucher.code, order_code: null };
    }
  }

  return detail;
}

async function loadReceiptForPaymentMethod(
  client: DatabaseClient,
  organizationId: string,
  paymentReceiptMethodId: string,
): Promise<{ id: string; code: string; method_type: string } | null> {
  const { data: method, error: methodError } = await client
    .from("payment_receipt_methods")
    .select("method_type, payment_receipt_id")
    .eq("id", paymentReceiptMethodId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (methodError !== null) throw methodError;
  if (method === null) return null;

  const { data: receipt, error: receiptError } = await client
    .from("payment_receipts")
    .select("id, code")
    .eq("id", method.payment_receipt_id)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (receiptError !== null) throw receiptError;
  return receipt === null ? null : { id: receipt.id, code: receipt.code, method_type: method.method_type };
}

async function loadPaymentReceiptDetail(
  client: DatabaseClient,
  organizationId: string,
  receiptId: string,
): Promise<PaymentReceiptDetailData | null> {
  const { data: receipt, error } = await client
    .from("payment_receipts")
    .select("id, code, status, receipt_type, customer_id, order_id, total_received_amount, created_at")
    .eq("id", receiptId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error !== null) throw error;
  if (receipt === null) return null;

  const { data: methods, error: methodsError } = await client
    .from("payment_receipt_methods")
    .select("method_type, amount, finance_accounts(id, code, name)")
    .eq("payment_receipt_id", receipt.id)
    .eq("organization_id", organizationId)
    .order("line_no", { ascending: true });
  if (methodsError !== null) throw methodsError;

  const customer = typeof receipt.customer_id === "string"
    ? await loadCustomerRef(client, organizationId, receipt.customer_id)
    : null;
  const sourceOrder = typeof receipt.order_id === "string"
    ? await loadOrderRef(client, organizationId, receipt.order_id)
    : null;

  return {
    id: receipt.id,
    code: receipt.code,
    status: receipt.status,
    receipt_type: receipt.receipt_type,
    total_received_amount: Number(receipt.total_received_amount),
    created_at: receipt.created_at,
    customer,
    source_order: sourceOrder,
    methods: (methods ?? []).map((method) => {
      const account = Array.isArray(method.finance_accounts) ? method.finance_accounts[0] : method.finance_accounts;
      return {
        method_type: method.method_type,
        amount: Number(method.amount),
        finance_account: {
          id: String(account?.id ?? ""),
          code: String(account?.code ?? ""),
          name: String(account?.name ?? ""),
        },
      };
    }),
    allocations: await loadPaymentReceiptAllocations(client, organizationId, receipt.id),
  };
}

async function loadPaymentReceiptAllocations(
  client: DatabaseClient,
  organizationId: string,
  receiptId: string,
): Promise<PaymentReceiptAllocationData[]> {
  const { data, error } = await client
    .from("customer_debt_allocations")
    .select("order_id, allocated_amount, order_debt_before, order_debt_after")
    .eq("payment_receipt_id", receiptId)
    .eq("organization_id", organizationId)
    .order("line_no", { ascending: true });
  if (error !== null) throw error;

  return await Promise.all((data ?? []).map(async (allocation) => {
    const order = await loadOrderRef(client, organizationId, allocation.order_id);
    return {
      order_id: allocation.order_id,
      order_code: order?.code ?? "",
      order_total_amount: order?.total_amount ?? 0,
      collected_before: Math.max(Number(allocation.order_debt_before) - Number(allocation.allocated_amount), 0),
      allocated_amount: Number(allocation.allocated_amount),
      remaining_after: Number(allocation.order_debt_after),
    };
  }));
}

async function loadCustomerRef(
  client: DatabaseClient,
  organizationId: string,
  customerId: string,
): Promise<{ id: string; code: string; name: string } | null> {
  const { data, error } = await client
    .from("customers")
    .select("id, code, name")
    .eq("id", customerId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error !== null) throw error;
  return data;
}

async function loadOrderRef(
  client: DatabaseClient,
  organizationId: string,
  orderId: string,
): Promise<{ id: string; code: string; total_amount: number } | null> {
  const { data, error } = await client
    .from("orders")
    .select("id, code, total_amount")
    .eq("id", orderId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error !== null) throw error;
  return data === null ? null : { id: data.id, code: data.code, total_amount: Number(data.total_amount) };
}

async function loadProfileName(client: DatabaseClient, userId: string): Promise<string> {
  const { data, error } = await client
    .from("profiles")
    .select("display_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (error !== null) throw error;
  return data?.display_name ?? "";
}

function toFinanceAccountRef(value: unknown): { id: string; code: string; name: string; account_type: "cash" | "bank" } {
  const account = isRecord(value) ? value : {};
  return {
    id: String(account.id ?? ""),
    code: String(account.code ?? ""),
    name: String(account.name ?? ""),
    account_type: String(account.account_type ?? "cash") as "cash" | "bank",
  };
}

async function loadCustomerDebtSummaries(
  client: DatabaseClient,
  organizationId: string,
): Promise<CustomerDebtSummaryData[]> {
  const invoices = await loadOpenDebtInvoices(client, organizationId);
  const byCustomer = new Map<string, CustomerDebtSummaryData>();

  for (const invoice of invoices) {
    const key = invoice.customer_id ?? `retail:${invoice.order_id}`;
    const current = byCustomer.get(key) ?? {
      customer_id: invoice.customer_id,
      customer_code: invoice.customer_code,
      customer_name: invoice.customer_name,
      total_debt: 0,
      oldest_order_code: invoice.order_code,
      open_invoice_count: 0,
    };
    current.total_debt += invoice.remaining_debt;
    current.open_invoice_count += 1;
    current.oldest_order_code ??= invoice.order_code;
    byCustomer.set(key, current);
  }

  return [...byCustomer.values()]
    .filter((item) => item.total_debt > 0)
    .sort((left, right) => left.customer_name.localeCompare(right.customer_name, "vi"));
}

async function loadOpenDebtInvoices(
  client: DatabaseClient,
  organizationId: string,
  customerId?: string,
): Promise<Array<{
  order_id: string;
  order_code: string;
  customer_id: string | null;
  customer_code: string | null;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  debt_amount: number;
  remaining_debt: number;
}>> {
  let orderQuery = client
    .from("orders")
    .select("id, code, customer_id, customer_snapshot, total_amount, paid_amount, debt_amount, created_at")
    .eq("organization_id", organizationId)
    .eq("order_type", "invoice")
    .eq("status", "completed")
    .gt("debt_amount", 0)
    .order("created_at", { ascending: true })
    .limit(1000);

  if (customerId !== undefined) orderQuery = orderQuery.eq("customer_id", customerId);

  const { data: orders, error: ordersError } = await orderQuery;
  if (ordersError !== null) throw ordersError;
  if ((orders ?? []).length === 0) return [];

  const orderIds = (orders ?? []).map((order) => order.id);
  const { data: allocations, error: allocationsError } = await client
    .from("customer_debt_allocations")
    .select("order_id, allocated_amount")
    .eq("organization_id", organizationId)
    .in("order_id", orderIds);
  if (allocationsError !== null) throw allocationsError;

  const allocatedByOrder = new Map<string, number>();
  for (const allocation of allocations ?? []) {
    allocatedByOrder.set(
      allocation.order_id,
      (allocatedByOrder.get(allocation.order_id) ?? 0) + Number(allocation.allocated_amount),
    );
  }

  return (orders ?? [])
    .map((order) => {
      const snapshot = isRecord(order.customer_snapshot) ? order.customer_snapshot : {};
      const debtAmount = Number(order.debt_amount);
      const remainingDebt = debtAmount - (allocatedByOrder.get(order.id) ?? 0);
      return {
        order_id: order.id,
        order_code: order.code,
        customer_id: order.customer_id,
        customer_code: typeof snapshot.code === "string" ? snapshot.code : null,
        customer_name: typeof snapshot.name === "string" ? snapshot.name : "Khách lẻ",
        total_amount: Number(order.total_amount),
        paid_amount: Number(order.paid_amount),
        debt_amount: debtAmount,
        remaining_debt: remainingDebt,
      };
    })
    .filter((invoice) => invoice.remaining_debt > 0);
}

function paginate<T>(items: T[], page: number, pageSize: number): { items: T[]; total: number } {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length };
}

function normalizePriceFormula(formula: Record<string, unknown>): PriceFormulaInput {
  if (typeof formula.name !== "string" || formula.name.trim().length < 1 || formula.name.trim().length > 120) {
    throw new Error("FORMULA_NAME_INVALID");
  }
  if (!isRecord(formula.product_filter)) throw new Error("FORMULA_PRODUCT_FILTER_INVALID");
  if (!isRecord(formula.cost_formula)) throw new Error("FORMULA_COST_INVALID");
  if (!isRecord(formula.profit_formula)) throw new Error("FORMULA_PROFIT_INVALID");
  if (!isRecord(formula.price_list_adjustments)) throw new Error("FORMULA_ADJUSTMENTS_INVALID");

  return {
    name: formula.name.trim(),
    product_filter: formula.product_filter,
    cost_formula: formula.cost_formula as unknown as PriceFormulaCost,
    profit_formula: formula.profit_formula as unknown as PriceFormulaProfit,
    price_list_adjustments: formula.price_list_adjustments as Record<string, PriceFormulaAdjustment>,
  };
}

function normalizePriceListAdjustments(
  adjustments: Record<string, PriceFormulaAdjustment>,
): Map<string, PriceFormulaAdjustment> {
  return new Map(Object.entries(adjustments).filter((entry): entry is [string, PriceFormulaAdjustment] =>
    isRecord(entry[1]) && (entry[1].type === "amount" || entry[1].type === "percent")
  ));
}

async function loadFormulaProducts(
  client: DatabaseClient,
  organizationId: string,
  productFilter: Record<string, unknown>,
): Promise<FormulaProductRow[]> {
  if ("group_id" in productFilter) throw new Error("FORMULA_PRODUCT_GROUP_UNSUPPORTED");
  if ("status" in productFilter && productFilter.status !== "active") throw new Error("FORMULA_STATUS_UNSUPPORTED");

  let query = client
    .from("products")
    .select("id, code, name, latest_purchase_cost")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("code", { ascending: true });

  const nameContains = typeof productFilter.name_contains === "string" ? productFilter.name_contains.trim() : "";
  if (nameContains !== "") {
    query = query.ilike("name", `%${escapeLike(nameContains)}%`);
  }
  const codeContains = typeof productFilter.code_contains === "string" ? productFilter.code_contains.trim() : "";
  if (codeContains !== "") {
    query = query.ilike("code", `%${escapeLike(codeContains)}%`);
  }
  if ("sell_method" in productFilter) {
    if (typeof productFilter.sell_method !== "string") throw new Error("FORMULA_SELL_METHOD_INVALID");
    query = query.eq("sell_method", productFilter.sell_method);
  }

  const { data, error } = await query;
  if (error !== null) throw error;
  return (data ?? []) as FormulaProductRow[];
}

async function loadFormulaPriceLists(
  client: DatabaseClient,
  organizationId: string,
): Promise<FormulaPriceListRow[]> {
  const { data, error } = await client
    .from("price_lists")
    .select("id, name")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("code", { ascending: true });
  if (error !== null) throw error;
  return (data ?? []) as FormulaPriceListRow[];
}

async function loadFormulaPriceItems(
  client: DatabaseClient,
  organizationId: string,
  productIds: string[],
  priceListIds: string[],
): Promise<Map<string, Map<string, FormulaPriceItemRow>>> {
  if (productIds.length === 0 || priceListIds.length === 0) return new Map();
  const { data, error } = await client
    .from("price_list_items")
    .select("product_id, price_list_id, unit_price, pricing_mode")
    .eq("organization_id", organizationId)
    .in("product_id", productIds)
    .in("price_list_id", priceListIds);
  if (error !== null) throw error;

  const itemsByProduct = new Map<string, Map<string, FormulaPriceItemRow>>();
  for (const row of (data ?? []) as FormulaPriceItemRow[]) {
    if (!itemsByProduct.has(row.product_id)) itemsByProduct.set(row.product_id, new Map());
    itemsByProduct.get(row.product_id)?.set(row.price_list_id, row);
  }
  return itemsByProduct;
}

async function loadPriceFormulaRules(
  client: DatabaseClient,
  organizationId: string,
  formulaRuleIds: string[],
): Promise<Map<string, PriceFormulaRuleRow>> {
  if (formulaRuleIds.length === 0) return new Map();
  const { data, error } = await client
    .from("price_formula_rules")
    .select("id, cost_formula, profit_formula, price_list_adjustments")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .in("id", formulaRuleIds);
  if (error !== null) throw error;

  return new Map((data ?? []).map((row) => [
    row.id,
    {
      cost_formula: row.cost_formula as unknown as PriceFormulaCost,
      profit_formula: row.profit_formula as unknown as PriceFormulaProfit,
      price_list_adjustments: row.price_list_adjustments as Record<string, PriceFormulaAdjustment>,
    },
  ]));
}

function uniqueFormulaSelections(
  items: Array<{ product_id: string; price_list_id: string }>,
): Array<{ product_id: string; price_list_id: string }> {
  const seen = new Set<string>();
  const uniqueItems = [];
  for (const item of items) {
    const key = `${item.product_id}:${item.price_list_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueItems.push(item);
  }
  return uniqueItems;
}

function toNullableNumber(value: number | string | null): number | null {
  return value === null ? null : Number(value);
}

function escapeLike(value: string): string {
  return value.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

async function hydrateInventoryProducts(
  client: DatabaseClient,
  organizationId: string,
  products: Array<{ id: string; code: string; name: string; status: "active" | "inactive" }>,
  inventoryShape?: "normal" | "roll" | "sheet",
): Promise<InventoryProductData[]> {
  const productIds = products.map((product) => product.id);
  if (productIds.length === 0) return [];

  const { data: settingsRows, error: settingsError } = await client
    .from("product_inventory_settings")
    .select("product_id, inventory_shape, stock_unit_id")
    .eq("organization_id", organizationId)
    .in("product_id", productIds);
  if (settingsError !== null) throw settingsError;

  const settingsByProduct = new Map((settingsRows ?? []).map((row) => [row.product_id, row]));
  const filteredProducts = inventoryShape === undefined
    ? products
    : products.filter((product) => settingsByProduct.get(product.id)?.inventory_shape === inventoryShape);
  const filteredProductIds = filteredProducts.map((product) => product.id);
  if (filteredProductIds.length === 0) return [];

  const stockUnitIds = [...new Set((settingsRows ?? []).map((row) => row.stock_unit_id).filter(isString))];
  const unitsById = new Map<string, string>();
  if (stockUnitIds.length > 0) {
    const { data: units, error: unitsError } = await client
      .from("inventory_units")
      .select("id, name")
      .eq("organization_id", organizationId)
      .in("id", stockUnitIds);
    if (unitsError !== null) throw unitsError;
    for (const unit of units ?? []) unitsById.set(unit.id, unit.name);
  }

  const { data: movements, error: movementsError } = await client
    .from("stock_movements")
    .select("product_id, quantity_delta")
    .eq("organization_id", organizationId)
    .in("product_id", filteredProductIds);
  if (movementsError !== null) throw movementsError;

  const qtyByProduct = new Map<string, number>();
  for (const movement of movements ?? []) {
    qtyByProduct.set(movement.product_id, (qtyByProduct.get(movement.product_id) ?? 0) + Number(movement.quantity_delta));
  }

  return filteredProducts.map((product) => {
    const settings = settingsByProduct.get(product.id);
    const availableQty = qtyByProduct.get(product.id) ?? 0;
    return {
      product_id: product.id,
      code: product.code,
      name: product.name,
      status: product.status,
      inventory_shape: settings?.inventory_shape ?? "normal",
      stock_unit: unitsById.get(settings?.stock_unit_id ?? "") ?? "đơn vị",
      available_qty: availableQty,
      is_negative: availableQty < 0,
    };
  });
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function hydrateUser(
  client: DatabaseClient,
  row: { user_id: string; display_name: string; status: "active" | "inactive" },
  email: string,
): Promise<UserListItem> {
  const { data: permissionRows, error } = await client
    .from("user_permissions")
    .select("permission_code")
    .eq("user_id", row.user_id)
    .order("permission_code", { ascending: true });
  if (error !== null) throw error;
  return {
    id: row.user_id,
    email,
    display_name: row.display_name,
    status: row.status,
    permissions: (permissionRows ?? []).map((permission) => permission.permission_code as PermissionCode),
  };
}

export function createSupabaseRepositoryFromEnv(): FoundationRepository {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (url === undefined || serviceRoleKey === undefined) {
    throw new Error("Supabase API environment variables are required.");
  }

  return createFoundationRepository(createClient(url, serviceRoleKey));
}
