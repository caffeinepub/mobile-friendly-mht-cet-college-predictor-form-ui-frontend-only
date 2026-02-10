# Specification

## Summary
**Goal:** Add a functional backend-driven MHT-CET predictor flow by implementing a simple canister `predict` method and wiring the existing predictor form to call it and display results.

**Planned changes:**
- Implement a public backend predictor method in `backend/main.mo` that accepts a percentile, validates it, computes a deterministic placeholder `estimatedRank`, and returns exactly three dummy prediction rows (college, branch, chance).
- Update frontend canister bindings/types so the actor interface includes the new predictor method signature and strongly-typed response payload.
- Update `frontend/src/pages/MhtCetPredictorFormPage.tsx` to call the backend on submit via the existing actor hook, show a loading state, render `estimatedRank` plus a results table on success, and show a retryable English error message on failure.

**User-visible outcome:** Users can submit their percentile in the existing MHT-CET predictor form and see an estimated rank plus a 3-row sample table of predicted college/branch/chance, with loading and error handling, without a page reload.
