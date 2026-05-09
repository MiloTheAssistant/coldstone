function normalizeQuantity(quantity) {
  const parsed = Number(quantity);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(0, Math.min(99, Math.floor(parsed)));
}

function addCartItem(items, product, quantity = 1) {
  const safeQuantity = normalizeQuantity(quantity);
  if (safeQuantity <= 0) return [...items];

  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: normalizeQuantity(item.quantity + safeQuantity) }
        : item
    );
  }

  return [
    ...items,
    {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: product.priceCents,
      image: product.image,
      quantity: safeQuantity,
    },
  ];
}

function updateCartQuantity(items, productId, quantity) {
  const safeQuantity = normalizeQuantity(quantity);
  if (safeQuantity <= 0) return removeCartItem(items, productId);

  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: safeQuantity } : item
  );
}

function removeCartItem(items, productId) {
  return items.filter((item) => item.productId !== productId);
}

function clearCart() {
  return [];
}

function getCartSummary(items) {
  return items.reduce(
    (summary, item) => ({
      itemCount: summary.itemCount + item.quantity,
      subtotalCents: summary.subtotalCents + item.priceCents * item.quantity,
    }),
    { itemCount: 0, subtotalCents: 0 }
  );
}

module.exports = {
  addCartItem,
  clearCart,
  getCartSummary,
  removeCartItem,
  updateCartQuantity,
};
