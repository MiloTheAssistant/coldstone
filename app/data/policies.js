const contactEmail = 'hello@coldstonesoapco.com';

const policyPages = {
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    description:
      'Plain-English notes on shopping data, checkout, analytics, email updates, and the choices customers have when using Coldstone Soap Co.',
    sections: [
      {
        title: 'Information We Collect',
        body: 'We collect the information needed to run the shop, including customer contact details, shipping addresses, order details, newsletter signups, and messages sent through customer support channels.',
      },
      {
        title: 'Checkout and Payments',
        body: 'Checkout is handled through Stripe. Coldstone Soap Co. receives order and payment status information from Stripe, but full card numbers are processed by Stripe and are not stored directly by Coldstone Soap Co.',
      },
      {
        title: 'Analytics, Cookies, and Local Storage',
        body: 'The site may use Google Analytics and Google Tag Manager to understand visits, product interest, cart activity, and checkout performance. The cart may use browser localStorage, and analytics tools may use cookies or similar browser storage.',
      },
      {
        title: 'Email and Newsletter Updates',
        body: 'Customers who join the newsletter may receive product drops, soapmaking notes, and shop updates. Marketing email tools may process signup details, and every marketing email will include an unsubscribe option.',
      },
      {
        title: 'How Information Is Used',
        body: 'Information is used to process orders, ship purchases, answer questions, prevent fraud, improve the website, measure marketing performance, and comply with business recordkeeping needs.',
      },
      {
        title: 'Questions and Requests',
        body: `Privacy questions or update requests can be sent to ${contactEmail}. Include the email address used for the order or signup so the request can be matched accurately.`,
      },
    ],
  },
  terms: {
    eyebrow: 'Terms',
    title: 'Terms of Use',
    description:
      'The basic ground rules for using the Coldstone Soap Co. website, shopping the catalog, and using free tools such as the Soap Calculator.',
    sections: [
      {
        title: 'Website Use',
        body: 'By using this website, you agree to use it lawfully, respect site security, and avoid interfering with checkout, account services, customer communications, or product listings.',
      },
      {
        title: 'Product Information',
        body: 'Product descriptions, ingredients, scent notes, weights, and photos are provided to help customers shop confidently. Handmade bars can vary slightly in color, shape, finish, and exact weight from batch to batch.',
      },
      {
        title: 'Orders, Pricing, and Availability',
        body: 'Orders are accepted when checkout is completed and payment is confirmed. Prices, promotions, product availability, and shipping options may change until an order is placed.',
      },
      {
        title: 'Soap Calculator',
        body: 'The Soap Calculator is an educational tool for recipe planning and estimation. Users are responsible for checking calculations, following safe soapmaking practices, and choosing appropriate materials for their own use.',
      },
      {
        title: 'Site Content',
        body: 'Website text, photos, designs, product names, and calculator materials belong to Coldstone Soap Co. or their respective owners and may not be copied for commercial use without permission.',
      },
      {
        title: 'Questions',
        body: `Questions about these terms can be sent to ${contactEmail}. If a policy page conflicts with a checkout notice, the more specific checkout notice applies to that order.`,
      },
    ],
  },
  shipping: {
    eyebrow: 'Shipping',
    title: 'Shipping',
    description:
      'Coldstone Soap Co. ships from ZIP code 63025 in Missouri, starting with clear domestic shipping expectations for customers in the United States.',
    sections: [
      {
        title: 'Where Orders Ship From',
        body: 'Orders ship from ZIP code 63025 in Missouri. The first shop version focuses on domestic United States shipping so rates, tracking, and support stay simple.',
      },
      {
        title: 'Carriers',
        body: 'Coldstone Soap Co. may use UPS or USPS depending on the package, destination, service availability, and checkout shipping option selected by the customer.',
      },
      {
        title: 'Processing Time',
        body: 'In-stock orders are typically packed within 2 to 4 business days. Weather, holidays, carrier volume, and handmade batch timing can affect shipping speed.',
      },
      {
        title: 'Tracking',
        body: 'When tracking is available, customers receive a tracking link through the checkout email flow. Tracking updates are controlled by the carrier after the package is accepted.',
      },
      {
        title: 'Address Issues',
        body: 'Customers are responsible for entering a complete shipping address during checkout. If a package is returned because of an address issue, Coldstone Soap Co. will help arrange the next step.',
      },
      {
        title: 'Damaged Packages',
        body: `If an order arrives damaged, keep the packaging and email ${contactEmail} with the order number and photos within 7 days of delivery.`,
      },
    ],
  },
  returns: {
    eyebrow: 'Returns',
    title: 'Returns',
    description:
      'A straightforward return and issue-resolution policy for handmade personal care products, damaged packages, and incorrect orders.',
    sections: [
      {
        title: 'Personal Care Products',
        body: 'Because soap is a personal care product, opened or used bars cannot be returned. Unopened and unused bars may be eligible for return when Coldstone Soap Co. is contacted within 14 days of delivery.',
      },
      {
        title: 'Damaged or Incorrect Orders',
        body: `If an order arrives damaged or incorrect, email ${contactEmail} with the order number, photos, and a short description within 7 days of delivery so the issue can be reviewed quickly.`,
      },
      {
        title: 'Return Shipping',
        body: 'Customers may be responsible for return shipping unless the issue was caused by an incorrect item, damaged shipment, or fulfillment error.',
      },
      {
        title: 'Refund Timing',
        body: 'Approved refunds are sent to the original payment method. Bank and card processing times can vary after the refund is issued through checkout.',
      },
      {
        title: 'Exchanges',
        body: 'Exchange availability depends on current inventory. If a replacement bar is not available, Coldstone Soap Co. may offer a refund or another practical resolution.',
      },
      {
        title: 'Questions',
        body: `Return questions can be sent to ${contactEmail}. Include the order number so support can look up the purchase quickly.`,
      },
    ],
  },
};

const faqItems = [
  {
    title: 'What is cold process soap?',
    body: 'Cold process soap is made when oils and lye go through saponification. Finished bars rest for weeks so they become harder, longer-lasting, and ready for daily washing.',
  },
  {
    title: 'Are the bars identical every time?',
    body: 'Handmade bars can vary slightly in appearance from batch to batch. Formula, process, ingredient standards, and labeling stay consistent.',
  },
  {
    title: 'Can I use these bars on sensitive skin?',
    body: 'Ingredient preferences are personal. Review the ingredient list, avoid known allergens, and do a small patch test before regular use if your skin is sensitive.',
  },
  {
    title: 'How do I make a bar last longer?',
    body: 'Keep the bar dry between uses. A draining soap dish helps the bar firm back up instead of sitting in water.',
  },
  {
    title: 'Where do orders ship from?',
    body: 'Orders ship from ZIP code 63025 in Missouri. Coldstone Soap Co. starts with domestic United States shipping through UPS or USPS.',
  },
  {
    title: 'What is the Soap Calculator?',
    body: 'The Soap Calculator is a free tool for planning cold process recipes, estimating lye and water, comparing oils, and exploring soap properties.',
  },
  {
    title: 'How are sales tax and shipping calculated?',
    body: 'Shipping and applicable sales tax are calculated during Stripe Checkout based on the order, shipping address, and configured shop rules.',
  },
  {
    title: 'How do returns work?',
    body: 'Opened or used bars cannot be returned. For unopened items, damaged packages, or incorrect orders, contact Coldstone Soap Co. with the order number and photos when applicable.',
  },
];

const trustHighlights = [
  {
    title: 'Secure Checkout',
    body: 'Payments run through Stripe-hosted Checkout, keeping card entry on a payment platform built for secure commerce.',
  },
  {
    title: 'Simple Domestic Shipping',
    body: 'Orders ship from Missouri with clear UPS or USPS options and tracking when available.',
  },
  {
    title: 'Ingredient-First Product Pages',
    body: 'Each bar lists its scent profile, ingredients, approximate weight, and care details before checkout.',
  },
  {
    title: 'Fast Issue Resolution',
    body: 'Damaged or incorrect orders can be reported with photos and an order number for a practical resolution.',
  },
];

const productTrustDetails = [
  {
    title: 'Small-Batch Process',
    body: 'Bars are made in small batches using cold process methods, then rested before they are listed for sale.',
  },
  {
    title: 'Handmade Variation',
    body: 'Color, swirl, top texture, and exact bar shape can vary slightly because every batch is finished by hand.',
  },
  {
    title: 'Care Tip',
    body: 'Use a draining soap dish and let the bar dry between uses for better longevity.',
  },
  {
    title: 'Clear Support Path',
    body: 'Shipping, return, privacy, and terms pages are linked near checkout so customers can review policies before buying.',
  },
];

const checkoutTrustLinks = [
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

exports.checkoutTrustLinks = checkoutTrustLinks;
exports.contactEmail = contactEmail;
exports.faqItems = faqItems;
exports.policyPages = policyPages;
exports.productTrustDetails = productTrustDetails;
exports.trustHighlights = trustHighlights;
