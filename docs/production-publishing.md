# Production Publishing

## Source Of Truth

Production publishes from the `main` branch of `MiloTheAssistant/coldstone`.

Vercel project:

- Team: `project-milo`
- Project: `coldstone`
- Production branch: `main`
- Public Soap Abacus domain: `https://www.soapabacus.com/`
- Public Coldstone domain: `https://www.coldstonesoap.com/`

## Normal Release Flow

1. Create a feature branch.
2. Open a pull request into `main`.
3. Wait for CI and Vercel checks to pass.
4. Merge into `main`.
5. Let Vercel create the production deployment from `main`.
6. Verify the public aliases after deployment.

Do not use `vercel deploy --prod` from a feature branch for normal releases.
Reserve direct production deploys for emergency recovery only.

## Required Local Checks

Run these before opening or merging a production change:

```powershell
npm test
npm run lint
npm run build
```

## Live Smoke Checks

After Vercel publishes from `main`, verify:

```powershell
curl.exe -I https://www.soapabacus.com/
curl.exe -I https://www.soapabacus.com/soap-calculator
curl.exe -I https://www.coldstonesoap.com/soap-calculator
curl.exe -I https://www.coldstonesoap.com/
```

Expected routing:

- `https://www.soapabacus.com/` returns `200` and serves Soap Abacus Studio.
- `https://www.soapabacus.com/soap-calculator` redirects to `/`.
- `https://www.coldstonesoap.com/soap-calculator` redirects to `https://www.soapabacus.com/`.
- `https://www.coldstonesoap.com/` returns `200` and serves the Coldstone storefront.

## GitHub Branch Protection

Recommended `main` protection settings:

- Require pull request before merging.
- Require status checks before merging.
- Require the `CI / Test, lint, and build` check.
- Require the Vercel deployment check.
- Require branch to be up to date before merging.
- Block force pushes.

## Signed-In Billing QA

Before considering the Soap Abacus membership launch fully verified, test:

- Clerk sign-up and sign-in.
- Free account unlocks editing without Stripe.
- Plus monthly and annual Checkout Sessions.
- Pro monthly and annual Checkout Sessions.
- Pro 7-day trial.
- Stripe customer portal.
- Stripe webhook membership sync.
- Feature unlocks for Plus and Pro.
