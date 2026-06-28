import { createApp } from "../../functions/api/app.ts";

function assertEquals<T>(actual: T, expected: T): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assertMatch(actual: string, expected: RegExp): void {
  if (!expected.test(actual)) {
    throw new Error(`Expected ${actual} to match ${expected}`);
  }
}

Deno.test("GET /api/v1/health returns the standard success envelope", async () => {
  const response = await createApp({ version: "test-sha" })(
    new Request("http://local/api/v1/health"),
  );
  const body = await response.json();

  assertEquals(response.status, 200);
  assertEquals(body.success, true);
  assertEquals(body.data, {
    status: "ok",
    service: "qc-oms-api",
    version: "test-sha",
  });
  assertMatch(body.trace_id, /^[0-9a-f-]{36}$/);
});
