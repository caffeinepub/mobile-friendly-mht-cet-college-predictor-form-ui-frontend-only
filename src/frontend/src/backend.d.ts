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
export interface CutoffsRecord {
    college_name: string;
    branch_name: string;
    closing_rank: number;
    seat_type: string;
    gender: string;
    category: string;
    percentile: number;
}
export interface backendInterface {
    getCutoffsCount(): Promise<bigint>;
    getCutoffsRange(start: bigint, limit: bigint): Promise<Array<CutoffsRecord>>;
    getPredictions(college: string, branch: string, category: string, gender: string, seat_type: string): Promise<Array<Prediction>>;
    predictAdmission(userPercentile: number): Promise<Array<Prediction>>;
}
