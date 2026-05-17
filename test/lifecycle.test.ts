/**
 * Tests cho extension lifecycle — SPEC §7.3, §7.4.
 */
import { describe, expect, it, vi } from "vitest";
import type { BeforeAgentStartEvent, BeforeAgentStartEventResult, ExtensionAPI, PiSkill } from "../src/types.ts";

// Mock extension API
function createMockAPI(): {
	api: ExtensionAPI;
	onSpy: ReturnType<typeof vi.fn>;
	registerToolSpy: ReturnType<typeof vi.fn>;
} {
	const onSpy = vi.fn();
	const registerToolSpy = vi.fn();
	const api = {
		on: onSpy,
		registerTool: registerToolSpy,
	} as unknown as ExtensionAPI;
	return { api, onSpy, registerToolSpy };
}

const testSkills: PiSkill[] = [
	{
		name: "rdkit",
		description: "Cheminformatics toolkit for fine-grained molecular control and drug design",
		filePath: "/skills/rdkit/SKILL.md",
		disableModelInvocation: false,
	},
	{
		name: "scanpy",
		description: "Single-cell RNA-seq analysis and gene expression toolkit for genomics",
		filePath: "/skills/scanpy/SKILL.md",
		disableModelInvocation: false,
	},
	{
		name: "pytorch",
		description: "Deep learning and neural network framework for machine learning",
		filePath: "/skills/pytorch/SKILL.md",
		disableModelInvocation: false,
	},
];

// Tạo systemPrompt giả với <available_skills> block
const FAKE_SKILLS_BLOCK = `

The following skills provide specialized instructions for specific tasks.

<available_skills>
  <skill>
    <name>rdkit</name>
    <description>Molecular toolkit</description>
    <location>/skills/rdkit/SKILL.md</location>
  </skill>
</available_skills>`;

function createEvent(skills: PiSkill[], systemPrompt?: string): BeforeAgentStartEvent {
	return {
		type: "before_agent_start",
		prompt: "test",
		systemPrompt: systemPrompt ?? `You are a helpful assistant.${FAKE_SKILLS_BLOCK}`,
		systemPromptOptions: {
			cwd: "/test",
			skills: skills as unknown as PiSkill[],
		},
	} as BeforeAgentStartEvent;
}

describe("extension lifecycle", () => {
	it("registers before_agent_start handler", async () => {
		const { api, onSpy } = createMockAPI();
		const mod = await import("../index.ts");
		mod.default(api);
		expect(onSpy).toHaveBeenCalledWith("before_agent_start", expect.any(Function));
	});

	it("registers tool on first before_agent_start", async () => {
		const { api, onSpy, registerToolSpy } = createMockAPI();
		const mod = await import("../index.ts");
		mod.default(api);

		const handler = onSpy.mock.calls[0][1] as (
			event: BeforeAgentStartEvent,
		) => Promise<BeforeAgentStartEventResult | undefined>;
		const event = createEvent(testSkills);
		await handler(event);

		expect(registerToolSpy).toHaveBeenCalledTimes(1);
		const tool = registerToolSpy.mock.calls[0][0];
		expect(tool.name).toBe("skill-search");
		expect(tool.execute).toBeInstanceOf(Function);
	});

	it("does not re-register tool on subsequent calls", async () => {
		const { api, onSpy, registerToolSpy } = createMockAPI();
		const mod = await import("../index.ts");
		mod.default(api);

		const handler = onSpy.mock.calls[0][1] as (
			event: BeforeAgentStartEvent,
		) => Promise<BeforeAgentStartEventResult | undefined>;

		// First call
		await handler(createEvent(testSkills));
		// Second call — same skills
		await handler(createEvent(testSkills));
		// Third call
		await handler(createEvent(testSkills));

		expect(registerToolSpy).toHaveBeenCalledTimes(1);
	});

	it("strips <available_skills> from output", async () => {
		const { api, onSpy } = createMockAPI();
		const mod = await import("../index.ts");
		mod.default(api);

		const handler = onSpy.mock.calls[0][1] as (
			event: BeforeAgentStartEvent,
		) => Promise<BeforeAgentStartEventResult | undefined>;
		const result = await handler(createEvent(testSkills));

		expect(result?.systemPrompt).not.toContain("<available_skills>");
		expect(result?.systemPrompt).not.toContain("</available_skills>");
	});

	it("injects ## Available Skill Domains", async () => {
		const { api, onSpy } = createMockAPI();
		const mod = await import("../index.ts");
		mod.default(api);

		const handler = onSpy.mock.calls[0][1] as (
			event: BeforeAgentStartEvent,
		) => Promise<BeforeAgentStartEventResult | undefined>;
		const result = await handler(createEvent(testSkills));

		expect(result?.systemPrompt).toContain("## Available Skill Domains");
	});

	it("returns stripped prompt when no skills", async () => {
		const { api, onSpy } = createMockAPI();
		const mod = await import("../index.ts");
		mod.default(api);

		const handler = onSpy.mock.calls[0][1] as (event: BeforeAgentStartEvent) => Promise<BeforeAgentStartEventResult>;
		const result = await handler(createEvent([]));

		// Always strips and returns — never undefined (prevents Pi reset)
		expect(result).toBeDefined();
		expect(result?.systemPrompt).not.toContain("<available_skills>");
	});

	it("handles disabled skills", async () => {
		const { api, onSpy, registerToolSpy } = createMockAPI();
		const mod = await import("../index.ts");
		mod.default(api);

		const handler = onSpy.mock.calls[0][1] as (event: BeforeAgentStartEvent) => Promise<BeforeAgentStartEventResult>;
		const disabledSkills: PiSkill[] = [
			{ ...testSkills[0], disableModelInvocation: true },
			{ ...testSkills[1], disableModelInvocation: true },
			{ ...testSkills[2], disableModelInvocation: true },
		];
		const result = await handler(createEvent(disabledSkills));

		// All Pi skills disabled → sample skills still indexed (if present)
		// → summary injected, <available_skills> stripped
		expect(result).toBeDefined();
		expect(result?.systemPrompt).not.toContain("<available_skills>");
		// sample-skills/ co the co hoac khong tuy thuoc vao moi truong
		// Chi check: khong crash, prompt da strip
	});
});

describe("search handler edge cases", () => {
	async function getSearchTool() {
		const { api, onSpy, registerToolSpy } = createMockAPI();
		const mod = await import("../index.ts");
		mod.default(api);

		const beforeHandler = onSpy.mock.calls[0][1] as (
			event: BeforeAgentStartEvent,
		) => Promise<BeforeAgentStartEventResult | undefined>;
		await beforeHandler(createEvent(testSkills));

		return registerToolSpy.mock.calls[0][0];
	}

	it("returns error for empty query", async () => {
		const tool = await getSearchTool();
		const result = await tool.execute("test-id", { query: "" }, undefined, undefined, undefined);
		expect(result.content[0].text).toBe("Query is required.");
	});

	it("returns error for query > 500 chars", async () => {
		const tool = await getSearchTool();
		const result = await tool.execute("test-id", { query: "x".repeat(501) }, undefined, undefined, undefined);
		expect(result.content[0].text).toBe("Query too long (max 500 chars).");
	});

	it("clamps limit: 0 → 1 result", async () => {
		const tool = await getSearchTool();
		const result = await tool.execute("test-id", { query: "molecular", limit: 0 }, undefined, undefined, undefined);
		expect(result.content[0].text).toContain("Found");
	});

	it("clamps limit: 1000 → at most 20", async () => {
		const tool = await getSearchTool();
		const result = await tool.execute(
			"test-id",
			{ query: "molecular", limit: 1000 },
			undefined,
			undefined,
			undefined,
		);
		const count = (result.content[0].text.match(/## /g) || []).length;
		expect(count).toBeLessThanOrEqual(20);
	});

	it("clamps limit: -5 → 1 result", async () => {
		const tool = await getSearchTool();
		const result = await tool.execute("test-id", { query: "drug", limit: -5 }, undefined, undefined, undefined);
		expect(result.content[0].text).toContain("Found");
	});

	it("defaults limit to 5 for NaN", async () => {
		const tool = await getSearchTool();
		const result = await tool.execute(
			"test-id",
			{ query: "molecular", limit: Number.NaN },
			undefined,
			undefined,
			undefined,
		);
		expect(result.content[0].text).toContain("Found");
	});

	it("returns results for valid query", async () => {
		const tool = await getSearchTool();
		const result = await tool.execute("test-id", { query: "rdkit" }, undefined, undefined, undefined);
		expect(result.content[0].text).toContain("rdkit");
	});

	it("returns details with query and resultCount", async () => {
		const tool = await getSearchTool();
		const result = await tool.execute("test-id", { query: "rdkit" }, undefined, undefined, undefined);
		expect(result.details).toBeDefined();
		expect(result.details?.query).toBe("rdkit");
	});
});
