import { test, expect, request } from "@playwright/test";

const base = "http://localhost:3000";
const apiBase = "http://localhost:3000";

async function getAnyUserId() {
  const api = await request.newContext();
  const res = await api.get(`${apiBase}/api/debug/users/`);
  const json = await res.json();
  return json.sample?.[0]?.id || json[0]?.id;
}

test("Navigate main menus load without errors", async ({ page }) => {
  const userId = await getAnyUserId();
  await page.addInitScript((id) => {
    window.localStorage.setItem("auth_token", id as string);
  }, userId);
  const pages = [
    "/",
    "/projects",
    "/tasks",
    "/timesheet",
    "/sales",
    "/reports/projects",
    "/reports/utilization",
    "/reports/hours",
    "/help",
    "/settings",
  ];
  for (const p of pages) {
    await page.goto(`${base}${p}`);
    await expect(page).toHaveTitle(
      /I-PROJECT|Projects|Tasks|Timesheet|Sales|Reports|Help|Settings/i,
    );
  }
});
