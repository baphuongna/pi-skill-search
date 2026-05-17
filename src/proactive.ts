/**
 * Phase 10 — Proactive suggestion hook.
 * Detect Python package imports trong bash commands va suggest matching skills.
 * SPEC §11 E02-S01.
 */

/**
 * Regex patterns cho detecting Python package imports/installs.
 */
const PATTERNS = [
	{ re: /\bimport\s+([a-zA-Z_][\w]*)/g, multi: false },
	{ re: /\bfrom\s+([a-zA-Z_][\w]*)\s+import\b/g, multi: false },
	{ re: /\bpip\s+install\s+(.+)/g, multi: true },
	{ re: /\buv\s+(?:add|pip\s+install)\s+(.+)/g, multi: true },
];

/**
 * Detect Python package names tu bash command.
 * Tra ve danh sach package names da detect.
 */
export function detectPythonPackages(command: string): string[] {
	const packages = new Set<string>();

	// Skip comments
	if (command.trim().startsWith("#")) return [];

	for (const { re, multi } of PATTERNS) {
		const regex = new RegExp(re.source, re.flags);
		let match: RegExpExecArray | null = regex.exec(command);
		while (match !== null) {
			if (multi) {
				// Split by whitespace, filter out flags like -r, -U, etc
				const parts = match[1].split(/\s+/);
				for (const part of parts) {
					const pkg = part.split(/[=><@]/)[0].trim();
					if (pkg && pkg.length >= 2 && !pkg.startsWith("-")) {
						packages.add(pkg.toLowerCase());
					}
				}
			} else {
				const pkg = match[1].split(/[=><@]/)[0].trim();
				if (pkg && pkg.length >= 2) {
					packages.add(pkg.toLowerCase());
				}
			}
			match = regex.exec(command);
		}
	}

	return [...packages];
}
