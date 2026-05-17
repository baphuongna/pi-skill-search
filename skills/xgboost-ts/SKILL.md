---
name: xgboost-ts
description: Time series forecasting with machine learning. Use when predicting future values from temporal data, ARIMA alternatives, seasonality decomposition, or demand forecasting. Trigger on imports of prophet, darts, or mentions of time series, forecasting, prediction, seasonal, trend, ARIMA, LSTM.
---
# xgboost-ts

Use this skill for time series forecasting with ML approaches.

## Core patterns

- **Features**: Create lag features (`df['lag_1'] = df['value'].shift(1)`), rolling stats, Fourier terms.
- **Train**: Split by time (not random) — use `train_test_split(shuffle=False)`.
- **Prophet**: `Prophet(yearly_seasonality=True).fit(df)` for automatic decomposition.
- **Evaluate**: MAE, MAPE, MASE on holdout — never on training data.

## Rules

- Always use time-based split, not random — data leakage otherwise.
- Stationarity: difference the series if ADF test shows unit root.
- Cross-validation: use `TimeSeriesSplit` with expanding window.

## Anti-patterns

- Don't use future data in lag features — check for lookahead bias.
- Don't forecast too far ahead — uncertainty grows quadratically.
- Don't ignore seasonality — decompose before modeling.

