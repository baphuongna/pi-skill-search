/**
 * Fixture generator — doc YAML frontmatter tu scientific-agent-skills
 * va serialize thanh JSON cho test fixtures.
 *
 * Usage: npx tsx scripts/build-skills-fixture.ts
 * Output: test/fixtures/skills-137.json
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as yaml from "js-yaml";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const SKILLS_DIR = path.resolve(__dirname, "../../Source/scientific-agent-skills/scientific-skills");

interface ParsedSkill {
	name: string;
	description: string;
	filePath: string;
	disableModelInvocation: boolean;
}

function parseFrontmatter(content: string): { name: string; description: string } | null {
	const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
	if (!match) return null;

	const frontmatter = match[1];

	// Extract name va description bang regex thay vi yaml.load
	// de tranh YAML parse errors tu colons trong description
	const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
	const descMatch = frontmatter.match(/^description:\s*([\s\S]*?)(?=\n\w+:|\n$)/m);

	if (!nameMatch) return null;

	let description = "";
	if (descMatch) {
		// Clean up — co the la multi-line
		description = descMatch[1].trim();
	} else {
		// Fallback: lay toan bo dong sau 'description:' cho den khi gap key moi
		const lines = frontmatter.split("\n");
		let inDesc = false;
		const descParts: string[] = [];
		for (const line of lines) {
			if (line.startsWith("description:")) {
				inDesc = true;
				descParts.push(line.slice("description:".length).trim());
			} else if (inDesc) {
				if (line.match(/^\w+:/) && !line.startsWith(" ")) {
					break;
				}
				descParts.push(line.trim());
			}
		}
		description = descParts.join(" ");
	}

	return {
		name: nameMatch[1].trim(),
		description,
	};
}

function main(): void {
	if (!fs.existsSync(SKILLS_DIR)) {
		console.error(`Skills directory not found: ${SKILLS_DIR}`);
		console.error("Make sure Source/scientific-agent-skills is checked out.");
		process.exit(1);
	}

	const skills: ParsedSkill[] = [];
	const dirs = fs.readdirSync(SKILLS_DIR);

	for (const dir of dirs) {
		const skillPath = path.join(SKILLS_DIR, dir, "SKILL.md");
		if (!fs.existsSync(skillPath)) continue;

		const content = fs.readFileSync(skillPath, "utf-8");
		const parsed = parseFrontmatter(content);
		if (!parsed) continue;

		const name = parsed.name ?? dir;
		const description = parsed.description ?? "";

		skills.push({
			name,
			description,
			filePath: skillPath.replace(/\\/g, "/"),
			disableModelInvocation: false,
		});
	}

	console.log(`Parsed ${skills.length} skills`);

	const outPath = path.resolve(__dirname, "../test/fixtures/skills-137.json");
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, JSON.stringify(skills, null, "\t"));
	console.log(`Written to ${outPath}`);
}

main();
