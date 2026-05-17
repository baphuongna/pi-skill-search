---
name: optimize-for-gpu
description: "GPU-accelerate Python code using CuPy, Numba CUDA, Warp, cuDF, cuML, cuGraph, KvikIO, cuCIM, cuxfilter, cuVS, cuSpatial, and RAFT. Use whenever the user mentions GPU/CUDA/NVIDIA acceleration, or wants to speed up NumPy, pandas, scikit-learn, scikit-image, NetworkX, GeoPandas, or Faiss workloads. Covers physics simulation, differentiable rendering, mesh ray casting, particle systems (DEM/SPH/fluids), vector/similarity search, GPUDirect Storage file IO, interactive dashboards, geospatial analysis, medical imaging, and sparse eigensolvers. Also use when you see CPU-bound Python code (loops, large arrays, ML pipelines, graph analytics, image processing) that would benefit from GPU acceleration, even if not explicitly requested."
---

# GPU Optimization for Python with NVIDIA

You are an expert GPU optimization engineer. Your job is to help users write new GPU-accelerated code or transform their existing CPU-bound Python code to run on NVIDIA GPUs for dramatic speedups — often 10x to 1000x for suitable workloads.

## When This Skill Applies

- User wants to speed up numerical/scientific Python code
- User is working with large arrays, matrices, or dataframes
- User mentions CUDA, GPU, NVIDIA, or parallel computing
- User has NumPy, pandas, SciPy, scikit-learn, NetworkX, or scipy.sparse.linalg code that processes large datasets
- User needs low-level GPU primitives (sparse eigensolvers, device memory management, multi-GPU communication)
- User is doing machine learning (training, inference, hyperparameter tuning, preprocessing)
- User is doing graph analytics (centrality, community detection, shortest paths, PageRank, etc.)
- User is doing vector search, nearest neighbor search, similarity search, or building a RAG pipeline
- User has Faiss, Annoy, ScaNN, or sklearn NearestNeighbors code that could be GPU-accelerated
- User wants GPU-accelerated interactive dashboards, cross-filtering, or exploratory data analysis on large datasets
- User is doing geospatial analysis (point-in-polygon, spatial joins, trajectory analysis, distance calculations) with GeoPandas or shapely
- User is doing image processing, computer vision, or medical imaging (filtering, segmentation, morphology, feature detection) with scikit-image or OpenCV
- User is working with whole-slide images (WSI), digital pathology, microscopy, or remote sensing imagery

## Decision Framework: Which Library to Use

Choose the right tool based on what the user's code actually does. Read the appropriate reference file(s) before writing any GPU code.

### CuPy — for array/matrix operations (NumPy replacement)
**Read:** `references/cupy.md`

Use CuPy when the user's code is primarily:
- NumPy array operations (element-wise math, linear algebra, FFT, sorting, reductions)
- SciPy operations (sparse matrices, signal processing, image filtering, special functions)
- Any code that chains NumPy calls — CuPy is a drop-in replacement

CuPy wraps NVIDIA's optimized libraries (cuBLAS, cuFFT, cuSOLVER, cuSPARSE, cuRAND) so standard operations are already tuned. Most NumPy code works by changing `import numpy as np` to `import cupy as cp`.

**Best for:** Linear algebra, FFTs, array math, image processing, signal processing, Monte Carlo with array ops, any NumPy-heavy workflow.

### Numba CUDA — for custom GPU kernels
**Read:** `references/numba.md`

Use Numba when the user needs:
- Custom algorithms that don't map to standard array operations
- Fine-grained control over GPU threads, blocks, and shared memory
- Element-wise operations with complex logic (use `@vectorize(target='cuda')`)
- Reduction operations with custom logic
- Stencil computations or neighbor-dependent calculations
- Anything requiring the CUDA programming model directly

Numba compiles Python directly into CUDA kernels. It gives full control over the GPU's thread hierarchy, shared memory, and synchronization — essential for algorithms that can't be expressed as array operations.

**Best for:** Custom kernels, particle simulations, stencil codes, custom reductions, algorithms needing shared memory, any code with complex per-element logic.

### Warp — for simulation, spatial computing, and differentiable programming
**Read:** `references/warp.md`

Use Warp when the user's code is primarily:
- Physics simulation (particles, cloth, fluids, rigid bodies, DEM, SPH)
- Geometry processing (mesh operations, ray casting, signed distance fields, marching cubes)
- Robotics (kinematics, dynamics, control with transforms and quaternions)
- Differentiable simulation for ML training (integrates with PyTorch/JAX autograd)
- Any Python simulation loop that needs to be JIT-compiled to GPU
- Spatial computing with meshes, volumes (NanoVDB), hash grids, or BVH queries

Warp JIT-compiles `@wp.kernel` Python functions to CUDA, with built-in types for spatial computing (vec3, mat33, quat, transform) and primitives for geometry queries (Mesh, Volume, HashGrid, BVH). All kernels are automatically differentiable.

**Best for:** Physics simulation, mesh ray casting, particle systems, differentiable rendering, robotics kinematics, SDF operations, any workload combining spatial data structures with GPU compute.

**Warp vs Numba:** Both compile Python to CUDA, but Warp provides higher-level spatial types (vec3, quat, Mesh, Volume) and automatic differentiation, while Numba gives raw CUDA control (shared memory, block/thread management, atomics). Use Warp for simulation/geometry, Numba for general-purpose custom kernels.

### cuDF — for dataframe operations (pandas replacement)
**Read:** `references/cudf.md`

Use cuDF when the user's code is primarily:
- pandas DataFrame operations (filtering, groupby, joins, aggregations)
- CSV/Parquet/JSON reading and processing
- ETL pipelines or data wrangling on large datasets
- Any pandas-heavy workflow on datasets that fit in GPU memory

cuDF's `cudf.pandas` accelerator mode can speed up existing pandas code with zero code changes. For maximum performance, use the native cuDF API.

**Best for:** Data wrangling, ETL, groupby/aggregations, joins, string processing on dataframes, time series on tabular data.

### cuML — for machine learning (scikit-learn replacement)
**Read:** `references/cuml.md`

Use cuML when the user's code is primarily:
- scikit-learn estimators (classification, regression, clustering, dimensionality reduction)
- ML preprocessing (scaling, encoding, imputation, feature extraction)
- Hyperparameter tuning or cross-validation
- Tree model inference (XGBoost, LightGBM, sklearn Random Forest via FIL)
- UMAP, t-SNE, HDBSCAN, or KNN on large datasets

cuML's `cuml.accel` accelerator mode can speed up existing sklearn code with zero code changes. For maximum performance, use the native cuML API. Speedups range from 2-10x for simple linear models to 60-600x for complex algorithms like HDBSCAN and KNN.

**Best for:** Classification, regression, clustering, dimensionality reduction, preprocessing pipelines, model inference, any scikit-learn-heavy workflow.

### cuGraph — for graph analytics (NetworkX replacement)
**Read:** `references/cugraph.md`

Use cuGraph when the user's code is primarily:
- NetworkX graph algorithms (centrality, community detection, shortest paths, PageRank)
- Graph construction and analysis on large networks
- Social network analysis, knowledge graphs, or recommendation systems
- Any graph algorithm on networks with 10K+ edges

cuGraph's `nx-cugraph` backend can accelerate existing NetworkX code with zero code changes via an environment variable. For maximum performance, use the native cuGraph API with cuDF DataFrames. Speedups range from 10x for small graphs to 500x+ for large graphs (millions of edges).

**Best for:** PageRank, betweenness centrality, community detection (Louvain, Leiden), BFS/SSSP, connected components, link prediction, graph neural network sampling, any NetworkX-heavy workflow.

### KvikIO — for high-performance GPU file IO
**Read:** `references/kvikio.md`

Use KvikIO when the user's code is primarily:
