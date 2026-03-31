import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    // Authorization (used by useActor)
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    // Per-user data sync (by ICP principal)
    storeUserData(module_: string, jsonData: string): Promise<void>;
    getUserData(module_: string): Promise<string | null>;
    getUserModules(): Promise<Array<string>>;
    deleteUserData(module_: string): Promise<void>;
    // Per-user data sync (by userId key - for username/password auth)
    storeUserDataByKey(userId: string, module_: string, jsonData: string): Promise<void>;
    getUserDataByKey(userId: string, module_: string): Promise<string | null>;
    // Username/password authentication
    registerUser(username: string, passwordHash: string, recoveryHash: string, userId: string): Promise<{ ok: null } | { err: string }>;
    loginUser(username: string, passwordHash: string): Promise<{ ok: string } | { err: string }>;
    resetPasswordWithRecovery(username: string, recoveryHash: string, newPasswordHash: string): Promise<{ ok: null } | { err: string }>;
    // Legacy label management
    addLabel(id: string, name: string): Promise<boolean>;
    deleteLabel(id: string): Promise<boolean>;
    getAllLabels(): Promise<Array<[string, string]>>;
    getLabel(id: string): Promise<string | null>;
    initializeDefaultLabels(): Promise<void>;
    renameLabel(id: string, newName: string): Promise<boolean>;
}
