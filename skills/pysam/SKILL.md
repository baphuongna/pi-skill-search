---
name: pysam
description: Genomic file toolkit. Read/write SAM/BAM/CRAM alignments, VCF/BCF variants, FASTA/FASTQ sequences, extract regions, calculate coverage, for NGS data processing pipelines.
---

# Pysam

## Overview

Pysam is a Python module for reading, manipulating, and writing genomic datasets. Read/write SAM/BAM/CRAM alignment files, VCF/BCF variant files, and FASTA/FASTQ sequences with a Pythonic interface to htslib. Query tabix-indexed files, perform pileup analysis for coverage, and execute samtools/bcftools commands.

## When to Use This Skill

This skill should be used when:
- Working with sequencing alignment files (BAM/CRAM)
- Analyzing genetic variants (VCF/BCF)
- Extracting reference sequences or gene regions
- Processing raw sequencing data (FASTQ)
- Calculating coverage or read depth
- Implementing bioinformatics analysis pipelines
- Quality control of sequencing data
- Variant calling and annotation workflows

## Quick Start

### Basic Examples

**Read alignment file:**
```python
import pysam

# Open BAM file and fetch reads in region
samfile = pysam.AlignmentFile("example.bam", "rb")
for read in samfile.fetch("chr1", 1000, 2000):
    print(f"{read.query_name}: {read.reference_start}")
samfile.close()
```

**Read variant file:**
```python
# Open VCF file and iterate variants
vcf = pysam.VariantFile("variants.vcf")
for variant in vcf:
    print(f"{variant.chrom}:{variant.pos} {variant.ref}>{variant.alts}")
vcf.close()
```

**Query reference sequence:**
```python
# Open FASTA and extract sequence
fasta = pysam.FastaFile("reference.fasta")
sequence = fasta.fetch("chr1", 1000, 2000)
print(sequence)
fasta.close()
```

## Core Capabilities

### 1. Alignment File Operations (SAM/BAM/CRAM)

Use the `AlignmentFile` class to work with aligned sequencing reads. This is appropriate for analyzing mapping results, calculating coverage, extracting reads, or quality control.

**Common operations:**
- Open and read BAM/SAM/CRAM files
- Fetch reads from specific genomic regions
- Filter reads by mapping quality, flags, or other criteria
- Write filtered or modified alignments
- Calculate coverage statistics
- Perform pileup analysis (base-by-base coverage)
- Access read sequences, quality scores, and alignment information

**Reference:** See `references/alignment_files.md` for detailed documentation on:
- Opening and reading alignment files

### 2. Variant File Operations (VCF/BCF)

Use the `VariantFile` class to work with genetic variants from variant calling pipelines. This is appropriate for variant analysis, filtering, annotation, or population genetics.

**Common operations:**
- Read and write VCF/BCF files
- Query variants in specific regions
- Access variant information (position, alleles, quality)
- Extract genotype data for samples
- Filter variants by quality, allele frequency, or other criteria
- Annotate variants with additional information
- Subset samples or regions

**Reference:** See `references/variant_files.md` for detailed documentation on:
- Opening and reading variant files

### 3. Sequence File Operations (FASTA/FASTQ)

Use `FastaFile` for random access to reference sequences and `FastxFile` for reading raw sequencing data. This is appropriate for extracting gene sequences, validating variants against reference, or processing raw reads.

**Common operations:**
- Query reference sequences by genomic coordinates
- Extract sequences for genes or regions of interest
- Read FASTQ files with quality scores
- Validate variant reference alleles
- Calculate sequence statistics
- Filter reads by quality or length
- Convert between FASTA and FASTQ formats

**Reference:** See `references/sequence_files.md` for detailed documentation on:
- FASTA file access and indexing

## Key Concepts

### Coordinate Systems

**Critical:** Pysam uses **0-based, half-open** coordinates (Python convention):
- Start positions are 0-based (first base is position 0)
- End positions are exclusive (not included in the range)
- Region 1000-2000 includes bases 1000-1999 (1000 bases total)

**Exception:** Region strings in `fetch()` follow samtools convention (1-based):
```python

<!-- condensed from source -->

