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
    addLabel(id: string, name: string): Promise<boolean>;
    deleteLabel(id: string): Promise<boolean>;
    getAllLabels(): Promise<Array<[string, string]>>;
    getLabel(id: string): Promise<string | null>;
    initializeDefaultLabels(): Promise<void>;
    renameLabel(id: string, newName: string): Promise<boolean>;
}
