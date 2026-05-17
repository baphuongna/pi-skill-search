---
name: lamindb
description: This skill should be used when working with LaminDB, an open-source data framework for biology that makes data queryable, traceable, reproducible, and FAIR. Use when managing biological datasets (scRNA-seq, spatial, flow cytometry, etc.), tracking computational workflows, curating and validating data with biological ontologies, building data lakehouses, or ensuring data lineage and reproducibility in biological research. Covers data management, annotation, ontologies (genes, cell types, diseases, tissues), schema validation, integrations with workflow managers (Nextflow, Snakemake) and MLOps platforms (W&B, MLflow), and deployment strategies.
---

# LaminDB

## Overview

LaminDB is an open-source data framework for biology designed to make data queryable, traceable, reproducible, and FAIR (Findable, Accessible, Interoperable, Reusable). It provides a unified platform that combines lakehouse architecture, lineage tracking, feature stores, biological ontologies, LIMS (Laboratory Information Management System), and ELN (Electronic Lab Notebook) capabilities through a single Python API.

**Core Value Proposition:**
- **Queryability**: Search and filter datasets by metadata, features, and ontology terms
- **Traceability**: Automatic lineage tracking from raw data through analysis to results
- **Reproducibility**: Version control for data, code, and environment
- **FAIR Compliance**: Standardized annotations using biological ontologies

## When to Use This Skill

Use this skill when:

- **Managing biological datasets**: scRNA-seq, bulk RNA-seq, spatial transcriptomics, flow cytometry, multi-modal data, EHR data
- **Tracking computational workflows**: Notebooks, scripts, pipeline execution (Nextflow, Snakemake, Redun)
- **Curating and validating data**: Schema validation, standardization, ontology-based annotation
- **Working with biological ontologies**: Genes, proteins, cell types, tissues, diseases, pathways (via Bionty)
- **Building data lakehouses**: Unified query interface across multiple datasets
- **Ensuring reproducibility**: Automatic versioning, lineage tracking, environment capture
- **Integrating ML pipelines**: Connecting with Weights & Biases, MLflow, HuggingFace, scVI-tools
- **Deploying data infrastructure**: Setting up local or cloud-based data management systems
- **Collaborating on datasets**: Sharing curated, annotated data with standardized metadata

## Core Capabilities

LaminDB provides six interconnected capability areas, each documented in detail in the references folder.

### 1. Core Concepts and Data Lineage

**Core entities:**
- **Artifacts**: Versioned datasets (DataFrame, AnnData, Parquet, Zarr, etc.)
- **Records**: Experimental entities (samples, perturbations, instruments)
- **Runs & Transforms**: Computational lineage tracking (what code produced what data)
- **Features**: Typed metadata fields for annotation and querying

**Key workflows:**
- Create and version artifacts from files or Python objects
- Track notebook/script execution with `ln.track()` and `ln.finish()`
- Annotate artifacts with typed features
- Visualize data lineage graphs with `artifact.view_lineage()`
- Query by provenance (find all outputs from specific code/inputs)

**Reference:** `(see docs)` - Read this for detailed information on artifacts, records, runs, transforms, features, versioning, and lineage tracking.

### 2. Data Management and Querying

**Query capabilities:**
- Registry exploration and lookup with auto-complete
- Single record retrieval with `get()`, `one()`, `one_or_none()`
- Filtering with comparison operators (`__gt`, `__lte`, `__contains`, `__startswith`)
- Feature-based queries (query by annotated metadata)
- Cross-registry traversal with double-underscore syntax
- Full-text search across registries
- Advanced logical queries with Q objects (AND, OR, NOT)
- Streaming large datasets without loading into memory

**Key workflows:**
- Browse artifacts with filters and ordering
- Query by features, creation date, creator, size, etc.

### 3. Annotation and Validation

**Curation process:**
1. **Validation**: Confirm datasets match desired schemas
2. **Standardization**: Fix typos, map synonyms to canonical terms
3. **Annotation**: Link datasets to metadata entities for queryability

**Schema types:**
- **Flexible schemas**: Validate only known columns, allow additional metadata
- **Minimal required schemas**: Specify essential columns, permit extras
- **Strict schemas**: Complete control over structure and values

**Supported data types:**
- DataFrames (Parquet, CSV)
- AnnData (single-cell genomics)

### 4. Biological Ontologies

**Available ontologies (via Bionty):**
- Genes (Ensembl), Proteins (UniProt)
- Cell types (CL), Cell lines (CLO)
- Tissues (Uberon), Diseases (Mondo, DOID)
- Phenotypes (HPO), Pathways (GO)
- Experimental factors (EFO), Developmental stages
- Organisms (NCBItaxon), Drugs (DrugBank)

**Key workflows:**
- Import public ontologies with `bt.CellType.import_source()`
- Search ontologies with keyword or exact matching
- Standardize terms using synonym mapping
- Explore hierarchical relationships (parents, children, ancestors)

### 5. Integrations

**Workflow managers:**
- Nextflow: Track pipeline processes and outputs
- Snakemake: Integrate into Snakemake rules
- Redun: Combine with Redun task tracking

**MLOps platforms:**
- Weights & Biases: Link experiments with data artifacts
- MLflow: Track models and experiments
- HuggingFace: Track model fine-tuning
- scVI-tools: Single-cell analysis workflows

**Storage systems:**
- Local filesystem, AWS S3, Google Cloud Storage

### 6. Setup and Deployment


