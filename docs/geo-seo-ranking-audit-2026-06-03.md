# GEO/SEO Ranking Audit: Coldstone Soap Co.

**Audit Date:** 2026-06-03
**Target:** https://www.coldstonesoap.com
**Business Type:** E-commerce plus soapmaking education

## Executive Summary

Coldstone has a strong technical GEO/SEO foundation. The live quick audit scores `100` with an `excellent` rating: homepage metadata, canonical, robots, sitemap, `llms.txt`, image alt text, crawler access, and core schema are all visible. The next ranking gains should come from higher-citability content blocks, stronger page-level answer sections, better internal linking, and verified external authority signals.

## Live Audit Evidence

- `geo_quick_audit.py https://www.coldstonesoap.com --pretty`
  - Status: `200`
  - Score: `100`
  - Rating: `excellent`
  - Findings: none
  - Sitemap: `200`, 18 URL hints
  - `llms.txt`: `200`, 18 links
  - Robots crawler access: allowed for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Google-Extended, GoogleOther, PerplexityBot, and related crawlers checked by the skill.
- `llmstxt_generator.py https://www.coldstonesoap.com validate`
  - Exists: true
  - Format valid: true
  - Sections: 5
  - Links: 18
  - Issues: none

## Route And Coverage Checks

Representative live routes returned `200`: `/`, `/shop`, both product pages, `/blog`, a representative blog post, `/soap-making`, `/soap-making/soap-making-101-beginners-guide`, `/faq`, `/robots.txt`, `/sitemap.xml`, and `/llms.txt`.

The live sitemap and `llms.txt` both cover the same 18 public URLs:

- Home, shop, blog, FAQ, shipping, returns, privacy, terms
- Black Granite and Stone Forge product pages
- Six public blog posts
- Soapmaking Lesson Library and the public Soap Making 101 preview module

## Page-Level Signals

- Homepage: canonical `https://www.coldstonesoap.com`, Organization and WebSite schema.
- Product page: canonical, Product, Brand, and Offer schema.
- Blog post: canonical and Article schema.
- Soapmaking library: canonical and CollectionPage schema.
- Soap Making 101 module: canonical and Course schema.
- FAQ: canonical and FAQPage schema.

## Primary Opportunity

The homepage citability score is the main gap:

- Average citability score: `27.8`
- Grade distribution: 0 A, 0 B, 0 C, 2 D, 4 F
- Weakest blocks are short or context-light sections such as product cards, cure-time copy, customer quote aggregation, and the Soap Calculator teaser.

This does not mean the site is technically weak. It means the current copy is not yet structured as highly citable answer blocks for AI systems.

## Recommended Next Fixes

1. Add answer-ready homepage sections that define Coldstone, cold process soap, the two bars, and SoapAbacus in self-contained 80-150 word blocks.
2. Strengthen product pages with concise, citable product summaries, ingredient rationale, bar care notes, and internal links to related blog/lesson content.
3. Add breadcrumb schema and visible breadcrumbs for products, blog posts, and soapmaking pages.
4. Add ItemList schema to shop, blog, and soapmaking index pages.
5. Expand internal links from blog and lesson pages to relevant products, FAQ, and SoapAbacus where the connection is natural.
6. Audit real external authority signals before adding `sameAs`; only add official profiles that actually exist and are maintained.

## Approval-Gated Items

Do not proceed without explicit approval for:

- Search Console sitemap submission or URL inspection requests.
- Google Business Profile, social profile, directory, or review-platform changes.
- Any off-page outreach or link-building campaign.
- Any robots, noindex, redirect, or canonical changes that alter public search behavior.
