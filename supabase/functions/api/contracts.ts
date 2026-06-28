export type PermissionCode = `perm.${string}`;

export interface RequestContext {
  traceId: string;
  userId: string;
  email: string;
  organizationId: string;
  workstationId: string | null;
  permissions: ReadonlySet<PermissionCode>;
}

export interface WorkstationData {
  id: string;
  code: string;
  name: string;
  status: "active" | "inactive";
}

export interface UserListItem {
  id: string;
  email: string;
  display_name: string;
  status: "active" | "inactive";
  permissions: PermissionCode[];
}

export interface PermissionData {
  code: PermissionCode;
  module: string;
  description: string;
}

export interface CurrentUserData {
  user: { id: string; email: string; display_name: string };
  organization: { id: string; code: string; name: string };
  workstation: { id: string; code: string; name: string } | null;
  permissions: PermissionCode[];
}

export interface CurrentUserRecord {
  user: { id: string; email: string; displayName: string };
  organization: { id: string; code: string; name: string };
  workstation: { id: string; code: string; name: string } | null;
  permissions: PermissionCode[];
  workstationInvalid: boolean;
}

export interface GetCurrentUserInput {
  userId: string;
  email: string;
  workstationId: string | null;
}

export interface FoundationRepository {
  getCurrentUser(input: GetCurrentUserInput): Promise<CurrentUserRecord | null>;
  listWorkstations(organizationId: string): Promise<WorkstationData[]>;
  createWorkstation(input: {
    organizationId: string;
    code: string;
    name: string;
  }): Promise<WorkstationData>;
  updateWorkstation(input: {
    organizationId: string;
    id: string;
    code?: string;
    name?: string;
    status?: "active" | "inactive";
  }): Promise<WorkstationData | null>;
  listUsers(input: {
    organizationId: string;
    search?: string;
    status?: "active" | "inactive";
    page: number;
    pageSize: number;
  }): Promise<{ items: UserListItem[]; total: number }>;
  getUser(input: { organizationId: string; userId: string }): Promise<UserListItem | null>;
  createUser(input: {
    organizationId: string;
    email: string;
    password: string;
    displayName: string;
    permissions: PermissionCode[];
    actorUserId: string;
    traceId: string;
  }): Promise<UserListItem>;
  updateUser(input: {
    organizationId: string;
    userId: string;
    displayName?: string;
    status?: "active" | "inactive";
    actorUserId: string;
  }): Promise<UserListItem | null>;
  replaceUserPermissions(input: {
    organizationId: string;
    userId: string;
    permissions: PermissionCode[];
    actorUserId: string;
    traceId: string;
  }): Promise<UserListItem | null>;
  listPermissions(): Promise<PermissionData[]>;
}
