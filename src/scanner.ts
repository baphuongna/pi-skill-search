/**
 * Custom directory scanner — doc skills tu thu muc chinh thuc
 * do pi-skill-search quan ly, doc lap voi Pi's skill discovery.
 *
 * Scan `skills/` trong extension root, parse SKILL.md frontmatter,
 * tra ve PiSkill[] de extension index.
 * Pi KHONG quet thu muc nay khi khoi dong — extension tu scan.
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
 * Resolve extension root — thu muc chua index.ts cua extension.
 * Jiti/TS loader suong __dirname tu import.meta.
 */
export function resolveExtensionRoot(): string {
	const thisFile = path.dirname(
		new URL(import.meta.url).pathname
			// Windows: strip leading / from file:///C:/...
			.replace(/^\/([A-Z]:)/, "$1"),
	);
	// thisFile = <root>/src khi chay tu src, hoac <root> khi chay tu index.ts
	// Check: neu thisFile ten la "src" thi len 1 level
	if (path.basename(thisFile) === "src") return path.dirname(thisFile);
	return thisFile;
}
