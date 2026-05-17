---
name: pymatgen
description: Materials science computational library. Use when working with crystal structures, phase diagrams, electronic structure, diffusion analysis, or materials property prediction. Trigger on imports of pymatgen, Structure, PhaseDiagram, or mentions of crystal lattice, band structure, DFT, materials genome.
---
# pymatgen

Use this skill for materials science computations.

## Core patterns

- **Structure**: `Structure.from_file('POSCAR')` / `structure.to('cif')`.
- **Lattice**: `Lattice.cubic(4.2)`, `Lattice.hexagonal(a=3.0, c=5.0)`.
- **Sites**: `structure.sites` → `site.species`, `site.coords`, `site.frac_coords`.
- **Phase diagram**: `PhaseDiagram(entries)` → `pd.get_equilibrium_reaction_energy(entry)`.
- **Diffusion**: `DiffusionAnalyzer.from_files()` for MD trajectory analysis.

## Rules

- Always check structure validity: `structure.is_valid(tol=0.5)`.
- Use `structure.make_supercell()` for defect calculations, not manual replication.
- For DFT workflows, validate k-points and convergence parameters.

## Anti-patterns

- Don't compare floating point coordinates directly — use `structure.matches(other)`.
- Don't create structures with overlapping sites without checking tolerance.
