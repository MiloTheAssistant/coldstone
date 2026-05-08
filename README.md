# ColdstoneSoap-Website

Coldstone Soap Co. website and soap calculator.

## Local Development

This repo uses the shared local project port map in [docs/local-port-map.md](docs/local-port-map.md).

ColdstoneSoap-Website ports:

| Purpose | Port | Command |
| --- | ---: | --- |
| Normal dev | 3004 | `npm.cmd run dev -- -p 3004` |
| Alternate / preview / debug | 3005 | `npm.cmd run dev -- -p 3005` |

## AI Recipe Generator

The AI Recipe Generator uses NVIDIA NIM by default.

Add these values to `.env.local` and to the production environment before using it:

```env
AI_PROVIDER=nvidia
NVIDIA_API_KEY=nvapi_replace_me
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=minimaxai/minimax-m2.7
```

Set `AI_PROVIDER=openai` and add `OPENAI_API_KEY` only if you want to use OpenAI
as a fallback provider.
