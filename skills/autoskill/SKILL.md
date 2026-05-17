---
name: autoskill
description: Observe the user's screen via screenpipe, detect repeated research workflows, match them against existing scientific-agent-skills, and draft new skills (or composition recipes that chain existing ones) for the patterns not yet covered. Use when the user asks to analyze their recent work and propose skills based on what they actually do. Requires the screenpipe daemon (https://github.com/screenpipe/screenpipe) running locally on port 3030 — the skill has no other data source and will refuse to run if screenpipe is unreachable. All detection runs locally; only redacted cluster summaries reach the LLM.
---

# autoskill

> **Requires a running [screenpipe](https://github.com/screenpipe/screenpipe) daemon.** This skill has no alternate data source — it reads exclusively from the local screenpipe HTTP API (default `http://localhost:3030`). If the daemon isn't running, `run()` raises `ScreenpipeUnreachable` with install instructions.

> **Network access & environment variables.** This skill makes authenticated HTTP requests to (a) the user's local screenpipe daemon on loopback, and (b) the user-configured LLM backend — one of `http://localhost:1234/v1` (LM Studio, default), `https://api.anthropic.com` (opt-in Claude), or a user-supplied BYOK Foundry gateway. The skill reads three environment variables — `SCREENPIPE_TOKEN`, `ANTHROPIC_API_KEY`, `FOUNDRY_API_KEY` — and uses each only to authenticate to the single endpoint its name implies. No other network destinations, no telemetry, no data egress to any third party.

## Overview

Turn the user's own workflow history — captured passively by the local [screenpipe](https://github.com/screenpipe/screenpipe) daemon — into new skills. This skill is on-demand: the user invokes it with a time window, it queries screenpipe's local HTTP API, clusters repeated workflow patterns, compares each pattern against the existing skills in this repo, and produces a staged folder of proposals the user can review, edit, and promote.

## When to Use This Skill

Invoke this skill when the user asks to:
- "Analyze my last 4 hours / day / week and propose new skills."
- "Look at what I've been doing and tell me what's not covered yet."
- "Draft a skill from my recent workflow."
- "Find composition recipes for workflows I repeat."

Do **not** invoke it for one-off questions about screenpipe itself, for real-time screen queries, or without an explicit user request — the skill analyzes sensitive local content and must stay explicitly user-triggered.

## Privacy Posture

- **Screenpipe handles app/window filtering at capture time.** Install a starter deny-list by copying `references/screenpipe-config.yaml` into the user's screenpipe config. Sensitive apps (password managers, messaging, banking) are never OCR'd in the first place.
- **Raw OCR never leaves the machine.** `scripts/fetch_window.py` pulls data over localhost HTTP. `scripts/cluster.py` reduces the timeline to app/duration/title summaries. `scripts/redact.py` strips emails, API keys, bearer tokens, and phone numbers as defense-in-depth before any cluster summary reaches the LLM.
- **LLM backend defaults to `local`.** The recommended setup is [LM Studio](https://lmstudio.ai/) running `Gemma-4-31B-it` — strong reasoning at a size that fits on most workstation GPUs, and no data ever leaves your machine. Cloud backends (`claude`, `foundry`) are opt-in and documented in `config.yaml` for users who explicitly want them. Detection and embeddings always run locally regardless of backend choice.
- **Dry-run mode** (`--plan`) prints the exact timeline that will be analyzed before any LLM call.
- **TLS for localhost** (optional, for corporate policy): see `references/https-proxy.md` for the Caddy pattern.

## Prerequisites

### 1. Screenpipe daemon

Either install the official release or build from source. Either way the daemon binds HTTP on `localhost:3030` by default.

**From source** (recommended if you want the CLI daemon without the desktop GUI):

```bash
git clone --depth 1 https://github.com/mediar-ai/screenpipe.git
cd screenpipe
cargo build -p screenpipe-engine --release
# System deps (macOS): cmake + full Xcode.app (not just Command Line Tools).
#   # if xcodebuild plug-ins error: sudo xcodebuild -runFirstLaunch
./target/release/screenpipe doctor   # confirm permissions + ffmpeg
./target/release/screenpipe record --disable-audio --use-pii-removal
```

First run will prompt for macOS Screen Recording permission. Grant it and relaunch.

### 2. Screenpipe API token

The local API now requires bearer auth. Retrieve your token and export it:

```bash
export SCREENPIPE_TOKEN=$(screenpipe auth token)
```

(Or set `screenpipe.token` directly in `config.yaml` — env var is preferred since it keeps secrets out of version control.)

### 3. Python environment

Via `pipenv` from the repo root:

```bash
pipenv install httpx pyyaml sentence-transformers
```

The embedding model (`sentence-transformers/all-MiniLM-L6-v2`, ~80 MB) downloads on first run.

### 4. Local LLM (default path) — LM Studio

- Install [LM Studio](https://lmstudio.ai/).
- Download `Gemma-4-31B-it` (or another strong reasoning model; adjust `local.model` in `config.yaml`).
- Load it via the CLI for headless use (no GUI required):

```bash
lms load gemma-4-31b-it --context-length 131072 --gpu max -y
lms status   # confirm server running on :1234
```

### 5. Cloud LLM backends (optional, opt-in)

Only if you explicitly opt out of local:
- `claude`: set `ANTHROPIC_API_KEY`, flip `backend: claude` in `config.yaml`.
- `foundry`: set `FOUNDRY_API_KEY`, flip `backend: foundry`, set `foundry.endpoint` to your corporate gateway URL.

## Architecture

```
screenpipe daemon (user-installed)
        │  HTTP on localhost:3030
        ▼
scripts/fetch_window.py    → normalized timeline events
scripts/redact.py          → regex scrub (defense-in-depth)
scripts/cluster.py         → sessions + clusters (local only)
scripts/match_skills.py    → top-k vs existing 135 skills (local embeddings)
scripts/synthesize.py      → LLM judge: reuse / compose / novel
        │
        ▼
~/.autoskill/proposed/<timestamp>/        (default; override with --out)
  ├── report.md

## Workflow

The skill ships a unified CLI at `scripts/autoskill.py` with three subcommands:

```bash
python scripts/autoskill.py doctor   --config config.yaml --skills-dir ../
python scripts/autoskill.py run      --start ... --end ... --config config.yaml
python scripts/autoskill.py promote  --proposed ~/.autoskill/proposed/<ts> --skills-dir ../ --name <skill>

