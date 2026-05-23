/**
 * pi-skill-search — Extension entry point.
 * Implement theo SPEC §7.3, §7.4.
 *
 * Thay the Pi's inject-all pattern bang on-demand search tool + category summary.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { formatCategorySummary, formatResults, renderToolDescription } from "./src/format.ts";
import { buildIndex, fingerprintSkills } from "./src/indexer.ts";
import { resolveExtensionRoot, scanSkillDirectory } from "./src/scanner.ts";
import { search } from "./src/search.ts";
import { stripAvailableSkillsBlock } from "./src/strip.ts";
import type {
	BeforeAgentStartEvent,
	BeforeAgentStartEventResult,
	ExtensionAPI,
	PiSkill,
	SkillIndex,
} from "./src/types.ts";
/** JSON Schema cho skill-search tool parameters */
const SEARCH_PARAMETERS = {
	type: "object" as const,
	properties: {
		query: { type: "string" as const, description: "Search query — 1 to 500 characters" },
		limit: { type: "number" as const, description: "Max results (1-20, default 5)" },
	},
	required: ["query"],
	additionalProperties: false,
};
/** path.join wrapper */
const pathJoin = path.join;

/**
 * Merge Pi skills + sample skills. Dedupe by name — sample skills win ties.
 */
function mergeSkills(piSkills: PiSkill[], sampleSkills: PiSkill[]): PiSkill[] {
	if (sampleSkills.length === 0) return piSkills;
	if (piSkills.length === 0) return sampleSkills;
	const byName = new Map<string, PiSkill>();
	for (const s of piSkills) byName.set(s.name, s);
	for (const s of sampleSkills) byName.set(s.name, s); // sample overwrites
	return [...byName.values()];
}

export default function (pi: ExtensionAPI): void {
	let index: SkillIndex | undefined;
	let lastSkillsFingerprint = "";
	let toolRegistered = false;
	let skillSetupDone = false;

	/**
	 * Auto-setup: copy skill-search to ~/.pi/agent/skills/ if not exists.
	 * Runs once at first before_agent_start event.
	 */
	function ensureSkillSearchInstalled(): void {
		if (skillSetupDone) return;
		skillSetupDone = true;

		const home = os.homedir();
		const destDir = path.join(home, ".pi", "agent", "skills", "skill-search");
		const destFile = path.join(destDir, "SKILL.md");

		// Already installed?
		if (fs.existsSync(destFile)) {
			console.log("pi-skill-search: skill-search already installed");
			return;
		}

		// Find source SKILL.md in extension data/
		const extRoot = resolveExtensionRoot();
		const sourceFile = pathJoin(extRoot, "data", "skill-search", "SKILL.md");

		if (!fs.existsSync(sourceFile)) {
			console.error("pi-skill-search: skill-search/SKILL.md not found in data/");
			return;
		}

		try {
			fs.mkdirSync(destDir, { recursive: true });
			fs.copyFileSync(sourceFile, destFile);
			console.log(`pi-skill-search: installed skill-search to ${destFile}`);
		} catch (err) {
			console.error("pi-skill-search: failed to install skill-search", err);
		}
	}

	// Scan data/ directory — bộ skill chính thức do pi-skill-search quản lý
	const extensionRoot = resolveExtensionRoot();
	const dataDir = pathJoin(extensionRoot, "data");
	const bundledSkills = scanSkillDirectory(dataDir);
	if (bundledSkills.length > 0) {
		console.log(`pi-skill-search: loaded ${bundledSkills.length} bundled skills from ${dataDir}`);
	}
	/**
	 * Build (hoac rebuild) index.
	 * Merge Pi's visible skills + bundled skills/ (dedupe by name, bundled wins).
	 * Bundled skills chi duoc load khi co it nhat 1 Pi skill visible
	 * (khong tao index khi Pi khong co skills nao).
	 * Fingerprint short-circuit de tranh rebuild khong can thiet.
	 */
	function ensureIndex(skills: PiSkill[] | undefined): SkillIndex | undefined {
		const piVisible = (skills ?? []).filter((s) => !s.disableModelInvocation);
		// Chi merge sample skills khi co it nhat 1 Pi skill visible
		const merged = piVisible.length > 0 ? mergeSkills(piVisible, bundledSkills) : bundledSkills;
		if (merged.length === 0) return undefined;
		const fingerprint = fingerprintSkills(merged);
		if (fingerprint === lastSkillsFingerprint && index) return index;
		try {
			index = buildIndex(merged);
			lastSkillsFingerprint = fingerprint;
			return index;
		} catch (err) {
			console.error("pi-skill-search: index build failed", err);
			return undefined;
		}
	}
	/**
	 * before_agent_start handler:
	 * - Auto-setup skill-search (first time only)
	 * - Build/rebuild index
	 * - Register skill-search tool (first time only)
	 * - Strip <available_skills> block (ALWAYS — prevent Pi reset)
	 * - Inject category summary (when skills exist)
	 */
	pi.on("before_agent_start", async (event: BeforeAgentStartEvent): Promise<BeforeAgentStartEventResult> => {
		// Auto-setup skill-search on first activation
		ensureSkillSearchInstalled();

		const skills = event.systemPromptOptions?.skills as PiSkill[] | undefined;
		const idx = ensureIndex(skills);

		// ALWAYS strip — if extension returns undefined, Pi resets to
		// baseSystemPrompt which still contains <available_skills> block.
		const stripped = stripAvailableSkillsBlock(event.systemPrompt);

		if (!idx || idx.entries.size === 0) {
			// No skills → strip block nhung khong inject summary
			return { systemPrompt: stripped };
		}

		// Dang ky tool lan dau tien
		if (!toolRegistered) {
			pi.registerTool({
				name: "skill-search",
				label: "Skill Search",
				description: renderToolDescription(idx),
				parameters: SEARCH_PARAMETERS,
				async execute(
					_toolCallId: string,
					input: { query?: string; limit?: number },
					_signal: AbortSignal | undefined,
					_onUpdate: unknown,
					_ctx: unknown,
				) {
					return makeSearchResult(() => index, input);
				},
			});
			toolRegistered = true;
		}

		// Inject category summary
		const summary = formatCategorySummary(idx);
		return { systemPrompt: `${stripped}\n\n${summary}` };
	});
}
/**
 * Xu ly search request voi validation va error handling.
 * Tra ve AgentToolResult format.
 */
function makeSearchResult(
	getIndex: () => SkillIndex | undefined,
	input: { query?: string; limit?: number },
): { content: Array<{ type: "text"; text: string }>; details: Record<string, unknown> } {
	try {
		const idx = getIndex();
		if (!idx || idx.entries.size === 0) {
			return { content: [{ type: "text", text: "No skills indexed." }], details: {} };
		}

		const query = (input.query ?? "").trim();
		if (query.length === 0) {
			return { content: [{ type: "text", text: "Query is required." }], details: {} };
		}
		if (query.length > 500) {
			return { content: [{ type: "text", text: "Query too long (max 500 chars)." }], details: {} };
		}

		// Clamp limit to [1, 20]; default 5
		const rawLimit = input.limit != null && Number.isFinite(input.limit) ? input.limit : 5;
		const limit = Math.max(1, Math.min(20, Math.floor(rawLimit)));

		const results = search(idx, query, limit);
		const text = formatResults(query, results, idx.entries.size);

		return {
			content: [{ type: "text", text }],
			details: { query, resultCount: results.length },
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("pi-skill-search: search failed", err);
		return { content: [{ type: "text", text: `Search failed: ${message}` }], details: {} };
	}
}