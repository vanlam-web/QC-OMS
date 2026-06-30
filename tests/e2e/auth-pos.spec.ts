import { expect, test } from "@playwright/test";

test("login, open dashboard modules, refresh POS shell, and logout", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Tài khoản").fill("admin");
  await page.getByLabel("Mật khẩu").fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("heading", { name: "QC-OMS" })).toBeVisible();
  await page.getByRole("button", { name: "Bán hàng" }).click();
  await expect(page.getByLabel("K01 topbar")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("K01 topbar")).toBeVisible();
  await page.getByRole("button", { name: /Admin/ }).click();
  await page.getByRole("menuitem", { name: "Đăng xuất" }).click();
  await expect(page.getByRole("heading", { name: "QC-OMS" })).toBeVisible();
});
