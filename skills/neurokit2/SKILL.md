---
name: neurokit2
description: Comprehensive biosignal processing toolkit for analyzing physiological data including ECG, EEG, EDA, RSP, PPG, EMG, and EOG signals. Use this skill when processing cardiovascular signals, brain activity, electrodermal responses, respiratory patterns, muscle activity, or eye movements. Applicable for heart rate variability analysis, event-related potentials, complexity measures, autonomic nervous system assessment, psychophysiology research, and multi-modal physiological signal integration.
---

# NeuroKit2

## Overview

NeuroKit2 is a comprehensive Python toolkit for processing and analyzing physiological signals (biosignals). Use this skill to process cardiovascular, neural, autonomic, respiratory, and muscular signals for psychophysiology research, clinical applications, and human-computer interaction studies.

## When to Use This Skill

Apply this skill when working with:
- **Cardiac signals**: ECG, PPG, heart rate variability (HRV), pulse analysis
- **Brain signals**: EEG frequency bands, microstates, complexity, source localization
- **Autonomic signals**: Electrodermal activity (EDA/GSR), skin conductance responses (SCR)
- **Respiratory signals**: Breathing rate, respiratory variability (RRV), volume per time
- **Muscular signals**: EMG amplitude, muscle activation detection
- **Eye tracking**: EOG, blink detection and analysis
- **Multi-modal integration**: Processing multiple physiological signals simultaneously
- **Complexity analysis**: Entropy measures, fractal dimensions, nonlinear dynamics

## Core Capabilities

### 1. Cardiac Signal Processing (ECG/PPG)

Process electrocardiogram and photoplethysmography signals for cardiovascular analysis. See `references/ecg_cardiac.md` for detailed workflows.

**Primary workflows:**
- ECG processing pipeline: cleaning → R-peak detection → delineation → quality assessment
- HRV analysis across time, frequency, and nonlinear domains
- PPG pulse analysis and quality assessment
- ECG-derived respiration extraction

**Key functions:**
```python
import neurokit2 as nk

# Complete ECG processing pipeline
signals, info = nk.ecg_process(ecg_signal, sampling_rate=1000)

# Analyze ECG data (event-related or interval-related)
analysis = nk.ecg_analyze(signals, sampling_rate=1000)

# Comprehensive HRV analysis
hrv = nk.hrv(peaks, sampling_rate=1000)  # Time, frequency, nonlinear domains
```

### 2. Heart Rate Variability Analysis

Compute comprehensive HRV metrics from cardiac signals. See `references/hrv.md` for all indices and domain-specific analysis.

**Supported domains:**
- **Time domain**: SDNN, RMSSD, pNN50, SDSD, and derived metrics
- **Frequency domain**: ULF, VLF, LF, HF, VHF power and ratios
- **Nonlinear domain**: Poincaré plot (SD1/SD2), entropy measures, fractal dimensions
- **Specialized**: Respiratory sinus arrhythmia (RSA), recurrence quantification analysis (RQA)

**Key functions:**
```python
# All HRV indices at once
hrv_indices = nk.hrv(peaks, sampling_rate=1000)

# Domain-specific analysis
hrv_time = nk.hrv_time(peaks)
hrv_freq = nk.hrv_frequency(peaks, sampling_rate=1000)
hrv_nonlinear = nk.hrv_nonlinear(peaks, sampling_rate=1000)
hrv_rsa = nk.hrv_rsa(peaks, rsp_signal, sampling_rate=1000)
```

### 3. Brain Signal Analysis (EEG)

Analyze electroencephalography signals for frequency power, complexity, and microstate patterns. See `references/eeg.md` for detailed workflows and MNE integration.

**Primary capabilities:**
- Frequency band power analysis (Delta, Theta, Alpha, Beta, Gamma)
- Channel quality assessment and re-referencing
- Source localization (sLORETA, MNE)
- Microstate segmentation and transition dynamics
- Global field power and dissimilarity measures

**Key functions:**
```python
# Power analysis across frequency bands
power = nk.eeg_power(eeg_data, sampling_rate=250, channels=['Fz', 'Cz', 'Pz'])

# Microstate analysis
microstates = nk.microstates_segment(eeg_data, n_microstates=4, method='kmod')
static = nk.microstates_static(microstates)
dynamic = nk.microstates_dynamic(microstates)
```

### 4. Electrodermal Activity (EDA)

Process skin conductance signals for autonomic nervous system assessment. See `references/eda.md` for detailed workflows.

**Primary workflows:**
- Signal decomposition into tonic and phasic components
- Skin conductance response (SCR) detection and analysis
- Sympathetic nervous system index calculation
- Autocorrelation and changepoint detection

**Key functions:**
```python
# Complete EDA processing
signals, info = nk.eda_process(eda_signal, sampling_rate=100)

# Analyze EDA data
analysis = nk.eda_analyze(signals, sampling_rate=100)

# Sympathetic nervous system activity
sympathetic = nk.eda_sympathetic(signals, sampling_rate=100)
```
