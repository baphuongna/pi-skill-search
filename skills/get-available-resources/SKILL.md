---
name: get-available-resources
description: This skill should be used at the start of any computationally intensive scientific task to detect and report available system resources (CPU cores, GPUs, memory, disk space). It creates a JSON file with resource information and strategic recommendations that inform computational approach decisions such as whether to use parallel processing (joblib, multiprocessing), out-of-core computing (Dask, Zarr), GPU acceleration (PyTorch, JAX), or memory-efficient strategies. Use this skill before running analyses, training models, processing large datasets, or any task where resource constraints matter.
---

# Get Available Resources

## Overview

Detect available computational resources and generate strategic recommendations for scientific computing tasks. This skill automatically identifies CPU capabilities, GPU availability (NVIDIA CUDA, AMD ROCm, Apple Silicon Metal), memory constraints, and disk space to help make informed decisions about computational approaches.

## When to Use This Skill

Use this skill proactively before any computationally intensive task:

- **Before data analysis**: Determine if datasets can be loaded into memory or require out-of-core processing
- **Before model training**: Check if GPU acceleration is available and which backend to use
- **Before parallel processing**: Identify optimal number of workers for joblib, multiprocessing, or Dask
- **Before large file operations**: Verify sufficient disk space and appropriate storage strategies
- **At project initialization**: Understand baseline capabilities for making architectural decisions

**Example scenarios:**
- "Help me analyze this 50GB genomics dataset" → Use this skill first to determine if Dask/Zarr are needed
- "Train a neural network on this data" → Use this skill to detect available GPUs and backends
- "Process 10,000 files in parallel" → Use this skill to determine optimal worker count
- "Run a computationally intensive simulation" → Use this skill to understand resource constraints

### Resource Detection

The skill runs `scripts/detect_resources.py` to automatically detect:

1. **CPU Information**
   - Physical and logical core counts
   - Processor architecture and model
   - CPU frequency information

2. **GPU Information**
   - NVIDIA GPUs: Detects via nvidia-smi, reports VRAM, driver version, compute capability
   - AMD GPUs: Detects via rocm-smi
   - Apple Silicon: Detects M1/M2/M3/M4 chips with Metal support and unified memory

3. **Memory Information**

### Strategic Recommendations

The skill generates context-aware recommendations:

**Parallel Processing Recommendations:**
- **High parallelism (8+ cores)**: Use Dask, joblib, or multiprocessing with workers = cores - 2
- **Moderate parallelism (4-7 cores)**: Use joblib or multiprocessing with workers = cores - 1
- **Sequential (< 4 cores)**: Prefer sequential processing to avoid overhead

**Memory Strategy Recommendations:**
- **Memory constrained (< 4GB available)**: Use Zarr, Dask, or H5py for out-of-core processing
- **Moderate memory (4-16GB available)**: Use Dask/Zarr for datasets > 2GB
- **Memory abundant (> 16GB available)**: Can load most datasets into memory directly

**GPU Acceleration Recommendations:**

## Usage Instructions

### Step 1: Run Resource Detection

Execute the detection script at the start of any computationally intensive task:

```bash
python scripts/detect_resources.py
```

Optional arguments:
- `-o, --output <path>`: Specify custom output path (default: `.claude_resources.json`)
- `-v, --verbose`: Print full resource information to stdout

### Step 2: Read and Apply Recommendations

After running detection, read the generated `.claude_resources.json` file to inform computational decisions:

```python
# Example: Use recommendations in code
import json

with open('.claude_resources.json', 'r') as f:
    resources = json.load(f)

# Check parallel processing strategy
if resources['recommendations']['parallel_processing']['strategy'] == 'high_parallelism':
    n_jobs = resources['recommendations']['parallel_processing']['suggested_workers']
    # Use joblib, Dask, or multiprocessing with n_jobs workers

# Check memory strategy
if resources['recommendations']['memory_strategy']['strategy'] == 'memory_constrained':
    # Use Dask, Zarr, or H5py for out-of-core processing
    import dask.array as da
    # Load data in chunks

# Check GPU availability
if resources['recommendations']['gpu_acceleration']['available']:
    backends = resources['recommendations']['gpu_acceleration']['backends']
    # Use appropriate GPU library based on available backend
```

<!-- condensed from source -->

