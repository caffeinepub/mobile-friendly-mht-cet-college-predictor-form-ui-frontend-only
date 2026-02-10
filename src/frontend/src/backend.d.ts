import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Prediction {
    branch: string;
    chance: string;
    college: string;
}
export interface backendInterface {
    predictAdmission(userPercentile: number): Promise<Array<Prediction>>;
}
