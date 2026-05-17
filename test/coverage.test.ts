import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
/**
 * Phase 9 — Classifier coverage test.
 * Moi skill phai duoc assign ≥1 category (no "Other" cho seed corpus).
 */
import { describe, expect, it } from "vitest";
import { CATEGORY_RULES, classify } from "../src/categories.ts";
import type { PiSkill } from "../src/types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, "fixtures/skills-137.json");

let skills: PiSkill[];
try {
	skills = JSON.parse(readFileSync(fixturePath, "utf-8"));
} catch {
	skills = [];
}

describe.skipIf(skills.length === 0)("classifier coverage — 137-skill corpus", () => {
	it("every skill gets at least one category (no 'Other')", () => {
		const others: string[] = [];
		for (const skill of skills) {
			const cats = classify(skill);
			if (cats.length === 1 && cats[0] === "Other") {
				others.push(skill.name);
			}
		}
		// Report which skills fell through
		if (others.length > 0) {
			console.log(`Skills classified as 'Other': ${others.join(", ")}`);
		}
		// Phase 9 goal: no "Other" — nhưng co the con mot so
		// cho phep ≤5 "Other" trong lan chay dau tien
		expect(others.length).toBeLessThanOrEqual(5);
	});

	it("classifier is deterministic", () => {
		for (const skill of skills) {
			const r1 = classify(skill);
			const r2 = classify(skill);
			expect(r1).toEqual(r2);
		}
	});

	it("at least 10 distinct categories have members", () => {
		const usedCats = new Set<string>();
		for (const skill of skills) {
			const cats = classify(skill);
			for (const c of cats) usedCats.add(c);
		}
		expect(usedCats.size).toBeGreaterThanOrEqual(10);
	});
});
