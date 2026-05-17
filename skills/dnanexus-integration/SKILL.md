---
name: dnanexus-integration
description: DNAnexus cloud genomics platform. Build apps/applets, manage data (upload/download), dxpy Python SDK, run workflows, FASTQ/BAM/VCF, for genomics pipeline development and execution.
---

# DNAnexus Integration

## Overview

DNAnexus is a cloud platform for biomedical data analysis and genomics. Build and deploy apps/applets, manage data objects, run workflows, and use the dxpy Python SDK for genomics pipeline development and execution.

## When to Use This Skill

This skill should be used when:
- Creating, building, or modifying DNAnexus apps/applets
- Uploading, downloading, searching, or organizing files and records
- Running analyses, monitoring jobs, creating workflows
- Writing scripts using dxpy to interact with the platform
- Setting up dxapp.json, managing dependencies, using Docker
- Processing FASTQ, BAM, VCF, or other bioinformatics files
- Managing projects, permissions, or platform resources

## Core Capabilities

The skill is organized into five main areas, each with detailed reference documentation:

### 1. App Development

**Purpose**: Create executable programs (apps/applets) that run on the DNAnexus platform.

**Key Operations**:
- Generate app skeleton with `dx-app-wizard`
- Write Python or Bash apps with proper entry points
- Handle input/output data objects
- Deploy with `dx build` or `dx build --app`
- Test apps on the platform

**Common Use Cases**:
- Bioinformatics pipelines (alignment, variant calling)
- Data processing workflows
- Quality control and filtering

### 2. Data Operations

**Purpose**: Manage files, records, and other data objects on the platform.

**Key Operations**:
- Upload/download files with `dxpy.upload_local_file()` and `dxpy.download_dxfile()`
- Create and manage records with metadata
- Search for data objects by name, properties, or type
- Clone data between projects
- Manage project folders and permissions

**Common Use Cases**:
- Uploading sequencing data (FASTQ files)
- Organizing analysis results
- Searching for specific samples or experiments

### 3. Job Execution

**Purpose**: Run analyses, monitor execution, and orchestrate workflows.

**Key Operations**:
- Launch jobs with `applet.run()` or `app.run()`
- Monitor job status and logs
- Create subjobs for parallel processing
- Build and run multi-step workflows
- Chain jobs with output references

**Common Use Cases**:
- Running genomics analyses on sequencing data
- Parallel processing of multiple samples
- Multi-step analysis pipelines

### 4. Python SDK (dxpy)

**Purpose**: Programmatic access to DNAnexus platform through Python.

**Key Operations**:
- Work with data object handlers (DXFile, DXRecord, DXApplet, etc.)
- Use high-level functions for common tasks
- Make direct API calls for advanced operations
- Create links and references between objects
- Search and discover platform resources

**Common Use Cases**:
- Automation scripts for data management
- Custom analysis pipelines
- Batch processing workflows

### 5. Configuration and Dependencies

**Purpose**: Configure app metadata and manage dependencies.

**Key Operations**:
- Write dxapp.json with inputs, outputs, and run specs
- Install system packages (execDepends)
- Bundle custom tools and resources
- Use assets for shared dependencies
- Integrate Docker containers
- Configure instance types and timeouts

**Common Use Cases**:
- Defining app input/output specifications
- Installing bioinformatics tools (samtools, bwa, etc.)

## Quick Start Examples

### Upload and Analyze Data

```python
import dxpy

# Upload input file
input_file = dxpy.upload_local_file("sample.fastq", project="project-xxxx")

# Run analysis

<!-- condensed from source -->
```
