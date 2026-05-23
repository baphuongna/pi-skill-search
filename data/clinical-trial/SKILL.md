---
name: clinical-trial
description: Clinical trial data management and medical data analysis. Use when working with patient records, clinical study design, survival analysis, adverse event reporting, or medical coding (ICD, SNOMED). Trigger on imports of lifelines, or mentions of clinical trial, patient, medical, diagnosis, survival analysis, Kaplan-Meier, Cox regression.
---
# clinical-trial

Use this skill for clinical trial data analysis and medical research.

## Core patterns

- **Survival**: `KaplanMeierFitter().fit(durations, event_observed)` for time-to-event.
- **Cox model**: `CoxPHFitter().fit(df, duration_col='time', event_col='event')`.
- **Group comparison**: `logrank_test(group1, group2)` for survival difference.
- **ICD codes**: Map via `icd10-cm` lookup tables for standardized diagnosis.

## Rules

- Always de-identify patient data before analysis — remove names, MRNs, dates.
- Use intent-to-treat (ITT) analysis for randomized trials.
- Report CONSORT flow diagram for trial transparency.

## Anti-patterns

- Don't use per-protocol analysis as primary — ITT is gold standard.
- Don't ignore censoring in survival analysis — it biases estimates.
- Don't share patient-level data without IRB approval.


