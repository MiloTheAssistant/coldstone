# GEO/SEO Audit Report: Coldstone Soap Co.

**Audit Date:** 2026-05-13  
**Target:** https://www.coldstonesoap.com  
**Local Repo:** D:\Dev\ColdStoneSoap-Website  
**Business Type:** E-commerce with educational content

## Executive Summary

The live Coldstone site was crawlable and had useful homepage metadata, Open Graph data, indexable text, and a fair quick GEO/SEO score of 62. The main blockers were missing structured data, missing `robots.txt`, missing `sitemap.xml`, missing `llms.txt`, and no canonical links detected on the live homepage. Implementation now adds those crawler-facing foundations and keeps private/auth/cart/API routes out of public discovery files.

## Audit Evidence

- `geo_quick_audit.py https://example.com --pretty` completed successfully as the skill smoke test.
- `geo_quick_audit.py https://www.coldstonesoap.com --pretty` returned HTTP 200 and a quick score of 62.
- Live findings before implementation: no JSON-LD schema, `/robots.txt` 404, `/sitemap.xml` 404, `/llms.txt` 404, canonical not detected, and 2 images missing alt text.
- `llmstxt_generator.py` confirmed the live `llms.txt` was missing; its generated draft included cart/account paths and a bad `contact@www.coldstonesoap.com` address, so the final file was hand-reviewed.

## Current Crawler Policy Inputs

Crawler names were verified from current official documentation before implementation:

- OpenAI documents `OAI-SearchBot`, `GPTBot`, and `ChatGPT-User`: https://developers.openai.com/api/docs/bots
- Anthropic documents `ClaudeBot`, `Claude-User`, and `Claude-SearchBot`: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Perplexity documents `PerplexityBot` and `Perplexity-User`: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- Google documents `Googlebot`, `GoogleOther`, and `Google-Extended`: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers

## Implemented Improvements

- Added `app/robots.ts` with explicit allow rules for AI/search visibility crawlers and disallow rules for API, cart, checkout, auth, account, and private recipe routes.
- Added `app/sitemap.ts` for homepage, shop, public product pages, blog index, public blog posts, FAQ, shipping, returns, privacy, and terms.
- Added `public/llms.txt` with factual public pages only, excluding cart, account, checkout, API, and private recipe routes.
- Added canonical metadata to public pages and noindex metadata to cart, checkout, and auth pages.
- Added JSON-LD foundations: Organization, WebSite, Product, Article, and FAQPage.

## Verification

- Local checks passed: `npm.cmd run lint`, `npm.cmd test`, and `npm.cmd run build`.
- Local production route checks passed on a temporary port because the assigned `3004/3005` ports were already occupied by existing Node processes.
- Preview deployment completed: https://coldstone-jvgzvsi55-project-milo.vercel.app
- The preview is Vercel Deployment Protection gated for public requests, so unauthenticated GEO crawling sees a 401 auth wall. Authenticated `vercel curl` checks confirmed `/`, `/shop`, `/products/black-granite`, `/blog`, `/blog/what-is-cold-process-soap`, `/faq`, `/robots.txt`, `/sitemap.xml`, and `/llms.txt` return 200 on the preview.
- Authenticated preview checks confirmed product canonical metadata, Open Graph/Twitter tags, Product JSON-LD, crawler names in `robots.txt`, and an `llms.txt` that excludes `/cart` and `/sign-in`.

## Follow-Up Plan

1. Re-run the GEO quick audit after deployment to confirm live `/robots.txt`, `/sitemap.xml`, `/llms.txt`, canonicals, and schema are visible.
2. Add stronger on-page citability blocks over time: ingredient summaries, process proof, founder/veteran-owned context, batch/cure details, and answer-style FAQ snippets on product and article pages.
3. Monitor server or Vercel logs for verified bot access where available, especially `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, and `Googlebot`.
