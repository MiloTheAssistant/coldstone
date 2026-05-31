import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  getLessonModuleBySlug,
  getLessonModules,
  lessonModules,
} from '../app/data/soap-lessons.ts';
import {
  LESSON_LIBRARY_PREVIEW_MODULE_SLUG,
  hasProLessonLibraryAccess,
  isPublicLessonModule,
} from '../app/lib/lesson-library-rules.ts';
import { mainNavLinks } from '../app/data/site.ts';

const expectedModules = [
  ['soap-making-101-beginners-guide', 8],
  ['cold-process-soap-making-guide', 7],
  ['hot-process-soap-making-guide', 8],
  ['melt-and-pour-soap-making-notes', 6],
  ['lye-and-oil-ratio-quick-reference-chart', 6],
  ['essential-oils-for-soap-making-quick-reference-chart', 7],
  ['fragrance-oils-guide', 7],
  ['colorants-and-natural-additives-notes', 6],
  ['exfoliants-in-soap-printable-chart', 6],
  ['soap-recipe-template-guide', 8],
  ['specialty-soap-recipes-guide', 9],
  ['swirling-and-layering-techniques-guide', 8],
  ['soap-troubleshooting-guide', 9],
  ['soap-packaging-and-branding-notes', 8],
];

const blockedMedicalClaims = [
  /\bacne\b/i,
  /\beczema\b/i,
  /\bpsoriasis\b/i,
  /\bdetox\b/i,
  /\bheals?\b/i,
  /\bhealing\b/i,
  /\btherapeutic\b/i,
  /\banti-?bacterial\b/i,
  /\btreats?\b/i,
];

function allModuleText(lessonModule) {
  return JSON.stringify(lessonModule);
}

test('soap lesson library exposes the 14 planned modules with stable chapter counts', () => {
  assert.equal(lessonModules.length, 14);
  assert.deepEqual(
    lessonModules.map((lessonModule) => [lessonModule.slug, lessonModule.chapters.length]),
    expectedModules,
  );
  assert.deepEqual(getLessonModules().map((lessonModule) => lessonModule.slug), expectedModules.map(([slug]) => slug));
  assert.equal(getLessonModuleBySlug('missing-module'), undefined);
  assert.equal(getLessonModuleBySlug('soap-making-101-beginners-guide').title, 'Soap Making 101, Beginner’s Guide');
});

test('soap lesson modules have complete metadata, notes, authority links, and checklists', () => {
  const moduleSlugs = new Set();

  for (const lessonModule of lessonModules) {
    assert.match(lessonModule.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(moduleSlugs.has(lessonModule.slug), false, `duplicate module slug: ${lessonModule.slug}`);
    moduleSlugs.add(lessonModule.slug);

    assert.ok(lessonModule.title.length >= 12, lessonModule.slug);
    assert.ok(lessonModule.description.length >= 80, lessonModule.slug);
    assert.ok(lessonModule.sourcePdf.endsWith('.pdf'), lessonModule.slug);
    assert.ok(lessonModule.checklist.length >= 6, `${lessonModule.slug} needs a checklist`);
    assert.ok(lessonModule.authorityLinks.length >= 1, `${lessonModule.slug} needs authority links`);

    const noteIds = new Set();
    const chapterSlugs = new Set();

    for (const chapter of lessonModule.chapters) {
      assert.match(chapter.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.equal(chapterSlugs.has(chapter.slug), false, `duplicate chapter slug: ${lessonModule.slug}/${chapter.slug}`);
      chapterSlugs.add(chapter.slug);
      assert.ok(chapter.title.length >= 8, `${lessonModule.slug}/${chapter.slug}`);
      assert.ok(chapter.objective.length >= 40, `${lessonModule.slug}/${chapter.slug}`);
      assert.ok(chapter.steps.length >= 3, `${lessonModule.slug}/${chapter.slug}`);
      assert.ok(chapter.insights.length >= 2, `${lessonModule.slug}/${chapter.slug}`);
      assert.ok(chapter.notes.length >= 1, `${lessonModule.slug}/${chapter.slug}`);
      assert.ok(chapter.image.src.startsWith('/brand/lessons/'), `${lessonModule.slug}/${chapter.slug}`);
      assert.ok(chapter.image.alt.length >= 40, `${lessonModule.slug}/${chapter.slug}`);

      for (const note of chapter.notes) {
        assert.match(note.id, /^[a-z0-9-]+$/);
        assert.equal(noteIds.has(note.id), false, `duplicate note id in ${lessonModule.slug}: ${note.id}`);
        noteIds.add(note.id);
        assert.ok(note.label.length > 0);
        assert.ok(note.body.length >= 30);
      }
    }

    for (const link of lessonModule.authorityLinks) {
      if (link.label.includes('SoapAbacus') || link.href.includes('soapabacus')) {
        assert.equal(link.href, 'https://www.soapabacus.com/');
        assert.equal(link.target, '_blank');
        assert.equal(link.rel, 'noopener noreferrer');
      }
    }
  }
});

test('soap lesson copy has no placeholders and blocks risky soap claims', () => {
  const text = lessonModules.map(allModuleText).join(' ');

  for (const phrase of ['todo', 'tbd', 'placeholder', 'coming soon', 'lorem']) {
    assert.equal(text.toLowerCase().includes(phrase), false, `placeholder found: ${phrase}`);
  }

  for (const pattern of blockedMedicalClaims) {
    assert.equal(pattern.test(text), false, `risky claim pattern found: ${pattern}`);
  }
});

test('soap lesson chapter images exist as project assets', () => {
  for (const lessonModule of lessonModules) {
    for (const chapter of lessonModule.chapters) {
      const imagePath = new URL(`../public${chapter.image.src}`, import.meta.url);
      assert.equal(existsSync(imagePath), true, `${chapter.image.src} is missing`);
      assert.ok(statSync(imagePath).size > 40_000, `${chapter.image.src} is too small`);
    }
  }
});

test('soap lesson public routes and crawler files are wired', async () => {
  const indexSource = await readFile(new URL('../app/soap-making/page.tsx', import.meta.url), 'utf8');
  const moduleSource = await readFile(new URL('../app/soap-making/[moduleSlug]/page.tsx', import.meta.url), 'utf8');
  const chapterSource = await readFile(new URL('../app/soap-making/[moduleSlug]/[chapterSlug]/page.tsx', import.meta.url), 'utf8');
  const sitemapSource = await readFile(new URL('../app/sitemap.ts', import.meta.url), 'utf8');
  const llmsSource = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');

  assert.match(indexSource, /getLessonModules/);
  assert.match(moduleSource, /export const dynamic = 'force-dynamic'/);
  assert.doesNotMatch(moduleSource, /generateStaticParams/);
  assert.match(moduleSource, /getLessonModuleBySlug/);
  assert.match(moduleSource, /getLessonLibraryAccess/);
  assert.match(moduleSource, /isPublicLessonModule/);
  assert.match(moduleSource, /LessonPaywall/);
  assert.match(moduleSource, /Unlock Chapters/);
  assert.match(chapterSource, /export const dynamic = 'force-dynamic'/);
  assert.doesNotMatch(chapterSource, /generateStaticParams/);
  assert.match(chapterSource, /getLessonLibraryAccess/);
  assert.match(chapterSource, /if \(!access\.allowed\) {\s*return <LessonPaywall/s);
  assert.match(chapterSource, /LessonNoteTag/);
  assert.match(chapterSource, /LessonChecklist/);
  assert.match(chapterSource, /index: false/);
  assert.match(sitemapSource, /getLessonModules/);
  assert.match(sitemapSource, /LESSON_LIBRARY_PREVIEW_MODULE_SLUG/);
  assert.match(sitemapSource, /\/soap-making/);
  assert.doesNotMatch(sitemapSource, /module\.chapters\.map/);
  assert.match(llmsSource, /Soapmaking Lesson Library/);
  assert.match(llmsSource, /https:\/\/www\.coldstonesoap\.com\/soap-making/);
  assert.match(llmsSource, /active Pro subscription/);
  assert.doesNotMatch(llmsSource, /cold-process-soap-making-guide/);
});

test('soap lesson paywall allows only the public preview module and active Pro lesson access', () => {
  assert.equal(LESSON_LIBRARY_PREVIEW_MODULE_SLUG, 'soap-making-101-beginners-guide');
  assert.equal(isPublicLessonModule('soap-making-101-beginners-guide'), true);
  assert.equal(isPublicLessonModule('cold-process-soap-making-guide'), false);

  assert.equal(hasProLessonLibraryAccess({ tier: 'pro', effectiveTier: 'pro', status: 'active' }), true);
  assert.equal(hasProLessonLibraryAccess({ tier: 'plus', effectiveTier: 'plus', status: 'active' }), false);
  assert.equal(hasProLessonLibraryAccess({ tier: 'free', effectiveTier: 'free', status: 'free' }), false);
  assert.equal(hasProLessonLibraryAccess({ tier: 'pro', effectiveTier: 'pro', status: 'trialing' }), false);
  assert.equal(hasProLessonLibraryAccess({ tier: 'pro', effectiveTier: 'pro', status: 'past_due' }), false);
  assert.equal(hasProLessonLibraryAccess({ tier: 'pro', effectiveTier: 'free', status: 'canceled' }), false);
});

test('main navigation points learners to the soap lesson library', () => {
  assert.deepEqual(
    mainNavLinks.map((link) => [link.label, link.href]),
    [
      ['Shop', '/shop'],
      ['Soap Calculator', 'https://www.soapabacus.com'],
      ['Blog', '/blog'],
      ['Lesson Library', '/soap-making'],
      ['About', '/#about'],
      ['FAQ', '/faq'],
    ],
  );
});
