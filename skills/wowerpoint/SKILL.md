---
name: wowerpoint
description: Turn one document into a kawaii NotebookLM slide-deck PDF. Use for "wowerpoint this", "make a deck about <file>", "turn this report into slides", or any request to render a single document as shareable narrative slides.
---

# Wowerpoint

One doc in, one PDF out. Slide-deck only — videos and podcasts from the same engine are noticeably worse and out of scope; refer the user to the `notebooklm` CLI directly if they want those.

## Triggers

- "Wowerpoint <file>"
- "Make a slide deck about <file>"
- "Turn this report into slides"
- "Kawaii-deck this"

## Setup (one-time per machine)

If `notebooklm auth check` returns 0 and `command -v jq` resolves, skip.

```bash
uv tool install --with playwright --force notebooklm-py
$(uv tool dir)/notebooklm-py/bin/playwright install chromium
```

`jq` is required by the workflow's JSON parsing; install if missing (`brew install jq` on macOS, or your distro's package manager).

Then the user authenticates interactively — do not script. Tell them to type `! notebooklm login` so the OAuth ENTER lands in their terminal.

## Workflow

### 1. The source doc

You need exactly one source doc. If it doesn't exist or is too thin to carry a deck, **write it first** — use mem-search and sequential thinking to make it comprehensive (long-form, narrative, several thousand words is normal). Do not paper over a weak source by adding more sources.

### 2. Auth pre-flight

```bash
notebooklm auth check 2>&1 | tail -5
```

Exit 1 with `Run 'notebooklm login' to authenticate.` = halt and tell the user.

### 3. Create notebook, add the source

```bash
NOTEBOOK_ID=$(notebooklm create "<title>" --json | jq -r .notebook.id)
SOURCE_ID=$(notebooklm source add "<doc-path>" --notebook "$NOTEBOOK_ID" --json | jq -r .source.id)
```

Title: H1 of the source doc, or its filename stem; append a date for dated work.

JSON envelope keys differ — `create` → `.notebook.id`, `source add` → `.source.id`, `generate` → `.task_id`. Wrong key = empty string = silent downstream failure.

### 4. Spawn the subagent

Generation takes ~10 minutes; never block on it. Use the template below with `run_in_background: true`.

### 5. End your turn

Print the notebook URL so the user can watch live:

```text
https://notebooklm.google.com/notebook/
```

The subagent's completion notification fires when the file is on disk.

## Output path

Adjacent to the source, parallel filename:

```text
<source-dir>/<source-stem>-slides.pdf
```

If the source isn't somewhere that makes sense as an output location, default to `reports/<stem>-slides.pdf`.

## Share link (WOWerpoint Server)

After the PDF lands on disk, the subagent also POSTs it to the WOWerpoint Server, which converts the 16:9 deck into a 9:16 mobile twin and returns a share URL. The share URL is the primary deliverable to the user; the PDF on disk is the backup.

Required env (exported in the user's shell — the subagent inherits the parent's environment, so plain `export` is enough; no dotenv loader runs):

```bash
WOWERPOINT_API_BASE=https://wowerpoint-api.<subdomain>.workers.dev
WOWERPOINT_VIEWER_BASE=https://wowerpoint-viewer.<subdomain>.workers.dev
WOWERPOINT_UPLOAD_TOKEN=<token>
```

If any var is missing, skip the share-link step and just hand the PDF over.

Upload pattern (run AFTER the subagent confirms the PDF exists on disk). Capture the full response so empty `id` and `error` payloads are handled — `jq -r '.id'` returns the literal string `null` on a missing key, so always pipe through `.id // empty`:

## The prompt

One sentence. Default:

```text
Use kawaii characters to tell the story of <subject>. Keep it warm and clear.
```

