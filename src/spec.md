# Specification

## Summary
**Goal:** Add persistent backend storage for MHT-CET cutoff records in the Motoko canister and expose minimal query accessors for inspection/testing.

**Planned changes:**
- Define a public `Cutoff` type in `backend/main.mo` with fields: `college_name`, `branch_name`, `category`, `gender`, `seat_type`, `closing_rank`, `percentile`.
- Add stable storage in `backend/main.mo` to persist cutoff records across canister upgrades.
- Add a query method to return the total count of stored cutoff records.
- Add a query method to return a bounded/paginated list of cutoff records (e.g., via start/limit parameters).
- Keep the existing `predictAdmission` method compiling and behaving as before (no predictor logic changes).

**User-visible outcome:** Backend can be deployed with persistent cutoff storage, and developers/testers can query the total number of stored cutoffs and fetch a limited list for verification; a fresh deployment returns 0 and an empty list.
