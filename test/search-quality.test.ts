/**
 * Search quality smoke test — vitest-based.
 */
import { describe, expect, it } from "vitest";
import { buildIndex } from "../src/indexer.ts";
import { resolveExtensionRoot, scanSkillDirectory } from "../src/scanner.ts";
import { search } from "../src/search.ts";

const root = resolveExtensionRoot();
const allSkills = scanSkillDirectory(`${root}/data`);
const index = buildIndex(allSkills);

const cases: Array<{ query: string; expectContains: string }> = [
	// Chemistry
	{ query: "molecular docking", expectContains: "diffdock" },
	{ query: "chemical structure SMILES", expectContains: "rdkit" },
	// Biology
	{ query: "DNA sequences bioinformatics", expectContains: "biopython" },
	{ query: "single cell RNA analysis", expectContains: "scanpy" },
	// ML
	{ query: "pytorch neural network training", expectContains: "pytorch" },
	{ query: "build a neural network", expectContains: "pytorch" },
	// Tools
	{ query: "convert PDF to markdown", expectContains: "markitdown" },
	// Lab
	{ query: "opentrons liquid handling robot", expectContains: "opentrons-integration" },
	// Agent workflow
	{ query: "delegation patterns for agents", expectContains: "delegation-patterns" },
	// VETC
	{ query: "VETC security OWASP scan", expectContains: "vetc-security" },
];

describe("search quality — real corpus", () => {
	for (const c of cases) {
		it(`${c.query} → top 5 includes ${c.expectContains}`, () => {
			const results = search(index, c.query, 5);
			const names = results.map((r) => r.name);
			expect(names).toContain(c.expectContains);
		});
	}
});
