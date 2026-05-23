/**
 * Custom directory scanner — doc skills tu corpus data.
 *
 * pi-skill-search scan thu muc `data/` trong extension root.
 * Thu muc nay KHONG chua `.md` files truc tiep ma chua subdirectories
 * voi SKILL.md ben trong, nhung Pi chi quet files ket thuc bang `.md`,
 * nen subdirectories nay se KHONG bi Pi discover nhu skills.
 *
 * Noi cach khac:
 * - Pi quet: `<path>/*.md` hoac `<path>/<name>/SKILL.md`
 * - pi-skill-search scan: `<path>/<name>/SKILL.md` (voi path la `data/`)
 * - Ket qua: Pi khong quet `data/` vi no khong phai la skill directory
 */
import * as fs from "node:fs";
import * as path from "node:path";
import type { PiSkill } from "./types.ts";

/**
 * Parse YAML frontmatter tu SKILL.md content.
 * Chi extract `name` va `description` — cac fields khac bo qua.
 */
export function parseFrontmatter(content: string): { name: string; description: string } | null {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return null;
	const fm = match[1];
	let name = "";
	let description = "";
	for (const line of fm.split(/\r?\n/)) {
		const nameMatch = line.match(/^name:\s*(.+)$/);
		if (nameMatch) name = nameMatch[1].trim();
		const descMatch = line.match(/^description:\s*(.+)$/);
		if (descMatch) description = descMatch[1].trim();
	}
	if (!name) return null;
	return { name, description };
}

/**
 * Scan mot thu muc de tim tat ca SKILL.md.
 * Moi subdirectory chua SKILL.md la mot skill.
 */
export function scanSkillDirectory(dir: string): PiSkill[] {
	if (!fs.existsSync(dir)) return [];

	const skills: PiSkill[] = [];

	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			const skillFile = path.join(dir, entry.name, "SKILL.md");
			if (!fs.existsSync(skillFile)) continue;

			try {
				const content = fs.readFileSync(skillFile, "utf-8");
				const parsed = parseFrontmatter(content);
				if (!parsed) continue;

				skills.push({
					name: parsed.name,
					description: parsed.description,
					filePath: skillFile,
					disableModelInvocation: false,
				});
			} catch {
				// Skip unreadable files
			}
		}
	} catch {
		// Directory unreadable
	}

	return skills;
}

/**
 * Find corpus data directory (data/).
 * Thu tu tim kiem:
 * 1. <ext-root>/data/           (local development)
 * 2. <ext-root>/../data/        (when installed, corpus in sibling dir)
 * 3. <global-npm>/pi-skill-search/data/ (global install + sibling data)
 */
export function findCorpusPath(): string | undefined {
	const thisFile = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
	const extRoot = path.basename(thisFile) === "src" ? path.dirname(thisFile) : thisFile;

	// 1. Check ext-root/data/
	const extDataPath = path.join(extRoot, "data");
	if (fs.existsSync(extDataPath)) {
		return extDataPath;
	}

	// 2. Check sibling directory (for when data is in separate package)
	// e.g., node_modules/pi-skill-search/ and node_modules/pss-corpus/data/
	const nodeModulesMatch = extRoot.match(/(.+\/node_modules)\/[^/]+$/);
	if (nodeModulesMatch) {
		// Try common corpus package names
		for (const pkgName of ["pss-corpus", "pss-data", "pi-skill-corpus"]) {
			const siblingPath = path.join(nodeModulesMatch[1], pkgName, "data");
			if (fs.existsSync(siblingPath)) {
				return siblingPath;
			}
		}
	}

	// 3. Try global npm root
	try {
		const { execSync } = require("node:child_process");
		const globalRoot = execSync("npm root -g", { encoding: "utf-8" }).trim();
		for (const pkgName of ["pi-skill-search", "pss-corpus", "pss-data"]) {
			const globalPath = path.join(globalRoot, pkgName, "data");
			if (fs.existsSync(globalPath)) {
				return globalPath;
			}
		}
	} catch {
		// npm root -g failed
	}

	return undefined;
}

/**
 * Resolve extension root — thu muc chua index.ts cua extension.
 */
export function resolveExtensionRoot(): string {
	const thisFile = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
	return path.basename(thisFile) === "src" ? path.dirname(thisFile) : thisFile;
}
