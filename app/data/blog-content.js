const blogCategories = [
  'Cold Process Soap',
  'Ingredients',
  'Grooming',
  'Behind the Batch',
  'Soapmaking Tools',
];

const SOAP_ABACUS_URL = 'https://www.soapabacus.com';

const blogPosts = [
  {
    slug: 'what-is-cold-process-soap',
    title: 'What Is Cold Process Soap?',
    description:
      'A clear guide to cold process soap, how saponification works, why handmade bars need time, and what shoppers should look for on a product page.',
    excerpt:
      'Cold process soap starts with oils, lye, and time. Here is the plain-English version of what happens before a finished bar reaches the shower.',
    category: 'Cold Process Soap',
    publishedDate: '2026-05-01',
    readTime: '5 min read',
    heroImage: '/stone-forge.jpg',
    heroAlt: 'Stone Forge cold process soap bar',
    internalLinks: [
      { label: 'Shop cold process bars', href: '/shop' },
      { label: 'Try the Soap Calculator', href: SOAP_ABACUS_URL, target: '_blank', rel: 'noopener noreferrer' },
      { label: 'Read the shipping policy', href: '/shipping' },
    ],
    sections: [
      {
        heading: 'The short version',
        body: [
          'Cold process soap is made when fats and oils combine with a lye solution and go through saponification. The finished result is soap, plus naturally occurring glycerin from the process.',
          'The method is called cold process because the maker does not cook the batch after mixing. The recipe is poured into a mold, cut into bars, and rested before sale.',
        ],
      },
      {
        heading: 'Why makers choose it',
        body: [
          'Cold process gives a maker control over the oil blend, scent direction, color, bar hardness, and lather style. That is why two bars can feel very different even when both are simply meant for washing.',
          'It also rewards patience. A fresh bar may be soap, but it needs time to become firmer and easier to use day after day.',
        ],
      },
      {
        heading: 'What shoppers should check',
        body: [
          'Look for a clear ingredient list, approximate bar weight, scent notes, and practical care guidance. A strong product page should help you understand the bar before you add it to cart.',
          'Coldstone product pages are built around that idea: ingredients, scent profile, bar weight, care tips, and support links stay close to the buy button.',
        ],
      },
    ],
  },
  {
    slug: 'why-handmade-soap-needs-to-cure',
    title: 'Why Handmade Soap Needs to Cure',
    description:
      'Handmade soap improves during its rest period. Learn what the cure window changes, why patience matters, and how a firmer bar helps daily use.',
    excerpt:
      'The waiting period is not decorative. Cure time helps a handmade bar become harder, longer-lasting, and more pleasant to handle.',
    category: 'Behind the Batch',
    publishedDate: '2026-05-03',
    readTime: '4 min read',
    heroImage: '/stone-forge.jpg',
    heroAlt: 'Black Granite cold process soap bar',
    internalLinks: [
      { label: 'View Black Granite', href: '/products/black-granite' },
      { label: 'Shop all soap', href: '/shop' },
      { label: 'Use the Soap Calculator', href: SOAP_ABACUS_URL, target: '_blank', rel: 'noopener noreferrer' },
    ],
    sections: [
      {
        heading: 'Cure time is part of the recipe',
        body: [
          'A handmade bar changes after it is cut. Water continues to leave the bar, the structure firms up, and the final feel becomes easier to judge.',
          'That is why a responsible maker pays attention to the calendar after the batch is unmolded. The work is not finished the moment the bars are sliced.',
        ],
      },
      {
        heading: 'Hardness matters in the shower',
        body: [
          'A firmer bar handles daily water better. It is less likely to soften quickly on a wet ledge, and it usually feels more substantial in the hand.',
          'That does not replace good care. A draining soap dish still matters because any bar sitting in water will wear down faster.',
        ],
      },
      {
        heading: 'What it means for buying',
        body: [
          'Batch timing affects availability. Small-batch soap is not always instant inventory, and that is part of keeping the product honest.',
          'Coldstone keeps the customer-facing promise simple: in-stock bars are ready to ship, and product pages focus on what the bar is built to do in normal daily washing.',
        ],
      },
    ],
  },
  {
    slug: 'activated-charcoal-soap-what-it-is',
    title: 'Activated Charcoal Soap: What It Is and When to Use It',
    description:
      'A practical look at activated charcoal in handmade soap, including color, texture, scent pairing, and how to decide if a charcoal bar fits your routine.',
    excerpt:
      'Activated charcoal brings a deep black color and a crisp, mineral mood to soap. The best version still depends on the full recipe around it.',
    category: 'Ingredients',
    publishedDate: '2026-05-05',
    readTime: '5 min read',
    heroImage: '/stone-forge.jpg',
    heroAlt: 'Black Granite activated charcoal soap bar',
    internalLinks: [
      { label: 'View Black Granite', href: '/products/black-granite' },
      { label: 'Read about bar longevity', href: '/blog/make-a-bar-last-longer' },
      { label: 'Join batch updates', href: '/#newsletter' },
    ],
    sections: [
      {
        heading: 'What activated charcoal adds',
        body: [
          'Activated charcoal is a fine black powder used by soapmakers for its bold color and clean visual identity. In a bar, it can make the whole design feel sharper and more modern.',
          'It also pairs naturally with herbal, wood, mint, and mineral scent directions because the look suggests something crisp and grounded.',
        ],
      },
      {
        heading: 'The full formula still matters',
        body: [
          'Charcoal is one ingredient, not the whole bar. The oil blend, butter content, water amount, fragrance or essential oil choices, and cure window all shape the finished soap.',
          'That is why a good product page should describe more than a single featured ingredient. The whole bar is the product.',
        ],
      },
      {
        heading: 'When to choose it',
        body: [
          'Choose a charcoal bar when you like a darker look, a crisp scent profile, and a clean finish for everyday washing.',
          'Black Granite is Coldstone Soap Co.\'s charcoal-forward bar, built with tea tree essential oil and a simple cold process base.',
        ],
      },
    ],
  },
  {
    slug: 'cedar-and-sage-earthy-soap-bar',
    title: 'Cedar and Sage: Building an Earthy Soap Bar',
    description:
      'Explore how cedar and sage create an earthy soap profile, why scent balance matters, and how Stone Forge turns that idea into a daily-use bar.',
    excerpt:
      'Cedar and sage give a bar a grounded, woodsy direction without needing to shout. The right base keeps that scent useful every day.',
    category: 'Ingredients',
    publishedDate: '2026-05-07',
    readTime: '4 min read',
    heroImage: '/stone-forge.jpg',
    heroAlt: 'Stone Forge cedar and sage soap bar',
    internalLinks: [
      { label: 'View Stone Forge', href: '/products/stone-forge' },
      { label: 'Shop all bars', href: '/shop' },
      { label: 'Read about cold process soap', href: '/blog/what-is-cold-process-soap' },
    ],
    sections: [
      {
        heading: 'Why cedar works',
        body: [
          'Cedar brings a dry wood note that feels steady and familiar. In soap, it can make a bar read as clean, outdoorsy, and unfussy.',
          'It is especially useful when the goal is a bar that feels masculine without leaning into heavy cologne styling.',
        ],
      },
      {
        heading: 'What sage adds',
        body: [
          'Sage adds a green herbal edge. Paired with cedar, it keeps the bar from feeling flat and gives the scent profile more movement.',
          'The result is less sweet, less floral, and more grounded than many bath products on the shelf.',
        ],
      },
      {
        heading: 'How Stone Forge uses the pairing',
        body: [
          'Stone Forge takes that cedar-and-sage direction and sets it inside a richer cold process base. The goal is a sturdy bar with a warm wood finish and a dense daily-use feel.',
          'If Black Granite is crisp and dark, Stone Forge is warmer and more grounded.',
        ],
      },
    ],
  },
  {
    slug: 'make-a-bar-last-longer',
    title: 'How to Make a Bar Last Longer in the Shower',
    description:
      'Simple soap care tips for getting more uses from a handmade bar, including drainage, storage, rotation, and habits that prevent unnecessary softening.',
    excerpt:
      'A good bar deserves a decent home. The fastest way to waste handmade soap is to let it sit in water between uses.',
    category: 'Grooming',
    publishedDate: '2026-05-09',
    readTime: '3 min read',
    heroImage: '/stone-forge.jpg',
    heroAlt: 'Handmade soap bar with earthy finish',
    internalLinks: [
      { label: 'Shop long-lasting bars', href: '/shop' },
      { label: 'View Stone Forge', href: '/products/stone-forge' },
      { label: 'Read the FAQ', href: '/faq' },
    ],
    sections: [
      {
        heading: 'Keep it out of standing water',
        body: [
          'The biggest upgrade is drainage. A soap dish with ridges, slots, or a raised surface lets water leave the bar instead of pooling underneath it.',
          'If the bottom of the bar stays wet all day, it will soften faster no matter how well the recipe was built.',
        ],
      },
      {
        heading: 'Let air do its job',
        body: [
          'A bar lasts longer when it has a chance to dry between uses. Keep it away from the strongest shower spray and avoid storing it on a flat, wet shelf.',
          'In a busy shower, rotating between two bars can also give each one more time to firm back up.',
        ],
      },
      {
        heading: 'Use the right amount',
        body: [
          'Handmade soap does not need to be ground down into a washcloth for a long time. Work up what you need, set the bar down somewhere dry, and let it rest.',
          'Small habits make a noticeable difference over the life of the bar.',
        ],
      },
    ],
  },
  {
    slug: 'use-a-soap-calculator-without-guessing',
    title: 'How to Use a Soap Calculator Without Guessing',
    description:
      'A beginner-friendly guide to using a soap calculator with oil percentages, lye amount, water ratio, superfat, batch size, and recipe notes.',
    excerpt:
      'A soap calculator turns a recipe idea into numbers you can check. The key is knowing which numbers matter before you pour anything.',
    category: 'Soapmaking Tools',
    publishedDate: '2026-05-11',
    readTime: '7 min read',
    heroImage: '/stone-forge.jpg',
    heroAlt: 'Cold process soap bar beside soapmaking notes',
    internalLinks: [
      { label: 'Open the Soap Calculator', href: SOAP_ABACUS_URL, target: '_blank', rel: 'noopener noreferrer' },
      { label: 'Read about cure time', href: '/blog/why-handmade-soap-needs-to-cure' },
      { label: 'Shop finished bars', href: '/shop' },
    ],
    sections: [
      {
        heading: 'Start with batch size',
        body: [
          'Before choosing oils, decide how much oil weight you want in the batch. Batch size keeps the whole recipe anchored and prevents every other number from floating.',
          'Once the oil weight is set, percentages become easier to reason about because every oil is part of a defined total.',
        ],
      },
      {
        heading: 'Use percentages, not vibes',
        body: [
          'Percentages make a recipe easier to scale. If olive oil is 40 percent of the oil blend, it stays 40 percent whether the batch is small or large.',
          'The calculator turns those percentages into grams or ounces, then estimates lye and water based on the selected oils.',
        ],
      },
      {
        heading: 'Check lye, water, and superfat',
        body: [
          'A calculator is only as useful as the inputs. Review each oil, the unit of measure, water setting, superfat, and total batch size before relying on the output.',
          'Keep notes on what you changed and why. Good recipe notes make the next batch easier to improve.',
        ],
      },
      {
        heading: 'Use the tool, then use judgment',
        body: [
          'Coldstone\'s Soap Calculator is built to make recipe planning clearer, but safe soapmaking still depends on careful measuring, protective equipment, and a process you understand.',
          'For shoppers, the calculator is also a useful window into why handmade bars are designed with intention instead of guesswork.',
        ],
      },
    ],
  },
];

function getBlogCategories() {
  return [...blogCategories];
}

function getBlogPostBySlug(slug) {
  return blogPosts.find((post) => post.slug === slug);
}

function getPublishedBlogPosts() {
  return [...blogPosts].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

exports.blogCategories = blogCategories;
exports.blogPosts = blogPosts;
exports.getBlogCategories = getBlogCategories;
exports.getBlogPostBySlug = getBlogPostBySlug;
exports.getPublishedBlogPosts = getPublishedBlogPosts;
