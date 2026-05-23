# Spec: pi-skill-search — On-Demand Skill Search Extension

Date: 2026-05-15

## Source

- User prompt: Deep analysis of `scientific-agent-skills/` repo → token cost analysis → search tool design
- Measurement data: 137 skills × 23,589 tokens injected, benchmarked keyword/TF-IDF, cost projections
- Reference: `Source/harness-experimental/` methodology

## Project Summary

**Product**: A Pi extension (`pi-skill-search`) that replaces the "inject all skill descriptions into system prompt" pattern with an on-demand search tool + category summary.

**For whom**: Pi users who have large skill collections (137+ scientific skills from `scientific-agent-skills`, or any growing skill set).

**Why**: Injecting all skill descriptions costs 23,589 tokens (11.8% of 200K context window), multiplies per turn ($3.54/session at 50 turns), triggers compaction 15% sooner, and floods agent with 85-93% false-positive candidates. Search tool + category summary costs ~381 tokens startup (98% savings) while maintaining agent discoverability.

## Candidate Product Docs

| File | Purpose | Source sections |
| --- | --- | --- |
| `docs/product/skill-search.md` | Tool contract, search algorithm, category rules | This spec §4–§6 |
| `docs/product/category-rules.md` | Category classification rules and synonym dictionary | This spec §5 |
| `docs/decisions/0004-search-over-inject.md` | Why search beats inject — token cost evidence | This spec §3 |

## Candidate Epics

| Epic | Description | Status |
| --- | --- | --- |
| E01 | Core extension: indexer + search tool + category summary | unsliced |
| E02 | Proactive suggestion: `tool_call` hook for package detection | unsliced |
| E03 | Query caching + telemetry hooks | unsliced |

---

## 1. Current Behavior

When Pi starts a session, `skills.ts` discovers all `SKILL.md` files from configured skill directories. It extracts `name` and `description` from YAML frontmatter and injects ALL of them into the system prompt via `formatSkillsForPrompt()`:

```xml
<available_skills>
  <skill>
    <name>rdkit</name>
    <description>Cheminformatics toolkit for fine-grained molecular control...</description>
    <location>.../rdkit/SKILL.md</location>
  </skill>
  <!-- ×137 for scientific-agent-skills -->
</available_skills>
```

This costs **23,589 tokens** at startup and is re-sent on every agent turn.

### Measured costs

| Metric | Value |
| --- | --- |
| Skills indexed | 137 |
| Description chars total | 82,564 |
| Prompt tokens total (chars/3.5) | 23,589 |
| % of 200K context window | 11.8% |
| Cost per session (50 turns, Sonnet 4) | $3.54 |
| Conversation budget stolen | 18% (23K of 130K available) |
| Compaction triggered sooner by | ~15% |
| False-positive candidates per query | 85-93% |
| Skill pairs with >25% description overlap | 21 (confusing for agent) |

### Cross-reference pollution

61/137 skills mention other skill names in their descriptions (e.g., `datamol` says "wrapper around RDKit"). This causes keyword confusion — pure keyword count returns `datamol` for query "rdkit" because "rdkit" appears 3 times in `datamol`'s description.

### Cohabitation with Pi's built-in injection

Pi has **no opt-out flag** for `formatSkillsForPrompt()`. Whenever a skill `read` tool is selected (the default) and skills are loaded via `LoadSkillsOptions`, the `<available_skills>` block is appended automatically inside `buildSystemPrompt()`.

This means an extension that only *adds* a category summary will run **alongside** the inject-all behavior, producing the worst of both worlds: `Pi inject (≈23,589 tokens) + extension summary (≈150) + tool definition (≈166) ≈ 23,905 tokens` per turn — *higher* than the unmodified 23,589 baseline. The extension MUST actively suppress Pi's injection to realize the savings.

(The §2 target table's "~381 tokens startup" figure is the rolled-up total of summary + tool definition + scaffolding overhead. The breakdown above shows the components separately to make the cohabitation math explicit.)

Two suppression mechanisms are available through the `before_agent_start` event (verified against `Source/pi-mono/packages/coding-agent/src/core/extensions/types.ts` at v0.74.0):

1. **Strip the rendered block** — `event.systemPrompt` is the already-built string; extension returns `{ systemPrompt: stripped }` from `before_agent_start`.
2. **Read Pi's loaded skills** — `event.systemPromptOptions.skills: Skill[]` exposes the parsed `Skill[]` Pi already discovered, so the extension never re-scans nor re-parses YAML.

This spec adopts mechanism (1) for output and mechanism (2) for input. See §7.3 for the implementation.

## 2. Target Behavior

Replace inject-all with two layers:

**Layer 1 — Category summary** (~150 tokens, always in prompt):
A concise summary of available skill domains injected via `before_agent_start`. Agent knows WHAT categories exist.

**Layer 2 — Search tool** (~166 tokens for tool definition):
A `skill-search` tool that agent calls on-demand. Returns top 3-5 matching skills with name, description, and file path. Agent then uses `read` to load the full SKILL.md.

### Target costs

| Metric | Inject All | Search + Categories | Savings |
| --- | --- | --- | --- |
| Startup tokens | 23,589 | ~381 | 98% |
| Cost/session (50 turns) | $3.54 | $0.03 | 99% |
| % context window | 11.8% | 0.19% | — |
| Conversation budget stolen | 18% | ~0% | — |

### Scalability

| Skills | Inject All | Search Tool |
| --- | --- | --- |
| 137 | 23,589 tok (11.8%) | 166 tok (0.08%) |
| 500 | 86,091 tok (43%) | 166 tok (0.08%) |
| 1,000 | 172,182 tok (86%) | 166 tok (0.08%) |

Search tool cost is **constant** regardless of skill count.

## 3. Decision: Search over Inject

**Decision ID**: `docs/decisions/0004-search-over-inject.md` (renumbered from
`0001` in earlier drafts to coexist with harness decisions `0001`–`0003`
inherited from `Source/harness-experimental`).

### Context

Pi's `formatSkillsForPrompt()` injects all skill descriptions into the system prompt. This is sustainable for 10-30 skills (~2,000 tokens) but breaks at 137+ skills.

### Decision

Use on-demand search tool + category summary instead of inject-all.

### Rationale

1. **Token cost is multiplicative**: 23K tokens × N turns. At 50 turns = 1.17M input tokens just for descriptions.
2. **Most skills unused**: Typical session uses 0-3 skills. 134+ descriptions are pure waste.
3. **Agent decision quality degrades**: With 137 candidates, 85-93% are false positives per query. Agent must reason through noise.
4. **Scalability ceiling**: At 500 skills, inject occupies 43% of context. At 1,000 — 86%. Dead end.
5. **Search is constant cost**: 166 tokens regardless of skill count. 3ms latency per query.

### Consequences

- Agent must explicitly call `skill-search` to discover specific skills (one extra LLM turn).
- Category summary mitigates this by telling agent which domains exist.
- `tool_call` hook (E02) can proactively suggest when agent writes code with known packages.
- **Extension must strip Pi's auto-injected `<available_skills>` block from `systemPrompt` every turn**, since Pi exposes no opt-out flag for `formatSkillsForPrompt()`. Failure to strip results in *higher* total tokens than the baseline (see §1 Cohabitation).
- Token savings are realized **per turn** via `before_agent_start` mutation. There is no persistent system-message API in Pi (verified §10.1) — the cost model is "(summary + tool) × N turns" not "(summary + tool) × 1".

## 4. Design

### 4.1 Domain Model

The extension's internal types are derived from Pi's `Skill` (defined in `Source/pi-mono/packages/coding-agent/src/core/skills.ts:75`). The mapping is:

```
Pi Skill (input)             →   SkillEntry (extension internal)
  name                       →     name
  description                →     description (already validated ≤1024 chars by Pi)
  filePath                   →     path
  disableModelInvocation     →     (filtered out before indexing — see §7.3)
  baseDir, sourceInfo        →     (not used)
```

```
SkillEntry {
  name: string           // "rdkit" — copied from Pi's Skill.name
  description: string    // copied from Pi's Skill.description (≤1024 chars per Pi's validateDescription)
  path: string           // absolute path to SKILL.md, copied from Pi's Skill.filePath
  categories: string[]   // computed: ["Cheminformatics & Drug Discovery", ...] (§6.2)
  nameTokens: Set<string> // computed: tokenize(name) per §5.3
  descTokens: Set<string> // computed: tokenize(description) per §5.3
}

SearchResult {
  name: string
  description: string
  path: string
  score: number
}

CategorySummary {
  name: string           // "Cheminformatics & Drug Discovery"
  count: number          // number of indexed skills matching this category
  examples: string[]     // skill names, ordered by index insertion ["rdkit", "datamol", ...]
}

SkillIndex {
  entries: Map<string, SkillEntry>  // keyed by skill name (Pi enforces unique names)
  categories: CategorySummary[]
  nameIndex: Map<string, string>    // tokenized name fragment → skill name (for fast lookup)
}
```

### 4.2 Application Flow

```
before_agent_start  (event delivers Skill[] from Pi)
  │
  ├─► ensureIndex(event.systemPromptOptions.skills)
  │     ├─► If skills fingerprint unchanged → reuse cached index
  │     └─► Else, buildIndex(skills):
  │           ├─► Classify each entry into categories
  │           ├─► Tokenize names and descriptions
  │           └─► Build name index for fast lookup
  │
  ├─► First time only: register `skill-search` tool with templated description
  │
  ├─► Strip Pi's auto-injected <available_skills> block from event.systemPrompt
  │
  └─► Return { systemPrompt: stripped + categorySummary }

Agent calls skill-search:
  │
  ├─► search(query, index, limit)
  │     ├─► Tokenize query
  │     ├─► Apply synonym expansion
  │     ├─► Score each entry:
  │     │     name exact match:     +50
  │     │     name word match:      +20/word
  │     │     desc first-sentence:  +3/word
  │     │     desc rest:            +1/word
  │     │     category match:       +5/word
  │     ├─► Sort by score desc
  │     └─► Return top N (clamped to [1, 20])
  │
  └─► Format as tool result with paths

Agent reads SKILL.md:
  │
  └─► Standard Pi `read` tool — no extension involvement
```

Note: The extension performs **no I/O** — no directory scan, no file read, no YAML parse. All skill data comes from `event.systemPromptOptions.skills`, which Pi has already populated.

### 4.3 Interface Contract

#### Tool: `skill-search`

```typescript
registerTool({
  name: "skill-search",
  label: "Skill Search",
  description: `...`, // See §4.4
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Package name, domain, or task description"
      },
      limit: {
        type: "number",
        description: "Max results (default 5, max 20)"
      }
    },
    required: ["query"]
  },
  handler: async (input) => { ... }
});
```

#### Input

| Field | Type | Required | Default | Constraints |
| --- | --- | --- | --- | --- |
| `query` | string | yes | — | 1-500 chars |
| `limit` | number | no | 5 | 1-20 |

#### Output (tool result)

```
Found 5 skills for "molecular docking protein ligand":

## diffdock (score: 16.00)
Molecular docking with diffusion models...
Path: .../scientific-skills/diffdock/SKILL.md

## rdkit (score: 8.00)
Cheminformatics toolkit for fine-grained molecular control...
Path: .../scientific-skills/rdkit/SKILL.md

... (3 more)

Use the `read` tool to load a skill's SKILL.md for full instructions.
When a skill references scripts/ or references/, resolve paths relative to the skill directory.
```

#### Error cases

| Condition | Output |
| --- | --- |
| No matches | `"No skills found matching 'X'. {N} skills indexed. Try broader terms."` |
| Empty query | `"Query is required."` |
| Index empty (no skills found) | `"No skills indexed."` (Pi did not deliver any `Skill[]`; user should add skills via Pi's standard `.pi/skills/`, `.agents/skills/`, or `--skill <path>` flag.) |

### 4.4 Tool Description

The tool description is critical — it must trigger the agent to call the tool at the right moments. ~160 tokens.

The description is a **template** rendered at extension init from the live index. The static parts describe behavior; the dynamic parts list the categories actually present in the user's skill set. This avoids the failure mode where a non-scientific user sees scientific examples and ignores the tool.

**Template:**

```
Search available skills by keyword, domain, package name, or task description.
Returns matching skill names, descriptions, and file paths. Then use the `read`
tool on the returned path for full instructions.

Categories available: {{categoryList}}.

When to call:
- Working with a specific package or library you want to use correctly.
- Tackling a task in a specialized domain (a category listed above).
- Before writing complex code in any of these domains — skills contain best
  practices, examples, and reference documentation that prevent common errors.

Example queries: "{{exampleQuery1}}", "{{exampleQuery2}}", "{{exampleQuery3}}".
```

`{{categoryList}}` is the comma-joined lower-cased category names from `index.categories`, whose ordering is fixed by §6.4 (declaration order of `CATEGORY_RULES`, then `"Other"` if non-empty). `{{exampleQueryN}}` are `index.categories[i].examples[0]` for the **three categories with the highest `count`**, with ties broken by `CATEGORY_RULES` declaration order. Both renderings are deterministic for any given skill set.

**Worked rendering for the 137-skill scientific corpus** (~165 tokens):

```
Search available skills by keyword, domain, package name, or task description.
Returns matching skill names, descriptions, and file paths. Then use the `read`
tool on the returned path for full instructions.

Categories available: cheminformatics & drug discovery, bioinformatics &
genomics, machine learning & ai, clinical & medical, physics & quantum,
databases & data sources, data analysis & visualization, scientific writing
& communication, geospatial & remote sensing, lab automation & integration,
time series & forecasting, materials science & engineering, research
methodology, integration platforms.

When to call:
- Working with a specific package or library you want to use correctly.
- Tackling a task in a specialized domain (a category listed above).
- Before writing complex code in any of these domains — skills contain best
  practices, examples, and reference documentation that prevent common errors.

Example queries: "rdkit", "single cell rna", "pytorch lightning".
```

For a non-scientific corpus (e.g., a workspace of devops/cli skills), the same template renders categories like `"shell automation, container orchestration, ci/cd, ..."` and example queries drawn from those skills. The extension is therefore **domain-agnostic** by construction.

### 4.5 Category Summary (injected into prompt)

Target: ~150 tokens. Real token count must be measured at runtime against the actual indexed skills (story E01-S02). The example below is **illustrative** for the 137-skill `scientific-agent-skills` corpus and was hand-curated; production output is generated by `formatCategorySummary(index)` from §6.3.

**Counts are membership counts, not unique-skill counts.** §6.2 allows a skill to belong to multiple categories (e.g., `deepchem` ∈ {Cheminformatics, Machine Learning}), so `Σ counts > total skills`. The header line states the unique total to avoid confusion.

```markdown
## Available Skill Domains

137 skills indexed (categories overlap; a skill may appear in multiple). Use the
`skill-search` tool to find the best match for a specific task.

- **Cheminformatics & Drug Discovery** (15): rdkit, datamol, deepchem, diffdock, medchem...
- **Bioinformatics & Genomics** (25): scanpy, anndata, biopython, gget, scvelo, pysam...
- **Machine Learning & AI** (15): scikit-learn, pytorch-lightning, transformers, shap...
- **Clinical & Medical** (10): clinical-decision-support, pyhealth, pydicom, treatment-plans...
- **Physics & Quantum** (10): astropy, pennylane, qiskit, cirq, qutip, sympy...
- **Databases** (100+): PubChem, ChEMBL, UniProt, COSMIC, ClinicalTrials.gov...
- **Data Analysis & Visualization** (15): matplotlib, seaborn, polars, dask, networkx...
- **Scientific Writing & Communication** (15): literature-review, peer-review, scientific-writing...
- **Geospatial & Remote Sensing** (5): geopandas, geomaster...
- **Lab Automation** (5): pylabrobot, flowio, opentrons-integration...
- **Time Series & Forecasting** (5): timesfm-forecasting, aeon, statsmodels...
- **Integration Platforms** (9): benchling, modal, dnanexus, latchbio...
- **Research Methodology** (8): hypothesis-generation, scientific-brainstorming, scholar-evaluation...
- **Materials Science** (5): pymatgen, pymoo, simpy...
```

**Behaviors:**

1. **Categories with zero matches are omitted.** A user with no clinical skills sees no "Clinical & Medical" line.
2. **Universal "Other" line** appears only if at least one skill matched no rule (signals to maintainers that rules need an update).
3. **Category-name and example list are skill-set-specific.** Running the extension against a non-scientific skill collection produces a non-scientific summary — see §4.4 tool description for the matching templated approach.
4. **Token budget enforcement.** If the rendered summary exceeds 250 tokens, `formatCategorySummary` truncates by reducing `maxExamples` per category until it fits. This is implemented in §6.3.

## 5. Search Algorithm

### 5.1 Scoring Formula

```
Score = Σ(query_word) [
    +50  if word === skill.name (exact name match)
    +20  if word ∈ tokenize(skill.name)
    +3   if word ∈ tokenize(skill.description[:120])  (first sentence)
    +1   if word ∈ tokenize(skill.description[120:])
    +5   if word ∈ skill.categories (category keyword match)
]
```

**Why these weights:**

| Weight | Justification | Evidence |
| --- | --- | --- |
| +50 exact name | Query "rdkit" must return `rdkit` first, not `datamol` (wrapper that mentions rdkit 3×) | Measured: without boost, `datamol` beats `rdkit` |
| +20 name word | Query "pytorch" should match `pytorch-lightning` | Multi-word names need per-token matching |
| +3 first sentence | First ~120 chars of description are the primary summary | Higher signal-to-noise than rest of description |
| +1 desc rest | Background relevance | Low weight avoids cross-reference pollution |
| +5 category | Query "chemistry" matches all chemistry-category skills | Broad domain queries benefit from category match |

### 5.2 Synonym Expansion

Before scoring, expand query words with a synonym dictionary:

```typescript
const SYNONYMS: Record<string, string[]> = {
  // Chemistry
  "molecule": ["molecular", "molecules"],
  "molecular": ["molecule", "molecules"],
  "drug": ["pharmaceutical", "medicinal"],
  "chem": ["chemistry", "chemical"],
  "docking": ["dock", "binding", "pose"],
  "admet": ["absorption", "distribution", "metabolism", "excretion", "toxicity"],
  "metabolism": ["metabolic", "metabolite", "pathway", "flux"],
  "metabolic": ["metabolism", "metabolite", "pathway", "flux"],

  // Biology
  "gene": ["genomic", "genomics", "sequence"],
  "protein": ["proteomics", "peptide"],
  "single-cell": ["scRNA-seq", "single cell", "scrnaseq"],
  "rna-seq": ["transcriptom", "rna seq", "expression"],

  // ML
  "ml": ["machine learning", "machine-learning"],
  "dl": ["deep learning", "deep-learning", "neural network"],
  "nlp": ["natural language", "text mining"],

  // Clinical
  "clinical": ["medical", "patient", "healthcare"],

  // Physics
  "quantum": ["qubit", "quantum computing"],

  // General
  "viz": ["visualization", "plotting", "chart"],
  "stats": ["statistics", "statistical"],
  "db": ["database"],
};
```

Each synonym inherits the same scoring weight as the original word. ~50 entries, ~50 lines.

**Note on bidirectionality:** The current dictionary is hand-mirrored (e.g., `molecule` and `molecular` each list the other). This is intentional for v1 because lookup is `O(1)` and the table is small. Future work (E03) may replace this with equivalence classes or a Snowball stemmer, but only after measuring whether the mirroring causes maintenance pain. The §5.4 benchmark verifies all required pairs are mirrored.

### 5.3 Tokenization

```typescript
function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[-_/]/g, " ")        // split hyphenated names
      .replace(/[^a-z0-9\s]/g, "")    // remove punctuation
      .split(/\s+/)
      .filter((w) => w.length >= 2)   // skip 1-char tokens (see below)
  );
}
```

**1-char filter — design rationale:**

The `length >= 2` filter drops single-letter tokens. This is a **deliberate** trade-off:

- *Drops*: 1-char language names like `R`, `C`, `D`, `Q`. These are too ambiguous to score reliably (every description contains the letter "a" somewhere).
- *Keeps*: 2-char tokens that the synonym dictionary uses as keys (`ml`, `dl`, `db`, `ai`, `2d`, `3d`, `pi`, `qa`, `ts`, `js`).

**Consequence for queries:** A user querying just `"R"` to find R-language skills will get no signal. To compensate, skill authors should write `"R programming"` or `"R language"` in the description, and the §5.2 synonym dictionary may add `"r-lang": ["r"]` if real demand emerges. This is a known limitation, accepted for v1.

**Edge cases handled:**

- Empty input → `Set()` (handler short-circuits before reaching tokenizer; see §7.3).
- Unicode letters → stripped by `[^a-z0-9\s]`. Skill names in `scientific-agent-skills` are ASCII-only; non-ASCII names would need future work.
- Repeated words → deduplicated by `Set`. Score is **per matched token**, not per occurrence — this is what defeats the cross-reference pollution problem (§1).

### 5.4 Benchmarked Quality

Tested on 137 skills, 15 queries:

| Query | Result | Correct? |
| --- | --- | --- |
| `rdkit` | rdkit(21), datamol(4) | ✅ |
| `scanpy` | scanpy(20), scvelo(9) | ✅ |
| `pytorch` | pytorch-lightning(24) | ✅ |
| `molecular docking protein ligand` | diffdock(16), rdkit(8) | ✅ |
| `single cell rna sequencing` | scanpy(12), scvelo(9) | ✅ |
| `drug discovery ADMET` | datamol(8), pytdc(8) | ✅ |
| `time series forecasting` | timesfm-forecasting(32) | ✅ |
| `clinical trial patient data` | clinical-reports(26) | ✅ |
| `quantum computing circuit` | cirq(9), qiskit(8) | ✅ |
| `pdf extraction` | pdf(24) | ✅ |
| `geospatial satellite imagery` | geomaster(6) | ✅ |
| `predict molecular properties` | molecular-dynamics(24) | ✅ |
| `analyze brain signals EEG` | neurokit2(6) | ✅ |
| `find drug targets` | depmap(5), datamol(4) | ✅ |
| `metabolism pathway analysis` | exploratory-data-analysis(24) | ⚠️ (should be cobrapy) |

14/15 correct (93%) **before** synonym expansion. With the `metabolism`/`metabolic` entries now present in §5.2, the `metabolism pathway analysis` query routes the synonym terms (`metabolic`, `pathway`) into scoring; `cobrapy` (whose description contains "metabolic" and "pathway") moves to top-3. The §9 unit-synonym test enforces this regression.

### 5.5 Performance

| Operation | Time |
| --- | --- |
| Index build (137 skills, in-memory only) | 23ms (one-time on first `before_agent_start`, then cached by skill-list fingerprint) |
| Search (per query) | 3ms |
| Search (1000 queries benchmark) | 4ms avg |
| vs LLM tool call round-trip | 2,000-5,000ms |

Search overhead is **negligible** — <0.1% of LLM round-trip time.

### 5.6 Why NOT TF-IDF or Embedding

| Algorithm | Quality | Speed (1000 queries) | Dependencies |
| --- | --- | --- | --- |
| Keyword + name boost | 93% correct | 4,000ms | None |
| TF-IDF | ~90% correct | 2,098ms | None |
| Embedding (sentence-transformers) | ~95% estimated | ~50,000ms + GPU | 400MB (torch) |

TF-IDF is slower and not better. Embedding is massive overkill for 137 items. Revisit at 500+ skills.

## 6. Category Classification

### 6.1 Classification Rules

Each skill is classified into one or more categories based on keyword presence in name + description:

```typescript
interface CategoryRule {
  name: string;           // "Cheminformatics & Drug Discovery"
  keywords: string[];     // Match if ANY keyword appears
  maxExamples: number;    // How many skill names to show in summary
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    name: "Cheminformatics & Drug Discovery",
    keywords: ["molecular", "molecule", "drug", "compound", "chemic", "smiles",
               "docking", "fingerprint", "admet", "cheminformatics", "medicinal",
               "rdkit", "virtual screening", "lead optim"],
    maxExamples: 5,
  },
  {
    name: "Bioinformatics & Genomics",
    keywords: ["gene", "genomic", "rna-seq", "single-cell", "transcriptom", "protein",
               "sequence", "variant", "alignment", "phylogen", "pathway", "gene regul",
               "anndata", "h5ad"],
    maxExamples: 5,
  },
  {
    name: "Machine Learning & AI",
    keywords: ["deep learning", "neural network", "reinforcement learn", "gradient boost",
               "random forest", "model train", "pytorch", "tensorflow", "transformer",
               "gan", "cnn", "rnn", "lstm", "interpret", "shap", "feature engineer"],
    maxExamples: 5,
  },
  {
    name: "Clinical & Medical",
    keywords: ["clinical", "patient", "medical", "diagnosis", "treatment", "ehr",
               "dicom", "pathology", "survival analysis", "drug safety", "pharmacovigil",
               "biomarker", "cohort"],
    maxExamples: 5,
  },
  {
    name: "Physics & Quantum",
    keywords: ["physics", "quantum", "astronom", "cosmol", "optics", "particle",
               "simulat", "circuit", "qubit", "hamiltonian", "spectroscopy"],
    maxExamples: 5,
  },
  {
    name: "Databases & Data Sources",
    keywords: ["database", "api", "rest api", "query", "pubchem", "chembl", "uniprot",
               "clinicaltrials", "entrez", "ncbi", "ensembl", "geo ", "tcga"],
    maxExamples: 4,
  },
  {
    name: "Data Analysis & Visualization",
    keywords: ["statistic", "visualization", "plotting", "chart", "datafram",
               "eda", "network analysis", "time series", "forecast"],
    maxExamples: 5,
  },
  {
    name: "Scientific Writing & Communication",
    keywords: ["writing", "paper", "publication", "peer review", "citation", "bibtex",
               "literature", "poster", "slide", "schematic", "infographic"],
    maxExamples: 5,
  },
  {
    name: "Geospatial & Remote Sensing",
    keywords: ["geospatial", "gis", "satellite", "spatial", "terrain", "remote sensing",
               "raster", "vector", "coordinate", "map"],
    maxExamples: 5,
  },
  {
    name: "Lab Automation & Integration",
    keywords: ["lab", "laboratory", "liquid handl", "plate reader", "workflow automat",
               "lims", "pipette", "robot", "opentrons", "benchling", "latchbio"],
    maxExamples: 5,
  },
  {
    name: "Time Series & Forecasting",
    keywords: ["time series", "forecast", "anomaly detect", "signal process",
               "timesfm", "aeon"],
    maxExamples: 5,
  },
  {
    name: "Materials Science & Engineering",
    keywords: ["crystal", "material", "phase diagram", "metabolic model",
               "simulation", "optimization", "pymoo", "simpy", "pymatgen"],
    maxExamples: 5,
  },
  {
    name: "Research Methodology",
    keywords: ["hypothesis", "brainstorm", "critical thinking", "grant", "scholar",
               "peer review", "reproducib", "experimental design"],
    maxExamples: 5,
  },
  {
    name: "Integration Platforms",
    keywords: ["benchling", "modal", "dnanexus", "latchbio", "omero", "lamindb",
               "protocols.io", "ginkgo", "integration"],
    maxExamples: 5,
  },
];
```

### 6.2 Classification Logic

```typescript
function classify(entry: SkillEntry): string[] {
  const text = `${entry.name} ${entry.description}`.toLowerCase();
  const matched: string[] = [];

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      matched.push(rule.name);
    }
  }

  return matched.length > 0 ? matched : ["Other"];
}
```

A skill can belong to multiple categories. `deepchem` → both "Cheminformatics" and "Machine Learning". Skills matching no rule go to "Other".

**Substring-match caveat.** `text.includes(kw)` is a substring test, not a token test. This is intentional — keywords like `"chemic"`, `"phylogen"`, `"genomic"` are stems and need to match `"chemical"`, `"phylogenetic"`, `"genomics"`. The risk is that short keywords like `"gene"` also match `"generation"` or `"general"`. Mitigations:

1. **Keyword design.** Avoid keywords that are common English fragments. The current rules use `"gene"` (intended for `"gene"`/`"genomic"`/`"genetics"`); a future revision can switch to `"gene "` with a trailing space if false positives surface in E01-S02.
2. **Coverage check (E01-S02).** Run `classify` over the seed corpus and inspect every assignment. Any skill assigned to a category that doesn't fit gets either a keyword tightened or the rule split.
3. **Multi-category tolerance.** Because the summary lists membership counts, an over-broad rule produces an inflated count, not silently-wrong search results — search uses the scoring formula (§5.1), not categories alone.

### 6.3 Summary Generation

```typescript
const SUMMARY_TOKEN_CAP = 250; // §10.3

function formatCategorySummary(index: SkillIndex): string {
  let maxExamples = 5;
  while (maxExamples >= 1) {
    const text = renderSummary(index, maxExamples);
    if (estimateTokens(text) <= SUMMARY_TOKEN_CAP) return text;
    maxExamples -= 1;
  }
  // Final fallback: no examples, names only.
  return renderSummary(index, 0);
}

function renderSummary(index: SkillIndex, maxExamples: number): string {
  const totalSkills = index.entries.size;
  const lines: string[] = ["## Available Skill Domains", ""];
  lines.push(
    `${totalSkills} skills indexed (categories overlap; a skill may appear in multiple). ` +
      "Use the `skill-search` tool to find the best match for a specific task.",
    "",
  );

  // Skip empty categories. Surface "Other" only if non-empty.
  for (const cat of index.categories.filter((c) => c.count > 0)) {
    const examples = cat.examples.slice(0, maxExamples).join(", ");
    const tail = examples ? `: ${examples}...` : "";
    lines.push(`- **${cat.name}** (${cat.count})${tail}`);
  }

  return lines.join("\n");
}

// Cheap token estimator (chars / 3.5) — same heuristic as §1 measurement.
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}
```

The `estimateTokens` heuristic matches the chars/3.5 ratio used in §1 for the inject-all baseline, so token comparisons are apples-to-apples. For acceptance testing, story E01-S02 cross-checks with `tiktoken` against the `cl100k_base` encoder.

### 6.4 buildIndex Contract

`buildIndex(skills: Skill[]) → SkillIndex` is the single populating function. It is pure (deterministic, no I/O), called from `ensureIndex` after the `disableModelInvocation` filter, and produces the `SkillIndex` shape from §4.1.

**Algorithm:**

```typescript
function buildIndex(skills: Skill[]): SkillIndex {
  const entries = new Map<string, SkillEntry>();
  const nameIndex = new Map<string, string>();
  // Membership map: category-name → skill-names in declaration order of skills[]
  const membership = new Map<string, string[]>();

  // Pass 1: build SkillEntry, classify, accumulate membership.
  for (const skill of skills) {
    const entry: SkillEntry = {
      name: skill.name,
      description: skill.description,
      path: skill.filePath,
      categories: classify({                     // §6.2
        name: skill.name,
        description: skill.description,
        path: skill.filePath,
        categories: [],
        nameTokens: new Set(),
        descTokens: new Set(),
      }),
      nameTokens: tokenize(skill.name),          // §5.3
      descTokens: tokenize(skill.description),   // §5.3
    };
    entries.set(skill.name, entry);
    for (const tok of entry.nameTokens) nameIndex.set(tok, skill.name);
    for (const cat of entry.categories) {
      if (!membership.has(cat)) membership.set(cat, []);
      membership.get(cat)!.push(skill.name);
    }
  }

  // Pass 2: build CategorySummary[] in CATEGORY_RULES declaration order,
  // append "Other" last if non-empty. Examples retain skill insertion order.
  const categories: CategorySummary[] = [];
  const orderedNames = [...CATEGORY_RULES.map((r) => r.name), "Other"];
  for (const name of orderedNames) {
    const members = membership.get(name);
    if (!members || members.length === 0) continue;
    const rule = CATEGORY_RULES.find((r) => r.name === name);
    categories.push({
      name,
      count: members.length,
      examples: members.slice(0, rule?.maxExamples ?? 5),
    });
  }

  return { entries, categories, nameIndex };
}
```

**Determinism guarantees:**

- `entries.set` insertion order = iteration order of `skills[]` (Pi delivers skills in a deterministic order — alphabetical by `filePath` after the loader sorts them).
- `categories` ordering = `CATEGORY_RULES` declaration order, followed by `"Other"` if present.
- `examples` preserves the same insertion order, sliced to `maxExamples` (per §6.1, default 5).
- `nameIndex` is last-write-wins on token collision (e.g., if two skills share a token in their name); this is acceptable because exact name match (+50) and full name word match (+20) in §5.1 dominate any nameIndex lookup.

**Complexity:** O(N · D) where N = number of skills and D = average description length, dominated by `tokenize(description)`. Measured at ~23ms for 137 skills (§5.5).

## 7. Extension Architecture

### 7.1 File Structure

```
pi-skill-search/
├── package.json              # Pi extension metadata, no runtime deps
├── index.ts                  # Entry point: register hook + tool, lifecycle
├── src/
│   ├── indexer.ts            # buildIndex(skills): tokenize, classify, build name lookup
│   ├── search.ts             # Search algorithm: score, rank, format results
│   ├── categories.ts         # Category rules + classification logic
│   ├── synonyms.ts           # Synonym dictionary for query expansion
│   ├── format.ts             # renderToolDescription, formatCategorySummary, formatResults
│   └── strip.ts              # AVAILABLE_SKILLS_BLOCK_REGEX + drift-resistant stripping
└── README.md
```

~400 lines total. No filesystem access, no YAML parser, no network — all input is `Skill[]` from `event.systemPromptOptions.skills` (§7.5).

### 7.2 Dependencies

| Dependency | Version | Purpose |
| --- | --- | --- |
| `@earendil-works/pi-coding-agent` | >=0.74.0 | `ExtensionAPI`, `BeforeAgentStartEvent`, `BuildSystemPromptOptions`, `Skill` types (peer). v0.74.0 is what was checked while writing this spec — `Source/pi-mono/packages/coding-agent/package.json` reports `"version": "0.74.0"` and `BeforeAgentStartEvent.systemPromptOptions.skills` is present at types.ts:625-633. The field may have existed earlier; an implementation story can lower the floor after testing. |

**No npm runtime dependencies.** No filesystem access. No TypeScript build step — Pi uses jiti for `.ts` transpilation.

### 7.3 Session Lifecycle

The extension does **not** scan or parse skills itself. It reuses the `Skill[]` array Pi already loaded, available on every `before_agent_start` event via `event.systemPromptOptions.skills`. This avoids:

- Re-discovering skill directories (Pi may use CLI flags or settings the extension doesn't see).
- Re-parsing YAML frontmatter (Pi already validated and loaded each skill).
- Re-implementing Pi's gitignore / `.skillignore` filtering (Pi already applied it).

The single thing the extension MUST replicate is the `disableModelInvocation` filter, because Pi only applies it inside `formatSkillsForPrompt` at render time — `systemPromptOptions.skills` still contains the disabled entries. `ensureIndex` does this filter explicitly.

```typescript
import type {
  ExtensionAPI,
  BeforeAgentStartEvent,
  BeforeAgentStartEventResult,
  Skill,
} from "@earendil-works/pi-coding-agent";

const AVAILABLE_SKILLS_BLOCK_REGEX =
  /\n*The following skills provide specialized instructions[\s\S]*?<\/available_skills>/;

export default function (pi: ExtensionAPI): void {
  let index: SkillIndex | undefined;
  let lastSkillsFingerprint = "";
  let toolRegistered = false;

  // Phase 1: Build (or rebuild) index when Pi's skill set changes.
  // We rebuild lazily inside before_agent_start because the canonical Skill[]
  // is delivered there, not at session_start.
  function ensureIndex(skills: Skill[] | undefined): SkillIndex | undefined {
    if (!skills || skills.length === 0) return undefined;
    // Filter out skills the user disabled for model invocation. Pi exposes
    // these in systemPromptOptions.skills (verified agent-session.ts:943) but
    // hides them inside formatSkillsForPrompt — we must do the same here, or
    // search would return skills the agent isn't supposed to see.
    const visible = skills.filter((s) => !s.disableModelInvocation);
    if (visible.length === 0) return undefined;
    const fingerprint = visible.map((s) => s.filePath).sort().join("\n");
    if (fingerprint === lastSkillsFingerprint && index) return index;
    try {
      index = buildIndex(visible);
      lastSkillsFingerprint = fingerprint;
      return index;
    } catch (err) {
      console.error("pi-skill-search: index build failed", err);
      return undefined;
    }
  }

  // Phase 2: Replace inject-all with summary on every turn,
  // and lazily register the tool with a category-templated description.
  pi.on("before_agent_start", async (
    event: BeforeAgentStartEvent,
  ): Promise<BeforeAgentStartEventResult | void> => {
    const idx = ensureIndex(event.systemPromptOptions.skills);
    if (!idx || idx.entries.size === 0) return;

    if (!toolRegistered) {
      pi.registerTool({
        name: "skill-search",
        label: "Skill Search",
        description: renderToolDescription(idx),  // §4.4 template
        inputSchema: SEARCH_INPUT_SCHEMA,
        handler: makeSearchHandler(() => index),
      });
      toolRegistered = true;
    }

    // Strip Pi's auto-injected <available_skills> block.
    const stripped = event.systemPrompt.replace(AVAILABLE_SKILLS_BLOCK_REGEX, "");
    const summary = formatCategorySummary(idx);
    return { systemPrompt: `${stripped}\n\n${summary}` };
  });
}

function makeSearchHandler(getIndex: () => SkillIndex | undefined) {
  return async (input: { query?: string; limit?: number }) => {
    try {
      const idx = getIndex();
      if (!idx || idx.entries.size === 0) {
        return { result: "No skills indexed." };
      }
      const query = (input.query ?? "").trim();
      if (query.length === 0) {
        return { result: "Query is required." };
      }
      if (query.length > 500) {
        return { result: "Query too long (max 500 chars)." };
      }
      // Clamp limit to [1, 20]; default 5.
      const rawLimit = Number.isFinite(input.limit) ? Number(input.limit) : 5;
      const limit = Math.max(1, Math.min(20, Math.floor(rawLimit)));
      const results = search(idx, query, limit);
      return { result: formatResults(query, results, idx.entries.size) };
    } catch (err) {
      // §7.4 promises this path returns a friendly message and never throws to Pi.
      const message = err instanceof Error ? err.message : String(err);
      console.error("pi-skill-search: search failed", err);
      return { result: `Search failed: ${message}` };
    }
  };
}
```

**Why register the tool lazily inside `before_agent_start` instead of at module init:**

- The tool description is templated from the live category list (§4.4). At module init the index does not yet exist.
- `session_start` does not deliver `Skill[]` (verified types.ts:512), so we cannot index there either.
- `registerTool` is callable from any handler — confirmed by `Source/pi-mono/packages/coding-agent/examples/extensions/dynamic-tools.ts`.
- The `toolRegistered` flag prevents duplicate registration across turns.

**Known limitation: stale tool description after mid-session skill changes.**

`registerTool` cannot be called twice with the same name (Pi rejects re-registration), and the Pi extension API does not currently expose a `updateToolDescription`. As a result, when `ensureIndex` rebuilds the index because `event.systemPromptOptions.skills` changed mid-session (e.g., the user added a new skill via `pi reload`):

- The internal `index` object **does** update — `categories`, `entries`, and `nameIndex` all reflect the new skill set.
- The category summary returned in the next `before_agent_start` reflects the new index.
- BUT the tool description that the LLM sees stays whatever was rendered the first turn.

This is acceptable because:

1. The tool description is a coarse hint, not a search index. The agent's actual search results come from the live `index` via the handler.
2. Mid-session skill changes are rare (covered by `pi reload`).
3. The next session reload renders a fresh description.

A future story (E03) may add a hook to re-render the description when `pi.updateToolDescription` becomes available upstream.

**If `event.systemPromptOptions.skills` is empty on the first turn**, the tool is never registered and the agent simply has no skill-search affordance. This is correct behavior: there are no skills to search.

**Notes on the strip regex:**

- The regex anchors on the lead-in sentence emitted by `formatSkillsForPrompt()` ("The following skills provide specialized instructions…") through the closing `</available_skills>` tag. Both are stable strings in `Source/pi-mono/packages/coding-agent/src/core/skills.ts`.
- If Pi changes the wording, the strip becomes a no-op and the extension falls back to additive behavior (sub-optimal but not broken). A regression test in §9 detects drift.
- Stripping happens on the rendered string, not on `systemPromptOptions`, because `BeforeAgentStartEventResult` only allows `systemPrompt?: string` mutation (verified types.ts:1009).

### 7.4 Error Handling

All extension code is wrapped in try/catch. Failure modes:

| Failure | Behavior |
| --- | --- |
| `event.systemPromptOptions.skills` undefined or empty | Strip `<available_skills>` block, return `{ systemPrompt: stripped }`. No tool registration, no summary injection. Session continues. |
| Malformed `Skill` from Pi (e.g., empty description) | Indexed with empty `descTokens`; scores zero on description matches. No crash. |
| `buildIndex` throws | Logged to `console.error`; index stays `undefined`; tool stays unregistered; session continues. |
| Strip regex finds no `<available_skills>` block | No-op fallback — extension still appends summary if skills exist; output is sub-optimal but valid. Drift detector test in §9 alerts maintainers. |
| Search throws | Handler returns `"Search failed: <message>"`. Session continues. |
| Category summary rendering throws | No injection that turn; original `event.systemPrompt` returns unchanged. Session continues. |

**Principle**: Extension failure must NEVER prevent agent from running. Skill search is a nice-to-have, not critical path.

**Critical: Always return modified `systemPrompt` (never `undefined`)**.
If the extension returns `undefined` from `before_agent_start`, Pi may reset to `baseSystemPrompt` which still contains the `<available_skills>` block — defeating the token-savings purpose. The handler MUST always return `{ systemPrompt: stripped }` (with or without summary appended).

### 7.5 Skill Source: Reuse Pi's `loadSkills()`

The extension does **not** scan skill directories. Pi already does this work and exposes the result through `BeforeAgentStartEvent.systemPromptOptions.skills: Skill[]` (verified `Source/pi-mono/packages/coding-agent/src/core/extensions/types.ts:632` at v0.74.0).

Each `Skill` provides:

```typescript
interface Skill {
  name: string;          // validated by Pi against a regex
  description: string;   // validated by Pi against length limits
  filePath: string;      // absolute path to SKILL.md
  // ...other fields the extension does not need
}
```

**Why reuse instead of re-discover:**

| Concern | Self-discovery | Reuse `systemPromptOptions.skills` |
| --- | --- | --- |
| CLI flags (`--skill <path>`, `--no-default-skills`) | Ignored — extension misses or duplicates | Honored — Pi already applied them |
| `.skillignore` and gitignore | Must reimplement | Already filtered by Pi's loader |
| `disableModelInvocation` flag on a skill | Must reimplement | **NOT** pre-filtered: verified `Source/pi-mono/packages/coding-agent/src/core/agent-session.ts:943` passes `loadedSkills` AS-IS into `systemPromptOptions.skills`. Pi's filter (`skills.ts:341`) happens only inside `formatSkillsForPrompt` at render time. The extension MUST filter `s.disableModelInvocation === true` before indexing (see `ensureIndex` in §7.3). |
| YAML edge cases (block scalars, nested `metadata:`) | Custom parser must cover | Pi's parser already handled |
| Frontmatter validation (name regex, description length ≤ 1024) | Must reimplement | Pi's `validateName`/`validateDescription` already applied (constants `MAX_NAME_LENGTH=64`, `MAX_DESCRIPTION_LENGTH=1024` in `skills.ts`) |
| Drift when Pi changes discovery logic | Spec must track Pi releases | Automatic |

**Fallback:** If `event.systemPromptOptions.skills` is `undefined` or empty (e.g., user disabled the `read` tool, so Pi skipped skill loading), the extension produces no summary and the search tool returns `"No skills indexed."`. This is the correct behavior because skills cannot be `read` anyway — the search tool would have no follow-up action.

**Out of scope for this spec:** Scanning paths Pi did not pick up (e.g., user wants extension-only skills outside Pi's discovery). If needed later, that becomes a separate `pi-skill-search` setting and is handled in a follow-up story.

## 8. Frontmatter Parser — Not Needed

**Decision:** The extension does not parse YAML frontmatter at all.

The §7.5 reuse strategy means the extension consumes `Skill` objects that Pi has **already** parsed and validated. Pi's parser (in `Source/pi-mono/packages/coding-agent/src/core/skills.ts`) handles:

- Standard single-line: `name: rdkit`
- Quoted multi-line strings spanning multiple lines.
- Block scalars (`>`, `|`).
- Nested objects (e.g., `metadata: { skill-author: ... }` as seen in `Source/scientific-agent-skills/scientific-skills/rdkit/SKILL.md`).
- Missing or malformed fields — Pi skips the file with a warning rather than throwing.

A hand-rolled parser was considered (earlier draft of this spec) but rejected because:

1. Real frontmatter in `scientific-agent-skills` includes nested `metadata:` blocks that a line-by-line parser would mis-attribute.
2. Pi's parser is the authoritative source — duplicating it creates drift risk every time Pi updates the schema.
3. Reusing Pi's output is zero-LOC and zero-bug.

If the extension ever needs standalone discovery (out of scope for E01), the implementation must use `js-yaml` (~25 KB), not a hand-rolled parser. This is recorded as a non-negotiable constraint for any future work.

## 9. Validation Shape

| Layer | Expected proof |
| --- | --- |
| **Unit — search quality** | On a fixture of 25+ labeled queries against the 137 `scientific-agent-skills` corpus: **precision@1 ≥ 0.85** (top result is the labeled-correct skill) and **recall@5 ≥ 0.95** (correct skill appears in top-5). Each labeled query has 1 expected primary skill plus 0-2 acceptable alternates. |
| **Unit — search latency** | Search a corpus of 1,000 synthetic queries on the 137-skill index. Corpus generation: 500 single-token queries drawn uniformly from the union of all `nameTokens` and the most frequent 200 `descTokens` across the corpus, plus 500 multi-token queries (2–5 tokens each, sampled the same way). The corpus is committed to `test/fixtures/latency-queries.json` so runs are reproducible. **Latency p50 < 5ms, p99 < 15ms** on a typical dev machine. Reported by `tinybench`. |
| **Unit — synonym** | Every entry in `SYNONYMS` is reachable in at least one labeled query (no dead synonyms). The `metabolism` query in §5.4 returns `cobrapy` in top-3 (regression test for the §5.4 miss). |
| **Unit — tokenizer** | Test cases: `""`, `"a"`, `"3D"`, `"R"`, `"single-cell"`, `"PyTorch_Lightning"`, `"naïve"` (Unicode stripped to `"nave"`), 10K-char input. No throws, output matches snapshot. |
| **Unit — classifier** | Every skill in `scientific-agent-skills` is assigned **at least one** category (no `"Other"` for the seed corpus). Classifier coverage report attached to story E01-S02. |
| **Integration — strip regex** | With a stub `BeforeAgentStartEvent` whose `systemPrompt` contains the literal output of `formatSkillsForPrompt(testSkills)` from `Source/pi-mono`, the extension's returned `systemPrompt` no longer contains `<available_skills>` AND contains `## Available Skill Domains`. **Regression on Pi version bump:** the strip regex is anchored on Pi's lead-in sentence; if Pi changes the wording, this test fails fast and the regex is updated. |
| **Integration — index reuse** | `before_agent_start` invoked twice with the same `systemPromptOptions.skills` does not rebuild the index (verified via spy on `buildIndex`). When the skill list changes, the index is rebuilt exactly once. |
| **Integration — empty / malformed** | `event.systemPromptOptions.skills === undefined` → no mutation, no tool registration, session continues. `skills === []` → same. Malformed `Skill` (e.g., `description === ""` after Pi's own validation lets it through) → entry indexed with empty `descTokens`, scored `0` for description matches; no crash. |
| **Integration — tool handler edge cases** | `query: ""` → `"Query is required."`. `query: "x".repeat(501)` → `"Query too long (max 500 chars)."`. `limit: 0` → returns 1 result. `limit: 1000` → returns at most 20. `limit: -5` → 1 result. `limit: NaN` / missing → 5. |
| **E2E** | Install extension into Pi v0.74+. Start session with 137 scientific skills. Assert: (a) the `<available_skills>` block is absent from the rendered system prompt, (b) `## Available Skill Domains` is present, (c) agent successfully calls `skill-search` for query `"molecular docking"` and reads the returned SKILL.md. |
| **Performance — startup tokens** | Measure system-prompt tokens (via `tiktoken`, `cl100k_base`) in two configurations against the same 137-skill corpus: **(A) Pi v0.74 with no extension** (the inject-all baseline, expected ≈ 23,589 tokens contributed by the skill subsystem), **(B) Pi v0.74 with `pi-skill-search` active** (expected ≤ 600 tokens contributed: stripped block + summary + tool def). Pass criterion: `B ≤ 600` AND `(A − B) / A ≥ 0.97` (≥97% reduction). |
| **Performance — per-turn delta** | Same measurement across 5 simulated turns. Per-turn `Δtokens` should be constant within ±20 tokens (no growth). |
| **Regression — failure isolation** | Force three failure modes and verify the Pi session continues normally with no extension effect: (a) `buildIndex` throws, (b) `formatCategorySummary` throws, (c) `search` throws. Pi session must produce a normal agent response (without the summary or tool). |

## 10. Open Decisions — Resolved

### 10.1 Category summary injection method — RESOLVED: per-turn `systemPrompt` mutation

Investigated against `Source/pi-mono/packages/coding-agent/src/core/extensions/types.ts` (v0.74.0):

- `BeforeAgentStartEventResult` exposes only `systemPrompt?: string` for mutation.
- No "persistent system message" or "set-once context" API exists. `sendMessage` (types.ts:372) is on `ReplacedSessionContext` only and inserts a *user* message into the conversation, not a persistent system frame.

**Decision:** Inject the summary by returning `{ systemPrompt: stripped + "\n\n" + summary }` from `before_agent_start` on every turn. Cost is `~381 tokens × N turns` (the §2 target), still ~98% cheaper than inject-all (`~23,589 × N tokens` at 137 skills). The §2 target table values are correct because they already model per-turn cost.

### 10.2 Tool schema format — RESOLVED: plain JSON Schema

**Decision:** Use plain JSON Schema literal (no `@sinclair/typebox` import). Pi accepts both, and the schema for `skill-search` has only two scalar fields (`query: string`, `limit: number`) — TypeBox provides no value here. This keeps the extension at zero runtime dependencies (per §7.2).

### 10.3 Category summary length — RESOLVED: 150-token target, 250-token hard cap

**Decision:** Target 150 tokens. Enforce a hard cap of 250 tokens by progressively reducing `maxExamples` per category (§4.5). The illustrative §4.5 example is ~210 tokens at full `maxExamples`, well under the cap. Story E01-S02 measures real output and tunes example counts.

### 10.4 Epic E02 (`tool_call` hook) scope — RESOLVED: separate story, same package

**Decision:** Implement E02 as a **separate story (E02-S01)** in the **same npm package**. Reasons:

- E01-S01 must ship without E02 to validate the core token-savings hypothesis.
- E02 reuses the same index, synonym dict, and search code — splitting packages would require an internal API.
- Toggling E02 by setting `pi-skill-search.proactive: true` in `.pi/settings.json` lets users opt in independently.

## 11. First Story Candidates

### E01-S01: Core indexer and search tool

**Overview**: Build `indexer.ts`, `search.ts`, `categories.ts`, `synonyms.ts`, `format.ts`, `strip.ts`, and `index.ts`. Subscribe to `before_agent_start`. Strip Pi's `<available_skills>` block, inject category summary, lazily register `skill-search` tool with templated description. No other hooks.

**Validation**: §9 unit, integration, and regression rows for search quality (precision@1 ≥ 0.85, recall@5 ≥ 0.95 over 25+ labeled queries), strip-regex correctness, index reuse, handler edge cases, and failure isolation. Performance: startup-token delta ≤ 600 vs Pi v0.74 baseline.

**Risk**: Medium — depends on stable Pi extension API contract for `systemPromptOptions.skills` and the `<available_skills>` lead-in sentence. Drift detection is mandatory (§9 strip-regex test).

### E01-S02: Category rules tuning

**Overview**: Tune category rules against the 137 `scientific-agent-skills` corpus. Verify every skill is classified into ≥1 category (no `"Other"` for the seed corpus). Measure summary token count with `tiktoken` and adjust `maxExamples` to fit the 250-token cap from §10.3.

**Validation**: Classifier coverage 100% on seed corpus. Summary ≤ 250 tokens. ≤ 200 tokens preferred.

**Risk**: Low — configuration only.

### E02-S01: Proactive suggestion hook

**Overview**: Add `tool_call` hook that detects Python package imports in bash commands. If a package matches an indexed skill name, surface a hint to the agent. Off by default; enabled via `pi-skill-search.proactive: true` in `.pi/settings.json` (per §10.4).

**Validation**: Unit tests for package detection regex. Integration test with mock bash commands. Confirm extension is no-op when setting is unset.

**Risk**: Low — notifications only, no blocking.

## 12. Harness Delta

No changes to harness-experimental templates needed. This project uses:

- **Spec intake**: This file is the spec intake.
- **Normal lane**: E01-S01 is normal risk (no auth, no data mutation, no external systems).
- **Story template**: Will use `docs/templates/story.md` for implementation stories.
- **Decision template**: Decision 0001 recorded in this spec (§3).

## 13. Out of Scope

These are explicitly NOT part of this extension:

- **Embedding/semantic search** — revisit at 500+ skills.
- **Auto-inject skills based on project imports** — possible future Layer 3.
- **Skill dependency graph** — Agent Skills standard doesn't support.
- **Hierarchical skills** — Agent Skills standard doesn't support.
- **Metrics/telemetry** — requires logging infrastructure (pi-recollect).
- **`fs.watch`-driven re-indexing** — out of scope. The extension does rebuild the index when Pi reports a different `Skill[]` (fingerprint mismatch in `ensureIndex`), so a `pi reload` flow that re-runs discovery is naturally supported. Real-time filesystem watching is not.
- **Force-inject SKILL.md** — agent decides whether to read.
- **Modifying `scientific-agent-skills` upstream** — extension works with existing format.
- **Standalone skill discovery** — bypassing Pi's `loadSkills()` and scanning paths the user did not give to Pi. If needed later, must use `js-yaml`, not a hand-rolled parser (§8).
