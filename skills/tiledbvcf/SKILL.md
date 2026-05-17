---
name: tiledbvcf
description: Efficient storage and retrieval of genomic variant data using TileDB. Scalable VCF/BCF ingestion, incremental sample addition, compressed storage, parallel queries, and export capabilities for population genomics.
---

# TileDB-VCF

## Overview

TileDB-VCF is a high-performance C++ library with Python and CLI interfaces for efficient storage and retrieval of genomic variant-call data. Built on TileDB's sparse array technology, it enables scalable ingestion of VCF/BCF files, incremental sample addition without expensive merging operations, and efficient parallel queries of variant data stored locally or in the cloud.

## When to Use This Skill

This skill should be used when:
- Learning TileDB-VCF concepts and workflows
- Prototyping genomics analyses and pipelines
- Working with small-to-medium datasets (< 1000 samples)
- Need incremental addition of new samples to existing datasets
- Require efficient querying of specific genomic regions across many samples
- Working with cloud-stored variant data (S3, Azure, GCS)
- Need to export subsets of large VCF datasets
- Building variant databases for cohort studies
- Educational projects and method development
- Performance is critical for variant data operations

## Quick Start

# Enter the following two lines if you are on a M1 Mac
CONDA_SUBDIR=osx-64
conda config --env --set subdir osx-64

# Create the conda environment
conda create -n tiledb-vcf "python<3.10"
conda activate tiledb-vcf

# Mamba is a faster and more reliable alternative to conda
conda install -c conda-forge mamba

### Basic Examples

**Create and populate a dataset:**
```python
import tiledbvcf

# Create a new dataset
ds = tiledbvcf.Dataset(uri="my_dataset", mode="w",
                      cfg=tiledbvcf.ReadConfig(memory_budget=1024))

# Ingest VCF files (must be single-sample with indexes)
# Requirements:
# - VCFs must be single-sample (not multi-sample)
# - Must have indexes: .csi (bcftools) or .tbi (tabix)
ds.ingest_samples(["sample1.vcf.gz", "sample2.vcf.gz"])
```

**Query variant data:**
```python
# Open existing dataset for reading
ds = tiledbvcf.Dataset(uri="my_dataset", mode="r")

# Query specific regions and samples
df = ds.read(
    attrs=["sample_name", "pos_start", "pos_end", "alleles", "fmt_GT"],
    regions=["chr1:1000000-2000000", "chr2:500000-1500000"],
    samples=["sample1", "sample2", "sample3"]
)
print(df.head())
```

**Export to VCF:**
```python
import os

# Export two VCF samples
ds.export(
    regions=["chr21:8220186-8405573"],
    samples=["HG00101", "HG00097"],
    output_format="v",
    output_dir=os.path.expanduser("~"),
)
```

## Core Capabilities

### 1. Dataset Creation and Ingestion

Create TileDB-VCF datasets and incrementally ingest variant data from multiple VCF/BCF files. This is appropriate for building population genomics databases and cohort studies.

**Requirements:**
- **Single-sample VCFs only**: Multi-sample VCFs are not supported
- **Index files required**: VCF/BCF files must have indexes (.csi or .tbi)

**Common operations:**
- Create new datasets with optimized array schemas
- Ingest single or multiple VCF/BCF files in parallel
- Add new samples incrementally without re-processing existing data
- Configure memory usage and compression settings
- Handle various VCF formats and INFO/FORMAT fields
- Resume interrupted ingestion processes
- Validate data integrity during ingestion


### 2. Efficient Querying and Filtering

Query variant data with high performance across genomic regions, samples, and variant attributes. This is appropriate for association studies, variant discovery, and population analysis.

**Common operations:**
- Query specific genomic regions (single or multiple)
- Filter by sample names or sample groups
- Extract specific variant attributes (position, alleles, genotypes, quality)
- Access INFO and FORMAT fields efficiently
- Combine spatial and attribute-based filtering
- Stream large query results
- Perform aggregations across samples or regions


### 3. Data Export and Interoperability
