---
name: biopython
description: Computational biology and bioinformatics toolkit. Use when working with DNA/RNA/protein sequences, BLAST searches, PDB structures, phylogenetic trees, or GenBank records. Trigger on imports of Bio, Bio.Seq, Bio.Blast, Bio.PDB, or mentions of sequence alignment, genome, protein structure, phylogeny.
---
# biopython

Use this skill for computational biology and bioinformatics.

## Core patterns

- **Sequences**: `Seq('ATCG')` → `.complement()`, `.translate()`, `.reverse_complement()`.
- **BLAST**: `NCBIWWW.qblast('blastn', 'nt', sequence)` for remote BLAST.
- **PDB**: `PDBParser().get_structure('1a8o', '1a8o.pdb')` for 3D structure analysis.
- **Phylogeny**: `Phylo.read('tree.nwk', 'newick')` for tree visualization.
- **GenBank**: `SeqIO.parse('genome.gb', 'genbank')` for annotation parsing.

## Rules

- Always use `SeqIO` for file I/O — don't parse FASTA/GenBank manually.
- Handle ambiguous bases (`N`, `R`, `Y`) explicitly in sequence operations.
- For BLAST, respect NCBI rate limits — add delays between queries.

## Anti-patterns

- Don't compare sequences as strings — use `seq1 == seq2` which handles case.
- Don't parse XML BLAST results manually — use `NCBIXML.parse()`.
- Don't store full genome sequences in memory — iterate with `SeqIO.parse()`.

