---
name: openephys
description: Electrophysiology recording and neural data analysis. Use when working with neural recording systems, spike sorting, local field potentials, neuropixel probes, or electrophysiological signal processing. Trigger on imports of openephys, spikeinterface, probeinterface, or mentions of neural recording, neuropixel, spikeglx, electrophysiolog.
---
# openephys

Use this skill for electrophysiology data acquisition and analysis.

## Core patterns

- **Load recordings**: `read_openephys('session_folder')` for continuous data.
- **Spike extraction**: Use `spikeinterface` for modern spike sorting pipelines.
- **LFP analysis**: Bandpass filter 1-300 Hz for local field potentials.
- **Probe config**: `probeinterface` for neuropixel probe geometry mapping.

## Rules

- Always check sampling rate consistency across channels before analysis.
- Use memmap or chunked loading for large continuous files (>10GB).
- Reference signals appropriately (common average, median, or bipolar).

## Anti-patterns

- Don't load entire recordings into RAM — stream or chunk.
- Don't apply spike sorting without artifact removal first.
- Don't mix probe configurations without recalculating channel maps.

