---
name: matplotlib
description: Publication-quality data visualization and plotting. Use when creating figures, charts, plots, heatmaps, scatter plots, bar charts, subplots, or customizing axes, legends, colormaps. Trigger on imports of matplotlib, pyplot, plt, or mentions of plotting, visualization, figure, chart, graph rendering.
---
# matplotlib

Use this skill for creating publication-quality scientific plots.

## Core patterns

- **Figure + Axes**: `fig, ax = plt.subplots(nrows, ncols, figsize=(8, 6))`.
- **Plot types**: `ax.plot()`, `ax.scatter()`, `ax.bar()`, `ax.hist()`, `ax.imshow()`.
- **Labels**: `ax.set_xlabel()`, `ax.set_ylabel()`, `ax.set_title()`.
- **Legend**: `ax.legend(loc='best')` after label= in plot calls.
- **Save**: `fig.savefig('out.png', dpi=300, bbox_inches='tight')`.

## Rules

- Always use OO interface (`fig, ax`) — never `plt.plot()` for complex figures.
- Close figures: `plt.close(fig)` to prevent memory leaks in loops.
- Set `dpi=300` for publications; `dpi=72` for screen/web.
- Use `tight_layout()` or `constrained_layout=True` to avoid label clipping.

## Anti-patterns

- Don't call `plt.show()` in scripts — use `savefig()` instead.
- Don't create hundreds of figures without closing — memory leak.
- Don't hardcode colors for categories — use colormaps (`viridis`, `tab10`).
