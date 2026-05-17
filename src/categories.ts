/**
 * Category classifier — phan loai skill theo category.
 * Implement theo SPEC §6.1 rules va §6.2 logic.
 *
 * Luu y: Substring match — text.includes(kw).
 * Co the gay false positive (vi du "gene" match "generation").
 * Phase 9 se tuning cac keywords.
 */

export interface CategoryRule {
	name: string;
	keywords: string[];
	maxExamples: number;
}

/**
 * 14 category rules tu SPEC §6.1.
 * Thu tu khai bao quyet dinh thu tu trong summary output.
 */
export const CATEGORY_RULES: CategoryRule[] = [
	{
		name: "Cheminformatics & Drug Discovery",
		keywords: [
			"molecular",
			"molecule",
			"drug",
			"compound",
			"chemic",
			"smiles",
			"docking",
			"fingerprint",
			"admet",
			"cheminformatics",
			"medicinal",
			"rdkit",
			"virtual screening",
			"lead optim",
		],
		maxExamples: 5,
	},
	{
		name: "Bioinformatics & Genomics",
		keywords: [
			"gene",
			"genomic",
			"rna-seq",
			"single-cell",
			"transcriptom",
			"protein",
			"sequence",
			"variant",
			"alignment",
			"phylogen",
			"pathway",
			"gene regul",
			"anndata",
			"h5ad",
			"neural recording",
			"neuropixel",
			"spikeglx",
			"openephys",
			"electrophysiolog",
		],
		maxExamples: 5,
	},
	{
		name: "Machine Learning & AI",
		keywords: [
			"machine learning",
			"deep learning",
			"neural network",
			"reinforcement learn",
			"gradient boost",
			"random forest",
			"model train",
			"pytorch",
			"tensorflow",
			"transformer",
			"gan",
			"cnn",
			"rnn",
			"lstm",
			"interpret",
			"shap",
			"feature engineer",
			"scikit",
			"sklearn",
		],
		maxExamples: 5,
	},
	{
		name: "Clinical & Medical",
		keywords: [
			"clinical",
			"patient",
			"medical",
			"diagnosis",
			"treatment",
			"ehr",
			"dicom",
			"pathology",
			"survival analysis",
			"drug safety",
			"pharmacovigil",
			"biomarker",
			"cohort",
		],
		maxExamples: 5,
	},
	{
		name: "Physics & Quantum",
		keywords: [
			"physics",
			"quantum",
			"astronom",
			"cosmol",
			"optics",
			"particle",
			"simulat",
			"circuit",
			"qubit",
			"hamiltonian",
			"spectroscopy",
		],
		maxExamples: 5,
	},
	{
		name: "Databases & Data Sources",
		keywords: [
			"database",
			"api",
			"rest api",
			"query",
			"pubchem",
			"chembl",
			"uniprot",
			"clinicaltrials",
			"entrez",
			"ncbi",
			"ensembl",
			"geo ",
			"tcga",
		],
		maxExamples: 4,
	},
	{
		name: "Data Analysis & Visualization",
		keywords: [
			"statistic",
			"visualization",
			"plotting",
			"chart",
			"datafram",
			"eda",
			"network analysis",
			"time series",
			"forecast",
		],
		maxExamples: 5,
	},
	{
		name: "Scientific Writing & Communication",
		keywords: [
			"writing",
			"paper",
			"publication",
			"peer review",
			"citation",
			"bibtex",
			"literature",
			"poster",
			"slide",
			"schematic",
			"infographic",
		],
		maxExamples: 5,
	},
	{
		name: "Geospatial & Remote Sensing",
		keywords: [
			"geospatial",
			"gis",
			"satellite",
			"spatial",
			"terrain",
			"remote sensing",
			"raster",
			"vector",
			"coordinate",
			"map",
		],
		maxExamples: 5,
	},
	{
		name: "Lab Automation & Integration",
		keywords: [
			"lab",
			"laboratory",
			"liquid handl",
			"plate reader",
			"workflow automat",
			"lims",
			"pipette",
			"robot",
			"opentrons",
			"benchling",
			"latchbio",
		],
		maxExamples: 5,
	},
	{
		name: "Time Series & Forecasting",
		keywords: ["time series", "forecast", "anomaly detect", "signal process", "timesfm", "aeon"],
		maxExamples: 5,
	},
	{
		name: "Materials Science & Engineering",
		keywords: [
			"crystal",
			"material",
			"phase diagram",
			"metabolic model",
			"simulation",
			"optimization",
			"pymoo",
			"simpy",
			"pymatgen",
		],
		maxExamples: 5,
	},
	{
		name: "Research Methodology",
		keywords: [
			"hypothesis",
			"brainstorm",
			"critical thinking",
			"grant",
			"scholar",
			"peer review",
			"reproducib",
			"experimental design",
		],
		maxExamples: 5,
	},
	{
		name: "Integration Platforms",
		keywords: [
			"benchling",
			"modal",
			"dnanexus",
			"latchbio",
			"omero",
			"lamindb",
			"protocols.io",
			"ginkgo",
			"integration",
			"markitdown",
			"convert",
			"pdf",
		],
		maxExamples: 5,
	},
];

/**
 * Phan loai skill vao cac categories.
 * Substring match: neu bat ky keyword nao xuat hien trong name hoac description.
 * Tra ve ["Other"] neu khong match rule nao.
 */
export function classify(entry: { name: string; description: string }): string[] {
	const text = `${entry.name} ${entry.description}`.toLowerCase();
	const matched: string[] = [];

	for (const rule of CATEGORY_RULES) {
		if (rule.keywords.some((kw) => text.includes(kw))) {
			matched.push(rule.name);
		}
	}

	return matched.length > 0 ? matched : ["Other"];
}
