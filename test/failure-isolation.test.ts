/**
 * Failure isolation tests — verify extension khong crash Pi session.
 * SPEC §9 regression row.
 */
import { describe, expect, it, vi } from "vitest";
import extDefault from "../index.ts";
import type { BeforeAgentStartEvent, BeforeAgentStartEventResult, ExtensionAPI, PiSkill } from "../src/types.ts";

const testSkills: PiSkill[] = [
	{
		name: "rdkit",
		description: "Cheminformatics toolkit for molecular control",
		filePath: "/skills/rdkit/SKILL.md",
		disableModelInvocation: false,
	},
];

const FAKE_PROMPT = `System prompt.

The following skills provide specialized instructions for specific tasks.

<available_skills>
  <skill><name>rdkit</name><description>Molecular</description><location>/x</location></skill>
</available_skills>`;

function createEvent(skills: PiSkill[]): BeforeAgentStartEvent {
	return {
		type: "before_agent_start",
		prompt: "test",
		systemPrompt: FAKE_PROMPT,
		systemPromptOptions: {
			cwd: "/test",
			skills: skills as unknown as PiSkill[],
		},
	} as BeforeAgentStartEvent;
}

function setupExtension() {
	const onSpy = vi.fn();
	const registerToolSpy = vi.fn();
	const api = { on: onSpy, registerTool: registerToolSpy } as unknown as ExtensionAPI;
	extDefault(api);
	return { onSpy, registerToolSpy };
}

describe("failure isolation", () => {
	it("extension does not throw when skills are present", async () => {
		const { onSpy, registerToolSpy } = setupExtension();

		const handler = onSpy.mock.calls[0][1] as (
			event: BeforeAgentStartEvent,
		) => Promise<BeforeAgentStartEventResult | undefined>;

		const result = await handler(createEvent(testSkills));
		expect(result).toBeDefined();
		expect(result?.systemPrompt).not.toContain("<available_skills>");
	});

	it("tool returns results instead of throwing", async () => {
		const { onSpy, registerToolSpy } = setupExtension();

		const handler = onSpy.mock.calls[0][1] as (
			event: BeforeAgentStartEvent,
		) => Promise<BeforeAgentStartEventResult | undefined>;
		await handler(createEvent(testSkills));

		const tool = registerToolSpy.mock.calls[0][0];
		const result = await tool.execute("id", { query: "rdkit" }, undefined, undefined, undefined);
		expect(result.content[0].text).toContain("rdkit");
	});

	it("handles malformed skill gracefully", async () => {
		const { onSpy } = setupExtension();

		const handler = onSpy.mock.calls[0][1] as (
			event: BeforeAgentStartEvent,
		) => Promise<BeforeAgentStartEventResult | undefined>;

		const malformedSkills: PiSkill[] = [
			{
				name: "broken",
				description: "",
				filePath: "/skills/broken/SKILL.md",
				disableModelInvocation: false,
			},
		];

		const result = await handler(createEvent(malformedSkills));
		// Should still work — entry indexed with empty descTokens
		expect(result).toBeDefined();
	});
});
