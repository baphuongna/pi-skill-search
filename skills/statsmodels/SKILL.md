---
name: statsmodels
description: Statistical modeling, hypothesis testing, and econometric analysis. Use when fitting linear regression, GLM, time series forecasting (ARIMA, SARIMAX), ANOVA, or performing statistical tests. Trigger on imports of statsmodels, ols, arima, or mentions of p-value, confidence interval, statistical significance, regression analysis.
---
# statsmodels

Use this skill for statistical analysis and modeling.

## Core patterns

- **OLS**: `sm.OLS(y, X).fit()` → `result.summary()`, `result.params`, `result.pvalues`.
- **GLM**: `sm.GLM(y, X, family=sm.families.Gaussian()).fit()`.
- **Time series**: `SARIMAX(data, order=(p,d,q), seasonal_order=(P,D,Q,s)).fit()`.
- **Tests**: `sm.stats.anova_lm()`, `sm.stats.normal_ad()`, `sm.tsa.stattools.adfuller()`.
- **Prediction**: `result.get_prediction(new_X).conf_int(alpha=0.05)`.

## Rules

- Always add constant: `X = sm.add_constant(X)` for intercept term.
- Check assumptions: residuals normality, homoscedasticity, VIF for multicollinearity.
- Use `sm.stats.diagnostic.acorr_ljungbox()` for autocorrelation in time series.

## Anti-patterns

- Don't interpret p-values without checking model assumptions.
- Don't use OLS for time series without testing stationarity first.
- Don't ignore confidence intervals — point estimates are incomplete.
