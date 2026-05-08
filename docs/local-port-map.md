# Local Port Map

Use the first port as the normal dev port and the second port as the alternate, preview, or debug port.

| Project | Normal dev port | Alternate port |
| --- | ---: | ---: |
| St. Louis Creations | 3000 | 3001 |
| AcademAI-Website | 3002 | 3003 |
| ColdstoneSoap-Website | 3004 | 3005 |
| STL-Musicians-Website | 3006 | 3007 |
| DigitalEnergyMedia-Website | 3008 | 3009 |
| DigitalEnergyHoldings-Website | 3010 | 3011 |

## ColdstoneSoap-Website

Normal local dev:

```powershell
npm.cmd run dev -- -p 3004
```

Alternate, preview, or debug server:

```powershell
npm.cmd run dev -- -p 3005
```
