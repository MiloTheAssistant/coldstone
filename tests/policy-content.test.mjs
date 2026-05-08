import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkoutTrustLinks,
  faqItems,
  policyPages,
  productTrustDetails,
  trustHighlights,
} from '../app/data/policies.js';

const requiredPolicies = ['privacy', 'terms', 'shipping', 'returns'];
const allPolicyText = [
  ...Object.values(policyPages).flatMap((page) => [
    page.eyebrow,
    page.title,
    page.description,
    ...page.sections.flatMap((section) => [section.title, section.body]),
  ]),
  ...faqItems.flatMap((item) => [item.title, item.body]),
  ...trustHighlights.flatMap((item) => [item.title, item.body]),
  ...productTrustDetails.flatMap((item) => [item.title, item.body]),
].join(' ');

test('policy content covers the required customer trust pages', () => {
  for (const key of requiredPolicies) {
    assert.ok(policyPages[key], `missing policy page: ${key}`);
    assert.ok(policyPages[key].title.length > 0);
    assert.ok(policyPages[key].description.length > 0);
    assert.ok(policyPages[key].sections.length >= 4);
  }
});

test('policy content is launch-ready copy without placeholders', () => {
  const forbidden = [
    'todo',
    'tbd',
    'placeholder',
    'coming soon',
    'before launch',
    'launch review',
    'should be reviewed',
    'will be finalized',
  ];

  for (const phrase of forbidden) {
    assert.equal(
      allPolicyText.toLowerCase().includes(phrase),
      false,
      `policy content includes placeholder phrase: ${phrase}`,
    );
  }
});

test('policy content avoids medical or drug-style soap claims', () => {
  const forbiddenClaimPatterns = [
    /\beczema\b/i,
    /\bpsoriasis\b/i,
    /\bcures?\b/i,
    /\bheals?\b/i,
    /\bhealing\b/i,
    /\btherapeutic\b/i,
    /\banti-inflammatory\b/i,
    /\bdetox\b/i,
    /\btreats?\b/i,
  ];

  for (const claimPattern of forbiddenClaimPatterns) {
    assert.equal(
      claimPattern.test(allPolicyText),
      false,
      `policy content includes risky claim pattern: ${claimPattern}`,
    );
  }
});

test('shipping and returns policies set concrete expectations', () => {
  const shipping = [
    policyPages.shipping.description,
    ...policyPages.shipping.sections.map((section) => section.body),
  ].join(' ');
  const returns = [
    policyPages.returns.description,
    ...policyPages.returns.sections.map((section) => section.body),
  ].join(' ');

  assert.match(shipping, /63025/);
  assert.match(shipping, /Missouri/i);
  assert.match(shipping, /UPS|USPS/);
  assert.match(shipping, /United States|domestic|U\.S\./i);

  assert.match(returns, /personal care/i);
  assert.match(returns, /unopened|unused/i);
  assert.match(returns, /damaged|incorrect/i);
  assert.match(returns, /original payment method/i);
});

test('privacy, FAQ, and trust copy support checkout confidence', () => {
  const privacy = [
    policyPages.privacy.description,
    ...policyPages.privacy.sections.map((section) => section.body),
  ].join(' ');
  const faq = faqItems.map((item) => `${item.title} ${item.body}`).join(' ');

  assert.match(privacy, /Stripe/);
  assert.match(privacy, /Google Analytics|Google Tag Manager/);
  assert.match(privacy, /newsletter|email/i);
  assert.match(privacy, /localStorage|cookies/i);

  assert.match(faq, /Soap Calculator/);
  assert.match(faq, /patch test/i);
  assert.ok(trustHighlights.length >= 3);
  assert.ok(productTrustDetails.length >= 3);
});

test('checkout trust links point customers to core policy pages', () => {
  assert.deepEqual(
    checkoutTrustLinks.map((link) => link.href),
    ['/shipping', '/returns', '/privacy', '/terms'],
  );
  assert.deepEqual(
    checkoutTrustLinks.map((link) => link.label),
    ['Shipping', 'Returns', 'Privacy', 'Terms'],
  );
});
