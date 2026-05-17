/**
 * Tokenization — chuyen text thanh set cua tokens.
 * Implement theo SPEC §5.3.
 */

/**
 * Tokenize text thanh Set cua lowercase tokens.
 * - Split hyphenated names (-, _, /)
 * - Remove punctuation va non-alphanumeric chars
 * - Skip 1-char tokens (deliberate trade-off)
 * - Deduplicate qua Set
 */
export function tokenize(text: string): Set<string> {
	return new Set(
		text
			.toLowerCase()
			.replace(/[-_/]/g, " ")
			.replace(/[^a-z0-9\s]/g, "")
			.split(/\s+/)
			.filter((w) => w.length >= 2),
	);
}
