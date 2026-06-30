import { expect, test } from "@playwright/test";

test("login, open dashboard modules, refresh POS shell, and logout", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Tài khoản").fill("admin");
  await page.getByLabel("Mật khẩu").fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("heading", { name: "QC-OMS" })).toBeVisible();
  await page.getByRole("button", { name: /^(POS|Bán hàng)$/ }).click();
  await expect(page.getByLabel("K01 topbar")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("K01 topbar")).toBeVisible();
  await page.getByRole("button", { name: /Admin/ }).click();
  await page.getByRole("menuitem", { name: "Đăng xuất" }).click();
  await expect(page.getByRole("heading", { name: "QC-OMS" })).toBeVisible();
});

test("login, create a cash invoice from POS, and show receipt summary", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Tài khoản").fill("admin");
  await page.getByLabel("Mật khẩu").fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("heading", { name: "QC-OMS" })).toBeVisible();

  await page.getByRole("button", { name: /^(POS|Bán hàng)$/ }).click();
  await expect(page.getByLabel("K01 topbar")).toBeVisible();
  await page.getByRole("textbox", { name: "Tìm khách" }).fill("KH000001");
  await page.getByRole("button", { name: "Tìm khách" }).click();
  await page.getByRole("button", { name: /Chọn KH000001/ }).click();
  await expect(page.getByText(/Đã chọn KH000001/)).toBeVisible();

  await page.getByRole("button", { name: /Standee chữ X/ }).click();
  await expect(page.getByLabel("K02 giỏ hàng").getByText("Standee chữ X")).toBeVisible();
  await page.getByLabel("Số lượng Standee chữ X").fill("2");
  await page.getByLabel("Tiền mặt trả hóa đơn").fill("360000");
  await page.getByRole("button", { name: "Tạo hóa đơn" }).click();

  await expect(page.getByLabel("Kết quả checkout").getByText(/^HD[0-9]{6}$/)).toBeVisible();
  await expect(page.getByLabel("Kết quả checkout").getByText("Đã trả 360.000")).toBeVisible();
});
