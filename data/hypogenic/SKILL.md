---
name: hypogenic
description: Automated LLM-driven hypothesis generation and testing on tabular datasets. Use when you want to systematically explore hypotheses about patterns in empirical data (e.g., deception detection, content analysis). Combines literature insights with data-driven hypothesis testing. For manual hypothesis formulation use hypothesis-generation; for creative ideation use scientific-brainstorming.
---

# Hypogenic

## Overview

Hypogenic provides automated hypothesis generation and testing using large language models to accelerate scientific discovery. The framework supports three approaches: HypoGeniC (data-driven hypothesis generation), HypoRefine (synergistic literature and data integration), and Union methods (mechanistic combination of literature and data-driven hypotheses).

## Quick Start

Get started with Hypogenic in minutes:

```bash
# Clone example datasets
git clone https://github.com/ChicagoHAI/HypoGeniC-datasets.git ./data

# Run basic hypothesis generation
hypogenic_generation --config ./data/your_task/config.yaml --method hypogenic --num_hypotheses 20

# Run inference on generated hypotheses
hypogenic_inference --config ./data/your_task/config.yaml --hypotheses output/hypotheses.json
```

**Or use Python API:**

```python
from hypogenic import BaseTask

# Create task with your configuration
task = BaseTask(config_path="./data/your_task/config.yaml")

# Generate hypotheses
task.generate_hypotheses(method="hypogenic", num_hypotheses=20)

# Run inference
results = task.inference(hypothesis_bank="./output/hypotheses.json")
```

## When to Use This Skill

Use this skill when working on:
- Generating scientific hypotheses from observational datasets
- Testing multiple competing hypotheses systematically
- Combining literature insights with empirical patterns
- Accelerating research discovery through automated hypothesis ideation
- Domains requiring hypothesis-driven analysis: deception detection, AI-generated content identification, mental health indicators, predictive modeling, or other empirical research

## Key Features

**Automated Hypothesis Generation**
- Generate 10-20+ testable hypotheses from data in minutes
- Iterative refinement based on validation performance
- Support for both API-based (OpenAI, Anthropic) and local LLMs

**Literature Integration**
- Extract insights from research papers via PDF processing
- Combine theoretical foundations with empirical patterns
- Systematic literature-to-hypothesis pipeline with GROBID

**Performance Optimization**
- Redis caching reduces API costs for repeated experiments
- Parallel processing for large-scale hypothesis testing

## Core Capabilities

### 1. HypoGeniC: Data-Driven Hypothesis Generation

Generate hypotheses solely from observational data through iterative refinement.

**Process:**
1. Initialize with a small data subset to generate candidate hypotheses
2. Iteratively refine hypotheses based on performance
3. Replace poorly-performing hypotheses with new ones from challenging examples

**Best for:** Exploratory research without existing literature, pattern discovery in novel datasets

### 2. HypoRefine: Literature and Data Integration

Synergistically combine existing literature with empirical data through an agentic framework.

**Process:**
1. Extract insights from relevant research papers (typically 10 papers)
2. Generate theory-grounded hypotheses from literature
3. Generate data-driven hypotheses from observational patterns
4. Refine both hypothesis banks through iterative improvement

**Best for:** Research with established theoretical foundations, validating or extending existing theories

### 3. Union Methods

Mechanistically combine literature-only hypotheses with framework outputs.

**Variants:**
- **Literature ∪ HypoGeniC**: Combines literature hypotheses with data-driven generation
- **Literature ∪ HypoRefine**: Combines literature hypotheses with integrated approach

**Best for:** Comprehensive hypothesis coverage, eliminating redundancy while maintaining diverse perspectives

# For HypoGeniC examples
git clone https://github.com/ChicagoHAI/HypoGeniC-datasets.git ./data

# For HypoRefine/Union examples


