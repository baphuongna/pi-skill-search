/**
 * Tu dong ngu (synonym dictionary) — SPEC §5.2.
 * Moi entry key → danh sach tu dong ngu, cho phep expand query.
 */
import { tokenize } from "./text.ts";

/**
 * Bang tu dong ngu. Moi key danh cho cac tu co cung nghia.
 * Bidirectional — moi cap phai duoc mirror thuan nghich.
 */
export const SYNONYMS: Record<string, string[]> = {
	// Chemistry
	molecule: ["molecular", "molecules"],
	molecular: ["molecule", "molecules"],
	drug: ["pharmaceutical", "medicinal"],
	chem: ["chemistry", "chemical"],
	docking: ["dock", "binding", "pose"],
	admet: ["absorption", "distribution", "metabolism", "excretion", "toxicity"],
	metabolism: ["metabolic", "metabolite", "pathway", "flux"],
	metabolic: ["metabolism", "metabolite", "pathway", "flux"],

	// Biology
	gene: ["genomic", "genomics", "sequence"],
	protein: ["proteomics", "peptide"],
	"single-cell": ["scrna-seq", "single cell", "scrnaseq"],
	"rna-seq": ["transcriptom", "rna seq", "expression"],

	// ML
	ml: ["machine learning", "machine-learning"],
	dl: ["deep learning", "deep-learning", "neural network"],
	nlp: ["natural language", "text mining"],

	// Clinical
	clinical: ["medical", "patient", "healthcare"],

	// Physics
	quantum: ["qubit", "quantum computing"],

	// General
	viz: ["visualization", "plotting", "chart"],
	stats: ["statistics", "statistical"],
	db: ["database"],
};

/**
 * Expand query tokens voi tu dong ngu.
 * Tokenize query truoc, sau do union them tat ca synonym values.
 */
export function expandQuery(query: string): Set<string> {
	const tokens = tokenize(query);
	const expanded = new Set(tokens);

	for (const token of tokens) {
		const synonyms = SYNONYMS[token];
		if (synonyms) {
			for (const syn of synonyms) {
				// Tokenize moi synonym vi co the la multi-word ("machine learning")
				const synTokens = tokenize(syn);
				for (const st of synTokens) {
					expanded.add(st);
				}
			}
		}
	}

	return expanded;
}
