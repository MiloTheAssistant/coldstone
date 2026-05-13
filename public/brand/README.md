# Coldstone Soap Co. Brand Image Library

## Purpose

Make this the source of truth for Coldstone Soap Co. brand imagery: what the vibe is, what assets exist, how future images should be generated, and how to approve them.

This document is written for this repo:

```txt
D:\Dev\ColdStoneSoap-Website
```

Primary asset destination:

```txt
public/brand
```

## Brand Core

Coldstone Soap Co. makes field-kit soap built for hard use: cold process, slow cured, veteran-owned, small batch, and American made.

Core promise:

> Stone-stamped soap. Built for hard use.

Operating idea:

> Cold process bars with disciplined utility, mineral-dark character, and no shortcuts.

The imagery should complement the SVG logo system rather than replace it. The current hero source family is the Field Kit Ritual: the real Coldstone bar staged in a rugged dopp kit sink world with wet black stone, canvas/leather, steel, water highlights, aged brass, and disciplined negative space.

## Balanced Trinity

Artistic freedom stays inside this trinity. Future images can lean harder into one lane, but they should not leave the system.

### Field Kit Ritual

The primary lane. Rugged, premium, disciplined, and built around daily hard-use grooming ritual.

Use for:

- Homepage hero images
- Website profile backgrounds and social covers
- Product-led campaign assets
- Veteran-owned and American-made brand credibility

Visual signals:

- Black granite soap texture
- Stamped metal and gunmetal surfaces
- Field-kit canvas, rope, brass edging, and workbench shadows
- Wet black stone, steel grooming tools, and water highlights
- Controlled negative space
- Dark product staging with enough brightness for clarity

### Maker Bench

The craft lane. Small-batch process, cold-process soapmaking, slow cure, ingredients, and hands-on quality.

Use for:

- Process and product education imagery
- Soapmaking posts
- Blog and story backgrounds
- Human-centered brand warmth without portrait-led lifestyle scenes

Visual signals:

- Anonymous hands or implied maker presence
- Workbench staging
- Oils, curing racks, tools, and textured surfaces
- Practical craft details
- Warm parchment/gold highlights inside the darker palette

### Stone Standard

The endurance lane. Minimal, mineral, durable, and iconic.

Use for:

- Profile stamps
- Brand marks and campaign anchors
- Minimal social backgrounds
- Premium product credibility

Visual signals:

- Circular-crop-safe `S` stamp expression
- Stone, slate, gunmetal, and aged gold
- Simple geometry
- Low clutter
- Strong recognition at small sizes

## Anti-Slop Standard

Artistic freedom stays inside the Trinity. Technical execution stays disciplined:

- Use small source families instead of unrelated one-off scenes.
- Keep standard platform dimensions.
- Do not generate fake readable text.
- Do not include watermarks.
- Do not add clutter.
- Do not introduce unrelated scenes, mascots, gimmicks, random architecture, generic spa visuals, or novelty masculine styling.
- Do not overwrite the existing hero or SVG logo files unless explicitly requested.

Every generated image should feel like it belongs to Coldstone Soap Co. and could sit next to the existing homepage hero without breaking the brand.

## Quality Rules

- Photorealistic.
- Premium and plausible.
- Overlay-safe with usable negative space.
- Brand-coherent with midnight, gunmetal, parchment, crimson, and aged gold.
- No fake UI text.
- No embedded logos, slogans, or brand names in background assets.
- No stock-photo clutter.
- No distorted hands, warped tools, or impossible product shapes.
- No people as main subjects except anonymous/profile-stamp use.
- Profile stamps must be circular-crop safe and readable at small sizes.

## Asset System

Use the current source-family approach:

- **Existing logo family:** keep `coldstone-*.svg` as protected source/logo assets; do not overwrite them.
- **Hero ritual family:** use `public/hero/coldstone-field-kit-ritual-*.png` as the current homepage source family.
- **Existing product family:** keep current hero/product photos as source and fallback assets.
- **Profile stamp family:** one photoreal circular-crop-safe brass/gunmetal `S` stamp copied across platforms and used for round site logo contexts.
- **Favicon family:** `app/favicon.ico`, `app/icon.png`, and `app/apple-icon.png` are derived from the approved website profile stamp for browser and device use.
- **Wide field-kit family:** wide cover/header compositions derived from the ritual hero.
- **Square stone family:** reusable square post/profile backgrounds.
- **Vertical field-kit family:** 9:16 story/reel assets.
- **Campaign family:** process, packing, ingredient, brighter use-context, and product-specific campaign crops derived from dedicated source images.
- **Contact sheet:** generated review sheet for fast approval.

Platform folders:

```txt
public/brand/
  source/
  website/
  campaign/
  facebook/
  instagram/
  tiktok/
  linkedin/
  x/
```

Expected platform assets:

```txt
public/brand/website/profile-stamp.png
public/brand/website/profile-background.png

public/brand/campaign/maker-bench-process.png
public/brand/campaign/packing-bench.png
public/brand/campaign/ingredient-still-life.png
public/brand/campaign/bathroom-ritual-use-context.png
public/brand/campaign/black-granite-post.png
public/brand/campaign/black-granite-story.png
public/brand/campaign/stone-forge-post.png
public/brand/campaign/stone-forge-story.png

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
```

## Prompt Framework

Use this prompt when generating additional Coldstone brand imagery. Keep the filled Coldstone fields intact and only change future asset-specific choices.

```text
I need to create a project-specific photoreal brand image asset for Coldstone Soap Co.

Project:
- Website/project name: Coldstone Soap Co.
- Website domain: coldstonesoap.com
- Repo path: D:\Dev\ColdStoneSoap-Website
- Destination folder: D:\Dev\ColdStoneSoap-Website\public\brand
- Business/location/audience: Coldstone Soap Co. serves customers who want durable, premium, small-batch cold process soap with veteran-owned discipline, American-made credibility, and practical everyday utility.
- Current hero image/vibe: Dark cinematic stamped black-stone soap, field-kit materials, gunmetal texture, parchment highlights, restrained crimson, and aged gold.
- Brand tone: Rugged, premium, disciplined, practical, veteran-owned, American-made, small-batch, masculine without gimmicks, crafted without softness.
- Brand colors or visual cues: Midnight black, gunmetal stone, parchment, aged gold, restrained crimson, field-kit canvas, rope/fiber texture, brass edging, workbench shadows, clean negative space.

Goal:
Create an image that complements the existing Coldstone hero and strengthens the brand's Field Kit Ritual identity across the website and social platforms.

Approved visual trinity:
- Field Kit Ritual: rugged premium dopp kit sink ritual, wet black stone, canvas/leather, steel, water highlights, disciplined negative space.
- Maker Bench: cold-process craft, slow cure, workbench details, anonymous hands, practical process.
- Stone Standard: iconic stone/gunmetal stamp, minimal product authority, circular-crop recognition.

Asset-specific choices:
- Asset type: [PROFILE STAMP / WEBSITE BACKGROUND / FACEBOOK COVER / INSTAGRAM POST / TIKTOK COVER / LINKEDIN COVER / X HEADER / OTHER]
- Target lane: [FIELD KIT RITUAL / MAKER BENCH / STONE STANDARD / BLEND]
- Target platform and crop: [PLATFORM + DIMENSIONS OR ASPECT RATIO]
- Main scene: [DESCRIBE THE REAL-WORLD SCENE]
- Negative space: [WHERE OVERLAY SPACE SHOULD BE LEFT]
- Human presence: [NONE / ANONYMOUS HANDS / IMPLIED MAKER / BACKGROUND OPERATOR / PROFILE-STAMP FIGURE]

Profile stamp rules, if applicable:
- Human-centered or brand-stamp-centered mark, not another abstract background.
- Circular-crop safe.
- Strong at small profile-picture sizes.
- Can imply the existing Coldstone S badge, stone, field-kit utility, and premium stamped materials.
- Do not rely on readable generated letters or words except a simple S-style badge expression.
- No fake words, watermarks, slogans, or detailed typography.
- Should feel like a premium dimensional emblem or brand stamp.

Background rules, if applicable:
- Clean photoreal background.
- No embedded text, logos, slogans, or watermarks.
- Leave usable negative space for future overlays.
- Use real-world scenes connected to rugged soap, cold-process craft, field-kit ritual, workbench making, slow-cured product quality, or American-made discipline.
- Human presence may be implied through hands, maker tools, packing, or use context, but avoid identifiable portraits unless explicitly requested.

Avoid:
Fake readable text, fake logos, watermarks, clutter, distorted hands, warped tools, random futuristic panels, unrelated landmarks, generic spa/apothecary softness, novelty military props, stock-photo energy, one-off visual gimmicks, cartoon/vector style.

Output:
Save the final PNG in the correct `public/brand` platform folder. Validate that the file exists, opens as an image, has nonzero size, and has sensible platform dimensions.
```

## Approval Checklist

Before approving a new asset, check:

- **Lane:** Does it clearly fit Field Kit Ritual, Maker Bench, Stone Standard, or an intentional blend?
- **Use case:** Is it composed for the intended website or platform placement?
- **Visual quality:** Does it look photorealistic, premium, plausible, and non-generic?
- **Technical sizing:** Does it have the expected platform dimensions or crop behavior?
- **Negative space:** Is there room for future overlays where needed?
- **No AI slop:** No fake readable text, no watermark, no distorted hands, no warped tools, no random visual nonsense.
- **Continuity:** Does it feel connected to the current source family and existing hero?

## Current Inventory

```txt
public\hero\coldstone-field-kit-ritual-desktop.png
public\hero\coldstone-field-kit-ritual-mobile.png
app\favicon.ico
app\icon.png
app\apple-icon.png
public\brand\coldstone-logo-badge.svg
public\brand\coldstone-logo-horizontal.svg
public\brand\coldstone-logo-mark.svg
public\brand\coldstone-logo-slab.svg
public\brand\coldstone-s-badge.svg
public\brand\contact-sheet.png
public\brand\source\field-kit-ritual-scene.png
public\brand\source\photoreal-s-stamp.png
public\brand\source\maker-bench-process.png
public\brand\source\packing-bench.png
public\brand\source\ingredient-still-life.png
public\brand\source\bathroom-ritual-use-context.png
public\brand\source\product-family-black-granite.png
public\brand\source\product-family-stone-forge.png
public\brand\website\profile-stamp.png
public\brand\website\profile-background.png
public\brand\campaign\maker-bench-process.png
public\brand\campaign\packing-bench.png
public\brand\campaign\ingredient-still-life.png
public\brand\campaign\bathroom-ritual-use-context.png
public\brand\campaign\black-granite-post.png
public\brand\campaign\black-granite-story.png
public\brand\campaign\stone-forge-post.png
public\brand\campaign\stone-forge-story.png
public\brand\facebook\profile-stamp.png
public\brand\facebook\cover-background.png
public\brand\facebook\post-background.png
public\brand\instagram\profile-stamp.png
public\brand\instagram\profile-background.png
public\brand\instagram\post-background.png
public\brand\instagram\story-background.png
public\brand\tiktok\profile-stamp.png
public\brand\tiktok\profile-background.png
public\brand\tiktok\cover-background.png
public\brand\linkedin\profile-stamp.png
public\brand\linkedin\company-cover-background.png
public\brand\linkedin\post-background.png
public\brand\x\profile-stamp.png
public\brand\x\header-background.png
public\brand\x\post-background.png
public\og-image.png
```
