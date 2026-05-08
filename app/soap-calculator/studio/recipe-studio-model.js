const DEFAULT_BASE_URL = 'https://www.soapabacus.com';

const MODE_STEPS = {
  easy: [
    { id: 'goal', label: 'Choose the soap goal', description: 'Start with the job this recipe needs to do.' },
    { id: 'batch', label: 'Set batch size', description: 'Pick oil weight, unit, and expected bar yield.' },
    { id: 'oils', label: 'Build the oil blend', description: 'Use guided oil picks with safety ranges.' },
    { id: 'water', label: 'Confirm lye and water', description: 'Use safe defaults unless you know why to change them.' },
    { id: 'scent-additives', label: 'Add scent and extras', description: 'Choose fragrance, colorants, exfoliants, and additives.' },
    { id: 'costing', label: 'Add costs', description: 'Enter ingredient costs and target pricing values.' },
    { id: 'review', label: 'Review and save', description: 'Check warnings, save, share, print, or export.' },
  ],
  intermediate: [
    { id: 'goal', label: 'Choose the soap goal', description: 'Start with a recipe target and constraints.' },
    { id: 'batch', label: 'Set batch and mold yield', description: 'Control oil weight, units, bars, and cure notes.' },
    { id: 'oils', label: 'Tune the oil blend', description: 'Edit percentages with live properties and usage guidance.' },
    { id: 'water', label: 'Choose water method', description: 'Use water ratio, lye concentration, or water as percent of oils.' },
    { id: 'scent-additives', label: 'Build scent and additives', description: 'Calculate fragrance, IFRA guidance, color, and exfoliants.' },
    { id: 'pricing', label: 'Cost and price batch', description: 'Track supplier costs, cost per bar, and target retail price.' },
    { id: 'review', label: 'Version, save, share', description: 'Save recipe versions, create PDFs, or publish a read-only share link.' },
  ],
  expert: [
    { id: 'expert-controls', label: 'Open full controls', description: 'Use dense formula settings without hiding advanced options.' },
    { id: 'lye-system', label: 'Select lye system', description: 'Control NaOH, KOH, KOH purity, and future dual-lye planning.' },
    { id: 'batch', label: 'Set exact batch values', description: 'Edit precise weights, units, superfat, and water model.' },
    { id: 'oils', label: 'Edit oil formula', description: 'Use percentages, weights, SAP, fatty acids, INS, and iodine.' },
    { id: 'scent-additives', label: 'Calculate all extras', description: 'Track fragrances, additives, liquids, packaging, and costs.' },
    { id: 'review', label: 'Audit and export', description: 'Validate all warnings before saving, sharing, PDF export, or production.' },
  ],
};

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function normalizePercent(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function calculateAdvancedLye(oils, options = {}) {
  const lyeType = options.lyeType || 'NaOH';
  const superfatPercent = Math.max(0, Math.min(25, Number(options.superfatPercent ?? 5)));
  const waterMethod = options.waterMethod || 'water-lye-ratio';
  const waterValue = Number(options.waterValue ?? 2);
  const unit = options.unit || 'oz';
  const kohPurityPercent = Math.max(1, Math.min(100, Number(options.kohPurityPercent ?? 100)));

  let pureLyeWeight = 0;
  let naohWeight = 0;
  let kohWeight = 0;

  for (const oil of oils || []) {
    const weight = Number(oil.weight) || 0;
    if (lyeType === 'KOH') {
      pureLyeWeight += weight * ((Number(oil.sapKOH) || 0) / 1000);
    } else if (lyeType === 'dual') {
      const naohPercent = normalizePercent(options.naohPercent, 70);
      const kohPercent = Math.max(0, 100 - naohPercent);
      naohWeight += weight * (Number(oil.sapNaOH) || 0) * (naohPercent / 100);
      kohWeight += weight * ((Number(oil.sapKOH) || 0) / 1000) * (kohPercent / 100);
    } else {
      pureLyeWeight += weight * (Number(oil.sapNaOH) || 0);
    }
  }

  if (lyeType === 'dual') {
    naohWeight *= 1 - superfatPercent / 100;
    kohWeight *= 1 - superfatPercent / 100;
    pureLyeWeight = naohWeight + kohWeight;
  } else {
    pureLyeWeight *= 1 - superfatPercent / 100;
  }

  const lyeWeight = lyeType === 'KOH'
    ? pureLyeWeight / (kohPurityPercent / 100)
    : pureLyeWeight;

  let waterWeight;
  if (waterMethod === 'lye-concentration') {
    const concentration = Math.max(1, Math.min(99, waterValue || 33));
    waterWeight = lyeWeight * ((100 - concentration) / concentration);
  } else if (waterMethod === 'water-as-percent-of-oils') {
    const totalOilWeight = (oils || []).reduce((sum, oil) => sum + (Number(oil.weight) || 0), 0);
    waterWeight = totalOilWeight * ((waterValue || 38) / 100);
  } else {
    waterWeight = lyeWeight * (waterValue || 2);
  }

  return {
    lyeType,
    unit,
    waterMethod,
    waterValue,
    superfatPercent,
    kohPurityPercent: lyeType === 'KOH' ? kohPurityPercent : undefined,
    pureLyeWeight: round(pureLyeWeight, 2),
    lyeWeight: round(lyeWeight, 2),
    waterWeight: round(waterWeight, 2),
    lyeBreakdown: lyeType === 'dual'
      ? { naohWeight: round(naohWeight, 2), kohWeight: round(kohWeight, 2) }
      : undefined,
  };
}

function getModeProcess(mode = 'easy') {
  return MODE_STEPS[mode] || MODE_STEPS.easy;
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function buildRecipeSnapshot(input = {}) {
  const now = input.now || new Date().toISOString();
  const id = input.id || createId('recipe');
  const version = input.version || 1;
  const mode = input.mode || 'easy';

  return {
    id,
    versionId: input.versionId || createId('version'),
    previousVersionId: input.previousVersionId || null,
    ownerId: input.ownerId || null,
    name: input.name || 'Untitled Soap Recipe',
    slug: input.slug || slugify(input.name || 'untitled-soap-recipe'),
    description: input.description || '',
    mode,
    visibility: input.visibility || 'private',
    version,
    oils: Array.isArray(input.oils) ? input.oils : [],
    liquids: Array.isArray(input.liquids) ? input.liquids : [],
    fragrances: Array.isArray(input.fragrances) ? input.fragrances : [],
    additives: Array.isArray(input.additives) ? input.additives : [],
    costs: Array.isArray(input.costs) ? input.costs : [],
    pricing: input.pricing || null,
    notes: input.notes || '',
    processSteps: input.processSteps || getModeProcess(mode),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

function buildRecipeVaultPayloadFromSavedRecipe(recipe = {}, options = {}) {
  const oilCatalog = Array.isArray(options.oilCatalog) ? options.oilCatalog : [];
  const catalogById = new Map(oilCatalog.map((oil) => [oil.id, oil]));
  const totalOilWeight = Number(recipe.totalOilWeight) || 0;
  const unit = recipe.unit || 'oz';
  const waterMethod = recipe.waterMethod || 'water-lye-ratio';
  const waterValue = Number(recipe.waterValue ?? recipe.waterRatio ?? 2) || 2;

  return {
    id: recipe.cloudRecipeId || recipe.id,
    name: recipe.name || 'Untitled Soap Recipe',
    description: recipe.notes || '',
    mode: recipe.mode || 'easy',
    visibility: 'private',
    oils: (recipe.oils || []).map((entry) => {
      const oil = catalogById.get(entry.oilId);
      const percent = Number(entry.percent) || 0;
      return {
        oilId: entry.oilId,
        name: oil?.name || entry.oilId,
        percent,
        weight: round(totalOilWeight * (percent / 100), 2),
        unit,
      };
    }),
    liquids: [{
      liquidId: 'water',
      name: 'Water',
      method: waterMethod,
      value: waterValue,
      unit,
    }],
    fragrances: [],
    additives: [],
    costs: [],
    pricing: null,
    notes: recipe.notes || '',
  };
}

function createRecipeVersion(recipe, updates = {}, editorId) {
  return buildRecipeSnapshot({
    ...recipe,
    ...updates,
    id: recipe.id,
    ownerId: recipe.ownerId,
    versionId: createId('version'),
    previousVersionId: recipe.versionId,
    version: (Number(recipe.version) || 1) + 1,
    updatedBy: editorId,
    createdAt: recipe.createdAt,
    updatedAt: updates.now || new Date().toISOString(),
  });
}

function createShareLink(recipe, options = {}) {
  const token = options.token || createId('share');
  const baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  return {
    id: options.id || createId('link'),
    recipeId: recipe.id,
    versionId: recipe.versionId,
    token,
    permission: 'read',
    url: `${baseUrl}/recipes/${token}`,
    createdAt: options.now || new Date().toISOString(),
    expiresAt: options.expiresAt || null,
    revokedAt: null,
  };
}

function validateRecipeAccess(recipe, context = {}) {
  if (!recipe) return { ok: false, reason: 'not-found' };
  if (context.userId && recipe.ownerId === context.userId) return { ok: true, reason: 'owner' };
  if (recipe.visibility === 'public') return { ok: true, reason: 'public' };

  const share = (context.shareLinks || []).find((candidate) =>
    candidate.recipeId === recipe.id &&
    candidate.token === context.shareToken &&
    candidate.permission === 'read' &&
    !candidate.revokedAt &&
    (!candidate.expiresAt || new Date(candidate.expiresAt).getTime() > Date.now())
  );

  if (share) return { ok: true, reason: 'share-link' };
  return { ok: false, reason: 'private' };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'soap-recipe';
}

module.exports = {
  buildRecipeSnapshot,
  buildRecipeVaultPayloadFromSavedRecipe,
  calculateAdvancedLye,
  createRecipeVersion,
  createShareLink,
  getModeProcess,
  validateRecipeAccess,
};
