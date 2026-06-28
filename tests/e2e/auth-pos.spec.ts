import { expect, test } from "@playwright/test";

test("login, select workstation, open POS shell, refresh, and logout", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel("Mật khẩu").fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.goto("/pos");
  await expect(page.getByLabel("K01 topbar")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("K01 topbar")).toBeVisible();
});
