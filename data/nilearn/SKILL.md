---
name: nilearn
description: Neuroimaging data analysis and brain statistical maps. Use when working with fMRI, structural MRI, brain parcellation, connectivity matrices, or neuroimaging statistical analysis. Trigger on imports of nilearn, nibabel, or mentions of neuroimaging, fMRI, brain, voxel, cortical surface, MNI coordinates.
---
# nilearn

Use this skill for neuroimaging data analysis.

## Core patterns

- **Load**: `nilearn.image.load_img('brain.nii.gz')` → `img.get_fdata()`.
- **Masking**: `NiftiMasker(mask_img='mask.nii.gz', standardize=True).fit_transform(img)`.
- **Parcellation**: `datasets.fetch_atlas_harvard_oxford()` for brain region labels.
- **Connectivity**: `ConnectivityMeasure(kind='correlation').fit_extract(timeseries)`.
- **Plotting**: `plotting.plot_stat_map(stat_img, threshold=3.0)` for activation maps.

## Rules

- Always register images to same space (MNI152) before comparing.
- Use `NiftiMasker` for extracting voxel signals — handles masking and standardization.
- Smooth data before GLM analysis: `image.smooth_img(img, fwhm=6)`.

## Anti-patterns

- Don't compare brain images across subjects without normalization.
- Don't interpret correlation matrices without multiple comparison correction.
- Don't load 4D fMRI entirely into float64 — use `dtype='auto'`.


