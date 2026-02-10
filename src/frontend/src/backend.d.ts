import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ImportResult {
    errors: Array<[bigint, string]>;
    records_imported: bigint;
    total_rows: bigint;
}
export interface CutoffsRecord {
    college_name: string;
    branch_name: string;
    closing_rank: bigint;
    seat_type: string;
    gender: string;
    category: string;
    percentile: string;
}
export interface Prediction {
    college_name: string;
    branch_name: string;
    closing_rank: bigint;
}
export interface backendInterface {
    getCutoffsCount(): Promise<bigint>;
    getCutoffsRange(start: bigint, limit: bigint): Promise<Array<CutoffsRecord>>;
    getPredictions(college: string, branch: string, category: string, gender: string, seat_type: string): Promise<Array<Prediction>>;
    importCutoffsCsv(csvText: string): Promise<ImportResult>;
    predictAdmission(userPercentile: string): Promise<Array<Prediction>>;
}
