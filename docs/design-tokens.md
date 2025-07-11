# Luma Design Tokens

This sheet defines the core design tokens used across the Luma prototype. All variables are provided as CSS custom properties.

## Palette

| Token | Light | Dark |
|-------|-------|------|
| `--dawn-sand-0` | `#F4F3EF` | – |
| `--night-blue-0` | – | `#1E2A38` |
| `--mist-grey-0` | `#8A94A8` | `#8A94A8` |
| `--wave-teal-0` | `#2B6777` | `#2B6777` |
| `--ember-coral-0` | `#F05F57` | `#F05F57` |

Each palette colour exposes a tonal range from `--4` (darkest) to `4` (lightest).

## Typography

- Font family: **Inter**
- Weights: `100` to `700`
- Base size: `16px`
- Fluid scale: `clamp(1rem, 1vw + .7rem, 1.4rem)`

## Radius

| Name | Value |
|------|-------|
| `--radius-xs` | `4px` |
| `--radius-sm` | `8px` |
| `--radius-md` | `16px` |
| `--radius-lg` | `24px` |
| `--radius-full` | `9999px` |

## Spacing (4‑pt grid)

`--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px,
`--space-5` 24px, `--space-6` 32px, `--space-7` 48px, `--space-8` 64px.

## Elevation

Three preset shadows:

```css
box-shadow: var(--shadow-ambient); /* subtle */
box-shadow: var(--shadow-key);     /* primary */
box-shadow: var(--shadow-spread);  /* large */
```

These tokens can be imported in Tailwind via `tailwind.config.cjs` and reused throughout the application.
