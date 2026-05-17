---
name: geniml
description: This skill should be used when working with genomic interval data (BED files) for machine learning tasks. Use for training region embeddings (Region2Vec, BEDspace), single-cell ATAC-seq analysis (scEmbed), building consensus peaks (universes), or any ML-based analysis of genomic regions. Applies to BED file collections, scATAC-seq data, chromatin accessibility datasets, and region-based genomic feature learning.
---

# Geniml: Genomic Interval Machine Learning

## Overview

Geniml is a Python package for building machine learning models on genomic interval data from BED files. It provides unsupervised methods for learning embeddings of genomic regions, single cells, and metadata labels, enabling similarity searches, clustering, and downstream ML tasks.

## Core Capabilities

Geniml provides five primary capabilities, each detailed in dedicated reference files:

### 1. Region2Vec: Genomic Region Embeddings

Train unsupervised embeddings of genomic regions using word2vec-style learning.

**Use for:** Dimensionality reduction of BED files, region similarity analysis, feature vectors for downstream ML.

**Workflow:**
1. Tokenize BED files using a universe reference
2. Train Region2Vec model on tokens
3. Generate embeddings for regions

**Reference:** See `references/region2vec.md` for detailed workflow, parameters, and examples.

### 2. BEDspace: Joint Region and Metadata Embeddings

Train shared embeddings for region sets and metadata labels using StarSpace.

**Use for:** Metadata-aware searches, cross-modal queries (region→label or label→region), joint analysis of genomic content and experimental conditions.

**Workflow:**
1. Preprocess regions and metadata
2. Train BEDspace model
3. Compute distances
4. Query across regions and labels

**Reference:** See `references/bedspace.md` for detailed workflow, search types, and examples.

### 3. scEmbed: Single-Cell Chromatin Accessibility Embeddings

Train Region2Vec models on single-cell ATAC-seq data for cell-level embeddings.

**Use for:** scATAC-seq clustering, cell-type annotation, dimensionality reduction of single cells, integration with scanpy workflows.

**Workflow:**
1. Prepare AnnData with peak coordinates
2. Pre-tokenize cells
3. Train scEmbed model
4. Generate cell embeddings
5. Cluster and visualize with scanpy

**Reference:** See `references/scembed.md` for detailed workflow, parameters, and examples.

### 4. Consensus Peaks: Universe Building

Build reference peak sets (universes) from BED file collections using multiple statistical methods.

**Use for:** Creating tokenization references, standardizing regions across datasets, defining consensus features with statistical rigor.

**Workflow:**
1. Combine BED files
2. Generate coverage tracks
3. Build universe using CC, CCF, ML, or HMM method

**Methods:**
- **CC (Coverage Cutoff)**: Simple threshold-based
- **CCF (Coverage Cutoff Flexible)**: Confidence intervals for boundaries
- **ML (Maximum Likelihood)**: Probabilistic modeling of positions

### 5. Utilities: Supporting Tools

Additional tools for caching, randomization, evaluation, and search.

**Available utilities:**
- **BBClient**: BED file caching for repeated access
- **BEDshift**: Randomization preserving genomic context
- **Evaluation**: Metrics for embedding quality (silhouette, Davies-Bouldin, etc.)
- **Tokenization**: Region tokenization utilities (hard, soft, universe-based)
- **Text2BedNN**: Neural search backends for genomic queries

**Reference:** See `references/utilities.md` for detailed usage of each utility.

## Common Workflows

### Basic Region Embedding Pipeline

```python
from geniml.tokenization import hard_tokenization
from geniml.region2vec import region2vec
from geniml.evaluation import evaluate_embeddings

# Step 1: Tokenize BED files
hard_tokenization(
    src_folder='bed_files/',
    dst_folder='tokens/',
    universe_file='universe.bed',
    p_value_threshold=1e-9
)

# Step 2: Train Region2Vec
region2vec(
    token_folder='tokens/',
    save_dir='model/',
    num_shufflings=1000,
    embedding_dim=100
)

# Step 3: Evaluate
metrics = evaluate_embeddings(
    embeddings_file='model/embeddings.npy',
    labels_file='metadata.csv'
)
```

<!-- condensed from source -->

