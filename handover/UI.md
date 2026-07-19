# PokeSunshineTCG — UI Patterns

> **Version:** 1.0  
> **Status:** Living Document  
> **Purpose:** Define reusable interface patterns, page structures, and interaction behaviors across the PokeSunshineTCG storefront and admin experience.

---

# Purpose

This document defines how common user interface patterns should be designed and implemented.

While `VISION.md` defines the experience we want to create and `DESIGN_SYSTEM.md` defines the visual rules, this document defines how those rules should be applied to real screens.

The goal is to ensure every page feels like part of the same premium collector marketplace.

---

# Pattern Principles

Every UI pattern should:

- Reduce user effort
- Improve confidence
- Maintain product focus
- Feel predictable
- Work across devices
- Handle loading, empty, and error states
- Use existing design tokens
- Avoid unnecessary complexity

---

# Page Structure Philosophy

Every page should communicate:

1. Where am I?
2. What can I do here?
3. What information matters most?
4. What is the next action?

Users should never feel lost.

---

# Global Layout Pattern

## Desktop Structure

```
------------------------------------------------
Header
------------------------------------------------

Main Content

Maximum Width Container

------------------------------------------------

Footer

------------------------------------------------
```

---

## Container Rules

Primary content:

```
max-width: 1400px
```

Reading content:

```
max-width: 760px
```

Horizontal padding:

Desktop:

```
32px
```

Mobile:

```
16px
```

---

# Header Pattern

## Purpose

The header should provide immediate access to the most important shopping actions.

---

## Structure

Desktop:

```
Logo

Navigation

Search

Account

Cart
```

Mobile:

```
Menu

Logo

Cart

----------------

Search
```

---

## Behavior

Header should:

- Remain sticky
- Shrink slightly after scrolling
- Use subtle background blur
- Maintain readability
- Avoid blocking content

---

## Navigation

Primary navigation:

- Collections
- Singles
- Sealed Products
- New Arrivals
- Featured

---

## Interaction

Dropdowns should:

- Open smoothly
- Have clear focus states
- Close predictably
- Support keyboard navigation

Avoid:

- Large mega menus
- Excessive animation
- Hidden navigation

---

# Footer Pattern

## Purpose

Reinforce trust and provide useful information.

---

## Structure

Columns:

### Store

- About
- Contact
- FAQ

### Shopping

- Collections
- Shipping
- Returns

### Support

- Help Center
- Customer Service

### Social

- Social links

---

## Footer Should Communicate

- Professionalism
- Transparency
- Reliability

---

# Homepage Pattern

## Goal

The homepage should feel curated, not like a product dump.

---

# Recommended Order

## 1. Hero Section

Purpose:

Introduce the brand.

---

Content:

Headline:

> Welcome to PokeSunshineTCG

Subtitle:

> Authentic Pokémon cards, sealed products, and collector favorites.

Actions:

Primary:

Shop Singles

Secondary:

Shop Sealed

Tertiary:

New Arrivals

---

## Hero Rules

Should be:

- Elegant
- Spacious
- Product-focused

Avoid:

- Large promotional text
- Excessive animation
- Busy backgrounds

---

# 2. Featured Collections

Purpose:

Help customers discover categories.

Examples:

- Latest Sets
- Vintage Collection
- Popular Pokémon
- Trainer Collections

---

Pattern:

Image

Title

Short description

CTA

---

# 3. Product Sections

Examples:

- New Arrivals
- Trending Products
- Recently Added

---

Each section should contain:

Heading

Optional description

Product carousel/grid

View all action

---

# Product Grid Pattern

## Purpose

Allow comfortable browsing.

---

## Desktop

```
4-5 products per row
```

---

## Tablet

```
3 products per row
```

---

## Mobile

```
2 products per row
```

---

## Product Card Structure

```
------------------

Image

Condition Badge

Product Name

Price

Stock

Action Button

------------------
```

---

## Product Card Behavior

Hover:

- Lift 4-8px
- Increase shadow
- Slight image zoom
- Reveal secondary actions

---

Avoid:

- Excessive badges
- Large overlays
- Flash animations

---

# Product Card States

## Default

Normal appearance.

---

## Hover

Enhanced elevation.

---

## Loading

Skeleton placeholder.

---

## Out Of Stock

Show:

- Disabled action
- Clear status
- Optional notification option

---

# Product Listing Page

## Purpose

Help customers discover products efficiently.

---

## Structure

```
Breadcrumb

Title

Description

Filters

Sort

Product Grid

Pagination
```

---

# Filters Pattern

Desktop:

Sidebar

Mobile:

Drawer

---

Filters may include:

- Set
- Pokémon
- Type
- Condition
- Price
- Availability

---

## Filter Behavior

Should:

- Update quickly
- Preserve selections
- Show active filters
- Allow clearing

---

# Sorting

Common options:

- Newest
- Price low-high
- Price high-low
- Popularity

---

# Search Pattern

## Goal

Help customers find products quickly.

---

## Search Experience

Include:

- Instant suggestions
- Product thumbnails
- Pokémon names
- Set names
- Recent searches

---

## Search Dropdown

Structure:

```
Search result

Image

Name

Category

Price
```

---

## Keyboard Support

Support:

- Arrow navigation
- Enter selection
- Escape closing

---

# Product Detail Page

## Goal

Convert interest into confidence.

---

# Layout

Desktop:

```
---------------------------------

Gallery

        Product Information

        Price

        Purchase

---------------------------------
```

---

Mobile:

```
Gallery

Information

Purchase

Details
```

---

# Product Gallery

Include:

- Main image
- Thumbnail images
- Zoom

---

Rules:

Never distort cards.

Never crop important details.

---

# Purchase Panel

Should include:

- Product title
- Price
- Condition
- Availability
- Quantity
- Add to Cart

---

## Add To Cart Interaction

Sequence:

1. Button compresses slightly
2. Loading state appears
3. Confirmation appears
4. Cart updates smoothly

---

Optional:

Subtle product image movement toward cart.

---

# Product Information Sections

Recommended:

## Description

Explain product details.

## Condition

Provide grading information.

## Shipping

Explain delivery expectations.

## Authenticity

Reinforce trust.

---

# Recently Viewed Pattern

Purpose:

Help customers continue browsing.

---

Display:

Horizontal carousel.

Include:

- Product image
- Name
- Price

---

# Collection Page Pattern

## Structure

```
Banner

Collection Title

Description

Product Count

Filters

Products
```

---

Collection banners should be:

- Clean
- Themed
- Product-focused

---

# Cart Pattern

## Goal

Create confidence before checkout.

---

Include:

- Product image
- Quantity controls
- Price
- Remove option
- Shipping estimate

---

Avoid:

- Aggressive upselling
- Clutter

---

# Checkout Pattern

## Principles

Checkout should feel:

- Secure
- Simple
- Professional

---

Reduce:

- Distractions
- Navigation complexity
- Extra content

---

Include:

- Order summary
- Shipping information
- Payment information
- Confirmation

---

# Empty State Pattern

Empty states should be helpful.

Structure:

```
Illustration

Headline

Explanation

Primary Action
```

---

Examples:

Cart:

> Your binder is empty.

Search:

> We couldn't find that card.

Wishlist:

> Save cards you want to collect.

---

# Loading Pattern

Never show blank content.

Use:

- Skeleton cards
- Placeholder text
- Progressive loading

---

Loading should communicate:

"The page is working."

---

# Error Pattern

Errors should be:

- Clear
- Calm
- Helpful

Avoid technical language.

Include:

- What happened
- What the user can do next

---

# Notification Pattern

Use for:

- Cart updates
- Saved changes
- Successful actions

---

Rules:

- Short duration
- Non-blocking
- Accessible

---

# Modal Pattern

Use sparingly.

Good uses:

- Image zoom
- Confirmations
- Quick actions

Avoid:

- Important information hidden in modals

---

# Quick View Pattern

Optional feature.

Should show:

- Image
- Name
- Price
- Condition
- Add to Cart

Should link to full product page.

---

# Admin UI Patterns

The admin experience should use the same design system.

---

# Dashboard Pattern

Include:

- Summary cards
- Recent orders
- Inventory status
- Revenue overview

---

Cards should prioritize:

Important information first.

---

# Admin Tables

Required features:

- Sticky headers
- Sorting
- Filtering
- Pagination
- Status badges
- Bulk actions

---

# Admin Forms

Follow storefront form rules.

Include:

- Clear labels
- Validation
- Helpful descriptions
- Error messages

---

# Status Badge Pattern

Use semantic colors.

Examples:

Success:

Completed

Warning:

Pending

Error:

Failed

Neutral:

Draft

---

# Mobile Patterns

Mobile layouts should prioritize:

- Thumb reach
- Large controls
- Simple navigation
- Fast actions

---

Avoid:

- Tiny buttons
- Desktop layouts squeezed onto mobile
- Horizontal scrolling unless intentional

---

# Animation Patterns

Use animation only when it improves understanding.

Approved:

Card hover

Button feedback

Page transitions

Dropdown opening

Loading states

---

Avoid:

- Continuous animation
- Decorative movement
- Long transitions

---

# Accessibility Checklist

Every pattern must support:

✓ Keyboard navigation  
✓ Focus indicators  
✓ Screen readers  
✓ Reduced motion  
✓ Proper contrast  
✓ Touch-friendly controls  

---

# Component Reuse Rules

Before creating a new component:

Ask:

1. Does this already exist?
2. Can an existing component handle this?
3. Is this pattern likely to repeat?

Prefer extending existing components.

---

# Design Quality Checklist

Before shipping any page:

## Visual

✓ Matches brand  
✓ Uses design tokens  
✓ Product remains focus  

## Interaction

✓ Loading states exist  
✓ Empty states exist  
✓ Errors handled  

## Accessibility

✓ Keyboard usable  
✓ Focus visible  
✓ Contrast acceptable  

## Performance

✓ Images optimized  
✓ Animations smooth  
✓ Layout stable  

---

# Final Principle

The best UI is the one users stop noticing.

PokeSunshineTCG should feel effortless:

Easy to browse.

Easy to trust.

Easy to collect.