import assert from 'node:assert/strict';
import test from 'node:test';

import {
  blogPosts,
  getBlogCategories,
  getBlogPostBySlug,
  getPublishedBlogPosts,
} from '../app/data/blog-content.js';

const requiredSlugs = [
  'what-is-cold-process-soap',
  'why-handmade-soap-needs-to-cure',
  'activated-charcoal-soap-what-it-is',
  'cedar-and-sage-earthy-soap-bar',
  'make-a-bar-last-longer',
  'use-a-soap-calculator-without-guessing',
];

const riskyClaimPatterns = [
  /\beczema\b/i,
  /\bpsoriasis\b/i,
  /\bheals?\b/i,
  /\bhealing\b/i,
  /\btherapeutic\b/i,
  /\banti-inflammatory\b/i,
  /\bdetox\b/i,
  /\btreats?\b/i,
];

test('blog content includes the six planned Phase 5 posts', () => {
  assert.deepEqual(
    blogPosts.map((post) => post.slug),
    requiredSlugs,
  );
});

test('blog posts expose complete metadata for index and article pages', () => {
  const slugs = new Set();

  for (const post of blogPosts) {
    assert.equal(slugs.has(post.slug), false, `duplicate slug: ${post.slug}`);
    slugs.add(post.slug);

    assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(post.title.length >= 20);
    assert.ok(post.description.length >= 80);
    assert.match(post.publishedDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(post.category.length > 0);
    assert.match(post.readTime, /^\d+ min read$/);
    assert.ok(post.heroImage.startsWith('/'));
    assert.ok(post.sections.length >= 3);
    assert.ok(post.internalLinks.length >= 2);
  }
});

test('blog categories cover buyer education and soapmaking traffic themes', () => {
  assert.deepEqual(getBlogCategories(), [
    'Cold Process Soap',
    'Ingredients',
    'Grooming',
    'Behind the Batch',
    'Soapmaking Tools',
  ]);
});

test('blog lookup and published ordering are stable', () => {
  assert.equal(getBlogPostBySlug('missing-post'), undefined);
  assert.equal(getBlogPostBySlug('what-is-cold-process-soap').title, 'What Is Cold Process Soap?');

  const ordered = getPublishedBlogPosts();
  assert.equal(ordered[0].slug, 'use-a-soap-calculator-without-guessing');
  assert.equal(ordered.at(-1).slug, 'what-is-cold-process-soap');
});

test('blog internal links stay inside known site destinations', () => {
  const allowedPrefixes = [
    '/blog/',
    '/products/',
    '/shop',
    '/#newsletter',
    '/shipping',
    '/faq',
    'https://www.soapabacus.com',
  ];

  for (const post of blogPosts) {
    for (const link of post.internalLinks) {
      assert.ok(
        allowedPrefixes.some((prefix) => link.href.startsWith(prefix)),
        `unexpected internal link for ${post.slug}: ${link.href}`,
      );
      assert.ok(link.label.length > 0);
    }
  }
});

test('blog copy has no placeholders or medical-style soap claims', () => {
  const text = blogPosts
    .flatMap((post) => [
      post.title,
      post.description,
      post.excerpt,
      ...post.sections.flatMap((section) => [section.heading, ...section.body]),
    ])
    .join(' ');

  for (const phrase of ['todo', 'tbd', 'placeholder', 'coming soon', 'lorem']) {
    assert.equal(text.toLowerCase().includes(phrase), false, `placeholder found: ${phrase}`);
  }

  for (const pattern of riskyClaimPatterns) {
    assert.equal(pattern.test(text), false, `risky claim pattern found: ${pattern}`);
  }
});
