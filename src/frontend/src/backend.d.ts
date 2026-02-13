import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lead {
    name: string;
    whatsapp: string;
    email?: string;
    mobile: string;
    telegram: boolean;
}
export interface CutoffsRecord {
    college_name: string;
    branch_name: string;
    closing_rank: bigint;
    seat_type: string;
    gender: string;
    category: string;
}
export interface Prediction {
    college_name: string;
    branch_name: string;
    predicted_rank: bigint;
    closing_rank: bigint;
    eligible: boolean;
    predicted_percentile: number;
}
export interface PredictStep1 {
    gender?: string;
    category: string;
    branchName?: string;
    college?: string;
}
export interface ImportResult {
    errors: Array<[bigint, string]>;
    records_imported: bigint;
    total_rows: bigint;
}
export interface UserProfile {
    name: string;
}
export enum Candidature {
    allIndia = "allIndia",
    maharashtra = "maharashtra"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLead(name: string, mobile: string, whatsapp: string, telegram: boolean, email: string | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    exportLeadsAsCsv(): Promise<string>;
    getAllLeads(): Promise<Array<[bigint, Lead]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCutoffsCount(): Promise<bigint>;
    getCutoffsRange(start: bigint, limit: bigint): Promise<Array<CutoffsRecord>>;
    getLead(leadId: bigint): Promise<Lead | null>;
    getMaxClosingRank(): Promise<bigint | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    importCutoffsCsv(csvText: string): Promise<ImportResult>;
    isCallerAdmin(): Promise<boolean>;
    predictAdmissionStep1(userPercentile: string, step1: PredictStep1, candidature: Candidature): Promise<Array<Prediction>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
