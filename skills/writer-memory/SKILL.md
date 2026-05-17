---
name: writer-memory
description: Agentic memory system for writers - track characters, relationships, scenes, and themes
---

# Writer Memory - Agentic Memory System for Writers

Persistent memory system designed for creative writers, with first-class support for Korean storytelling workflows.

## Overview

Writer Memory maintains context across Claude sessions for fiction writers. It tracks:

- **Characters (캐릭터)**: Emotional arcs (감정궤도), attitudes (태도), dialogue tone (대사톤), speech levels
- **World (세계관)**: Settings, rules, atmosphere, constraints
- **Relationships (관계)**: Character dynamics and evolution over time
- **Scenes (장면)**: Cut composition (컷구성), narration tone, emotional tags
- **Themes (테마)**: Emotional themes (정서테마), authorial intent

All data persists in `.writer-memory/memory.json` for git-friendly collaboration.

## Commands

| Command | Action |
|---------|--------|
| `writer-memory init <project-name>` | Initialize new project memory |
| `writer-memory status` | Show memory overview (character count, scene count, etc) |
| `writer-memory char add ` | Add new character |
| `writer-memory char ` | View character details |
| `writer-memory char update  <field> <value>` | Update character field |
| `writer-memory char list` | List all characters |
| `writer-memory rel add <char1> <char2> <type>` | Add relationship |
| `writer-memory rel <char1> <char2>` | View relationship |
| `writer-memory rel update <char1> <char2> <event>` | Add relationship event |
| `writer-memory scene add <title>` | Add new scene |
| `writer-memory scene <id>` | View scene details |

## Memory Types

### 캐릭터 메모리 (Character Memory)

Tracks individual character attributes essential for consistent portrayal:

| Field | Korean | Description |
|-------|--------|-------------|
| `arc` | 감정궤도 | Emotional journey (e.g., "체념 -> 욕망자각 -> 선택") |
| `attitude` | 태도 | Current disposition toward life/others |
| `tone` | 대사톤 | Dialogue style (e.g., "담백", "직설적", "회피적") |
| `speechLevel` | 말투 레벨 | Formality: 반말, 존댓말, 해체, 혼합 |
| `keywords` | 핵심 단어 | Characteristic words/phrases they use |
| `taboo` | 금기어 | Words/phrases they would never say |
| `emotional_baseline` | 감정 기준선 | Default emotional state |
| `triggers` | 트리거 | What provokes emotional reactions |

### 세계관 메모리 (World Memory)

Establishes the universe your story inhabits:

| Field | Korean | Description |
|-------|--------|-------------|
| `setting` | 배경 | Time, place, social context |
| `rules` | 규칙 | How the world operates (magic systems, social norms) |
| `atmosphere` | 분위기 | Overall mood and tone |
| `constraints` | 제약 | What cannot happen in this world |
| `history` | 역사 | Relevant backstory |

### 관계 메모리 (Relationship Memory)

Captures the dynamic between characters over time:

| Field | Description |
|-------|-------------|
| `type` | Base relationship: romantic, familial, friendship, rivalry, professional |
| `status` | Current state: budding, stable, strained, broken, healing |
| `power_dynamic` | Who has the upper hand, if any |
| `events` | Timeline of relationship-changing moments |
| `tension` | Current unresolved conflicts |
| `intimacy_level` | Emotional closeness (1-10) |

**Example:**

