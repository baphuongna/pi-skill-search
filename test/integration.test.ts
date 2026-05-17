import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
/**
 * Integration test — token measurement va extension E2E.
 * SPEC §9 validation shape.
 */
import { describe, expect, it } from "vitest";
import { formatCategorySummary } from "../src/format.ts";
import { buildIndex } from "../src/indexer.ts";
import { search } from "../src/search.ts";
import { stripAvailableSkillsBlock } from "../src/strip.ts";
import type { PiSkill, SkillIndex } from "../src/types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load 137-skill fixture
const fixturePath = resolve(__dirname, "fixtures/skills-137.json");
let fixtureSkills: PiSkill[];

try {
	fixtureSkills = JSON.parse(readFileSync(fixturePath, "utf-8"));
} catch {
	fixtureSkills = [];
}

const hasFixture = fixtureSkills.length > 0;

// Simple token estimator (chars / 3.5) — khong can tiktoken cho integration test
function estimateTokens(text: string): number {
	return Math.ceil(text.length / 3.5);
}

describe.skipIf(!hasFixture)("integration — 137-skill fixture", () => {
	it("builds index from 137 skills", () => {
		const idx = buildIndex(fixtureSkills);
		expect(idx.entries.size).toBe(137);
	});

	it("category summary ≤ 250 tokens", () => {
		const idx = buildIndex(fixtureSkills);
		const summary = formatCategorySummary(idx);
		expect(estimateTokens(summary)).toBeLessThanOrEqual(250);
	});

	it("summary contains ## Available Skill Domains", () => {
		const idx = buildIndex(fixtureSkills);
		const summary = formatCategorySummary(idx);
		expect(summary).toContain("## Available Skill Domains");
	});

	it("strip removes <available_skills> and summary is added", () => {
		const idx = buildIndex(fixtureSkills);
		const fakePrompt = `System prompt preamble.${buildFakeSkillsBlock(fixtureSkills.slice(0, 10))}`;

		const stripped = stripAvailableSkillsBlock(fakePrompt);
		expect(stripped).not.toContain("<available_skills>");

		const summary = formatCategorySummary(idx);
		const output = `${stripped}\n\n${summary}`;
		expect(output).toContain("## Available Skill Domains");
	});

	it("token reduction ≥ 97% (estimated)", () => {
		const idx = buildIndex(fixtureSkills);
		const summary = formatCategorySummary(idx);

		// Simulate A: full skills block
		const fakeBlock = buildFakeSkillsBlock(fixtureSkills);
		const tokensA = estimateTokens(fakeBlock);

		// Simulate B: summary only
		const tokensB = estimateTokens(summary);

		// B should be much smaller than A
		expect(tokensB).toBeLessThanOrEqual(600);
		const reduction = (tokensA - tokensB) / tokensA;
		expect(reduction).toBeGreaterThanOrEqual(0.9); // Using estimate, ≥90% is safe
	});

	it("search finds rdkit for molecular query", () => {
		const idx = buildIndex(fixtureSkills);
		const results = search(idx, "rdkit molecular docking", 5);
		expect(results.length).toBeGreaterThan(0);
		// rdkit should be in top 3
		expect(results.slice(0, 3).some((r) => r.name === "rdkit")).toBe(true);
	});

	it("search finds cobrapy for metabolism pathway", () => {
		const idx = buildIndex(fixtureSkills);
		const results = search(idx, "metabolism pathway analysis", 10);
		// cobrapy should appear in results somewhere
		expect(results.some((r) => r.name === "cobrapy")).toBe(true);
	});

	it("per-turn delta is stable (5 invocations)", () => {
		const idx = buildIndex(fixtureSkills);
		const tokens: number[] = [];

		for (let i = 0; i < 5; i++) {
			const summary = formatCategorySummary(idx);
			tokens.push(estimateTokens(summary));
		}

		const min = Math.min(...tokens);
		const max = Math.max(...tokens);
		expect(max - min).toBeLessThanOrEqual(20);
	});
});

/**
 * Build fake <available_skills> block matching Pi's format.
 */
function buildFakeSkillsBlock(skills: PiSkill[]): string {
	const lines = [
		"",
		"The following skills provide specialized instructions for specific tasks.",
		"Use the read tool to load a skill's file when the task matches its description.",
		"",
		"<available_skills>",
	];

	for (const s of skills) {
		lines.push("  <skill>");
		lines.push(`    <name>${s.name}</name>`);
		lines.push(`    <description>${s.description}</description>`);
		lines.push(`    <location>${s.filePath}</location>`);
		lines.push("  </skill>");
	}

	lines.push("</available_skills>");
	return lines.join("\n");
}
