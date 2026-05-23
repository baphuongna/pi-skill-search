---
name: vetc-ui-visual-qa
description: PROACTIVELY activate khi implement/change React component, thay đổi styling, release candidate cho agency-portal hoặc ops-ui. Validate WCAG 2.2 AA, responsive, dark mode (nếu có), focus management, screen reader compatibility.
---

# VETC UI Visual QA — Accessibility + Visual Consistency

Đảm bảo UI VETC (agency-portal, ops-ui) tuân thủ WCAG 2.2 AA, responsive (320px-1920px), focus management đúng, screen reader navigable. Không dừng ở "looks OK on my laptop".

## When to Activate

- Component mới implement — accessibility + visual sweep
- Style change (color/font/spacing) — verify contrast & consistency
- Form/input component — keyboard + SR navigation
- Modal/dropdown/drawer — focus trap + escape handling
- Release candidate — full a11y audit
- Bug report: "screen reader can't read X" / "keyboard stuck"

## Do NOT Activate When

- Backend-only change — no UI
- Internal tool with 1-2 users, no a11y requirement (still recommended but lower priority)
- Component still WIP — wait for completion

## WCAG 2.2 AA Checklist — VETC Focus

### Perceivable (can users sense content?)

- [ ] **Text contrast ≥ 4.5:1** for normal text, ≥ 3:1 for large text (≥24px or 18.66px bold)
- [ ] **UI control contrast ≥ 3:1** (buttons, form borders, focus indicators) — WCAG 2.2 new
- [ ] **No color-only info** (e.g., red = error must have icon + label too)
- [ ] **Alt text on images** — `<img alt="...">`, `aria-label` on icon buttons
- [ ] **Captions on videos** (if any)
- [ ] **Resize to 200%** without loss of content/function
- [ ] **Reflow at 320px** wide — no horizontal scroll (except tables/code)
- [ ] **Text spacing** adjustable: line 1.5x, paragraph 2x, letter 0.12x, word 0.16x

### Operable (can users interact?)

- [ ] **Keyboard accessible** — every interactive element reachable via Tab
- [ ] **Visible focus indicator** — ≥ 3:1 contrast (WCAG 2.2)
- [ ] **Focus not obscured** by sticky header/footer (WCAG 2.2 new)
- [ ] **No keyboard trap** — Tab always moves forward, Shift+Tab backward
- [ ] **Escape closes modal/dropdown** — restores focus to trigger
- [ ] **Target size ≥ 24×24px** (WCAG 2.2 new, was 44×44 in 2.1)
- [ ] **Skip link** to main content (for screen reader users)
- [ ] **No auto-play** media without controls
- [ ] **Enough time** — warn before session timeout (15min warning)

### Understandable (can users comprehend?)

- [ ] **Language declared**: `<html lang="vi">`
- [ ] **Form labels** — every input has visible label or `aria-label`
- [ ] **Error messages** — identify field + describe fix (not "invalid")
- [ ] **Help text** associated via `aria-describedby`
- [ ] **Consistent navigation** — same menu position across pages
- [ ] **Consistent identification** — same icon = same function everywhere
- [ ] **Input suggestion on error** — "Amount must be between 1,000 and 10,000,000"

### Robust (can assistive tech parse?)

- [ ] **Valid HTML** — no duplicate IDs, proper nesting
- [ ] **ARIA roles** where semantic HTML insufficient (`role="dialog"`, `role="tab"`)
- [ ] **ARIA states/props** updated dynamically (`aria-expanded`, `aria-selected`)
- [ ] **Status messages** announced — `role="status"` or `role="alert"` for async updates
- [ ] **Name, Role, Value exposed** — every UI component testable via accessibility tree

## VETC-Specific Checks

### Ant Design / MUI Components

- [ ] Use Ant Design 5.x+ (built-in a11y better than 4.x)
- [ ] Don't override `tabindex` unless necessary
- [ ] Custom icons must have `aria-label` or `aria-hidden="true"` (if decorative)
- [ ] Modal `closable={true}` → Escape key works
- [ ] Form.Item `label` prop provides label association

### Vietnamese Text

- [ ] Font supports Vietnamese diacritics (most modern fonts OK, but test: "Nguyễn", "Đặng", "Ớt")
- [ ] No broken ligatures
- [ ] Vietnamese locale for date/number formatters (`vi-VN`)
- [ ] Long text (VN often 20% longer than EN) — no truncation in UI labels

### Currency & Numbers

- [ ] Use Intl.NumberFormat with `vi-VN` locale: `1.234.567 đ`
- [ ] Thousand separator: `.` (VN standard), not `,`
- [ ] Currency position: after amount (`100.000 đ`)
- [ ] Never truncate currency (10,000,000 → "10M" loses precision)
- [ ] Sign amounts clearly: debit `-100.000 đ` (red + minus), credit `+100.000 đ` (green + plus)

### Sensitive Data

- [ ] CCCD displayed partially masked by default: `001***999`
- [ ] Phone partially masked: `0912***345`
- [ ] Balance hidden until user clicks "Show" — for public terminals
- [ ] No sensitive data in URL query string (visible in browser history)
- [ ] No sensitive data in page title (visible in tab name)

## Workflow

### Step 1 — Static Check (axe-core)

```bash
# In dev mode, enable axe
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(axe => axe.default(React, ReactDOM, 1000));
}
```

Run dev server, open browser DevTools Console — axe reports violations.

Or use CLI:
```bash
npx @axe-core/cli https://localhost:3000/wallet/transfer
```
