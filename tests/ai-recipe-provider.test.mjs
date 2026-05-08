import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
const routeSource = readFileSync(new URL('../app/api/generate-recipe/route.ts', import.meta.url), 'utf8');
const generatorSource = readFileSync(
  new URL('../app/soap-calculator/components/AIRecipeGenerator.tsx', import.meta.url),
  'utf8',
);

test('AI recipe generator supports NVIDIA NIM through OpenAI-compatible chat completions', () => {
  assert.match(packageJson.dependencies.openai || '', /^\^/);
  assert.equal(packageJson.dependencies['@anthropic-ai/sdk'], undefined);

  assert.match(envExample, /AI_PROVIDER=nvidia/);
  assert.match(envExample, /NVIDIA_API_KEY=/);
  assert.match(envExample, /NVIDIA_NIM_BASE_URL=https:\/\/integrate\.api\.nvidia\.com\/v1/);
  assert.match(envExample, /NVIDIA_NIM_MODEL=minimaxai\/minimax-m2\.7/);
  assert.match(envExample, /OPENAI_API_KEY=/);
  assert.doesNotMatch(envExample, /ANTHROPIC_API_KEY/);

  assert.match(routeSource, /import OpenAI from 'openai'/);
  assert.match(routeSource, /AI_PROVIDER/);
  assert.match(routeSource, /process\.env\.NVIDIA_API_KEY/);
  assert.match(routeSource, /process\.env\.NVIDIA_NIM_BASE_URL/);
  assert.match(routeSource, /process\.env\.NVIDIA_NIM_MODEL/);
  assert.match(routeSource, /baseURL/);
  assert.match(routeSource, /chat\.completions\.create/);
  assert.match(routeSource, /json_schema/);
  assert.match(routeSource, /process\.env\.OPENAI_API_KEY/);
  assert.match(routeSource, /responses\.create/);
  assert.match(routeSource, /OPENAI_MODEL = 'gpt-5\.5'/);
  assert.match(routeSource, /type:\s*'json_schema'/);
  assert.doesNotMatch(routeSource, /Anthropic|ANTHROPIC|Claude|claude-sonnet/);

  assert.match(generatorSource, /Powered by NVIDIA NIM/);
  assert.doesNotMatch(generatorSource, /Powered by Claude/);
});
