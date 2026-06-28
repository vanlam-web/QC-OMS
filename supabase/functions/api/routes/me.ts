import type { FoundationRepository } from "../contracts.ts";
import type { AuthClient } from "../middleware/auth.ts";
import { requireAuth } from "../middleware/auth.ts";
import { successResponse } from "../http.ts";
import { getCurrentUser } from "../use-cases/get-current-user.ts";

export interface MeRouteDependencies {
  auth: AuthClient;
  repository: FoundationRepository;
}

export async function handleMe(
  request: Request,
  traceId: string,
  dependencies: MeRouteDependencies,
): Promise<Response> {
  const authUser = await requireAuth(request, dependencies.auth);
  const workstationId = request.headers.get("x-workstation-id");
  const data = await getCurrentUser({
    authUser,
    workstationId,
    repository: dependencies.repository,
  });

  return successResponse(data, traceId);
}
