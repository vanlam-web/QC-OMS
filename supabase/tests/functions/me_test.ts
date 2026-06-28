import { createApp } from "../../functions/api/app.ts";
import type { CurrentUserRecord, FoundationRepository } from "../../functions/api/contracts.ts";
import type { AuthClient } from "../../functions/api/middleware/auth.ts";

const userId = "50000000-0000-4000-8000-000000000001";
const organizationId = "50000000-0000-4000-8000-000000000101";
const workstationId = "50000000-0000-4000-8000-000000000201";

function assertEquals<T>(actual: T, expected: T): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function createAuthClient(): AuthClient {
  return {
    getUser(token: string) {
      if (token !== "valid-token") {
        return Promise.resolve({ user: null });
      }

      return Promise.resolve({
        user: {
          id: userId,
          email: "cashier@example.test",
        },
      });
    },
  };
}

function createRepository(record: CurrentUserRecord | null): FoundationRepository {
  return {
    getCurrentUser(input) {
      assertEquals(input.userId, userId);
      return Promise.resolve(record);
    },
    listWorkstations: () => Promise.resolve([]),
    createWorkstation: () => {
      throw new Error("not implemented");
    },
    updateWorkstation: () => {
      throw new Error("not implemented");
    },
    listUsers: () => Promise.resolve({ items: [], total: 0 }),
    getUser: () => Promise.resolve(null),
    createUser: () => {
      throw new Error("not implemented");
    },
    updateUser: () => Promise.resolve(null),
    replaceUserPermissions: () => Promise.resolve(null),
    listPermissions: () => Promise.resolve([]),
  };
}

function activeRecord(overrides: Partial<CurrentUserRecord> = {}): CurrentUserRecord {
  return {
    user: {
      id: userId,
      email: "cashier@example.test",
      displayName: "Cashier",
    },
    organization: {
      id: organizationId,
      code: "VAN-LAM",
      name: "Xưởng Văn Lâm",
    },
    workstation: {
      id: workstationId,
      code: "POS-01",
      name: "Quầy thu ngân 1",
    },
    permissions: ["perm.create_order", "perm.view_shift_report"],
    workstationInvalid: false,
    ...overrides,
  };
}

Deno.test("GET /api/v1/me returns profile, organization, permissions and optional workstation", async () => {
  const response = await createApp({
    version: "test-sha",
    auth: createAuthClient(),
    repository: createRepository(activeRecord()),
  })(
    new Request("http://local/api/v1/me", {
      headers: {
        authorization: "Bearer valid-token",
        "x-request-id": "trace-me-success",
        "x-workstation-id": workstationId,
      },
    }),
  );
  const body = await response.json();

  assertEquals(response.status, 200);
  assertEquals(body, {
    success: true,
    data: {
      user: {
        id: userId,
        email: "cashier@example.test",
        display_name: "Cashier",
      },
      organization: {
        id: organizationId,
        code: "VAN-LAM",
        name: "Xưởng Văn Lâm",
      },
      workstation: {
        id: workstationId,
        code: "POS-01",
        name: "Quầy thu ngân 1",
      },
      permissions: ["perm.create_order", "perm.view_shift_report"],
    },
    trace_id: "trace-me-success",
  });
});

Deno.test("GET /api/v1/me rejects a missing bearer token with AUTH_REQUIRED", async () => {
  const response = await createApp({
    version: "test-sha",
    auth: createAuthClient(),
    repository: createRepository(activeRecord()),
  })(
    new Request("http://local/api/v1/me", {
      headers: { "x-request-id": "trace-missing-auth" },
    }),
  );
  const body = await response.json();

  assertEquals(response.status, 401);
  assertEquals(body, {
    success: false,
    error: {
      code: "AUTH_REQUIRED",
      message: "Authentication is required.",
    },
    trace_id: "trace-missing-auth",
  });
});

Deno.test("GET /api/v1/me rejects an inactive profile with ACCOUNT_INACTIVE", async () => {
  const response = await createApp({
    version: "test-sha",
    auth: createAuthClient(),
    repository: createRepository(null),
  })(
    new Request("http://local/api/v1/me", {
      headers: {
        authorization: "Bearer valid-token",
        "x-request-id": "trace-inactive",
      },
    }),
  );
  const body = await response.json();

  assertEquals(response.status, 403);
  assertEquals(body, {
    success: false,
    error: {
      code: "ACCOUNT_INACTIVE",
      message: "Account is inactive.",
    },
    trace_id: "trace-inactive",
  });
});

Deno.test("GET /api/v1/me rejects a cross-organization workstation with WORKSTATION_INVALID", async () => {
  const response = await createApp({
    version: "test-sha",
    auth: createAuthClient(),
    repository: createRepository(activeRecord({ workstation: null, workstationInvalid: true })),
  })(
    new Request("http://local/api/v1/me", {
      headers: {
        authorization: "Bearer valid-token",
        "x-request-id": "trace-bad-workstation",
        "x-workstation-id": "60000000-0000-4000-8000-000000000201",
      },
    }),
  );
  const body = await response.json();

  assertEquals(response.status, 409);
  assertEquals(body, {
    success: false,
    error: {
      code: "WORKSTATION_INVALID",
      message: "Workstation is invalid.",
    },
    trace_id: "trace-bad-workstation",
  });
});
