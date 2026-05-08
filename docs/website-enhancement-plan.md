# Coldstone Website Enhancement Plan

Date: 2026-05-01

## Goal

Bring the main Coldstone website up to the same level of usefulness and polish as the Soap Calculator, with a clean mobile-first shopping experience, strong navigation, real commerce, blog/content foundations, and required legal pages.

The Soap Calculator remains a major traffic asset, but it is not the main implementation focus for this plan. This plan treats the calculator as a high-value destination that the website should promote, link to, and eventually convert from.

## Current Starting Point

The site is a Next.js 15 App Router project with Tailwind CSS. The homepage has strong brand mood, two featured products, a process/story section, testimonials, newsletter form, and links into the Soap Calculator.

Main gaps:

- Product cards exist, but the `ADD TO CART` actions do not implement commerce.
- There are no product detail pages.
- The footer includes placeholder links for Shipping, Returns, and FAQ.
- There are no Privacy or Terms pages.
- There is no blog/content section.
- Navigation is attractive, but the site needs a fuller information architecture for shopping, content, legal, and calculator flows.
- There is global metadata, but no sitemap, robots route, product schema, organization schema, or product-specific SEO structure.
- The newsletter form is currently visual-only and does not persist submissions.

## Guiding Priorities

1. Revenue path first: buyers should be able to find products, understand them, add them to cart, and check out.
2. Mobile first: every key flow should feel crisp on a phone, especially navigation, cart, product pages, and checkout entry.
3. Trust before cleverness: handmade soap buyers need ingredients, shipping, returns, batch/process details, reviews, and safe policies.
4. Content compounds traffic: blog posts should target useful soap, ingredient, cold process, and grooming queries.
5. Keep commerce pragmatic: use Stripe Checkout Sessions first rather than building a custom payment form from scratch.
6. Keep the calculator linked but separate: the calculator gets its own focused session later.

## Recommended Commerce Direction

Use a local cart in the Next.js app with Stripe Checkout Sessions for payment.

Why:

- Stripe Checkout is a low-code payment flow that can be hosted by Stripe or embedded on the site.
- Checkout Sessions support one-time payments, payment methods, shipping, discounts, tax options, and product/price data.
- This gives Coldstone a real cart and checkout quickly without taking on the risk and time cost of a fully custom card-entry UI.

Recommended first version:

- Use Stripe Products and Prices as the payment catalog.
- Maintain a local typed catalog file that maps Coldstone product slugs to Stripe Product and Price IDs.
- Store cart state client-side for browsing and adding items.
- Create a server route that validates cart line items against the local catalog and creates a Stripe Checkout Session with Stripe Price IDs.
- Redirect to Stripe-hosted Checkout for Phase 2 launch.
- Add the webhook skeleton in Phase 3, then extend it for durable order storage when the fulfillment workflow is defined.

### Stripe Catalog Separation

Coldstone should use the same Stripe account if desired, but every Coldstone product and price should be clearly separated from other projects.

Use this convention:

- Stripe Product name prefix: `Coldstone Soap Co. - Black Granite`
- Stripe Product metadata:
  - `project=coldstone`
  - `site=coldstonesoapco.com`
  - `catalog_slug=black-granite`
  - `sku=CSS-BG-001`
- Stripe Price metadata:
  - `project=coldstone`
  - `catalog_slug=black-granite`
  - `price_role=retail`
- Local catalog fields:
  - `stripeProductId`
  - `stripePriceId`
  - `sku`
  - `project: 'coldstone'`

Checkout code should only accept product IDs from the local Coldstone catalog. The server should never accept arbitrary Stripe Price IDs from the browser.

This keeps the Stripe Dashboard usable across multiple projects while keeping the application safe. Stripe metadata is designed for internal key-value tracking and is included on objects sent to webhook events.

Sources checked:

- Stripe Checkout overview: https://docs.stripe.com/payments/checkout
- Stripe Checkout lifecycle: https://docs.stripe.com/payments/checkout/how-checkout-works
- Stripe go-live checklist: https://docs.stripe.com/get-started/checklist/go-live

## Phase 1: Site Foundation and Navigation

Best bang for buck: high. This phase makes the site feel intentional and navigable before deeper commerce work lands.

### Outcomes

- Clean global layout and navigation system.
- Mobile menu that makes shopping, blog, policies, and calculator easy to reach.
- Footer upgraded from placeholder links into a real site map.
- Shared product/content data structures introduced so later pages do not duplicate arrays in the homepage.

### Scope

- Create a shared site navigation model:
  - Shop
  - Soap Calculator
  - Blog
  - Our Process
  - About
  - FAQ
  - Cart
- Rework the header for desktop and mobile:
  - Clear shop CTA.
  - Cart icon/count.
  - Better active states.
  - Mobile full-screen or drawer navigation with large tap targets.
- Rework the footer:
  - Shop links.
  - Help links.
  - Company links.
  - Legal links.
  - Newsletter CTA.
- Extract products from `app/page.tsx` into a shared catalog module.
- Add basic routes for:
  - `/shop`
  - `/blog`
  - `/privacy`
  - `/terms`
  - `/shipping`
  - `/returns`
  - `/faq`

### Acceptance Criteria

- A mobile visitor can reach Shop, Blog, Cart, Privacy, Terms, and Soap Calculator in two taps or fewer.
- No visible placeholder footer links remain.
- Homepage still feels premium, but navigation is more useful.
- Product data lives in one reusable location.

## Phase 2: Product Pages and Shopping Experience

Best bang for buck: very high. Product pages and a cart are the direct path to sales.

### Outcomes

- A real shop experience exists before payment integration.
- Product detail pages make each soap bar feel desirable, trustworthy, and easy to buy.
- Cart interactions work smoothly on desktop and mobile.

### Scope

- Build `/shop` as a product listing page:
  - Product cards.
  - Price.
  - Scent/benefit tags.
  - Quick add to cart.
  - Link to product detail page.
- Build product detail pages:
  - `/products/black-granite`
  - `/products/stone-forge`
- Each product page should include:
  - Product images.
  - Price.
  - Short benefit-led intro.
  - Full description.
  - Ingredients.
  - Scent profile.
  - Skin feel/use case.
  - Bar weight or size.
  - Cure/process notes.
  - Shipping/return trust text.
  - Add to cart.
- Implement cart state:
  - Add item.
  - Remove item.
  - Update quantity.
  - Cart drawer or cart page.
  - Subtotal.
  - Empty cart state.
- Add product data fields needed for checkout:
  - `id`
  - `slug`
  - `name`
  - `priceCents`
  - `currency`
  - `image`
  - `description`
  - `ingredients`
  - `inventoryStatus`
  - `stripePriceId` when products are managed in Stripe, or a server-side price mapping when the app catalog is the source of truth.

### Acceptance Criteria

- `ADD TO CART` performs a real action.
- Cart count updates globally.
- Cart persists across refreshes.
- Mobile cart is easy to use with one thumb.
- Product pages are indexable and have unique metadata.

## Phase 3: Stripe Checkout and Order Flow

Best bang for buck: very high. This turns the polished shopping flow into actual revenue.

### Outcomes

- Customers can check out securely.
- Server validates cart prices before creating checkout.
- Success and cancel pages provide clear post-checkout flow.

### Scope

- Add Stripe dependency and environment variables:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_SITE_URL`
- Create `POST /api/checkout`:
  - Accept cart items.
  - Validate product IDs and quantities against the Coldstone catalog.
  - Reject unknown products or invalid quantities.
  - Create Stripe Checkout Session in `payment` mode.
  - Use Stripe Price IDs from the server-side catalog.
  - Include shipping address collection for US domestic shipping.
  - Enable automatic tax calculation with Stripe Tax once Missouri registration is configured in Stripe.
  - Redirect to Stripe-hosted checkout.
- Create:
  - `/checkout/success`
  - `/checkout/cancel`
- Add webhook route:
  - Handle `checkout.session.completed`.
  - Log order details initially.
  - Prepare for email/fulfillment integration.
- Add checkout error states:
  - Empty cart.
  - Product unavailable.
  - Checkout creation failed.
- Configure domestic shipping:
  - Start with simple US-only rules.
  - Use Stripe shipping rates for a flat-rate or threshold-based first version.
  - Keep UPS and USPS account integration as a later fulfillment/rate-shopping enhancement unless live carrier rates are required at launch.
- Configure tax:
  - Ship-from ZIP code: `63025`, Missouri.
  - Use Stripe Tax rather than manual tax tables for checkout tax calculation.
  - Collect shipping address in Checkout so tax is based on the customer shipping location.
  - Confirm Missouri sales tax registration and add it in Stripe Tax before collecting Missouri sales tax.

### Acceptance Criteria

- Test purchase can be completed in Stripe test mode.
- Cart cannot submit tampered prices.
- Success page clears cart after confirmed checkout return.
- Checkout route handles failures gracefully.
- Stripe go-live checklist is reviewed before live keys are used.
- Stripe products/prices used by checkout have `project=coldstone` metadata.
- Checkout sessions include `metadata.project=coldstone` and a cart/order reference.

## Phase 4: Legal, Trust, and Customer Support Pages

Best bang for buck: high. Trust pages reduce purchase anxiety and make paid traffic safer.

### Outcomes

- Required policy pages exist.
- Buyers can answer basic purchase questions without contacting the business.
- The site feels legitimate enough to buy from.

### Scope

- Build `/privacy`:
  - What data is collected.
  - Newsletter/contact data.
  - Checkout/payment processor note.
  - Analytics/cookies note if analytics are added.
  - Contact method.
- Build `/terms`:
  - Site use.
  - Product information.
  - Purchases and payment.
  - Shipping/returns reference.
  - Limitation language.
- Build `/shipping`:
  - Processing time.
  - Domestic shipping expectations.
  - Lost/damaged package process.
- Build `/returns`:
  - Handmade/personal care product return policy.
  - Damaged/incorrect item policy.
  - Refund timing.
- Build `/faq`:
  - Ingredients.
  - Cold process.
  - Cure time.
  - Bar longevity.
  - Sensitive skin.
  - Shipping.
  - Returns.
  - Soap Calculator.

### Acceptance Criteria

- Footer and checkout-adjacent UI link to relevant policies.
- Policy language is written in plain English.
- No placeholder legal text remains.
- Pages are easy to read on mobile.

Note: final legal copy should be reviewed by the business owner or counsel before launch.

## Phase 5: Blog and Content Engine

Best bang for buck: medium initially, high over time. Content is how the site earns durable search traffic.

### Outcomes

- Blog infrastructure exists.
- First posts support search, buyer education, and internal links to products and the Soap Calculator.

### Scope

- Build `/blog` index page:
  - Featured post.
  - Post cards.
  - Category filters or tags.
- Build `/blog/[slug]` article pages.
- Choose content source:
  - Phase 5A: local MDX or typed content files for speed.
  - Later: CMS if the publishing workflow needs non-developer editing.
- Add initial blog categories:
  - Cold Process Soap
  - Ingredients
  - Grooming
  - Behind the Batch
  - Soapmaking Tools
- Publish first 6 posts:
  - What Is Cold Process Soap?
  - Why Handmade Soap Needs to Cure
  - Activated Charcoal Soap: What It Is and When to Use It
  - Cedar and Sage: Building an Earthy Soap Bar
  - How to Make a Bar Last Longer in the Shower
  - How to Use a Soap Calculator Without Guessing
- Add internal CTAs:
  - Related products.
  - Soap Calculator.
  - Newsletter.

### Acceptance Criteria

- Blog index and post pages have responsive layouts.
- Posts include useful internal links.
- Each post has title, description, published date, category, and Open Graph metadata.
- Blog pages are included in sitemap.

## Phase 6: SEO and Structured Data

Best bang for buck: medium to high. This improves discoverability after the content and product pages exist.

### Outcomes

- Search engines can crawl the full site cleanly.
- Product pages are eligible for richer search results where applicable.
- Metadata is unique and useful per page.

### Scope

- Add:
  - `app/sitemap.ts`
  - `app/robots.ts`
- Add page-specific metadata for:
  - Homepage.
  - Shop.
  - Product pages.
  - Blog index.
  - Blog posts.
  - Legal/support pages.
- Add JSON-LD structured data:
  - `Organization`
  - `WebSite`
  - `Product`
  - `Offer`
  - `BreadcrumbList`
  - `Article`
  - `FAQPage` where appropriate.
- Add canonical URLs.
- Add alt text review for product and process images.
- Add basic social sharing images.

### Acceptance Criteria

- Sitemap contains all public routes.
- Product pages include valid product structured data.
- Blog posts include article structured data.
- Important pages have unique titles and descriptions.

## Phase 7: Visual Polish and Mobile Conversion Pass

Best bang for buck: medium, but important before launch.

### Outcomes

- The main site feels as polished as the calculator.
- Mobile shopping flow is crisp, fast, and legible.
- Brand expression is strong without getting in the way of purchase.

### Scope

- Refine homepage hierarchy:
  - Keep the strong brand hero.
  - Make product discovery visible earlier.
  - Add trust bar near top.
  - Add stronger shop CTA.
- Refine product card design:
  - Cleaner image framing.
  - Clear price and add action.
  - Better mobile spacing.
- Add site-wide UI primitives:
  - Button.
  - ProductCard.
  - SectionHeader.
  - PolicyPageLayout.
  - BlogCard.
  - CartDrawer.
- Accessibility pass:
  - Focus states.
  - Button labels.
  - Dialog semantics.
  - Color contrast.
  - Reduced motion where needed.
- Performance pass:
  - Use `next/font` instead of CSS `@import` for fonts.
  - Review image priority and sizes.
  - Avoid layout shift in product cards and cart.

### Acceptance Criteria

- Core mobile pages fit comfortably at common viewport widths.
- Header, mobile menu, cart, product pages, and blog pages have no obvious overflow or overlap.
- Lighthouse-style checks are clean enough to launch.
- Site feels like a store, not just a landing page.

## Phase 8: Newsletter, Analytics, and Launch Readiness

Best bang for buck: medium. This helps measure what is working and retain visitors.

### Outcomes

- Newsletter signup persists to the selected email provider or to a server-side subscriber store.
- Site behavior can be measured.
- Launch checklist is clear.

### Scope

- Replace visual-only newsletter form with a real provider or server action.
- Recommended newsletter path:
  - Start with Brevo if cost control and simple email capture/campaigns matter most.
  - Choose Klaviyo if ecommerce lifecycle marketing, segmentation, SMS, and revenue attribution become central.
  - Use Mailchimp only if its editor/workflow is preferred; it is easy to use, but contact-based pricing can become less attractive as the list grows.
- Recommended Phase 8 default: Brevo first, then revisit Klaviyo after checkout and order events are stable.
- Add analytics:
  - Page views.
  - Add to cart.
  - Checkout started.
  - Checkout completed.
  - Newsletter signup.
  - Blog CTA clicks.
- Recommended analytics path:
  - Use Google Analytics 4 for the first version if cost control matters most.
  - Use Google Search Console from launch for SEO/indexing visibility.
  - Use Google Tag Manager if we want to manage GA4, Google Ads conversions, remarketing, and other tags without repeated code changes.
  - Avoid Google AdSense for the ecommerce storefront; AdSense is for earning money by displaying third-party ads and would distract from product sales.
  - Use Vercel Web Analytics only if the site is deployed on Vercel and we want a paid, platform-native secondary view.
  - Use Plausible if privacy-friendly marketing analytics, goals, funnels, and simple dashboards are preferred.
  - Use PostHog if product analytics, session replay, funnels, feature flags, and deeper event analysis are needed.
- Recommended Phase 8 default: Google Analytics 4, Google Search Console, and Google Tag Manager, with explicit custom events for cart and checkout. Revisit Plausible or PostHog if reporting needs outgrow GA4.
- Add event names consistently.
- Add basic conversion dashboard plan.
- Add launch QA checklist:
  - Mobile navigation.
  - Product pages.
  - Cart.
  - Checkout test mode.
  - Legal links.
  - Sitemap.
  - Robots.
  - Metadata.
  - 404 page.
  - Performance.

### Acceptance Criteria

- Newsletter submissions are stored or sent to the chosen provider.
- Analytics events fire for major funnel actions.
- Launch checklist can be run end-to-end.

## Recommended Implementation Order

1. Phase 1: Site Foundation and Navigation
2. Phase 2: Product Pages and Shopping Experience
3. Phase 3: Stripe Checkout and Order Flow
4. Phase 4: Legal, Trust, and Customer Support Pages
5. Phase 5: Blog and Content Engine
6. Phase 6: SEO and Structured Data
7. Phase 7: Visual Polish and Mobile Conversion Pass
8. Phase 8: Newsletter, Analytics, and Launch Readiness

## Practical Sprint Breakdown

### Sprint 1: Make It Feel Like a Real Site

- Navigation.
- Footer.
- Shop route.
- Product catalog extraction.
- Product detail routes.
- Privacy, Terms, Shipping, Returns, FAQ route shells.

### Sprint 2: Make Shopping Work

- Cart state.
- Cart drawer/page.
- Add/remove/update quantity.
- Product page add-to-cart.
- Mobile cart QA.

### Sprint 3: Make Checkout Work

- Stripe setup.
- Checkout API route.
- Success/cancel pages.
- Test payments.
- Webhook skeleton.

### Sprint 4: Make It Trustworthy

- Final policy copy.
- FAQ content.
- Product trust details.
- Shipping/returns linking.
- Homepage conversion refinements.

### Sprint 5: Make It Findable

- Blog framework.
- First 6 posts.
- Sitemap/robots.
- Structured data.
- Metadata.

### Sprint 6: Make It Launch-Ready

- Accessibility pass.
- Performance pass.
- Newsletter persistence.
- Analytics.
- Full launch checklist.

## Deferred for Separate Soap Calculator Session

- Calculator redesign.
- Calculator SEO landing page expansion.
- Recipe sharing URLs.
- Calculator account/cloud saves.
- Calculator-to-product conversion flows.
- Advanced calculator AI changes.

## Confirmed Decisions

These decisions are set for the first implementation pass:

- Stripe Products and Prices as the payment catalog, mapped through a local typed Coldstone catalog.
- Stripe-hosted Checkout.
- Simple domestic shipping rules first.
- Ship-from ZIP code `63025`, Missouri.
- Stripe Tax for checkout tax calculation after registration is configured.
- Simple inventory status first: in stock or out of stock.
- Brevo as the first newsletter recommendation.
- Google Analytics 4, Google Search Console, and Google Tag Manager as the first analytics/measurement recommendation.

## Operational Details Still Needed

Before implementing checkout:

- Stripe account mode and access for development.
- Coldstone Stripe Product and Price IDs.
- Exact shipping rules for launch:
  - Flat rate amount.
  - Free shipping threshold, if any.
  - Whether local pickup is offered.
- Missouri sales tax registration status.
- Stripe Tax product tax code for handmade soap/body care products.
- Final product SKUs and bar weights.
