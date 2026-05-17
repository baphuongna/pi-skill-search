---
name: phylogenetics
description: Build and analyze phylogenetic trees using MAFFT (multiple alignment), IQ-TREE 2 (maximum likelihood), and FastTree (fast NJ/ML). Visualize with ETE3 or FigTree. For evolutionary analysis, microbial genomics, viral phylodynamics, protein family analysis, and molecular clock studies.
---

# Phylogenetics

## Overview

Phylogenetic analysis reconstructs the evolutionary history of biological sequences (genes, proteins, genomes) by inferring the branching pattern of descent. This skill covers the standard pipeline:

1. **MAFFT** — Multiple sequence alignment
2. **IQ-TREE 2** — Maximum likelihood tree inference with model selection
3. **FastTree** — Fast approximate maximum likelihood (for large datasets)
4. **ETE3** — Python library for tree manipulation and visualization

**Installation:**
```bash
# Conda (recommended for CLI tools)
conda install -c bioconda mafft iqtree fasttree
pip install ete3
```

## When to Use This Skill

Use phylogenetics when:

- **Evolutionary relationships**: Which organism/gene is most closely related to my sequence?
- **Viral phylodynamics**: Trace outbreak spread and estimate transmission dates
- **Protein family analysis**: Infer evolutionary relationships within a gene family
- **Horizontal gene transfer detection**: Identify genes with discordant species/gene trees
- **Ancestral sequence reconstruction**: Infer ancestral protein sequences
- **Molecular clock analysis**: Estimate divergence dates using temporal sampling
- **GWAS companion**: Place variants in evolutionary context (e.g., SARS-CoV-2 variants)
- **Microbiology**: Species phylogeny from 16S rRNA or core genome phylogeny

## Standard Workflow

### 1. Multiple Sequence Alignment with MAFFT

```python
import subprocess
import os

def run_mafft(input_fasta: str, output_fasta: str, method: str = "auto",
               n_threads: int = 4) -> str:
    """
    Align sequences with MAFFT.

    Args:
        input_fasta: Path to unaligned FASTA file
        output_fasta: Path for aligned output
        method: 'auto' (auto-select), 'einsi' (accurate), 'linsi' (accurate, slow),

# MAFFT method selection guide:
# Few sequences (<200), accurate: linsi or einsi
# Many sequences (<1000), moderate: fftnsi
# Large datasets (>1000): fftns or auto
# Ultra-fast (>10000): mafft --retree 1
```

### 2. Trim Alignment (Optional but Recommended)

```python
def trim_alignment_trimal(aligned_fasta: str, output_fasta: str,
                            method: str = "automated1") -> str:
    """
    Trim poorly aligned columns with TrimAl.

    Methods:
    - 'automated1': Automatic heuristic (recommended)
    - 'gappyout': Remove gappy columns
    - 'strict': Strict gap threshold
    """
    cmd = ["trimal", f"-{method}", "-in", aligned_fasta, "-out", output_fasta, "-fasta"]
    result = subprocess.run(cmd, capture_output=True, text=True)

### 3. IQ-TREE 2 — Maximum Likelihood Tree

```python
def run_iqtree(aligned_fasta: str, output_prefix: str,
                model: str = "TEST", bootstrap: int = 1000,
                n_threads: int = 4, extra_args: list = None) -> dict:
    """
    Build a maximum likelihood tree with IQ-TREE 2.

    Args:
        aligned_fasta: Aligned FASTA file
        output_prefix: Prefix for output files
        model: 'TEST' for automatic model selection, or specify (e.g., 'GTR+G' for DNA,
               'LG+G4' for proteins, 'JTT+G' for proteins)
        bootstrap: Number of ultrafast bootstrap replicates (1000 recommended)

# IQ-TREE model selection guide:
# DNA:     TEST → GTR+G, HKY+G, TrN+G
# Protein: TEST → LG+G4, WAG+G, JTT+G, Q.pfam+G
# Codon:   TEST → MG+F3X4

# For temporal (molecular clock) analysis, add:
# extra_args = ["--date", "dates.txt", "--clock-test", "--date-CI", "95"]
```

<!-- condensed from source -->
```
