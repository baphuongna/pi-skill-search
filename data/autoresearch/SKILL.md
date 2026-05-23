---
name: autoresearch
description: Stateful single-mission improvement loop with strict evaluator contract, markdown decision logs, and max-runtime stop behavior
---

- You need evaluator generation at runtime — use `/deep-interview --autoresearch` first
- You need multiple missions orchestrated together — v1 forbids that
- You want the deprecated `omc autoresearch` CLI flow — it is no longer authoritative

- Single-mission only in v1
- Mission setup/evaluator generation stays in `deep-interview --autoresearch`
- Evaluator output must be structured JSON with required boolean `pass` and optional numeric `score`
- Non-passing iterations do **not** stop the run
- Stop conditions are explicit and bounded, with max-runtime as the primary strict stop hook

Canonical persistent storage lives under `.omc/autoresearch/<mission-slug>/` and/or `.omc/logs/autoresearch/<run-id>/`.

Minimum required artifacts:
- mission spec
- evaluator script or command reference
- per-iteration evaluation JSON
- markdown decision logs

Recommended canonical shape:
```text
.omc/autoresearch/<mission-slug>/
  mission.md
  evaluator.json
  runs/<run-id>/
    evaluations/
      iteration-0001.json
      iteration-0002.json
    decision-log.md
```
Reuse existing runtime artifacts when available rather than duplicating them unnecessarily.

1. Confirm a single mission exists and evaluator setup is already available.
2. Ensure mode/state is active for `autoresearch` and records:
   - mission slug/dir
   - evaluator reference
   - iteration count
   - started/updated timestamps
   - explicit max-runtime or deadline
3. On every iteration:
   - run exactly one experiment/change cycle
   - run the evaluator
   - persist machine-readable evaluation JSON
   - append a human-readable markdown decision log entry
   - continue even when evaluation does not pass
4. Stop when:
   - max-runtime ceiling is reached
   - user explicitly cancels
   - another explicit terminal condition is recorded by the runtime

Claude Code native cron is a supported integration point for periodic mission enhancement. In v1, prefer documenting/configuring cron inputs over building a large scheduler UI.

If cron is used:
- keep one mission per scheduled job
- preserve the same mission/evaluator contract
- append new run artifacts rather than overwriting prior experiments

- Do not hand execution back to `omc autoresearch`


