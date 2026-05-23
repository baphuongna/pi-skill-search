---
name: clinical-decision-support
description: Generate professional clinical decision support (CDS) documents for pharmaceutical and clinical research settings, including patient cohort analyses (biomarker-stratified with outcomes) and treatment recommendation reports (evidence-based guidelines with decision algorithms). Supports GRADE evidence grading, statistical analysis (hazard ratios, survival curves, waterfall plots), biomarker integration, and regulatory compliance. Outputs publication-ready LaTeX/PDF format optimized for drug development, clinical research, and evidence synthesis.
---

# Clinical Decision Support Documents

## Description

Generate professional clinical decision support (CDS) documents for pharmaceutical companies, clinical researchers, and medical decision-makers. This skill specializes in analytical, evidence-based documents that inform treatment strategies and drug development:

1. **Patient Cohort Analysis** - Biomarker-stratified group analyses with statistical outcome comparisons
2. **Treatment Recommendation Reports** - Evidence-based clinical guidelines with GRADE grading and decision algorithms

All documents are generated as publication-ready LaTeX/PDF files optimized for pharmaceutical research, regulatory submissions, and clinical guideline development.

**Note:** For individual patient treatment plans at the bedside, use the `treatment-plans` skill instead. This skill focuses on group-level analyses and evidence synthesis for pharmaceutical/research settings.

**Writing Style:** For publication-ready documents targeting medical journals, consult the **venue-templates** skill's `medical_journal_styles.md` for guidance on structured abstracts, evidence language, and CONSORT/STROBE compliance.

## Capabilities

### Document Types

**Patient Cohort Analysis**
- Biomarker-based patient stratification (molecular subtypes, gene expression, IHC)
- Molecular subtype classification (e.g., GBM mesenchymal-immune-active vs proneural, breast cancer subtypes)
- Outcome metrics with statistical analysis (OS, PFS, ORR, DOR, DCR)
- Statistical comparisons between subgroups (hazard ratios, p-values, 95% CI)
- Survival analysis with Kaplan-Meier curves and log-rank tests
- Efficacy tables and waterfall plots
- Comparative effectiveness analyses
- Pharmaceutical cohort reporting (trial subgroups, real-world evidence)

**Treatment Recommendation Reports**
- Evidence-based treatment guidelines for specific disease states
- Strength of recommendation grading (GRADE system: 1A, 1B, 2A, 2B, 2C)

### Clinical Features

- **Biomarker Integration**: Genomic alterations (mutations, CNV, fusions), gene expression signatures, IHC markers, PD-L1 scoring
- **Statistical Analysis**: Hazard ratios, p-values, confidence intervals, survival curves, Cox regression, log-rank tests
- **Evidence Grading**: GRADE system (1A/1B/2A/2B/2C), Oxford CEBM levels, quality of evidence assessment
- **Clinical Terminology**: SNOMED-CT, LOINC, proper medical nomenclature, trial nomenclature
- **Regulatory Compliance**: HIPAA de-identification, confidentiality headers, ICH-GCP alignment
- **Professional Formatting**: Compact 0.5in margins, color-coded recommendations, publication-ready, suitable for regulatory submissions

## Pharmaceutical and Research Use Cases

This skill is specifically designed for pharmaceutical and clinical research applications:

**Drug Development**
- **Phase 2/3 Trial Analyses**: Biomarker-stratified efficacy and safety analyses
- **Subgroup Analyses**: Forest plots showing treatment effects across patient subgroups
- **Companion Diagnostic Development**: Linking biomarkers to drug response
- **Regulatory Submissions**: IND/NDA documentation with evidence summaries

**Medical Affairs**
- **KOL Education Materials**: Evidence-based treatment algorithms for thought leaders
- **Medical Strategy Documents**: Competitive landscape and positioning strategies
- **Advisory Board Materials**: Cohort analyses and treatment recommendation frameworks
- **Publication Planning**: Manuscript-ready analyses for peer-reviewed journals

## When to Use

Use this skill when you need to:

- **Analyze patient cohorts** stratified by biomarkers, molecular subtypes, or clinical characteristics
- **Generate treatment recommendation reports** with evidence grading for clinical guidelines or pharmaceutical strategies
- **Compare outcomes** between patient subgroups with statistical analysis (survival, response rates, hazard ratios)
- **Produce pharmaceutical research documents** for drug development, clinical trials, or regulatory submissions
- **Develop clinical practice guidelines** with GRADE evidence grading and decision algorithms
- **Document biomarker-guided therapy selection** at the population level (not individual patients)
- **Synthesize evidence** from multiple trials or real-world data sources
- **Create clinical decision algorithms** with flowcharts for treatment sequencing

**Do NOT use this skill for:**
- Individual patient treatment plans (use `treatment-plans` skill)
- Bedside clinical care documentation (use `treatment-plans` skill)
- Simple patient-specific treatment protocols (use `treatment-plans` skill)

## Visual Enhancement with Scientific Schematics

**⚠️ MANDATORY: Every clinical decision support document MUST include at least 1-2 AI-generated figures using the scientific-schematics skill.**

This is not optional. Clinical decision documents require clear visual algorithms. Before finalizing any document:
1. Generate at minimum ONE schematic or diagram (e.g., clinical decision algorithm, treatment pathway, or biomarker stratification tree)
2. For cohort analyses: include patient flow diagram
3. For treatment recommendations: include decision flowchart

**How to generate figures:**
- Use the **scientific-schematics** skill to generate AI-powered publication-quality diagrams
- Simply describe your desired diagram in natural language
- Nano Banana Pro will automatically generate, review, and refine the schematic

**How to generate schematics:**

## Document Structure

**CRITICAL REQUIREMENT: All clinical decision support documents MUST begin with a complete executive summary on page 1 that spans the entire first page before any table of contents or detailed sections.**

### Page 1 Executive Summary Structure

The first page of every CDS document should contain ONLY the executive summary with the following components:

**Required Elements (all on page 1):**
1. **Document Title and Type**
   - Main title (e.g., "Biomarker-Stratified Cohort Analysis" or "Evidence-Based Treatment Recommendations")
   - Subtitle with disease state and focus
   
2. **Report Information Box** (using colored tcolorbox)
   - Document type and purpose
   - Date of analysis/report
   - Disease state and patient population
   - Author/institution (if applicable)


