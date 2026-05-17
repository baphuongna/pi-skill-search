---
name: pydicom
description: Python library for working with DICOM (Digital Imaging and Communications in Medicine) files. Use this skill when reading, writing, or modifying medical imaging data in DICOM format, extracting pixel data from medical images (CT, MRI, X-ray, ultrasound), anonymizing DICOM files, working with DICOM metadata and tags, converting DICOM images to other formats, handling compressed DICOM data, or processing medical imaging datasets. Applies to tasks involving medical image analysis, PACS systems, radiology workflows, and healthcare imaging applications.
---

# Pydicom

## Overview

Pydicom is a pure Python package for working with DICOM files, the standard format for medical imaging data. This skill provides guidance on reading, writing, and manipulating DICOM files, including working with pixel data, metadata, and various compression formats.

## When to Use This Skill

Use this skill when working with:
- Medical imaging files (CT, MRI, X-ray, ultrasound, PET, etc.)
- DICOM datasets requiring metadata extraction or modification
- Pixel data extraction and image processing from medical scans
- DICOM anonymization for research or data sharing
- Converting DICOM files to standard image formats
- Compressed DICOM data requiring decompression
- DICOM sequences and structured reports
- Multi-slice volume reconstruction
- PACS (Picture Archiving and Communication System) integration

## Core Workflows

### Reading DICOM Files

Read a DICOM file using `pydicom.dcmread()`:

```python
import pydicom

# Read a DICOM file
ds = pydicom.dcmread('path/to/file.dcm')

# Access metadata
print(f"Patient Name: {ds.PatientName}")
print(f"Study Date: {ds.StudyDate}")
print(f"Modality: {ds.Modality}")

# Display all elements
print(ds)
```

**Key points:**
- `dcmread()` returns a `Dataset` object
- Access data elements using attribute notation (e.g., `ds.PatientName`) or tag notation (e.g., `ds[0x0010, 0x0010]`)
- Use `ds.file_meta` to access file metadata like Transfer Syntax UID
- Handle missing attributes with `getattr(ds, 'AttributeName', default_value)` or `hasattr(ds, 'AttributeName')`

### Working with Pixel Data

Extract and manipulate image data from DICOM files:

```python
import pydicom
import numpy as np
import matplotlib.pyplot as plt

# Read DICOM file
ds = pydicom.dcmread('image.dcm')

# Get pixel array (requires numpy)
pixel_array = ds.pixel_array

# Apply windowing for display (CT/MRI)
if hasattr(ds, 'WindowCenter') and hasattr(ds, 'WindowWidth'):
    from pydicom.pixel_data_handlers.util import apply_voi_lut
    windowed_image = apply_voi_lut(pixel_array, ds)
else:
    windowed_image = pixel_array

# Display image
plt.imshow(windowed_image, cmap='gray')
plt.title(f"{ds.Modality} - {ds.StudyDescription}")
plt.axis('off')
plt.show()
```

**Working with color images:**

```python
# RGB images have shape (rows, columns, 3)
if ds.PhotometricInterpretation == 'RGB':
    rgb_image = ds.pixel_array
    plt.imshow(rgb_image)
elif ds.PhotometricInterpretation == 'YBR_FULL':
    from pydicom.pixel_data_handlers.util import convert_color_space
    rgb_image = convert_color_space(ds.pixel_array, 'YBR_FULL', 'RGB')
    plt.imshow(rgb_image)
```

**Multi-frame images (videos/series):**

```python
# For multi-frame DICOM files
if hasattr(ds, 'NumberOfFrames') and ds.NumberOfFrames > 1:
    frames = ds.pixel_array  # Shape: (num_frames, rows, columns)
    print(f"Number of frames: {frames.shape[0]}")

    # Display specific frame
    plt.imshow(frames[0], cmap='gray')
```

# Normalize to 0-255 range
if pixel_array.dtype != np.uint8:
    pixel_array = ((pixel_array - pixel_array.min()) /
                   (pixel_array.max() - pixel_array.min()) * 255).astype(np.uint8)

# Save as PNG
image = Image.fromarray(pixel_array)
image.save('output.png')
```

<!-- condensed from source -->

