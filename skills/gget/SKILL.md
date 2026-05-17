---
name: gget
description: "Fast CLI/Python queries to 20+ bioinformatics databases. Use for quick lookups: gene info, BLAST searches, AlphaFold structures, enrichment analysis. Best for interactive exploration, simple queries. For batch processing or advanced BLAST use biopython; for multi-database Python workflows use bioservices."
---

# gget

## Overview

gget is a command-line bioinformatics tool and Python package providing unified access to 20+ genomic databases and analysis methods. Query gene information, sequence analysis, protein structures, expression data, and disease associations through a consistent interface. All gget modules work both as command-line tools and as Python functions.

**Important**: The databases queried by gget are continuously updated, which sometimes changes their structure. gget modules are tested automatically on a biweekly basis and updated to match new database structures when necessary.

# Using uv (recommended)
uv uv pip install gget

# Or using pip
uv pip install --upgrade gget

# In Python/Jupyter
import gget
```

## Quick Start

Basic usage pattern for all modules:

```bash
# Command-line
gget <module> [arguments] [options]

# Python
gget.module(arguments, options)
```

Most modules return:
- **Command-line**: JSON (default) or CSV with `-csv` flag
- **Python**: DataFrame or dictionary

Common flags across modules:
- `-o/--out`: Save results to file
- `-q/--quiet`: Suppress progress information
- `-csv`: Return CSV format (command-line only)

## Module Categories

# List available species
gget ref --list_species

# Get all reference files for human
gget ref homo_sapiens

# Download only GTF annotation for mouse
gget ref -w gtf -d mouse
```

```python
# Python
gget.ref("homo_sapiens")
gget.ref("mus_musculus", which="gtf", download=True)
```

#### gget search - Gene Search

Locate genes by name or description across species.

**Parameters**:
- `searchwords`: One or more search terms (case-insensitive)
- `-s/--species`: Target species (e.g., 'homo_sapiens', 'mouse')
- `-r/--release`: Ensembl release number
- `-t/--id_type`: Return 'gene' (default) or 'transcript'
- `-ao/--andor`: 'or' (default) finds ANY searchword; 'and' requires ALL

# Search for GABA-related genes in human
gget search -s human gaba gamma-aminobutyric

# Find specific gene, require all terms
gget search -s mouse -ao and pax7 transcription
```

```python
# Python
gget.search(["gaba", "gamma-aminobutyric"], species="homo_sapiens")
```

#### gget info - Gene/Transcript Information

Retrieve comprehensive gene and transcript metadata from Ensembl, UniProt, and NCBI.

**Parameters**:
- `ens_ids`: One or more Ensembl IDs (also supports WormBase, Flybase IDs). Limit: ~1000 IDs
- `-n/--ncbi`: Disable NCBI data retrieval
- `-u/--uniprot`: Disable UniProt data retrieval
- `-pdb`: Include PDB identifiers (increases runtime)

**Returns**: UniProt ID, NCBI gene ID, primary gene name, synonyms, protein names, descriptions, biotype, canonical transcript

**Examples**:
```bash
# Get info for multiple genes
gget info ENSG00000034713 ENSG00000104853 ENSG00000170296

# Include PDB IDs
gget info ENSG00000034713 -pdb
```

```python
# Python
gget.info(["ENSG00000034713", "ENSG00000104853"], pdb=True)
```

<!-- condensed from source -->
```
