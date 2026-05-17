---
name: scanpy
description: Single-cell RNA-seq analysis toolkit. Use when working with scRNA-seq data, AnnData objects, cell clustering, marker gene detection, UMAP/t-SNE embedding, differential expression, or trajectory inference. Trigger on imports of scanpy, sc, anndata, or mentions of single-cell, transcriptomics, cell-type annotation.
---
# scanpy

Use this skill for single-cell RNA-seq analysis workflows.

## Core patterns

- **Loading**: `sc.read_10x_mtx()` for 10X data; `sc.read_h5ad()` for AnnData files.
- **QC**: Filter cells by `n_genes`, `n_counts`, `pct_mito`.
- **Normalization**: `sc.pp.normalize_total()` → `sc.pp.log1p()` → `sc.pp.highly_variable_genes()`.
- **PCA + Neighbors**: `sc.tl.pca()` → `sc.pp.neighbors()`.
- **Clustering**: `sc.tl.leiden()` or `sc.tl.louvain()`.
- **Embedding**: `sc.tl.umap()` → `sc.pl.umap(color='louvain')`.
- **Markers**: `sc.tl.rank_genes_groups()` → `sc.pl.rank_genes_groups()`.

## Rules

- Always `.copy()` AnnData before destructive operations.
- Store raw counts in `adata.raw` before normalization.
- Use sparse matrices (`scipy.sparse`) for large datasets — don't densify unnecessarily.
- Batch correction: consider `sc.pp.harmony_integrate()` or `sc.external.pp.bbknn()`.

## Anti-patterns

- Don't run UMAP before computing neighbors graph.
- Don't interpret marker genes without statistical testing (use `rank_genes_groups` with `method='wilcoxon'`).
- Don't filter genes before selecting highly variable genes.

