# Specification

## Summary
**Goal:** Return and display only eligible college predictions where the predicted rank is less than or equal to each cutoff record’s closing rank.

**Planned changes:**
- Update the backend prediction response to filter out cutoff records where `predicted_rank > closing_rank`, returning only eligible records per cutoff record comparison.
- Update the predictions UI copy/behavior to reflect that only eligible colleges are shown and ensure the results table renders correctly with the backend-filtered list.

**User-visible outcome:** After running predictions, users see a results table containing only colleges they are eligible for (where `predicted_rank <= closing_rank`), with English-only user-facing text that does not imply non-eligible records are included.
