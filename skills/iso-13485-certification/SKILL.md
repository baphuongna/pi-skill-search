---
name: iso-13485-certification
description: Comprehensive toolkit for preparing ISO 13485 certification documentation for medical device Quality Management Systems. Use when users need help with ISO 13485 QMS documentation, including (1) conducting gap analysis of existing documentation, (2) creating Quality Manuals, (3) developing required procedures and work instructions, (4) preparing Medical Device Files, (5) understanding ISO 13485 requirements, or (6) identifying missing documentation for medical device certification. Also use when users mention medical device regulations, QMS certification, FDA QMSR, EU MDR, or need help with quality system documentation.
---

# ISO 13485 Certification Documentation Assistant

## Overview

This skill helps medical device manufacturers prepare comprehensive documentation for ISO 13485:2016 certification. It provides tools, templates, references, and guidance to create, review, and gap-analyze all required Quality Management System (QMS) documentation.

**What this skill provides:**
- Gap analysis of existing documentation
- Templates for all mandatory documents
- Comprehensive requirements guidance
- Step-by-step documentation creation
- Identification of missing documentation
- Compliance checklists

**When to use this skill:**
- Starting ISO 13485 certification process
- Conducting gap analysis against ISO 13485

## Core Workflow

### 1. Assess Current State (Gap Analysis)

**When to start here:** User has existing documentation and needs to identify gaps

**Process:**

1. **Collect existing documentation:**
   - Ask user to provide directory of current QMS documents
   - Documents can be in any format (.txt, .md, .doc, .docx, .pdf)
   - Include any procedures, manuals, work instructions, forms

2. **Run gap analysis script:**
   ```bash
   python scripts/gap_analyzer.py --docs-dir <path_to_docs> --output gap-report.json
   ```

### 2. Understand Requirements (Reference Consultation)

**When to use:** User needs to understand specific ISO 13485 requirements

**Available references:**
- `references/iso-13485-requirements.md` - Complete clause-by-clause breakdown
- `references/mandatory-documents.md` - All 31 required procedures explained
- `references/gap-analysis-checklist.md` - Detailed compliance checklist
- `references/quality-manual-guide.md` - How to create Quality Manual

**How to use:**

1. **For specific clause questions:**
   - Read relevant section from `iso-13485-requirements.md`
   - Explain requirements in plain language

### 3. Create Documentation (Template-Based Generation)

**When to use:** User needs to create specific QMS documents

**Available templates:**
- Quality Manual: `assets/templates/quality-manual-template.md`
- CAPA Procedure: `assets/templates/procedures/CAPA-procedure-template.md`
- Document Control: `assets/templates/procedures/document-control-procedure-template.md`

**Process for document creation:**

1. **Identify what needs to be created:**
   - Based on gap analysis or user request
   - Prioritize critical documents first (Quality Manual, CAPA, Complaints, Audits)


### 4. Develop Specific Documents

#### Creating a Quality Manual

**Process:**

1. **Read the comprehensive guide:**
   - Read `references/quality-manual-guide.md` in full
   - Understand structure and required content
   - Review examples provided

2. **Gather organization information:**
   - Legal company name and addresses
   - Product types and classifications
   - Organizational structure

### 5. Conduct Comprehensive Gap Analysis

**When to use:** User wants detailed assessment of all requirements

**Process:**

1. **Use comprehensive checklist:**
   - Open `references/gap-analysis-checklist.md`
   - Work through clause by clause
   - Mark status for each requirement: Compliant, Partial, Non-compliant, N/A

2. **For each clause:**
   - Read requirement description
   - Identify existing evidence
   - Note gaps or deficiencies

## Common Scenarios

### Scenario 1: Starting from Scratch

**User request:** "We're a medical device startup and need to implement ISO 13485. Where do we start?"

**Approach:**

1. **Explain the journey:**
   - ISO 13485 requires comprehensive QMS documentation
   - Typically 6-12 months for full implementation
   - Can be done incrementally

<!-- condensed from source -->

