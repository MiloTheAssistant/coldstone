import { getCurrentUserId, isClerkConfigured } from './auth';
import { getSoapAbacusMembershipForUser, isRecipeVaultConfigured } from './recipe-vault';
import { decorateMembership, defaultFreeMembership, type SoapAbacusMembership } from './soap-abacus-membership';
import { hasProLessonLibraryAccess } from './lesson-library-rules';

export type LessonLibraryAccessReason = 'signed_out' | 'pro_required' | 'membership_unavailable';

export interface LessonLibraryAccess {
  allowed: boolean;
  reason: LessonLibraryAccessReason;
  membership?: SoapAbacusMembership;
}

export async function getLessonLibraryAccess(): Promise<LessonLibraryAccess> {
  if (!isClerkConfigured()) {
    return { allowed: false, reason: 'membership_unavailable' };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { allowed: false, reason: 'signed_out' };
  }

  if (!isRecipeVaultConfigured()) {
    return {
      allowed: false,
      reason: 'membership_unavailable',
      membership: defaultFreeMembership(userId),
    };
  }

  const stored = await getSoapAbacusMembershipForUser(userId);
  const membership = decorateMembership(stored || { userId, tier: 'free', status: 'free' });
  const allowed = hasProLessonLibraryAccess(membership);

  return {
    allowed,
    reason: 'pro_required',
    membership,
  };
}
