# Local Dev Port Map

This is the global local development port policy for projects under `D:\Dev`.

Agents and scripts should use the ports assigned to the project repo being worked. Do not stop, kill, refresh, or reset ports assigned to another project unless the user explicitly asks for that project too.

Use the first port as the normal dev server. Use the second port as the alternate server. Use the remaining ports for preview, debug, test, or short-lived parallel sessions.

| Project | Primary dev | Alternate dev | Preview | Debug | Spare |
| --- | ---: | ---: | ---: | ---: | ---: |
| StLouisCreations-Website | 3000 | 3001 | 3002 | 3003 | 3004 |
| AcademAI-Website | 3005 | 3006 | 3007 | 3008 | 3009 |
| ColdStoneSoap-Website | 3010 | 3011 | 3012 | 3013 | 3014 |
| STL-Musicians-Website | 3015 | 3016 | 3017 | 3018 | 3019 |
| DigitalEnergyMedia-Website | 3020 | 3021 | 3022 | 3023 | 3024 |
| DigitalEnergyHoldings-Website | 3025 | 3026 | 3027 | 3028 | 3029 |

## Operating Rules

- Prefer the primary dev port for normal local work.
- Use the alternate dev port when the primary port is already in use or a second server is needed.
- Use preview, debug, and spare ports only for the same project repo's parallel workflows.
- Before killing a port, verify the owning process and confirm the port is in the active repo's assigned range.
- When changing projects, leave unrelated project ports alone unless the user asks for a wider cleanup.
- If a framework auto-selects a port outside the assigned range, restart it with an explicit port inside the assigned range.

## Fresh Start Procedure

For a fresh local dev start:

1. Identify the active project repo.
2. Check only that project's assigned port range.
3. Stop only processes bound to that project's assigned ports.
4. Restart the dev server on the project's primary dev port.
5. Use the alternate port only when running a parallel server, preview, debug session, or when the primary port is intentionally occupied.

## Project Commands

Use the repo's normal package manager and pass the assigned port explicitly when possible.

Examples:

```powershell
npm.cmd run dev -- -p 3000
pnpm.cmd dev --port 3000
yarn.cmd dev --port 3000
```

For Next.js projects, prefer:

```powershell
npm.cmd run dev -- -p <assigned-port>
```

## Migration

`docs/local-dev-port-map.md` is the canonical filename. Older `docs/local-port-map.md` files should either be replaced with this content or reduced to a pointer to this file.
