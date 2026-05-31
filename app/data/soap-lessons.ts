export interface LessonAuthorityLink {
  label: string;
  href: string;
  description: string;
  target?: '_blank';
  rel?: 'noopener noreferrer';
}

export interface LessonImage {
  src: string;
  alt: string;
  theme: string;
}

export interface LessonNote {
  id: string;
  label: string;
  title: string;
  body: string;
}

export interface LessonChapter {
  slug: string;
  title: string;
  objective: string;
  image: LessonImage;
  steps: string[];
  insights: string[];
  notes: LessonNote[];
  soapAbacusCheckpoint?: string;
}

export interface LessonChecklistItem {
  label: string;
  detail: string;
}

export interface LessonModule {
  slug: string;
  title: string;
  sourcePdf: string;
  description: string;
  audience: string;
  estimatedTime: string;
  chapters: LessonChapter[];
  checklist: LessonChecklistItem[];
  authorityLinks: LessonAuthorityLink[];
}

const SOAP_ABACUS: LessonAuthorityLink = {
  label: 'SoapAbacus recipe calculator',
  href: 'https://www.soapabacus.com/',
  description: 'Use SoapAbacus to verify oil weights, lye, liquid, superfat, and batch-size changes before making soap.',
  target: '_blank',
  rel: 'noopener noreferrer',
};

const LYE_SAFETY: LessonAuthorityLink = {
  label: 'CDC/NIOSH sodium hydroxide safety',
  href: 'https://archive.cdc.gov/www_cdc_gov/niosh/topics/sodium-hydroxide/default.html',
  description: 'Reference for sodium hydroxide hazards, exposure prevention, and serious skin or eye contact response.',
  target: '_blank',
  rel: 'noopener noreferrer',
};

const FDA_SOAP: LessonAuthorityLink = {
  label: 'FDA true soap guidance',
  href: 'https://www.fda.gov/cosmetics/cosmetic-products/frequently-asked-questions-soap',
  description: 'Use this to keep cleansing-only soap language separate from cosmetic or drug-style product claims.',
  target: '_blank',
  rel: 'noopener noreferrer',
};

const FDA_LABELING: LessonAuthorityLink = {
  label: 'FDA cosmetic labeling summary',
  href: 'https://www.fda.gov/cosmetics/labeling-regulations/summary-labeling-requirements',
  description: 'A labeling reference when a product presentation moves beyond simple true-soap language.',
  target: '_blank',
  rel: 'noopener noreferrer',
};

const IFRA: LessonAuthorityLink = {
  label: 'IFRA standards and rinse-off limits',
  href: 'https://ifrafragrance.org/docs/default-source/ifra-code-of-practice-and-standards/background-scientific-information-and-guidelines/ifra-rifm-qra-information-booklet-v7-1.pdf',
  description: 'Use supplier IFRA documents and Category 9 limits before adding fragrance or essential oils to soap.',
  target: '_blank',
  rel: 'noopener noreferrer',
};

type ChapterSeed = {
  slug: string;
  title: string;
  focus: string;
  imageTheme: string;
  calculator?: boolean;
  authority?: 'lye' | 'ifra' | 'fda' | 'label';
};

type ModuleSeed = Omit<LessonModule, 'chapters'> & {
  chapters: ChapterSeed[];
};

function buildChapter(moduleSlug: string, moduleTitle: string, index: number, seed: ChapterSeed): LessonChapter {
  const chapterNumber = index + 1;
  const notePrefix = `${moduleSlug}-${chapterNumber}`;
  const authorityNote =
    seed.authority === 'lye'
      ? 'Keep lye work physically controlled: gloves, eye protection, ventilation, lye-safe vessels, and a clear water-flush plan.'
      : seed.authority === 'ifra'
        ? 'Supplier IFRA and SDS documents set the working boundary for scent choices; do not rely on scent preference alone.'
        : seed.authority === 'fda'
          ? 'Keep product language focused on cleansing and craft unless the business intentionally follows the stricter regulatory path.'
          : seed.authority === 'label'
            ? 'Printed labels must remain readable without relying on a QR code or hidden web page for required customer-facing facts.'
            : 'Record the decision while the bench is still fresh; late notes are usually less accurate than batch-time notes.';

  return {
    slug: seed.slug,
    title: seed.title,
    objective: `Use this guided chapter to turn "${seed.title}" into a practical Coldstone soapmaking decision: ${seed.focus}.`,
    image: {
      src: `/brand/lessons/${moduleSlug}/${seed.slug}.png`,
      alt: `Photoreal Coldstone maker-bench lesson image for ${seed.title}, showing ${seed.imageTheme}.`,
      theme: seed.imageTheme,
    },
    steps: [
      `Define the working standard for this chapter: ${seed.focus}.`,
      seed.calculator
        ? 'Open SoapAbacus and verify the formula inputs before changing oils, water, lye, superfat, fragrance load, or batch size.'
        : 'Stage the relevant tools, supplier information, and batch notes before starting the hands-on work.',
      'Make one controlled choice at a time, then write down the weight, temperature, timing, source, and observed result.',
      'Finish the chapter by deciding what changes, what stays fixed, and what must be checked before the next batch.',
    ],
    insights: [
      'Community-standard soapmaking rewards exact weights, clean records, conservative safety habits, and supplier documentation.',
      'Coldstone lessons should feel practical and disciplined: useful at the bench, readable on a phone, and clean enough to print.',
      seed.calculator
        ? 'Calculator verification is a gate, not a suggestion; never let a chart, memory, or copied recipe replace current batch math.'
        : 'Use the PDF as source direction, but rewrite the lesson around decisions a maker can actually apply.',
    ],
    notes: [
      {
        id: `${notePrefix}-standard`,
        label: `N${chapterNumber}`,
        title: 'Bench standard',
        body: authorityNote,
      },
      {
        id: `${notePrefix}-record`,
        label: `R${chapterNumber}`,
        title: 'Record it',
        body: 'Capture grams, suppliers, temperatures, timing, and observations in the batch record so the lesson can improve the next attempt.',
      },
    ],
    soapAbacusCheckpoint: seed.calculator
      ? 'Verify this chapter’s formula, oil-weight, liquid, superfat, or batch-size decision in SoapAbacus before making the batch.'
      : undefined,
  };
}

function checklist(items: string[]): LessonChecklistItem[] {
  return items.map((item) => {
    const [label, detail = 'Confirm this item before closing the module.'] = item.split(': ');
    return { label, detail };
  });
}

function buildModule(seed: ModuleSeed): LessonModule {
  return {
    ...seed,
    chapters: seed.chapters.map((chapter, index) => buildChapter(seed.slug, seed.title, index, chapter)),
  };
}

const moduleSeeds: ModuleSeed[] = [
  {
    slug: 'soap-making-101-beginners-guide',
    title: 'Soap Making 101, Beginner’s Guide',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Soap Making 101 – Beginner’s Guide.pdf',
    description:
      'A beginner-friendly module that helps a new maker choose the right starting method, understand the safety boundary, gather tools, and move from learning to a controlled first batch.',
    audience: 'New soapmakers deciding between melt and pour, cold process, hot process, and a first calculator-checked batch.',
    estimatedTime: '8 guided chapters',
    authorityLinks: [SOAP_ABACUS, LYE_SAFETY, FDA_SOAP],
    checklist: checklist([
      'Method selected: Choose melt and pour, cold process, hot process, or practice-only study before buying supplies.',
      'PPE staged: Gloves, eye protection, long sleeves, ventilation, and no children or pets near active work.',
      'Calculator checked: Use SoapAbacus before any from-scratch lye batch.',
      'Workspace cleared: Dedicated tools, stable scale, lye-safe vessels, and a clean drying/cure area.',
      'Batch record started: Record date, goal, formula source, weights, temperatures, scent, color, and observations.',
      'Cure plan set: Label bars with batch ID and expected review date before storage.',
    ]),
    chapters: [
      { slug: 'choose-your-soapmaking-path', title: 'Choose Your Soapmaking Path', focus: 'compare melt and pour, cold process, hot process, and rebatch without rushing into lye work', imageTheme: 'four rugged bench stations for different soapmaking methods' },
      { slug: 'safety-before-craft', title: 'Safety Before Craft', focus: 'build the PPE, ventilation, and workspace habits that come before technique', imageTheme: 'gloves, goggles, apron, lye-safe pitcher, and clear bench space', authority: 'lye' },
      { slug: 'ingredients-that-build-a-bar', title: 'Ingredients That Build a Bar', focus: 'identify oils, lye solution, liquids, scent, color, and additives by role', imageTheme: 'oils, butters, amber bottles, and additive bowls on dark stone' },
      { slug: 'tools-for-a-dedicated-bench', title: 'Tools for a Dedicated Soap Bench', focus: 'separate soapmaking equipment from food tools and choose materials that tolerate lye and heat', imageTheme: 'scale, thermometer, stainless bowl, silicone molds, and notebook' },
      { slug: 'pick-a-first-project', title: 'Pick a First Project', focus: 'choose a first batch that keeps the learning load small and measurable', imageTheme: 'split bench with simple base cubes and a small loaf mold' },
      { slug: 'build-and-check-the-recipe', title: 'Build and Check the Recipe', focus: 'turn a batch idea into verified weights for oils, lye, water, and superfat', imageTheme: 'tablet beside oils and a scale showing a calculator workflow', calculator: true },
      { slug: 'make-the-batch', title: 'Make the Batch', focus: 'move through measure, mix, pour, and observe without changing multiple variables at once', imageTheme: 'gloved hands pouring pale soap batter into a wooden mold' },
      { slug: 'finish-cure-test-and-record', title: 'Finish, Cure, Test, and Record', focus: 'cut, cure, label, and evaluate the bar so the next batch improves', imageTheme: 'cut bars on curing rack with a kraft batch card' },
    ],
  },
  {
    slug: 'cold-process-soap-making-guide',
    title: 'Cold Process Soap Making Guide',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Cold Process Soap Making Guide.pdf',
    description:
      'A guided cold process module for planning a safe, calculator-verified loaf from batch goal through lye solution, trace, pour, cure, and improvement notes.',
    audience: 'Makers ready to handle sodium hydroxide and build cold process bars with disciplined records.',
    estimatedTime: '7 guided chapters',
    authorityLinks: [SOAP_ABACUS, LYE_SAFETY, IFRA, FDA_SOAP],
    checklist: checklist([
      'Recipe exported: Confirm oil weights, liquid, lye, and superfat in SoapAbacus.',
      'Exact weights verified: Weigh in grams and tare each vessel before use.',
      'PPE worn: Gloves, eye protection, sleeves, ventilation, and a clear lye path are active.',
      'Temperatures logged: Record lye solution and oils before combining.',
      'Trace observed: Note emulsion, trace speed, fragrance behavior, and additive timing.',
      'Cure date recorded: Label batch ID, cut date, cure review date, and observations.',
    ]),
    chapters: [
      { slug: 'define-the-batch-goal', title: 'Define the Batch Goal', focus: 'set the bar use case, target feel, hardness, and lather before selecting oils', imageTheme: 'finished bars grouped by everyday body, hands, and utility use' },
      { slug: 'safety-and-setup', title: 'Safety and Setup', focus: 'stage lye-safe containers, PPE, tools, ventilation, and cleanup before opening lye', imageTheme: 'Coldstone safety station with goggles, gloves, and lye-safe vessels', authority: 'lye' },
      { slug: 'formula-in-soapabacus', title: 'Formula in SoapAbacus', focus: 'verify oils, NaOH, water, superfat, and concentration before weighing', imageTheme: 'calculator screen beside oil bottles and a bench scale', calculator: true },
      { slug: 'weigh-and-mix-lye-solution', title: 'Weigh and Mix Lye Solution', focus: 'add lye to water, cool the solution, and record temperatures without shortcuts', imageTheme: 'labeled HDPE pitcher, thermometer, and sodium hydroxide setup', authority: 'lye' },
      { slug: 'prep-oils-and-emulsion', title: 'Prep Oils and Reach Emulsion', focus: 'melt solid oils, combine with liquid oils, and use stick blending with control', imageTheme: 'thermometer in oil pot beside a stick blender on the maker bench' },
      { slug: 'trace-additives-pour-and-gel', title: 'Trace, Additives, Pour, and Gel', focus: 'decide when to add scent, color, and additives while managing gel and insulation', imageTheme: 'textured soap loaf pour with color cups and insulated mold', authority: 'ifra' },
      { slug: 'cut-cure-label-and-improve', title: 'Cut, Cure, Label, and Improve', focus: 'cut consistently, cure with airflow, label clearly, and capture improvement notes', imageTheme: 'wire cutter, cure rack, kraft labels, and a batch notebook' },
    ],
  },
  {
    slug: 'hot-process-soap-making-guide',
    title: 'Hot Process Soap Making Guide',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Hot Process Soap Making Guide.pdf',
    description:
      'A hot process module that teaches cooked saponification, heat control, additive timing, rustic texture, and safer troubleshooting without treating appearance as proof of readiness.',
    audience: 'Makers who already respect lye safety and want a controlled hot process workflow.',
    estimatedTime: '8 guided chapters',
    authorityLinks: [SOAP_ABACUS, LYE_SAFETY, IFRA],
    checklist: checklist([
      'Cooker stable: Slow cooker or pot is heat-safe, stable, and sized for expansion.',
      'Recipe locked: Formula is verified in SoapAbacus before heat is applied.',
      'Lye vessels confirmed: No glass or aluminum, and lye path is clear.',
      'Cook log started: Record stage changes, temperature, texture, and timing.',
      'Additives cooled: Scent, color, milk, honey, and superfat additions are measured and timed.',
      'Storage notes captured: Pack mold, cut bars, cure or dry, and log texture results.',
    ]),
    chapters: [
      { slug: 'why-hot-process', title: 'Why Hot Process', focus: 'understand cooked saponification, rustic texture, and faster early usability', imageTheme: 'slow cooker, rugged soap bars, and a dark wood maker bench' },
      { slug: 'lye-plus-heat-safety', title: 'Lye Plus Heat Safety', focus: 'combine lye rules with splatter, steam, and hot-tool awareness', imageTheme: 'gloves, goggles, slow cooker, and heat-safe spatula', authority: 'lye' },
      { slug: 'equipment-and-bench-setup', title: 'Equipment and Bench Setup', focus: 'choose cooker size, spatulas, thermometer, molds, and cleanup tools', imageTheme: 'hot process tool kit arranged on slate and canvas' },
      { slug: 'formula-and-ingredient-authority', title: 'Formula and Ingredient Authority', focus: 'use the same calculator discipline as cold process before oil swaps or batch scaling', imageTheme: 'SoapAbacus tablet with oils, butters, and a scale', calculator: true },
      { slug: 'lye-oils-and-trace', title: 'Lye, Oils, and Trace', focus: 'prepare lye, melt oils, combine safely, and reach the right early texture', imageTheme: 'gloved maker combining oil and lye solution in a steel pot', authority: 'lye' },
      { slug: 'cook-stages', title: 'Cook Stages', focus: 'recognize pudding, wax, taffy, gel, and vaseline-style phases without guessing', imageTheme: 'four hot process texture stages in small dark bowls' },
      { slug: 'cooldown-and-additives', title: 'Cooldown and Additives', focus: 'time fragrance, essential oil, milk, honey, colorants, and superfat after the cook', imageTheme: 'post-cook additive bowls, amber bottles, and rustic batter', authority: 'ifra' },
      { slug: 'mold-cut-cure-and-troubleshoot', title: 'Mold, Cut, Cure, and Troubleshoot', focus: 'pack the mold, reduce voids, cut cleanly, and diagnose scorch or separation', imageTheme: 'rough top hot process loaf, cutter, and troubleshooting notes' },
    ],
  },
  {
    slug: 'melt-and-pour-soap-making-notes',
    title: 'Melt & Pour Soap Making Notes',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Melt & Pour Soap Making Notes.pdf',
    description:
      'A practical melt and pour module for customizing a premade base with heat control, measured additives, layer bonding, wrap strategy, and a clear next step toward from-scratch formulas.',
    audience: 'Beginners, families, workshop hosts, and makers who want fast custom bars without direct lye handling.',
    estimatedTime: '6 guided chapters',
    authorityLinks: [SOAP_ABACUS, IFRA, FDA_SOAP],
    checklist: checklist([
      'Base selected: Choose the base type and confirm manufacturer limits.',
      'Mold capacity measured: Know the fill weight before melting.',
      'Heat source chosen: Use controlled heat and avoid overheating.',
      'Additives measured: Scent, color, and texture additions are pre-measured.',
      'Layers bonded: Use timing and alcohol spray to reduce bubbles and separation.',
      'Bars wrapped: Package promptly to reduce glycerin dew and storage problems.',
    ]),
    chapters: [
      { slug: 'what-melt-and-pour-is', title: 'What Melt & Pour Is and Is Not', focus: 'understand premade base, no direct lye handling, and the difference from from-scratch soap', imageTheme: 'base cubes, silicone mold, and clean work mat' },
      { slug: 'workspace-and-heat-safety', title: 'Workspace and Heat Safety', focus: 'avoid burns, spills, overheated base, clutter, and unsupervised workshop work', imageTheme: 'clean bench with heat mat, gloves, spatula, and base cubes' },
      { slug: 'choose-base-and-design', title: 'Choose Base and Design', focus: 'select clear, goat milk, shea, oatmeal, honey, embed, or layer direction', imageTheme: 'base comparison board with clear, white, and textured cubes' },
      { slug: 'melt-cool-and-add', title: 'Melt, Cool, and Add', focus: 'control heat, cool before scent, and stir in color or additives evenly', imageTheme: 'thermometer in melted base with amber scent bottle and color cups', authority: 'ifra' },
      { slug: 'pour-layer-embed-and-finish', title: 'Pour, Layer, Embed, and Finish', focus: 'use alcohol spray, timing, and trimming to create cleaner bars', imageTheme: 'layered soap in silicone mold with spray bottle and trim knife' },
      { slug: 'wrap-store-troubleshoot-next-step', title: 'Wrap, Store, Troubleshoot, and Next Step', focus: 'prevent sweating, cloudy base, and layer separation, then decide whether to graduate to CP or HP', imageTheme: 'wrapped bars, storage bin, and calculator note for the next method', calculator: true },
    ],
  },
  {
    slug: 'lye-and-oil-ratio-quick-reference-chart',
    title: 'Lye & Oil Ratio Quick Reference Chart',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Lye & Oil Ratio Quick Reference Chart.pdf',
    description:
      'A reference module that teaches why lye ratio charts are study aids, not recipes, and how to verify SAP, superfat, water choices, and batch scale with SoapAbacus.',
    audience: 'Makers learning to read SAP values and recipe math without relying on copied ratios.',
    estimatedTime: '6 guided chapters',
    authorityLinks: [SOAP_ABACUS, LYE_SAFETY],
    checklist: checklist([
      'Lye type selected: Confirm NaOH for bars or KOH for liquid-style formulas.',
      'SAP source checked: Supplier variation and calculator data are understood.',
      'Superfat chosen: Use a controlled value and record why.',
      'Water method selected: Avoid aggressive water reduction until the formula is familiar.',
      'SoapAbacus verified: Use calculator confirmation as a required gate.',
      'Batch ID assigned: Save the calculation with the batch record.',
    ]),
    chapters: [
      { slug: 'ratios-are-not-recipes', title: 'Ratios Are Not Recipes', focus: 'use ratio charts for learning while refusing to make soap from ratios alone', imageTheme: 'scale, oils, lye, and notebook on black stone bench', calculator: true },
      { slug: 'sap-values-and-superfat', title: 'SAP Values and Superfat', focus: 'understand SAP variability and why superfat changes the finished formula', imageTheme: 'oil tins, olive oil, coconut oil, butter samples, and calculator notes', calculator: true },
      { slug: 'water-method-choices', title: 'Water Method Choices', focus: 'compare water as percent of oils, lye concentration, and water-to-lye ratio', imageTheme: 'lye-water pitcher, PPE, and stainless workspace', authority: 'lye' },
      { slug: 'batch-scaling', title: 'Batch Scaling', focus: 'scale formulas by total oils and mold capacity without changing percentages by accident', imageTheme: 'rugged bench scale, loaf mold, and tare workflow', calculator: true },
      { slug: 'verify-in-soapabacus', title: 'Verify in SoapAbacus', focus: 'make calculator verification the last gate before weighing any lye', imageTheme: 'tablet open to SoapAbacus beside oil bottles and scale', calculator: true },
      { slug: 'batch-record-and-cure-check', title: 'Batch Record and Cure Check', focus: 'connect formula math to real cure notes and bar performance', imageTheme: 'stamped recipe sheet, cure rack, and pencil marks' },
    ],
  },
  {
    slug: 'essential-oils-for-soap-making-quick-reference-chart',
    title: 'Essential Oils for Soap Making, Quick Reference Chart',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Essential Oils for Soap Making – Quick Reference Chart.pdf',
    description:
      'An essential oil module that turns a quick reference chart into a safe workflow for supplier documents, IFRA Category 9 limits, scent planning, blend testing, and cure notes.',
    audience: 'Makers choosing essential oils for rinse-off soap while keeping scent records and usage limits clear.',
    estimatedTime: '7 guided chapters',
    authorityLinks: [SOAP_ABACUS, IFRA, FDA_SOAP],
    checklist: checklist([
      'IFRA category checked: Confirm rinse-off soap limits with supplier documents.',
      'Max percentage recorded: Calculate the actual batch grams before weighing.',
      'Supplier docs saved: Keep IFRA, SDS, lot, and source notes together.',
      'Blend ratio set: Record top, middle, and base direction in parts or grams.',
      'Warnings reviewed: Consider sensitizers, phototoxic citrus, and strong materials.',
      'Cure scent log created: Review retention during cure instead of judging only on pour day.',
    ]),
    chapters: [
      { slug: 'eos-are-active-materials', title: 'Essential Oils Are Active Materials', focus: 'handle essential oils as concentrated materials with supplier limits and clear labels', imageTheme: 'amber bottles, gloves, and restrained dark bench', authority: 'ifra' },
      { slug: 'ifra-category-9-basics', title: 'IFRA Category 9 Basics', focus: 'read supplier limits for rinse-off soap before choosing a usage rate', imageTheme: 'supplier documents beside a scale and scent bottles', authority: 'ifra' },
      { slug: 'build-an-eo-profile', title: 'Build an EO Profile', focus: 'choose a scent family, strength, anchor, and intended bar character', imageTheme: 'cedar, tea tree, citrus peel, and patchouli on a stone tray' },
      { slug: 'safety-flags', title: 'Safety Flags', focus: 'recognize strong oils, sensitizer risks, phototoxic citrus, and customer-facing cautions', imageTheme: 'citrus peel, peppermint, eucalyptus, and warning card', authority: 'ifra' },
      { slug: 'blend-and-anchor', title: 'Blend and Anchor', focus: 'use simple blend ratios and base notes to improve scent survival through cure', imageTheme: 'droppers, scent blotters, cedar chips, and sage' },
      { slug: 'test-batch-log', title: 'Test Batch Log', focus: 'run small tests and record scent strength at pour, unmold, and cure review', imageTheme: 'small mold, cure rack, and weekly scent notes' },
      { slug: 'convert-chart-to-recipe', title: 'Convert Chart to Recipe', focus: 'convert chosen usage rate into batch grams with SoapAbacus and supplier limits', imageTheme: 'calculator handoff with amber bottles and batch-weight sheet', calculator: true, authority: 'ifra' },
    ],
  },
  {
    slug: 'fragrance-oils-guide',
    title: 'Fragrance Oils Guide',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Fragrance Oils Guide.pdf',
    description:
      'A fragrance oil module for selecting CP-safe oils, reading supplier documents, calculating scent load, preparing for acceleration, and recording cure performance.',
    audience: 'Soapmakers adding fragrance oils while managing IFRA limits, trace behavior, and discoloration.',
    estimatedTime: '7 guided chapters',
    authorityLinks: [SOAP_ABACUS, IFRA, FDA_SOAP],
    checklist: checklist([
      'IFRA certificate checked: Confirm rinse-off maximum and supplier notes.',
      'SDS reviewed: Keep safety and handling notes with the batch record.',
      'CP-safe confirmed: Avoid materials sold only for candles or non-soap use.',
      'Actual grams calculated: Convert percent to batch weight before pouring.',
      'Behavior noted: Record acceleration, ricing, seizing, and discoloration.',
      'Design choice matched: Choose simple or complex design based on fragrance behavior.',
    ]),
    chapters: [
      { slug: 'fo-vs-eo-at-the-bench', title: 'Fragrance Oil vs Essential Oil at the Bench', focus: 'compare fragrance oil and essential oil decisions without treating either as automatically safer', imageTheme: 'FO bottle, EO bottle, batter bowls, and practical bench lighting', authority: 'ifra' },
      { slug: 'supplier-docs-first', title: 'Supplier Docs First', focus: 'read IFRA, SDS, usage notes, vanillin, and CP behavior before opening the bottle', imageTheme: 'IFRA certificate, SDS sheet, and amber bottle', authority: 'ifra' },
      { slug: 'calculate-the-load', title: 'Calculate the Load', focus: 'turn supplier maximums and typical rates into grams for the actual batch', imageTheme: 'scale, calculator, oil weight sheet, and fragrance bottle', calculator: true, authority: 'ifra' },
      { slug: 'workspace-prep', title: 'Workspace Prep', focus: 'pre-weigh fragrance and have molds, towels, and color cups ready before trace changes', imageTheme: 'gloves, towels, mold, and pre-weighed fragrance cup' },
      { slug: 'acceleration-ricing-and-seizing', title: 'Acceleration, Ricing, and Seizing', focus: 'recognize fast thickening and texture problems before the design fails', imageTheme: 'test cups showing smooth batter and thickened batter' },
      { slug: 'design-around-behavior', title: 'Design Around Behavior', focus: 'choose simple pours for fast movers and save swirls for well-tested scents', imageTheme: 'simple pour setup next to swirl tools and color cups' },
      { slug: 'cure-performance-scorecard', title: 'Cure Performance Scorecard', focus: 'record scent retention, discoloration, and customer-facing scent language after cure', imageTheme: 'bars labeled by scent retention and discoloration notes' },
    ],
  },
  {
    slug: 'colorants-and-natural-additives-notes',
    title: 'Colorants & Natural Additives Notes',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Colorants & Natural Additives Notes.pdf',
    description:
      'A color and additive module for selecting soap-safe materials, dispersing them properly, anticipating trace or color shifts, and documenting batch results.',
    audience: 'Makers adding visual character or simple additives while keeping sourcing, usage, and records disciplined.',
    estimatedTime: '6 guided chapters',
    authorityLinks: [SOAP_ABACUS, FDA_LABELING],
    checklist: checklist([
      'Cosmetic grade confirmed: Use materials intended for skin-contact rinse-off products.',
      'Usage rate set: Keep each additive measured against batch size or oil weight.',
      'Dispersion medium chosen: Decide oil, water, glycerin, or direct addition before mixing.',
      'Gel plan documented: Note whether color depends on gel or no-gel handling.',
      'Bleed or morph checked: Record pH shift, botanical browning, or color migration.',
      'Batch photos saved: Photograph fresh, cut, and cured bars for comparison.',
    ]),
    chapters: [
      { slug: 'colorant-families', title: 'Colorant Families', focus: 'compare charcoal, clays, oxides, micas, botanicals, and infusions by role', imageTheme: 'charcoal, clays, oxides, micas, and botanicals on slate' },
      { slug: 'skin-safe-and-soap-safe-sourcing', title: 'Skin-Safe and Soap-Safe Sourcing', focus: 'confirm intended use, supplier quality, and label implications before adding color', imageTheme: 'labeled jars, supplier sheets, and clean maker bench', authority: 'label' },
      { slug: 'disperse-infuse-or-add-dry', title: 'Disperse, Infuse, or Add Dry', focus: 'choose the right preparation path to reduce clumps, specks, and uneven color', imageTheme: 'oil dispersion cups and small spatulas on dark bench' },
      { slug: 'recipe-and-trace-effects', title: 'Recipe and Trace Effects', focus: 'anticipate how clays, charcoal, botanicals, and powders change batter behavior', imageTheme: 'split batter, swirl tool, and disciplined mise en place', calculator: true },
      { slug: 'gel-cure-and-color-shift', title: 'Gel, Cure, and Color Shift', focus: 'track how heat, pH, and cure time change final color', imageTheme: 'cure rack with before and after color swatches' },
      { slug: 'document-the-batch', title: 'Document the Batch', focus: 'store colorant percentage, dispersion method, photos, and final observations together', imageTheme: 'photo log, batch card, and additive percentage notes' },
    ],
  },
  {
    slug: 'exfoliants-in-soap-printable-chart',
    title: 'Exfoliants in Soap, Printable Chart',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Exfoliants in Soap – Printable Chart.pdf',
    description:
      'A texture module that turns exfoliant ideas into safer particle choices, use-case matching, measured rates, suspension timing, and a printable reference chart.',
    audience: 'Makers creating hand, body, or foot bars with controlled texture instead of rough guesswork.',
    estimatedTime: '6 guided chapters',
    authorityLinks: [SOAP_ABACUS, FDA_SOAP],
    checklist: checklist([
      'Target use selected: Choose hand, body, or foot use before selecting texture.',
      'Particle size checked: Avoid jagged or overly rough material for delicate use.',
      'Rate calculated: Convert per-pound guidance into the actual batch size.',
      'Suspension timing chosen: Add at a trace level that holds the material evenly.',
      'Scratch and rinse check done: Evaluate feel and drain behavior before sharing.',
      'Label note written: Describe texture plainly and avoid over-promising results.',
    ]),
    chapters: [
      { slug: 'texture-has-a-job', title: 'Texture Has a Job', focus: 'define why the bar needs texture and what problem the grit should solve', imageTheme: 'fine and coarse exfoliant samples on black stone' },
      { slug: 'match-exfoliant-to-use-case', title: 'Match Exfoliant to Use Case', focus: 'separate hand, body, and foot bar decisions by particle strength', imageTheme: 'hand, body, and foot bar comparison on a rugged bench' },
      { slug: 'particle-size-and-edge-safety', title: 'Particle Size and Edge Safety', focus: 'reject jagged, sharp, or overly aggressive texture for routine use', imageTheme: 'gloved finger texture check with oats, pumice, and salt' },
      { slug: 'usage-rate-and-suspension', title: 'Usage Rate and Suspension', focus: 'calculate exfoliant amount and add at the right trace for even distribution', imageTheme: 'oats, pumice, coffee, and walnut shell samples measured by batch', calculator: true },
      { slug: 'pour-timing-and-bar-finish', title: 'Pour Timing and Bar Finish', focus: 'manage medium trace, surface finish, and cut-face appearance', imageTheme: 'medium trace batter with suspended particles and cut bars' },
      { slug: 'versioned-printable-chart', title: 'Versioned Printable Chart', focus: 'keep a dated reference chart so future batches improve from actual observations', imageTheme: 'rugged maker logbook and printed exfoliant chart' },
    ],
  },
  {
    slug: 'soap-recipe-template-guide',
    title: 'Soap Recipe Template Guide',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Soap Recipe Template Guide.pdf',
    description:
      'A recipe-template module that creates a complete batch record: batch code, oil system, lye and liquid choices, additives, scent documents, color intent, trace notes, cure, and QC.',
    audience: 'Makers who want repeatable formulas and a disciplined record before scaling or selling.',
    estimatedTime: '8 guided chapters',
    authorityLinks: [SOAP_ABACUS, LYE_SAFETY, IFRA, FDA_SOAP],
    checklist: checklist([
      'PPE ready: Safety tools and lye-safe containers are staged.',
      'Lye order confirmed: Lye goes into water and never the reverse.',
      'SoapAbacus saved: Calculation is saved or recorded before mixing.',
      'All grams logged: Oils, liquids, lye, scent, color, and additives use exact weights.',
      'IFRA checked: Scent maximum, supplier, and lot details are recorded.',
      'QC scheduled: Cure review, weight check, appearance, and notes are dated.',
    ]),
    chapters: [
      { slug: 'batch-brief-and-code', title: 'Batch Brief and Code', focus: 'give the formula an identity before ingredients are weighed', imageTheme: 'maker notebook and batch code on a dark bench' },
      { slug: 'oil-system', title: 'Oil System', focus: 'record each oil role, percentage, supplier, and weight in grams', imageTheme: 'oils and butters on a digital scale', calculator: true },
      { slug: 'lye-liquid-and-superfat', title: 'Lye, Liquid, and Superfat', focus: 'define lye type, water method, superfat, and solution notes', imageTheme: 'lye-safe pitcher with goggles and gloves', calculator: true, authority: 'lye' },
      { slug: 'additives-plan', title: 'Additives Plan', focus: 'flag honey, milk, salt, clay, charcoal, botanicals, and other high-impact additions', imageTheme: 'additive trays with charcoal, clay, honey, and salt' },
      { slug: 'fragrance-and-ifra-log', title: 'Fragrance and IFRA Log', focus: 'record fragrance name, supplier, IFRA limit, lot, and actual grams', imageTheme: 'fragrance bottles with IFRA sheet and scale', authority: 'ifra' },
      { slug: 'color-and-design-intent', title: 'Color and Design Intent', focus: 'sketch the visual plan and record colorant type, dispersion, and amount', imageTheme: 'mica cups, loaf sketch, and color map' },
      { slug: 'temperature-trace-and-pour-notes', title: 'Temperature, Trace, and Pour Notes', focus: 'capture process variables that explain the final bar', imageTheme: 'thermometer and stick blender at trace' },
      { slug: 'cure-qc-and-final-batch-record', title: 'Cure, QC, and Final Batch Record', focus: 'turn the template into a finished record with cure and quality notes', imageTheme: 'cured bars on rack with final batch card', calculator: true },
    ],
  },
  {
    slug: 'specialty-soap-recipes-guide',
    title: 'Specialty Soap Recipes Guide',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Specialty Soap Recipes Guide.pdf',
    description:
      'A specialty-soap module that turns recipe ideas into calculator-verified build paths for milk, sugars, minerals, botanicals, alternate liquids, scent systems, and collection evaluation.',
    audience: 'Intermediate makers ready to test specialty materials while controlling heat, acceleration, and claims.',
    estimatedTime: '9 guided chapters',
    authorityLinks: [SOAP_ABACUS, LYE_SAFETY, IFRA, FDA_SOAP],
    checklist: checklist([
      'Recipe verified: Specialty changes are entered in SoapAbacus before making.',
      'Specialty liquid prepared: Milk, beer, aloe, coffee, or tea is staged safely.',
      'Temperature ceiling set: Heat-sensitive materials have a control plan.',
      'Acceleration risks identified: Salt, clay, charcoal, sugars, and scent behavior are considered.',
      'Test batch chosen: Start small before scaling the concept.',
      'Claims reviewed: Packaging language stays within cleansing and craft boundaries.',
    ]),
    chapters: [
      { slug: 'specialty-readiness', title: 'Specialty Readiness', focus: 'confirm that core cold process skills are stable before adding specialty variables', imageTheme: 'foundation bench with oils, lye-safe tools, and PPE' },
      { slug: 'formula-architecture', title: 'Formula Architecture', focus: 'build specialty recipes as calculator-verified templates, not copied formulas', imageTheme: 'oils, lye-safe tools, notebook, and calculator', calculator: true },
      { slug: 'milk-sugars-and-heat-control', title: 'Milk, Sugars, and Heat Control', focus: 'manage freezing, scorching, and overheating when adding sugars or milk', imageTheme: 'frozen milk cubes beside a lye pitcher', authority: 'lye' },
      { slug: 'clay-charcoal-salt-and-mineral-bars', title: 'Clay, Charcoal, Salt, and Mineral Bars', focus: 'control thickening, texture, and bar feel when using mineral-heavy additions', imageTheme: 'charcoal, clay, salt, and mineral spread on slate' },
      { slug: 'botanicals-and-plant-powders', title: 'Botanicals and Plant Powders', focus: 'anticipate browning, speckling, and plant-material record needs', imageTheme: 'herb-infused oils and dried botanicals on a maker bench' },
      { slug: 'aloe-beer-coffee-tea-liquid-replacements', title: 'Aloe, Beer, Coffee, Tea, and Liquid Replacements', focus: 'prepare alternate liquids safely and adjust formula records accordingly', imageTheme: 'aloe, beer, coffee, and tea in labeled prep vessels', calculator: true },
      { slug: 'fragrance-essential-oil-and-color-systems', title: 'Fragrance, Essential Oil, and Color Systems', focus: 'match scent, color, and design to the specialty ingredient behavior', imageTheme: 'EO and fragrance bottles with droppers and color cups', authority: 'ifra' },
      { slug: 'guided-specialty-build-paths', title: 'Guided Specialty Build Paths', focus: 'choose one controlled specialty path and build a small test batch first', imageTheme: 'test-batch mini molds and measured ingredients', calculator: true },
      { slug: 'collections-packaging-and-evaluation', title: 'Collections, Packaging, and Evaluation', focus: 'evaluate cured bars and package them without unsupported product claims', imageTheme: 'curated rugged gift set and final QC cure rack', authority: 'fda' },
    ],
  },
  {
    slug: 'swirling-and-layering-techniques-guide',
    title: 'Swirling & Layering Techniques Guide',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Swirling & Layering Techniques Guide.pdf',
    description:
      'A design-technique module for cold process makers who need slow-moving formulas, color maps, trace targets, stable molds, and controlled swirl or layer workflows.',
    audience: 'Intermediate cold process makers designing repeatable visual bars.',
    estimatedTime: '8 guided chapters',
    authorityLinks: [SOAP_ABACUS, IFRA, LYE_SAFETY],
    checklist: checklist([
      'Formula checked: Use SoapAbacus for a slow-moving base before the design attempt.',
      'Fragrance behavior known: Avoid untested fast movers for complex work.',
      'Trace target chosen: Decide thin, light, medium, or layer-safe trace before mixing.',
      'Colors dispersed: Label cups and control dust from micas, clays, or charcoal.',
      'Mold level confirmed: Stabilize the mold and rehearse the pour sequence.',
      'Design QC recorded: Cut timing, gel choice, and final pattern notes are saved.',
    ]),
    chapters: [
      { slug: 'design-readiness-and-safety-gate', title: 'Design Readiness and Safety Gate', focus: 'make sure cold process fundamentals are stable before prioritizing visual complexity', imageTheme: 'sketched loaf map on parchment over black stone', authority: 'lye' },
      { slug: 'slow-moving-base-formula', title: 'Slow-Moving Base Formula', focus: 'choose oils, water, and scent behavior that leave time to design', imageTheme: 'slow-moving oil blend setup with calculator notes', calculator: true },
      { slug: 'sketch-the-loaf-and-color-map', title: 'Sketch the Loaf and Color Map', focus: 'plan color placement and pour order before reaching trace', imageTheme: 'color palette cups and loaf sketch on a steel tray' },
      { slug: 'temperature-water-and-trace-targets', title: 'Temperature, Water, and Trace Targets', focus: 'set practical temperature and trace targets for the design style', imageTheme: 'thermometer beside lye solution, oils, and batter', calculator: true },
      { slug: 'mold-colorant-and-pour-station-prep', title: 'Mold, Colorant, and Pour Station Prep', focus: 'level molds, disperse colors, label cups, and clear the pour path', imageTheme: 'lined loaf mold and labeled pour cups' },
      { slug: 'layering-workflow', title: 'Layering Workflow', focus: 'pour stable layers without separation, overheating, or rough edges', imageTheme: 'gloved hands pouring clean layers into a loaf mold' },
      { slug: 'swirl-workflow', title: 'Swirl Workflow', focus: 'choose drop, in-the-pot, hanger, or surface swirl based on trace and timing', imageTheme: 'drop swirl and hanger swirl action shots' },
      { slug: 'gel-cut-cure-qc-and-troubleshooting', title: 'Gel, Cut, Cure, QC, and Troubleshooting', focus: 'connect gel choice, cut timing, and pattern clarity to documented results', imageTheme: 'cut swirl bars on cure rack with QC card' },
    ],
  },
  {
    slug: 'soap-troubleshooting-guide',
    title: 'Soap Troubleshooting Guide',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Soap Troubleshooting Guide.pdf',
    description:
      'A troubleshooting module for triaging batch problems, identifying likely causes, deciding whether to wait, rescue, rebatch, or discard, and preventing repeat failures through better records.',
    audience: 'Makers diagnosing batter, heat, scent, texture, surface, and cure problems.',
    estimatedTime: '9 guided chapters',
    authorityLinks: [SOAP_ABACUS, LYE_SAFETY, IFRA, FDA_SOAP],
    checklist: checklist([
      'PPE active: Handle questionable soap with gloves and eye protection.',
      'Accurate scale checked: Confirm the scale and tare habits before the next batch.',
      'Recipe verified: Recheck lye, oil, liquid, and superfat math in SoapAbacus.',
      'Fragrance rate checked: Confirm IFRA and actual grams before repeating the scent.',
      'Cure setup reviewed: Record humidity, airflow, rack, and timing.',
      'Sell or hold decision made: Do not share questionable batches without a clear safety decision.',
    ]),
    chapters: [
      { slug: 'batch-triage', title: 'Batch Triage: Cosmetic, Salvageable, or Unsafe', focus: 'decide whether a problem is cosmetic, needs more time, needs rescue, or should be discarded', imageTheme: 'gloves, goggles, scale, notebook, and test strips on dark stone', authority: 'lye' },
      { slug: 'batter-behavior', title: 'Batter Behavior', focus: 'compare false trace, acceleration, seizing, ricing, and separation symptoms', imageTheme: 'two mixing bowls showing smooth emulsion and curdled batter', calculator: true },
      { slug: 'heat-control', title: 'Heat Control', focus: 'diagnose overheating, volcano risk, gel, and milk or sugar scorching', imageTheme: 'loaf mold, infrared thermometer, chilled milk cubes, and cooling rack', authority: 'lye' },
      { slug: 'surface-and-color-defects', title: 'Surface and Color Defects', focus: 'identify ash, darkening, glycerin rivers, color morphing, and uneven finish', imageTheme: 'cut bars on slate with steamed and planed comparison pieces' },
      { slug: 'texture-failures', title: 'Texture Failures', focus: 'diagnose soft, mushy, brittle, crumbly, or weeping bars with formula and cure records', imageTheme: 'wire cutter, dented soft bar, chipped brittle bar, and cure rack', calculator: true },
      { slug: 'fragrance-problems', title: 'Fragrance Problems', focus: 'connect acceleration, fading, discoloration, and irritation-risk decisions to scent documents', imageTheme: 'fragrance bottles, kaolin clay, IFRA sheet, and small test cup', authority: 'ifra' },
      { slug: 'rescue-methods', title: 'Rescue Methods', focus: 'choose wait, cool, reblend, hot-process rescue, rebatch, or discard with a safety-first mindset', imageTheme: 'double boiler rebatch pot beside rugged molds', authority: 'lye' },
      { slug: 'prevention-by-formula-design', title: 'Prevention by Formula Design', focus: 'prevent repeat failures by adjusting formula, water, scent, temperature, and process variables', imageTheme: 'tablet open to SoapAbacus with oil bottles and scale', calculator: true },
      { slug: 'batch-log-and-root-cause-quiz', title: 'Batch Log and Root-Cause Quiz', focus: 'turn the failure into a concise root-cause record and next-batch prevention plan', imageTheme: 'weather meter, batch card, thermometer, and annotated soap samples' },
    ],
  },
  {
    slug: 'soap-packaging-and-branding-notes',
    title: 'Soap Packaging & Branding Notes',
    sourcePdf: 'docs/SoapMaking/Soap-Making-Lessons/Soap Packaging & Branding Notes.pdf',
    description:
      'A packaging and branding module for protecting bars, presenting a coherent collection, staying inside true-soap or cosmetic label boundaries, and testing durability before sale.',
    audience: 'Makers preparing handmade bars for gifts, markets, shipping, or a small brand collection.',
    estimatedTime: '8 guided chapters',
    authorityLinks: [SOAP_ABACUS, FDA_SOAP, FDA_LABELING],
    checklist: checklist([
      'Packaging fit checked: Bar size, wrap tension, ventilation, and protection are tested.',
      'Claim path selected: True soap, cosmetic, or stricter path is identified before writing copy.',
      'Net weight included: Weight statement is accurate and readable.',
      'Ingredients listed: Ingredient language is consistent with the chosen claim path.',
      'Lot code assigned: Batch traceability links packaging to the formula record.',
      'Legibility tested: Print contrast, font size, and material durability are checked.',
      'Cost per unit known: Packaging cost is recorded before scaling.',
      'Shipping test done: Wrapped bars survive humidity, oil contact, and handling.',
    ]),
    chapters: [
      { slug: 'what-packaging-must-do', title: 'What Packaging Must Do', focus: 'protect the bar, inform the customer, support the brand, and survive handling', imageTheme: 'Coldstone bar in kraft wrap on stone and wood bench' },
      { slug: 'coldstone-brand-system', title: 'Coldstone Brand System', focus: 'translate the rugged, premium, disciplined brand into packaging materials and layout', imageTheme: 'logo stamp, kraft labels, black metal ruler, twine, and rugged swatches' },
      { slug: 'packaging-formats', title: 'Packaging Formats', focus: 'compare belly bands, sleeves, boxes, cloth bags, tins, and care cards by use case', imageTheme: 'lineup of belly bands, sleeves, boxes, cloth bags, and tins' },
      { slug: 'materials-climate-cost-and-sustainability', title: 'Materials, Climate, Cost, and Sustainability', focus: 'test material durability, oil resistance, humidity, cost, and proof for sustainability language', imageTheme: 'oil-drop and water-drop tests on kraft, wax paper, cardstock, and labels' },
      { slug: 'label-compliance-and-claim-boundaries', title: 'Label Compliance and Claim Boundaries', focus: 'separate true soap language from cosmetic or drug-style claims before label design', imageTheme: 'close-up label with net weight, lot code, contact, and ingredients', authority: 'fda' },
      { slug: 'label-design-workshop', title: 'Label Design Workshop', focus: 'test contrast, hierarchy, print size, icons, and scannability before ordering materials', imageTheme: 'printed test labels, cutter, contrast samples, and icon sheet', authority: 'label' },
      { slug: 'product-line-architecture', title: 'Product Line Architecture', focus: 'organize core, seasonal, premium, and gift bars without confusing customers', imageTheme: 'core, seasonal, premium, and gift bars arranged in crates', calculator: true },
      { slug: 'unboxing-market-display-and-seasonal-launches', title: 'Unboxing, Market Display, and Seasonal Launches', focus: 'connect shipping, display, care cards, and seasonal launches into a repeatable system', imageTheme: 'shipping box, tissue, care card, and market display under workshop lighting' },
    ],
  },
];

export const lessonModules: LessonModule[] = moduleSeeds.map(buildModule);

export function getLessonModules() {
  return lessonModules;
}

export function getLessonModuleBySlug(slug: string) {
  return lessonModules.find((module) => module.slug === slug);
}

export function getLessonChapterBySlug(moduleSlug: string, chapterSlug: string) {
  return getLessonModuleBySlug(moduleSlug)?.chapters.find((chapter) => chapter.slug === chapterSlug);
}
