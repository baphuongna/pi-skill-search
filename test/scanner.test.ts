import { describe, expect, it } from "vitest";
import { parseFrontmatter, resolveExtensionRoot, scanSkillDirectory } from "../src/scanner.ts";

describe("scanSkillDirectory", () => {
	it("scans data/ and finds bundled skills", () => {
		const root = resolveExtensionRoot();
		const dir = `${root}/data`;
		const skills = scanSkillDirectory(dir);

		expect(skills.length).toBeGreaterThanOrEqual(200);
		expect(skills.length).toBeLessThanOrEqual(300);

		// Every skill has required fields
		for (const s of skills) {
			expect(s.name).toBeTruthy();
			expect(s.description.length).toBeGreaterThan(20);
			expect(s.filePath).toContain("SKILL.md");
			expect(s.disableModelInvocation).toBe(false);
		}
	});

	it("finds rdkit skill with correct name", () => {
		const root = resolveExtensionRoot();
		const skills = scanSkillDirectory(`${root}/data`);
		const rdkit = skills.find((s) => s.name === "rdkit");
		expect(rdkit).toBeDefined();
		expect(rdkit?.description).toContain("molecular");
	});

	it("returns empty for non-existent directory", () => {
		const skills = scanSkillDirectory("/nonexistent/path");
		expect(skills).toEqual([]);
	});

	it("skips directories without SKILL.md", () => {
		const root = resolveExtensionRoot();
		// Point to src/ — has .ts files but no SKILL.md subdirs
		const skills = scanSkillDirectory(`${root}/src`);
		expect(skills).toEqual([]);
	});
});

describe("parseFrontmatter", () => {
	it("extracts name and description", () => {
		const content = `---
name: my-skill
description: A great skill for testing.
---
# my-skill
Body here.`;
		const result = parseFrontmatter(content);
		expect(result).toEqual({
			name: "my-skill",
			description: "A great skill for testing.",
		});
	});

	it("returns null when name is missing", () => {
		const content = `---
description: No name skill.
---`;
		const result = parseFrontmatter(content);
		expect(result).toBeNull();
	});

	it("returns null for no frontmatter", () => {
		const result = parseFrontmatter("# Just a heading\nNo frontmatter.");
		expect(result).toBeNull();
	});
});
