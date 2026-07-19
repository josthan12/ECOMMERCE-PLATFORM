# PokeSunshineTCG — Design System

> **Version:** 1.0  
> **Status:** Living Document  
> **Purpose:** Define the reusable visual language, component standards, interaction patterns, and implementation guidelines for PokeSunshineTCG.

---

# Design System Principles

This design system exists to create a storefront that feels cohesive, maintainable, and timeless.

Every component should be:

- Consistent
- Accessible
- Reusable
- Responsive
- Lightweight
- Predictable

Design decisions should reinforce the principles defined in **VISION.md**.

When in doubt:

> Simplicity beats complexity.  
> Consistency beats novelty.  
> Performance beats decoration.

---

# Foundations

## Color Palette

### Brand Colors

| Token | Value | Usage |
|--------|--------|------|
| `--color-primary` | `#14213D` | Primary actions, navigation |
| `--color-primary-hover` | `#1D2E55` | Primary hover |
| `--color-secondary` | `#6E2439` | Secondary accents |
| `--color-accent` | `#C6A15B` | Premium highlights |
| `--color-accent-light` | `#E2C98F` | Hover states |

---

### Background Colors

| Token | Value |
|--------|--------|
| `--color-background` | `#FAF6EE` |
| `--color-surface` | `#FFFFFF` |
| `--color-surface-muted` | `#F6F3ED` |
| `--color-surface-hover` | `#F2EEE7` |

---

### Text Colors

| Token | Value |
|--------|--------|
| `--color-text` | `#1F2937` |
| `--color-text-muted` | `#6B7280` |
| `--color-text-light` | `#9CA3AF` |
| `--color-text-inverse` | `#FFFFFF` |

---

### Borders

| Token | Value |
|--------|--------|
| `--color-border` | `#E5DED2` |
| `--color-border-light` | `#F0EBE3` |
| `--color-border-strong` | `#D2C8B8` |

---

### Semantic Colors

| Token | Value |
|--------|--------|
| Success | Emerald |
| Warning | Amber |
| Error | Deep Red |
| Info | Navy |

---

# CSS Variables

```css
:root {

  /* Brand */

  --color-primary: #14213D;
  --color-primary-hover: #1D2E55;

  --color-secondary: #6E2439;

  --color-accent: #C6A15B;
  --color-accent-light: #E2C98F;

  /* Background */

  --color-background: #FAF6EE;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F6F3ED;

  /* Typography */

  --color-text: #1F2937;
  --color-text-muted: #6B7280;

  /* Border */

  --color-border: #E5DED2;
  --color-border-light: #F0EBE3;

}
```

---

# Typography

## Heading Font

Preferred:

- Cinzel
- Marcellus
- Cormorant Garamond

Used for:

- Hero headings
- Collection titles
- Page headings

---

## Body Font

Preferred:

- Inter
- Manrope

Used for:

- Paragraphs
- Product information
- Navigation
- Buttons
- Forms

---

## Typography Scale

| Style | Size | Weight |
|---------|------|--------|
| Display | 56px | 700 |
| H1 | 40px | 700 |
| H2 | 32px | 700 |
| H3 | 24px | 600 |
| H4 | 20px | 600 |
| Body Large | 18px | 400 |
| Body | 16px | 400 |
| Small | 14px | 400 |
| Caption | 12px | 400 |

Use a consistent vertical rhythm with approximately 1.5 line-height for body text.

---

# Spacing System

Use an 8-point spacing system.

Base scale:

```
4
8
12
16
24
32
48
64
96
128
```

Avoid arbitrary spacing values.

---

# Border Radius

| Token | Value |
|--------|--------|
| Small | 8px |
| Medium | 12px |
| Large | 16px |
| XL | 20px |
| Pill | 999px |

---

# Shadows

## Level 1

Inputs

Small cards

```
0 2px 6px rgba(0,0,0,.05)
```

---

## Level 2

Product Cards

```
0 8px 20px rgba(0,0,0,.08)
```

---

## Level 3

Dropdowns

```
0 12px 28px rgba(0,0,0,.12)
```

---

## Level 4

Modals

```
0 20px 40px rgba(0,0,0,.15)
```

---

# Motion

Animations should explain interactions—not decorate them.

## Durations

Fast

150ms

Normal

250ms

Slow

350ms

---

## Easing

```
ease-out
```

---

## Allowed Animations

- Fade
- Lift
- Scale
- Slide
- Blur
- Opacity

---

## Avoid

- Bounce
- Elastic
- Shake
- Flash
- Spin
- Long delays

---

# Layout

## Grid

Desktop

12 columns

Tablet

8 columns

Mobile

4 columns

---

## Width

Maximum layout width

1400px

Reading width

760px

---

# Buttons

## Primary

- Navy background
- White text
- Gold hover
- Medium radius
- Smooth transition

Hover:

- Slight lift
- Color transition

Pressed:

- Scale 98%

---

## Secondary

Outline

Transparent background

Navy border

---

## Ghost

Minimal styling

No border

---

## Danger

Deep red

Reserved for destructive actions

---

# Product Cards

Every card should contain:

- Product image
- Name
- Price
- Stock
- Condition badge
- Add to Cart

Hover:

- Lift 6px
- Slight image zoom
- Stronger shadow
- Gold border accent

Cards should maintain consistent heights within a grid.

---

# Forms

Forms should prioritize clarity and accessibility.

Requirements:

- Rounded inputs
- Clear labels
- Visible focus ring
- Inline validation
- Consistent spacing
- Error messaging

Touch targets should be at least **44×44px**.

---

# Tables

Admin tables should include:

- Sticky headers
- Hover highlight
- Zebra striping
- Status badges
- Comfortable spacing
- Responsive scrolling

---

# Navigation

Sticky.

Background blur.

Subtle shrink on scroll.

Animated underline.

Smooth dropdowns.

Search should always be accessible.

---

# Search

Should include:

- Live suggestions
- Product thumbnails
- Pokémon matches
- Set matches
- Keyboard navigation
- Recent searches
- Trending searches

---

# Homepage

Recommended order:

1. Hero
2. Featured Collections
3. New Arrivals
4. Trending Products
5. Popular Sets
6. Trust Section
7. Reviews
8. Newsletter
9. Footer

---

# Product Listing

Prioritize:

- Product imagery
- Filtering
- Sorting
- Responsive grids

Avoid excessive spacing that reduces product density.

---

# Product Page

Include:

- Large gallery
- Image zoom
- Sticky purchase panel
- Condition
- Stock
- Shipping
- Related products
- Recently viewed

The purchase section should remain visible while scrolling on desktop.

---

# Collections

Each collection should contain:

- Banner
- Description
- Product count
- Featured products
- Filters

Avoid plain text headers.

---

# Empty States

Use branded messaging.

Example:

> Looks like this binder page is empty.

Offer useful next actions.

Include subtle illustrations where appropriate.

---

# Loading States

Never show blank pages.

Use:

- Skeletons
- Shimmer loaders
- Progressive image loading
- Fade-in transitions

---

# Icons

Use **Lucide** exclusively.

Icons should support text rather than replace it.

Maintain consistent stroke width.

---

# Imagery

Product photography is sacred.

Never:

- Crop cards
- Add decorative frames
- Apply heavy overlays
- Distort aspect ratios

Prefer neutral backgrounds.

---

# Accessibility

Minimum standard:

WCAG AA

Requirements:

- Keyboard navigation
- Visible focus
- Semantic HTML
- Screen reader labels
- Reduced motion support
- High contrast

---

# Performance Targets

LCP

<2.5s

CLS

<0.1

INP

<200ms

Animations

60 FPS

Images

Lazy-loaded

Prefer:

- WebP
- AVIF

Minimize layout shift.

---

# Responsive Philosophy

Mobile is not a simplified desktop.

Rearrange before removing.

Maintain feature parity whenever practical.

Optimize layouts for touch-first interactions.

---

# Component Philosophy

Every reusable component should:

- Solve one problem well
- Be composable
- Support light future customization
- Avoid page-specific styling
- Share design tokens

Favor composition over duplication.

---

# Implementation Principles

Prefer:

- CSS variables
- Reusable utilities
- Shared components
- Semantic HTML
- Progressive enhancement

Avoid:

- Inline styling
- One-off component variants
- Duplicate code
- Hardcoded spacing
- Hardcoded colors

---

# Anti-Patterns

Never introduce:

- Neon colors
- Oversized hero sections
- Heavy gradients
- Multiple accent colors
- Dashboard aesthetics
- Excessive glassmorphism
- Decorative clutter
- Random animation styles
- Inconsistent spacing
- Oversized shadows
- Auto-playing carousels
- Bounce animations
- Generic ecommerce templates

Every visual element should justify its existence.

---

# Decision Framework

When multiple solutions are possible, prioritize in this order:

1. Trust
2. Clarity
3. Product Visibility
4. Ease of Shopping
5. Accessibility
6. Performance
7. Responsiveness
8. Consistency
9. Delight
10. Decorative Effects

---

# Definition of Done

A feature is considered complete when it:

- Matches the design system
- Uses shared tokens
- Is responsive
- Meets accessibility standards
- Maintains performance targets
- Supports keyboard navigation
- Has appropriate loading and empty states
- Includes meaningful interaction feedback
- Avoids introducing unnecessary complexity

If a design decision conflicts with **VISION.md**, the principles in **VISION.md** take precedence.