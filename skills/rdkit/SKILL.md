---
name: rdkit
description: Cheminformatics toolkit for fine-grained molecular control. Use when working with SMILES, molecular fingerprints, substructure search, descriptor calculation, reaction transforms, or 2D/3D coordinate generation. Trigger on imports of rdkit, Chem, AllChem, Descriptors, or references to molecular weight, logP, TPSA, H-bond donors/acceptors.
---
# rdkit

Use this skill for molecular cheminformatics tasks in Python.

## Core patterns

- **Molecule I/O**: `Chem.MolFromSmiles()` / `Chem.MolToSmiles()` for SMILES; `Chem.SDMolSupplier()` for SDF files.
- **Fingerprints**: `AllChem.GetMorganFingerPrintAsBitVect(mol, radius=2, nBits=2048)` for ECFP4.
- **Descriptors**: `Descriptors.MolWt()`, `Descriptors.MolLogP()`, `Descriptors.TPSA()`.
- **Substructure search**: `mol.HasSubstructMatch(pattern)` with SMARTS queries.
- **Reactions**: `AllChem.ReactionFromSmarts()` for reaction transforms.

## Rules

- Always sanitize molecules: check `Chem.SanitizeMol()` return.
- Use explicit hydrogen handling (`AddHs`/`RemoveHs`) consistently within a pipeline.
- For large datasets, use generator patterns with `Chem.SDMolSupplier` instead of loading all into memory.
- SMILES canonical form: `Chem.MolToSmiles(mol, canonical=True)`.

## Anti-patterns

- Don't parse SMILES without try/catch — invalid SMILES throw silently.
- Don't compare molecules by SMILES string — use `Chem.MolToInchiKey()` for identity.
- Don't compute 3D coords without embedding: `AllChem.EmbedMolecule()` first.
