---
name: xgboost
description: Gradient boosted decision trees for machine learning. Use when training classification or regression models on tabular data, feature importance analysis, or hyperparameter tuning. Trigger on imports of xgboost, XGBClassifier, XGBRegressor, or mentions of gradient boosting, decision tree, ensemble, tabular ML, scikit, sklearn.
---
# xgboost

Use this skill for gradient boosting on tabular data.

## Core patterns

- **Train**: `XGBClassifier(n_estimators=500, max_depth=6, learning_rate=0.1).fit(X_train, y_train)`.
- **DMatrix**: `DMatrix(data, label)` for optimized data loading.
- **CV**: `xgb.cv(params, dtrain, num_boost_round=1000, nfold=5, early_stopping_rounds=50)`.
- **Feature importance**: `model.feature_importances_` or `xgb.plot_importance(model)`.
- **Save/Load**: `model.save_model('model.json')` / `XGBClassifier().load_model('model.json')`.

## Rules

- Always use `early_stopping_rounds` with eval set to prevent overfitting.
- Scale `scale_pos_weight` for imbalanced datasets: `sum(negative) / sum(positive)`.
- Use `n_estimators` + `early_stopping` instead of guessing optimal round count.

## Anti-patterns

- Don't use default hyperparameters for production — always tune.
- Don't ignore categorical encoding — XGBoost needs numeric input.
- Don't interpret feature importance as causal relationship.


