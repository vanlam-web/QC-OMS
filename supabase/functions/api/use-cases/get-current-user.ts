import type { CurrentUserData, FoundationRepository } from "../contracts.ts";
import { ApiError } from "../http.ts";
import type { AuthUser } from "../middleware/auth.ts";

export interface GetCurrentUserOptions {
  authUser: AuthUser;
  workstationId: string | null;
  repository: FoundationRepository;
}

export async function getCurrentUser(options: GetCurrentUserOptions): Promise<CurrentUserData> {
  const record = await options.repository.getCurrentUser({
    userId: options.authUser.id,
    email: options.authUser.email,
    workstationId: options.workstationId,
  });

  if (record === null) {
    throw new ApiError({
      status: 403,
      code: "ACCOUNT_INACTIVE",
      message: "Account is inactive.",
    });
  }

  if (record.workstationInvalid) {
    throw new ApiError({
      status: 409,
      code: "WORKSTATION_INVALID",
      message: "Workstation is invalid.",
    });
  }

  return {
    user: {
      id: record.user.id,
      email: record.user.email,
      display_name: record.user.displayName,
    },
    organization: record.organization,
    workstation: record.workstation,
    permissions: [...record.permissions].sort(),
  };
}
