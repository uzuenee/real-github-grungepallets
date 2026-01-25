# Image Assets Needed

This document lists images needed across the website (excluding product images managed through the admin panel).

## 1) Hero background

- Location: `src/components/sections/Hero.tsx`
- File: `public/images/hero-background.jpg`
- Recommended size: 1920×1080 (background-cover)
- Prompt:
  - Industrial warehouse with wooden pallets stacked high, dramatic lighting with amber/orange sun rays through large windows, forklift in motion blur, warm earthy tones, dust particles in light beams, wide angle, professional commercial photography.

## 2) About page image

- Location: `src/components/sections/AboutContent.tsx`
- File: `public/images/about-company.jpg`
- Recommended size: 800×600 (4:3)
- Prompt:
  - Warehouse team in safety vests/hard hats in front of organized pallets, friendly/professional, diverse team, forklift in background.

## 3) Resources/blog header images

Used by article cards + article pages.

- `public/images/articles/article-pallet-grades.jpg`
  - Prompt: side-by-side pallet grade comparison (new → used → worn), clean warehouse floor, educational/product photo style.
- `public/images/articles/article-recycling-benefits.jpg`
  - Prompt: pallet recycling facility sorting scene, sustainability theme.
- `public/images/articles/article-choosing-pallet.jpg`
  - Prompt: person examining pallet with tablet, decision-making, warehouse background.
- `public/images/articles/article-sustainability.jpg`
  - Prompt: aerial yard view with green surroundings, morning golden hour, sustainability theme.

## 4) Optional service images

Location: `src/components/sections/ServicesGrid.tsx` (icons already work well).

- `public/images/services/service-pallet-supply.jpg`
- `public/images/services/service-pallet-removal.jpg`
- `public/images/services/service-logistics.jpg`

## Image specs

- Format: JPG for photos; PNG for graphics with transparency.
- Quality: 80–85% compression.
- Color profile: sRGB.
- Target size: under ~500KB each after compression.

