import { test, expect, request } from "@playwright/test";

const base = "http://localhost:3000";

test("Sales pipeline endpoint returns pipeline and stages", async ({}) => {
  const api = await request.newContext();
  const res = await api.get(`${base}/api/sales/pipeline`);
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.pipeline?.id).toBeTruthy();
  expect(Array.isArray(json.stages)).toBeTruthy();
  expect(json.stages.length).toBeGreaterThan(0);
});

test("Sales deals list can be filtered by q", async ({}) => {
  const api = await request.newContext();
  const res = await api.get(`${base}/api/sales/deals?q=sample`);
  expect(res.ok()).toBeTruthy();
});
