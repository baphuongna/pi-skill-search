---
name: astropy
description: Astronomy and astrophysics library. Use when working with celestial coordinates, FITS files, physical units, cosmological calculations, time systems, world coordinate systems, or astronomical data processing. Trigger on imports of astropy, astroquery, or mentions of telescope, FITS, RA/Dec, redshift, cosmology.
---
# astropy

Use this skill for astronomical data analysis.

## Core patterns

- **Units**: `u.degree`, `u.meter`, `u.year`. Compose: `(10 * u.parsec).to(u.lightyear)`.
- **Coordinates**: `SkyCoord(ra=10.5*u.degree, dec=41.2*u.degree, frame='icrs')`.
- **FITS I/O**: `fits.open('file.fits')` → `hdul[0].data` / `hdul[0].header`.
- **Time**: `Time('2024-01-01T00:00:00', scale='utc')`.
- **Cosmology**: `cosmo = FlatLambdaCDM(H0=70, Om0=0.3)` → `cosmo.luminosity_distance(z)`.

## Rules

- Always specify units explicitly — don't assume SI.
- Use `with fits.open() as hdul:` for proper file handle cleanup.
- Convert between frames: `skycoord.transform_to('galactic')`.
- For large FITS files, use `memmap=True` to avoid loading into RAM.

## Anti-patterns

- Don't mix time scales without conversion (UTC vs TDB vs TT).
- Don't assume FITS data axis order — check `CDELT`/`CRVAL` headers.
- Don't compute angular separations with Euclidean distance — use `skycoord.separation()`.
