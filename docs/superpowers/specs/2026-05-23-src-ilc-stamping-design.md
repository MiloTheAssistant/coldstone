# Soap Recipe Code and Ingredient List Code Stamping Design

## Goal

Build a Soap Abacus production publishing layer where paid subscribers can stamp saved recipes into permanent Soap Recipe Codes (SRCs), generate Ingredient List Codes (ILCs), and share QR-backed recipe releases for production, sales, Etsy digital assets, and partner/vendor workflows.

## Product Rules

Free users can save recipes. Plus and Pro users can save recipes and use the `Stamp It` workflow.

`Save` remains the editable recipe workflow. It stores the current recipe in the user's local Recipe Cache and, when configured and authenticated, syncs it into the recipe vault.

`Stamp It` is a production release workflow. It requires a saved vault recipe, generates a permanent SRC, generates an ILC for the frozen ingredient list, and creates a QR-friendly lookup URL.

SRC codes are permanent identifiers. A stamped SRC should remain usable indefinitely unless an administrative safety action revokes it.

Stamped revisions are immutable. Each stamped release stores a frozen recipe snapshot and frozen ingredient-list snapshot.

Plus users can stamp new SRCs. If a Plus user changes a recipe after stamping, the changed recipe must be stamped as a new SRC.

Pro users can re-open an existing SRC for edit. Re-opening creates an editable draft from the latest active SRC revision. When publishing the change, Pro users can either update the same SRC with a new immutable revision or stamp a new SRC.

## Subscriber Warning Copy

The `Stamp It` action should be framed as production publishing, not casual saving.

Recommended inline note near the button:

> Stamp SRC only when this recipe is ready for production or sale. Stamping freezes this recipe version and generates a permanent SRC, ILC, and QR code. Future recipe edits will not change this stamped release.

Recommended first-stamp confirmation:

> You are about to freeze this recipe version as a production release. Soap Abacus will generate a permanent Soap Recipe Code, Ingredient List Code, and QR code. This stamped version cannot be changed. To revise it later, create a new recipe version and stamp a new SRC.

Recommended Pro same-SRC revision confirmation:

> Updating this SRC changes the active production recipe shown when this code is recalled or scanned. Previous revisions remain archived for traceability. Use "Stamp New SRC" instead if this is a new product or meaningfully different formula.

## Code Formats

SRC format:

```text
xxxx-xxxx-xxxx-xxxx-xxxx
```

SRC characters can use uppercase A-Z, lowercase a-z, and digits 0-9. No special characters are needed beyond hyphen separators.

ILC format:

```text
ILC-xxx-xxx-xxx-xxx
```

ILC characters can use uppercase A-Z, lowercase a-z, and digits 0-9 after the `ILC-` prefix.

Codes must be generated server-side and enforced with database unique constraints. The server should retry generation on collision.

## Lookup Behavior

Soap Abacus should include an `Enter SRC` lookup surface. When a user enters an SRC, Soap Abacus loads the latest active revision for that SRC as a read-only production release.

SRC lookup should be public read-only by default. This supports QR codes, Etsy digital recipe assets, partner vendor use, and customer-facing sharing without requiring every recipient to create an account.

The public SRC release view should show:

- Recipe name and production metadata.
- SRC code.
- Current revision number.
- Latest public release note, when present.
- Formula percentages and ingredient weights.
- Ingredient List Code.
- QR/share URL.
- Shopping-list and affiliate actions when available.

The public page should not expose owner-only data such as supplier cost, private notes, internal margin targets, or full historical revision notes unless a Pro owner explicitly publishes that history later.

Logged-in recipe owners should see owner controls on their own SRCs:

- `Clone to My Recipes`.
- `Re-open SRC for Edit` for Pro users.
- `Stamp New SRC`.
- `Update Same SRC` for Pro users after editing a re-opened SRC draft.

## Revision Notes

Pro users publishing a new revision to the same SRC should be prompted for optional revision notes.

Suggested helper text:

```text
Example: Changed olive oil from 35% to 33%, reduced fragrance load, adjusted water ratio.
```

Revision notes are optional but strongly encouraged.

The latest revision note should be public on the SRC lookup page as `Release Notes`. Full revision history should remain owner-only in the first version.

Each SRC revision should store:

- SRC code.
- Revision number.
- Frozen recipe snapshot.
- Frozen ILC snapshot.
- Revision notes.
- Published timestamp.
- Publisher user ID.
- Whether the revision is active.

## ILC and Shopping List Behavior

Every SRC revision generates or references an ILC for that revision's frozen ingredient list.

The ILC should represent the purchase-oriented ingredient list, not the editable recipe draft. It should include enough data to build a shopping list:

- Ingredient type.
- Ingredient ID.
- Display name.
- Formula percent when applicable.
- Recipe weight and unit.
- Purchase quantity recommendation when available.
- Vendor mapping metadata when available.
- Affiliate URL or partner item ID when available.

The first version can store ILC records without a full vendor integration. Partner integrations can later consume the ILC to build shopping carts or shopping lists on external vendor sites.

## Data Model

Add database tables rather than overloading `share_links`.

Recommended tables:

- `recipe_publications`: one row per SRC, owner, source recipe, and current active revision.
- `recipe_publication_revisions`: immutable frozen revisions under an SRC.
- `ingredient_list_codes`: one row per ILC, tied to a publication revision.
- `partner_export_events`: optional future table for recording partner/vendor sync attempts.

`recipes` remains the editable vault model. `recipe_versions` remains the saved recipe version history. `recipe_publications` becomes the production release model.

## Membership Gates

Add a membership feature key for SRC publishing.

Recommended feature split:

- Free: save only.
- Plus: save and stamp new SRCs.
- Pro: save, stamp new SRCs, re-open SRCs for edit, and update the same SRC with new revisions.

Quota and scale can be layered after the core feature:

- Plus: limited monthly SRC stamps.
- Pro: higher or unlimited SRC stamps plus future partner/export operations.

## QR Code Behavior

The QR code should encode the public Soap Abacus SRC lookup URL, not the entire recipe payload.

Recommended URL shape:

```text
https://www.soapabacus.com/src/xxxx-xxxx-xxxx-xxxx-xxxx
```

This keeps QR codes short, lets Soap Abacus show the latest active revision for Pro-managed SRCs, and allows revoked or superseded states to be handled server-side.

## Error Handling

If a user clicks `Stamp It` without a saved vault recipe, Soap Abacus should first save/sync the recipe, then continue stamping if the save succeeds.

If the user is Free, the UI should show a paid upgrade message and the API should return `402`.

If a Plus user attempts to update an existing SRC, the API should return `402` with a Pro upgrade message.

If an SRC is not found, the public lookup page should show a clear not-found state.

If an SRC exists but is administratively revoked, the lookup page should show that the SRC is unavailable.

If code generation collides with an existing code, the server should retry before failing.

## Testing Strategy

Model tests should cover SRC and ILC code generation, code format validation, immutable revision creation, Pro same-SRC revision behavior, Plus restriction behavior, and public/private revision note visibility.

API tests or route-source tests should verify membership gates:

- Free cannot stamp.
- Plus can stamp new SRCs.
- Plus cannot update the same SRC.
- Pro can update the same SRC with a new revision.

Database behavior should be verified against the schema:

- SRC codes are unique.
- ILC codes are unique.
- Publication revisions are append-only.
- Current active revision points to the newest same-SRC revision after a Pro update.

UI verification should cover:

- Free shows only `Save`.
- Plus and Pro show `Save` and `Stamp It`.
- Stamp warnings appear before production publishing.
- SRC lookup opens a read-only release.
- Pro owner controls appear for owned SRCs.

## Open Follow-Up Decisions

The implementation plan should use 10 SRC stamps per month for Plus and unlimited SRC stamps for Pro unless the product owner changes the quota before implementation starts.

Partner vendor exports should be designed as a later phase after the SRC/ILC data model and public lookup behavior are stable.
