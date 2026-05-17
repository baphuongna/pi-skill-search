---
name: research-reproducibility
description: Research methodology and experiment reproducibility. Use when setting up experiment tracking, managing computational notebooks, versioning datasets, or ensuring reproducible research workflows. Trigger on imports of mlflow, dvc, papermill, or mentions of reproducibility, experiment tracking, version control for data, notebook parameterization.
---
# research-reproducibility

Use this skill for reproducible research and experiment tracking.

## Core patterns

- **Experiment tracking**: `mlflow.start_run()` → `mlflow.log_param()`, `mlflow.log_metric()`.
- **Data versioning**: `dvc run -n stage -d data.csv -o processed.csv python process.py`.
- **Notebooks**: `papermill.execute_notebook('template.ipynb', 'output.ipynb', parameters={})`.
- **Seeds**: Set all random seeds (`random`, `numpy`, `torch`, `tensorflow`).

## Rules

- Always pin dependency versions: `pip freeze > requirements.txt`.
- Set seeds at experiment start — `np.random.seed(42)`, `torch.manual_seed(42)`.
- Log all hyperparameters, not just the final ones.

## Anti-patterns

- Don't use `random.seed()` alone — set numpy and torch seeds too.
- Don't hardcode paths in notebooks — use configuration files.
- Don't skip logging negative results — they are equally valuable.
