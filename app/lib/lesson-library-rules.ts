import { FEATURE_KEYS, hasFeature } from '../soap-calculator/studio/membership-model.js';

export const LESSON_LIBRARY_PREVIEW_MODULE_SLUG = 'soap-making-101-beginners-guide';

const PAID_PRO_STATUSES = new Set(['active']);

export function isPublicLessonModule(moduleSlug: string) {
  return moduleSlug === LESSON_LIBRARY_PREVIEW_MODULE_SLUG;
}

export function hasProLessonLibraryAccess(membership: { effectiveTier?: string; tier?: string; status?: string } = {}) {
  const tier = membership.effectiveTier || membership.tier;
  const status = String(membership.status || '').toLowerCase();
  return tier === 'pro' && PAID_PRO_STATUSES.has(status) && hasFeature(membership, FEATURE_KEYS.LESSON_LIBRARY);
}
