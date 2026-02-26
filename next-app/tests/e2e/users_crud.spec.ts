import { test, expect, request } from "@playwright/test";

const base = "http://localhost:3000";
const apiBase = "http://localhost:3000";

async function getAnyUserId() {
  const api = await request.newContext();
  const res = await api.get(`${apiBase}/api/debug/users/`);
  const json = await res.json();
  return json.sample?.[0]?.id || json[0]?.id;
}

test.describe("Users CRUD", () => {
  test("Create, Edit, Delete user", async ({ page }) => {
    const userId = await getAnyUserId();
    await page.addInitScript((id) => {
      window.localStorage.setItem("auth_token", id as string);
    }, userId);
    await page.goto(`${base}/users`);
    await expect(page.getByText("สร้างผู้ใช้ใหม่")).toBeVisible();

    const name = `QA User ${Date.now()}`;
    const email = `qa.${Date.now()}@example.com`;

    await page.getByPlaceholder("ชื่อ").fill(name);
    await page.getByPlaceholder("อีเมล").fill(email);
    await page.getByRole("button", { name: "สร้าง" }).click();

    await expect(page.getByText(name)).toBeVisible({ timeout: 5000 });

    const firstRowNameInput = page
      .locator("tbody tr")
      .first()
      .locator("input")
      .nth(0);
    await firstRowNameInput.fill(`${name} Edited`);
    await firstRowNameInput.blur();

    await expect(page.getByText(`${name} Edited`)).toBeVisible({
      timeout: 5000,
    });

    page.once("dialog", (dialog) => dialog.accept());
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: "ลบ" })
      .click();

    await expect(page.getByText(`${name} Edited`)).toBeHidden({
      timeout: 5000,
    });
  });

  test("Validation error on bad email", async ({ page }) => {
    const userId = await getAnyUserId();
    await page.addInitScript((id) => {
      window.localStorage.setItem("auth_token", id as string);
    }, userId);
    await page.goto(`${base}/users`);
    await page.getByPlaceholder("ชื่อ").fill("Invalid Email User");
    await page.getByPlaceholder("อีเมล").fill("invalid-email");
    await page.getByRole("button", { name: "สร้าง" }).click();
    await expect(page.getByText("รูปแบบอีเมลไม่ถูกต้อง")).toBeVisible();
  });
});
