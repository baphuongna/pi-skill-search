---
name: gtars
description: High-performance toolkit for genomic interval analysis in Rust with Python bindings. Use when working with genomic regions, BED files, coverage tracks, overlap detection, tokenization for ML models, or fragment analysis in computational genomics and machine learning applications.
---

# Gtars: Genomic Tools and Algorithms in Rust

## Overview

Gtars is a high-performance Rust toolkit for manipulating, analyzing, and processing genomic interval data. It provides specialized tools for overlap detection, coverage analysis, tokenization for machine learning, and reference sequence management.

Use this skill when working with:
- Genomic interval files (BED format)
- Overlap detection between genomic regions
- Coverage track generation (WIG, BigWig)
- Genomic ML preprocessing and tokenization
- Fragment analysis in single-cell genomics
- Reference sequence retrieval and validation

### Rust Library

Add to Cargo.toml for Rust projects:

```toml
[dependencies]
gtars = { version = "0.1", features = ["tokenizers", "overlaprs"] }
```

## Core Capabilities

Gtars is organized into specialized modules, each focused on specific genomic analysis tasks:

### 1. Overlap Detection and IGD Indexing

Efficiently detect overlaps between genomic intervals using the Integrated Genome Database (IGD) data structure.

**When to use:**
- Finding overlapping regulatory elements
- Variant annotation
- Comparing ChIP-seq peaks
- Identifying shared genomic features

**Quick example:**
```python
import gtars

# Build IGD index and query overlaps
igd = gtars.igd.build_index("regions.bed")
overlaps = igd.query("chr1", 1000, 2000)
```

See `(see docs)` for comprehensive overlap detection documentation.

### 2. Coverage Track Generation

Generate coverage tracks from sequencing data with the uniwig module.

**When to use:**
- ATAC-seq accessibility profiles
- ChIP-seq coverage visualization
- RNA-seq read coverage
- Differential coverage analysis

**Quick example:**
```bash
# Generate BigWig coverage track
gtars uniwig generate --input fragments.bed --output coverage.bw --format bigwig
```

See `(see docs)` for detailed coverage analysis workflows.

### 3. Genomic Tokenization

Convert genomic regions into discrete tokens for machine learning applications, particularly for deep learning models on genomic data.

**When to use:**
- Preprocessing for genomic ML models
- Integration with geniml library
- Creating position encodings
- Training transformer models on genomic sequences

**Quick example:**
```python
from gtars.tokenizers import TreeTokenizer

tokenizer = TreeTokenizer.from_bed_file("training_regions.bed")

### 4. Reference Sequence Management

Handle reference genome sequences and compute digests following the GA4GH refget protocol.

**When to use:**
- Validating reference genome integrity
- Extracting specific genomic sequences
- Computing sequence digests
- Cross-reference comparisons

**Quick example:**
```python
# Load reference and extract sequences
store = gtars.RefgetStore.from_fasta("hg38.fa")
sequence = store.get_subsequence("chr1", 1000, 2000)


