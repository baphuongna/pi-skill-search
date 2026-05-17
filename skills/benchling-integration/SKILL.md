---
name: benchling-integration
description: Benchling R&D platform integration. Access registry (DNA, proteins), inventory, ELN entries, workflows via API, build Benchling Apps, query Data Warehouse, for lab data management automation.
---

# Benchling Integration

## Overview

Benchling is a cloud platform for life sciences R&D. Access registry entities (DNA, proteins), inventory, electronic lab notebooks, and workflows programmatically via Python SDK and REST API.

## When to Use This Skill

This skill should be used when:
- Working with Benchling's Python SDK or REST API
- Managing biological sequences (DNA, RNA, proteins) and registry entities
- Automating inventory operations (samples, containers, locations, transfers)
- Creating or querying electronic lab notebook entries
- Building workflow automations or Benchling Apps
- Syncing data between Benchling and external systems
- Querying the Benchling Data Warehouse for analytics
- Setting up event-driven integrations with AWS EventBridge

## Core Capabilities

### 1. Authentication & Setup

**Python SDK Installation:**
```python
# Stable release
uv pip install benchling-sdk
# or with Poetry
poetry add benchling-sdk
```

**Authentication Methods:**

API Key Authentication (recommended for scripts):
```python
from benchling_sdk.benchling import Benchling
from benchling_sdk.auth.api_key_auth import ApiKeyAuth

benchling = Benchling(
    url="https://your-tenant.benchling.com",
    auth_method=ApiKeyAuth("your_api_key")
)

### 2. Registry & Entity Management

Registry entities include DNA sequences, RNA sequences, AA sequences, custom entities, and mixtures. The SDK provides typed classes for creating and managing these entities.

**Creating DNA Sequences:**
```python
from benchling_sdk.models import DnaSequenceCreate

sequence = benchling.dna_sequences.create(
    DnaSequenceCreate(
        name="My Plasmid",
        bases="ATCGATCG",
        is_circular=True,
        folder_id="fld_abc123",
        schema_id="ts_abc123",  # optional

# List all DNA sequences (returns a generator)
sequences = benchling.dna_sequences.list()
for page in sequences:
    for seq in page:
        print(f"{seq.name} ({seq.id})")

# Check total count
total = sequences.estimated_count()
```

**Key Operations:**
- Create: `benchling.<entity_type>.create()`
- Read: `benchling.<entity_type>.get(id)` or `.list()`
- Update: `benchling.<entity_type>.update(id, update_object)`
- Archive: `benchling.<entity_type>.archive(id)`

Entity types: `dna_sequences`, `rna_sequences`, `aa_sequences`, `custom_entities`, `mixtures`

For comprehensive SDK reference and advanced patterns, refer to `references/sdk_reference.md`.

### 3. Inventory Management

Manage physical samples, containers, boxes, and locations within the Benchling inventory system.

**Creating Containers:**
```python
from benchling_sdk.models import ContainerCreate

container = benchling.containers.create(
    ContainerCreate(
        name="Sample Tube 001",
        schema_id="cont_schema_abc123",
        parent_storage_id="box_abc123",  # optional
        fields=benchling.models.fields({"concentration": "100 ng/μL"})
    )

# Transfer a container to a new location
transfer = benchling.containers.transfer(
    container_id="cont_abc123",
    destination_id="box_xyz789"
)
```

<!-- condensed from source -->

