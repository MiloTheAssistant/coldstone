# Coldstone Brand Library

The source of truth for Coldstone Soap Co. brand imagery is:

```txt
public/brand/README.md
```

Use that file for the brand core, Balanced Trinity, anti-slop standard, quality rules, asset system, prompt framework, approval checklist, and current inventory.

The generated PNG assets and contact sheet also live under `public/brand/`.

Regenerate and validate the current library with:

```powershell
python scripts\generate-brand-library.py
```

Validate existing assets without regenerating them:

```powershell
python scripts\generate-brand-library.py --validate-only
```
