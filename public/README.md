# Public Asset Structure

This folder contains all static assets served by the Coldstone Soap Co. website.

## Source Of Truth

- `BrandImageLibrary.md` in the repo root defines the brand-library prompt, asset targets, generation rules, and future image guidance.
- `public/brand/README.md` defines the active brand imagery system, approval checklist, and current generated inventory.
- This file explains the folder structure for everything under `public`.

## Folder Structure

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
      field-kit-ritual-scene.png
      photoreal-s-stamp.png
      maker-bench-process.png
      packing-bench.png
      ingredient-still-life.png
      bathroom-ritual-use-context.png
      product-family-black-granite.png
      product-family-stone-forge.png
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

## What Belongs Where

`public/brand/` is the controlled brand image library. Put reusable brand identity, profile, source-family, and platform-native social assets here.

`public/brand/source/` is for master source-family images used to derive platform crops and future related assets. Keep these text-free and high quality.

`public/brand/website/` is for website profile and background assets, including the approved `profile-stamp.png` used by the site logo lockup and favicon family.

`public/brand/facebook/`, `public/brand/instagram/`, `public/brand/tiktok/`, `public/brand/linkedin/`, and `public/brand/x/` are for platform-native exported PNGs.

`public/hero/` is for homepage hero imagery. The current active hero files are:

```text
public/hero/coldstone-field-kit-ritual-desktop.png
public/hero/coldstone-field-kit-ritual-mobile.png
```

The older hero files remain as source/fallback assets:

```text
public/hero/coldstone-hero-desktop.jpg
public/hero/coldstone-hero-mobile.jpg
```

The root product images currently remain in place because the app references them:

```text
public/black-granite-soap.jpg
public/black-granite.jpg
public/stone-forge.jpg
```

Avoid dumping one-off generated images directly into `public/` root. Add them to `public/brand/source/`, the appropriate platform folder, or `public/hero/` based on use.

## Current Brand-Relevant Assets

```text
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
public/hero/coldstone-field-kit-ritual-desktop.png
public/hero/coldstone-field-kit-ritual-mobile.png
```

## App-Linked Assets Outside `public`

The favicon family is derived from the approved profile stamp but lives in `app/` because these are Next.js App Router metadata files:

```text
app/favicon.ico
app/icon.png
app/apple-icon.png
```

## Rules

- Do not move existing app-referenced assets unless code references are updated in the same change.
- Do not overwrite the existing `public/brand/coldstone-*.svg` logo files.
- Generated brand-library assets should follow the `public/brand/` platform folder structure from `BrandImageLibrary.md`.
- Brand source-family assets belong in `public/brand/source/`.
- Homepage hero assets belong in `public/hero/`.
- Product images should eventually move into a product-specific folder only if app references are updated at the same time.
- Backgrounds must not include readable generated text, fake logos, slogans, watermarks, or clutter.
- Run `python scripts\generate-brand-library.py --validate-only` after adding or regenerating brand-library assets.

## Additional Content To Consider

We do not need more files for the current shipped hero/profile/social/campaign library to function. The current structure is populated correctly.

Consider adding these content/image files if the site needs stronger page-level product storytelling:

```text
public/products/black-granite/hero.png
public/products/stone-forge/hero.png
public/process/cold-process-bench.png
public/process/slow-cure-rack.png
```

Only create those when there is a real page, campaign, or metadata integration ready to use them.
