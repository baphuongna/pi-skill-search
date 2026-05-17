---
name: vetc-meta-skill-creator
description: PROACTIVELY activate khi user muốn tạo skill mới, distill pattern từ session, hoặc promote instinct thành skill. Scaffold skill với YAML frontmatter chuẩn, references folder, và integration checklist.
---

# VETC Meta Skill Creator

Skill để tạo skill mới. Inspired by superpowers `create-skill` pattern. Giúp maintain consistency + quality cho toàn bộ skill library.

## When to Activate

- User muốn tạo skill mới: "tạo skill vetc-xxx", "make a skill for yyy"
- Distill pattern từ session hiện tại thành reusable skill
- Promote instinct có confidence cao thành formal skill
- `/vetc-learn` detected pattern đủ mature để skill-ize
- User nói: "this should be a skill", "convert this to skill"

## Do NOT Activate When

- Skill tương đương đã tồn tại — search trước khi tạo
- Pattern chỉ áp dụng 1 lần — instinct đủ rồi, không cần skill
- User muốn sửa skill hiện có → dùng Edit trực tiếp
- Generic best practice đã có trong `rules/*.md`

## Skill Quality Criteria

Skill MỚI chỉ nên tạo khi thỏa mãn:

- [ ] **Specific**: có trigger rõ ràng, không overlap skill khác
- [ ] **Actionable**: user follow được từ trigger đến output
- [ ] **Reusable**: áp dụng cho >= 3 scenarios khác nhau
- [ ] **VETC-flavored**: có VETC domain context (không generic)
- [ ] **Testable**: output có thể verify
- [ ] **Non-duplicate**: không trùng với 32 skills hiện có

## Workflow

### Step 1 — Validate Proposal

Trước khi tạo file:

```
Search existing skills for similar scope:
- grep -r "{keyword}" skills/*/SKILL.md
- List overlapping skills, justify differentiation
- Check rules/*.md — không duplicate generic rule
```

Nếu overlap > 70% → DO NOT CREATE, recommend extend existing skill.

### Step 2 — Define Skill Metadata

```yaml
---
name: vetc-{kebab-case-name}
description: PROACTIVELY activate khi {specific trigger}. {What it does in 1 sentence.}
effort: low | medium | high
allowed-tools: # optional - restrict tools if needed
paths: # optional - auto-activate when working in these paths
---
```

**Naming rules:**
- Prefix `vetc-` mandatory
- Kebab-case, all lowercase

### Step 3 — Scaffold Skill Files

```bash
# Create skill directory
mkdir -p skills/vetc-{name}/references/

# Create SKILL.md with template
# (use content from Step 4 below)

# Create first reference file if needed
touch skills/vetc-{name}/references/checklist.md
```

### Step 4 — SKILL.md Structure

See full template: `./references/skill-template.md`

Quick rules:
- **Naming**: `vetc-{verb}-{noun}` hoặc `vetc-{domain}`, 10-40 chars, prefix `vetc-` mandatory
- **Description**: Start with "PROACTIVELY activate khi...", 1-2 sentences, unique
- **Effort**: `low` (<5min), `medium` (10-30min), `high` (30+ min)

### Step 5 — Optional: Create Reference Files

For progressive disclosure (from superpowers pattern):

```
skills/vetc-{name}/references/
├── code-snippets.md    ← Language-specific examples (PASS/FAIL pattern)
├── checklist.md        ← Step-by-step validation checklist
├── anti-patterns.md    ← Detailed anti-patterns with examples
└── advanced.md         ← Expert-level usage
```

<!-- condensed from source -->

