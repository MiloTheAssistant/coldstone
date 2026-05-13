# Coldstone Soap Co. Brand Image Library Prompt

Use this prompt to generate and maintain a complete, project-specific brand image library for the Coldstone Soap Co. website.

## Project

- Website/project name: Coldstone Soap Co.
- Website domain: https://coldstonesoap.com
- Repo: D:\Dev\ColdStoneSoap-Website
- Business/location/audience: A veteran-owned small-batch soap company serving customers who want durable, premium, American-made cold process soap with practical everyday utility.
- Current hero image/vibe: Field Kit Ritual - a cinematic rugged dopp kit sink scene with wet black stone, canvas, leather, steel, water highlights, aged brass, and the real Coldstone soap bar as the product anchor.
- Brand tone: Rugged, masculine, premium, disciplined, practical, veteran-owned, American-made, small-batch, and crafted without gimmicks.
- Brand promise: Stone-stamped soap. Built for hard use.
- Brand colors or visual cues: Midnight black, gunmetal, parchment, aged gold, restrained crimson, wet black stone, field-kit canvas, leather, brass, steel, water highlights, and disciplined negative space.
- Destination folder: D:\Dev\ColdStoneSoap-Website\public\brand

## Current Public Asset Structure

```text
public/
  README.md
  black-granite-soap.jpg
  black-granite.jpg
  stone-forge.jpg
  brand/
    README.md
    coldstone-logo-badge.svg
    coldstone-logo-horizontal.svg
    coldstone-logo-mark.svg
    coldstone-logo-slab.svg
    coldstone-s-badge.svg
    contact-sheet.png
    source/
    website/
    campaign/
    facebook/
    instagram/
    tiktok/
    linkedin/
    x/
  hero/
    coldstone-field-kit-ritual-desktop.png
    coldstone-field-kit-ritual-mobile.png
    coldstone-hero-desktop.jpg
    coldstone-hero-mobile.jpg
```

Use `public/brand/` for the generated brand-library system. Use `public/hero/` for homepage hero imagery. Keep existing root product images in place unless code references are updated in the same change.

## Goal

Create project-specific image assets that complement the current Field Kit Ritual hero and give Coldstone Soap Co. a unified visual identity across the website and major social platforms.

Use a source-family brand library with:

- One strong photoreal profile stamp.
- Platform-native photoreal background assets.
- Website hero assets that feel connected to the same ritual world.
- A validation/contact-sheet workflow that keeps future work reviewable.

## Proposed `public/brand/README.md` Structure

### Purpose

Make `public/brand/README.md` the source of truth for Coldstone Soap Co. brand imagery: what the vibe is, what assets exist, how future images should be generated, and how to approve them.

### Brand Core

Coldstone Soap Co.: "Stone-stamped soap. Built for hard use." A veteran-owned small-batch cold process soap brand built around rugged utility, slow-cured quality, mineral-dark character, and disciplined American-made craft.

### Balanced Trinity

- Field Kit Ritual: rugged grooming context, dopp kit sink scene, wet black stone, canvas/leather, steel, brass, water highlights, and product-led utility.
- Maker Bench: cold-process craft, oils, curing racks, anonymous hands, packing details, practical tools, and small-batch credibility.
- Stone Standard: profile stamp, stone/gunmetal/brass emblem language, circular-crop recognition, endurance, and premium restraint.

### Anti-Slop Standard

Artistic freedom stays inside the Trinity. Technical execution stays disciplined: small source families, standard dimensions, no fake readable text, no watermark, no clutter, no unrelated scenes, no stock-photo spa softness, and no one-off visual gimmicks.

### Quality Rules

Photorealistic, premium, overlay-safe, brand-coherent, no fake UI text, no generated slogans, no watermarks, no distorted hands, no warped product forms, no people as main subjects except anonymous use-context, and profile stamps must read at small sizes.

### Asset System

Source, website, Facebook, Instagram, TikTok, LinkedIn, and X. Keep the current source-family approach so each platform asset feels related instead of one-off.

### Prompt Framework

Use the reusable Coldstone prompt framework below, with fields already filled and placeholders only where future asset-specific choices are needed.

### Approval Checklist

Lane, use case, visual quality, technical sizing, negative space, no AI slop, continuity with the Field Kit Ritual source family, and product clarity.

### Current Inventory

The current file list from `public/brand`.

## Required Output

The current generated library already includes:

1. A photoreal circular profile stamp that works as the primary social/profile/favicon model.
2. Clean photoreal platform backgrounds for:
   - Website
   - Facebook
   - Instagram
   - TikTok
   - LinkedIn
   - X / Twitter
3. Homepage hero images for desktop and mobile.
4. A contact sheet for fast review.
5. A local Python/Pillow validation workflow.

## Direction

Use a Field Kit Ritual brand-library approach:

- Preserve the existing SVG logo files as brand source assets.
- Use `public/brand/website/profile-stamp.png` for round profile contexts and app logo lockups.
- Use `public/hero/coldstone-field-kit-ritual-*.png` for the current homepage hero.
- Keep the real Coldstone bar as the product anchor wherever product recognition matters.
- Treat veteran-owned and American-made as trust signals, not heavy-handed visual props.
- Avoid fake readable text, military-prop gimmicks, generic spa imagery, and weak product focus.

## Profile Stamp Rules

- Photoreal brand-stamp object, not a flat vector mark.
- Circular-crop safe.
- Strong at small profile-picture and favicon sizes.
- May imply the existing `S` badge language, stone, brass, gunmetal, patina, beveling, scratches, and macro lighting.
- Do not rely on generated readable words except a simple S-style badge expression.
- No fake words, watermarks, slogans, or detailed typography.
- Should feel like a premium dimensional stamp or emblem from the same world as the hero.

## Background Rules

- Clean photoreal backgrounds.
- No embedded text, logos, slogans, or watermarks.
- Leave negative space for future overlays.
- Use real-world scenes connected to rugged soap, cold-process craft, field-kit ritual, workbench making, slow-cured product quality, or American-made discipline.
- Human presence may be implied through hands, maker tools, packing, or use context, but avoid identifiable portraits unless explicitly requested.
- Avoid distorted hands, clutter, fake readable UI text, random futuristic panels, generic spa softness, unrelated landmarks, and stock-photo energy.

## Folder Structure

```text
public/brand/
  README.md
  coldstone-logo-badge.svg
  coldstone-logo-horizontal.svg
  coldstone-logo-mark.svg
  coldstone-logo-slab.svg
  coldstone-s-badge.svg
  contact-sheet.png
  source/
  website/
  facebook/
  instagram/
  tiktok/
  linkedin/
  x/
```

## Asset Targets

```text
public/brand/source/field-kit-ritual-scene.png
public/brand/source/photoreal-s-stamp.png
public/brand/source/maker-bench-process.png
public/brand/source/packing-bench.png
public/brand/source/ingredient-still-life.png
public/brand/source/bathroom-ritual-use-context.png
public/brand/source/product-family-black-granite.png
public/brand/source/product-family-stone-forge.png

public/hero/coldstone-field-kit-ritual-desktop.png
public/hero/coldstone-field-kit-ritual-mobile.png

public/brand/website/profile-stamp.png
public/brand/website/profile-background.png

public/brand/facebook/profile-stamp.png
public/brand/facebook/cover-background.png
public/brand/facebook/post-background.png

public/brand/instagram/profile-stamp.png
public/brand/instagram/profile-background.png
public/brand/instagram/post-background.png
public/brand/instagram/story-background.png

public/brand/tiktok/profile-stamp.png
public/brand/tiktok/profile-background.png
public/brand/tiktok/cover-background.png

public/brand/linkedin/profile-stamp.png
public/brand/linkedin/company-cover-background.png
public/brand/linkedin/post-background.png

public/brand/x/profile-stamp.png
public/brand/x/header-background.png
public/brand/x/post-background.png

public/brand/campaign/maker-bench-process.png
public/brand/campaign/packing-bench.png
public/brand/campaign/ingredient-still-life.png
public/brand/campaign/bathroom-ritual-use-context.png
public/brand/campaign/black-granite-post.png
public/brand/campaign/black-granite-story.png
public/brand/campaign/stone-forge-post.png
public/brand/campaign/stone-forge-story.png

public/og-image.png
```

## Reusable Prompt Framework

```text
Create a complete photoreal brand image asset for Coldstone Soap Co.

Brand:
- Name: Coldstone Soap Co.
- Domain: https://coldstonesoap.com
- Promise: Stone-stamped soap. Built for hard use.
- Identity: Veteran-owned American-made small-batch cold process soap.
- Vibe: Field Kit Ritual with Maker Bench craft and Stone Standard restraint.
- Visual cues: wet black stone, rugged dopp kit sink scene, canvas, leather, steel, aged brass, gunmetal, parchment highlights, restrained crimson, water highlights, practical workbench details, premium masculine utility, and useful negative space.
- Product anchor: the Coldstone soap bar should remain recognizable when the asset is product-led.
- Avoid: fake readable text, fake logos, watermarks, clutter, distorted hands, warped tools, random futuristic panels, generic spa imagery, novelty military props, stock-photo people, and one-off gimmicks.

Asset:
- Platform/use case: [PLATFORM AND USE CASE]
- Orientation/dimensions: [TARGET DIMENSIONS]
- Composition needs: [NEGATIVE SPACE / CROP SAFETY / PROFILE CIRCLE / OVERLAY AREA]
- Source family lane: [Field Kit Ritual / Maker Bench / Stone Standard / Blend]
- Product visibility: [NONE / IMPLIED / SUPPORTING / PRIMARY PRODUCT ANCHOR]
- Human presence: [NONE / ANONYMOUS HANDS / IMPLIED MAKER / USE-CONTEXT ONLY]

Generate a clean, photoreal, premium, overlay-safe asset that feels connected to the Coldstone homepage hero and can live inside the same brand family. Do not include readable text, logos, slogans, or watermarks.
```

## After Generation

- Save all final PNGs into the correct platform folders.
- Validate that every file exists, opens as an image, has nonzero size, and has sensible platform dimensions.
- Run `python scripts\generate-brand-library.py --validate-only`.
- Regenerate `public/brand/contact-sheet.png` after any full brand-library refresh.
- Do not overwrite existing SVG logo files.
- Do not overwrite existing hero/product images unless explicitly requested.
- Do not move app-referenced assets unless code references are updated in the same change.

## Current Inventory

```text
public/brand/README.md
public/brand/coldstone-logo-badge.svg
public/brand/coldstone-logo-horizontal.svg
public/brand/coldstone-logo-mark.svg
public/brand/coldstone-logo-slab.svg
public/brand/coldstone-s-badge.svg
public/brand/contact-sheet.png
public/brand/source/field-kit-ritual-scene.png
public/brand/source/photoreal-s-stamp.png
public/brand/source/maker-bench-process.png
public/brand/source/packing-bench.png
public/brand/source/ingredient-still-life.png
public/brand/source/bathroom-ritual-use-context.png
public/brand/source/product-family-black-granite.png
public/brand/source/product-family-stone-forge.png
public/brand/website/profile-stamp.png
public/brand/website/profile-background.png
public/brand/facebook/profile-stamp.png
public/brand/facebook/cover-background.png
public/brand/facebook/post-background.png
public/brand/instagram/profile-stamp.png
public/brand/instagram/profile-background.png
public/brand/instagram/post-background.png
public/brand/instagram/story-background.png
public/brand/tiktok/profile-stamp.png
public/brand/tiktok/profile-background.png
public/brand/tiktok/cover-background.png
public/brand/linkedin/profile-stamp.png
public/brand/linkedin/company-cover-background.png
public/brand/linkedin/post-background.png
public/brand/x/profile-stamp.png
public/brand/x/header-background.png
public/brand/x/post-background.png
public/brand/campaign/maker-bench-process.png
public/brand/campaign/packing-bench.png
public/brand/campaign/ingredient-still-life.png
public/brand/campaign/bathroom-ritual-use-context.png
public/brand/campaign/black-granite-post.png
public/brand/campaign/black-granite-story.png
public/brand/campaign/stone-forge-post.png
public/brand/campaign/stone-forge-story.png
public/og-image.png
```

Brand-relevant site imagery currently outside the generated brand library:

```text
public/hero/coldstone-field-kit-ritual-desktop.png
public/hero/coldstone-field-kit-ritual-mobile.png
public/hero/coldstone-hero-desktop.jpg
public/hero/coldstone-hero-mobile.jpg
public/black-granite-soap.jpg
public/black-granite.jpg
public/stone-forge.jpg
app/favicon.ico
app/icon.png
app/apple-icon.png
```

## Additional Content To Consider

- Product-detail page hero images wired directly into `app/products/[slug]/page.tsx`.
- Process-section imagery wired into a future process/about page.
- Email/newsletter header images if campaigns become a priority.
- Retail/wholesale sell-sheet images for sales collateral.
- Seasonal or limited-run campaign source families once those products exist.
