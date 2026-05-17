---
name: pytdc
description: Therapeutics Data Commons. AI-ready drug discovery datasets (ADME, toxicity, DTI), benchmarks, scaffold splits, molecular oracles, for therapeutic ML and pharmacological prediction.
---

# PyTDC (Therapeutics Data Commons)

## Overview

PyTDC is an open-science platform providing AI-ready datasets and benchmarks for drug discovery and development. Access curated datasets spanning the entire therapeutics pipeline with standardized evaluation metrics and meaningful data splits, organized into three categories: single-instance prediction (molecular/protein properties), multi-instance prediction (drug-target interactions, DDI), and generation (molecule generation, retrosynthesis).

## When to Use This Skill

This skill should be used when:
- Working with drug discovery or therapeutic ML datasets
- Benchmarking machine learning models on standardized pharmaceutical tasks
- Predicting molecular properties (ADME, toxicity, bioactivity)
- Predicting drug-target or drug-drug interactions
- Generating novel molecules with desired properties
- Accessing curated datasets with proper train/test splits (scaffold, cold-split)
- Using molecular oracles for property optimization

## Quick Start

The basic pattern for accessing any TDC dataset follows this structure:

```python
from tdc.<problem> import 
data = (name='')
split = data.get_split(method='scaffold', seed=1, frac=[0.7, 0.1, 0.2])
df = data.get_data(format='df')
```

Where:
- `<problem>`: One of `single_pred`, `multi_pred`, or `generation`
- ``: Specific task category (e.g., ADME, DTI, MolGen)
- ``: Dataset name within that task

# Returns dict with 'train', 'valid', 'test' DataFrames
```

## Single-Instance Prediction Tasks

Single-instance prediction involves forecasting properties of individual biomedical entities (molecules, proteins, etc.).

### Available Task Categories

#### 1. ADME (Absorption, Distribution, Metabolism, Excretion)

Predict pharmacokinetic properties of drug molecules.

```python
from tdc.single_pred import ADME
data = ADME(name='Caco2_Wang')  # Intestinal permeability
# Other datasets: HIA_Hou, Bioavailability_Ma, Lipophilicity_AstraZeneca, etc.
```

**Common ADME datasets:**
- Caco2 - Intestinal permeability
- HIA - Human intestinal absorption
- Bioavailability - Oral bioavailability
- Lipophilicity - Octanol-water partition coefficient
- Solubility - Aqueous solubility
- BBB - Blood-brain barrier penetration
- CYP - Cytochrome P450 metabolism

#### 2. Toxicity (Tox)

Predict toxicity and adverse effects of compounds.

# Other datasets: AMES, DILI, Carcinogens_Lagunin, etc.
```

**Common toxicity datasets:**
- hERG - Cardiac toxicity
- AMES - Mutagenicity
- DILI - Drug-induced liver injury
- Carcinogens - Carcinogenicity
- ClinTox - Clinical trial toxicity

#### 3. HTS (High-Throughput Screening)

Bioactivity predictions from screening data.

```python

## Multi-Instance Prediction Tasks

Multi-instance prediction involves forecasting properties of interactions between multiple biomedical entities.

### Available Task Categories

#### 1. DTI (Drug-Target Interaction)

Predict binding affinity between drugs and protein targets.

```python
from tdc.multi_pred import DTI
data = DTI(name='BindingDB_Kd')
split = data.get_split()

