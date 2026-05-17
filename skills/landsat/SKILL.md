---
name: landsat
description: Geospatial and remote sensing analysis with satellite imagery. Use when working with Landsat, Sentinel, raster data, land cover classification, NDVI calculation, or spatial data processing. Trigger on imports of rasterio, geopandas, xarray-spatial, or mentions of satellite, remote sensing, geospatial, raster, land cover.
---
# landsat

Use this skill for satellite imagery and geospatial analysis.

## Core patterns

- **Load raster**: `rasterio.open('image.tif')` → `band = src.read(1)`.
- **CRS transform**: `rasterio.warp.reproject()` for coordinate system conversion.
- **NDVI**: `(nir - red) / (nir + red)` where Landsat 8: B5=NIR, B4=Red.
- **Vector overlay**: `geopandas.sjoin(points, polygons)` for spatial joins.
- **Zonal stats**: `rasterstats.zonal_stats(polygons, raster, stats=['mean', 'std'])`.

## Rules

- Always check CRS before spatial operations — mismatched CRS causes silent errors.
- Use `with rasterio.open() as src:` for file handle safety.
- Mask clouds using QA band — don't assume clear pixels.

## Anti-patterns

- Don't load entire raster into memory for large scenes — use windowed reading.
- Don't reproject vector data repeatedly — reproject once, cache result.
- Don't compute NDVI with integer division — cast to float first.
