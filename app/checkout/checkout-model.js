const MAX_CHECKOUT_QUANTITY = 99;

function normalizeQuantity(quantity) {
  const parsed = Number(quantity);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(MAX_CHECKOUT_QUANTITY, Math.floor(parsed)));
}

function getRequiredStripePriceEnvVars(catalog) {
  return catalog
    .map((product) => product.stripePriceEnvVar)
    .filter((envVar) => typeof envVar === 'string' && envVar.length > 0);
}

function validateCheckoutCart(cartItems, catalog, env) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { ok: false, status: 400, error: 'Your cart is empty.' };
  }

  const validatedItems = [];

  for (const item of cartItems) {
    const productId = typeof item?.productId === 'string' ? item.productId : '';
    const quantity = normalizeQuantity(item?.quantity);
    const product = catalog.find((candidate) => candidate.id === productId);

    if (!product || quantity <= 0) {
      return { ok: false, status: 400, error: 'Your cart contains an invalid item.' };
    }

    if (product.inventoryStatus !== 'in-stock') {
      return { ok: false, status: 409, error: `${product.name} is currently out of stock.` };
    }

    const stripePriceEnvVar = product.stripePriceEnvVar;
    const stripePriceId = stripePriceEnvVar ? env[stripePriceEnvVar] : undefined;

    if (!stripePriceId) {
      return {
        ok: false,
        status: 503,
        error: `${product.name} is not configured for checkout yet.`,
      };
    }

    validatedItems.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      quantity,
      stripePriceId,
    });
  }

  return { ok: true, items: validatedItems };
}

function buildCheckoutLineItems(items) {
  return items.map((item) => ({
    price: item.stripePriceId,
    quantity: item.quantity,
  }));
}

function isAutomaticTaxEnabled(env) {
  return env.STRIPE_AUTOMATIC_TAX_ENABLED === 'true';
}

module.exports = {
  buildCheckoutLineItems,
  getRequiredStripePriceEnvVars,
  isAutomaticTaxEnabled,
  validateCheckoutCart,
};
