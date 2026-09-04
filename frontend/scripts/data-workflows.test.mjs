import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('resume pagination requests only the selected database page', async () => {
  const source = await read('src/pages/Resumes/List.tsx');

  assert.match(source, /skip:\s*\(currentPage - 1\) \* pageSize/);
  assert.match(source, /limit:\s*pageSize/);
  assert.match(source, /page:\s*currentPage/);
  assert.match(source, /pageSize/);
  assert.doesNotMatch(source, /skip:\s*0,\s*\r?\n\s*limit:\s*500/);
  assert.doesNotMatch(source, /allItems\.slice/);
});

test('data-first navigation keeps paused workflows out of the active product', async () => {
  const [router, layout, knowledgeAssets, login] = await Promise.all([
    read('src/router/index.tsx'),
    read('src/components/Layout/index.tsx'),
    read('src/pages/KnowledgeAssets/index.tsx'),
    read('src/pages/Login/index.tsx'),
  ]);

  const pausedPaths = [
    'dashboard',
    'workbench',
    'customer-projects',
    'customer-projects/:id',
    'knowledge-assets/intake',
    'ai-employees',
    'ai-solution-assistant',
    'ai-product-manager',
    'industry-agent',
  ];

  for (const path of pausedPaths) {
    const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(
      router,
      new RegExp(`path:\\s*'${escapedPath}',[\\s\\S]{0,180}?<Navigate to="/knowledge-assets" replace \\/>`),
      `${path} must redirect to the knowledge asset library`,
    );
  }

  assert.match(router, /index:\s*true,[\s\S]{0,120}?<Navigate to="\/knowledge-assets" replace \/>/);
  assert.doesNotMatch(layout, /key:\s*'\/(?:dashboard|customer-projects|ai-solution-assistant)'/);
  assert.doesNotMatch(knowledgeAssets, /navigate\('\/knowledge-assets\/intake'\)/);
  assert.doesNotMatch(knowledgeAssets, /navigate\(`\/workbench/);
  assert.doesNotMatch(knowledgeAssets, /调起 AI 助手/);
  assert.doesNotMatch(login, /navigate\('\/dashboard'/);
});

test('route failures preserve the production error boundary', async () => {
  const source = await read('src/router/index.tsx');

  assert.match(source, /isRouteErrorResponse/);
  assert.match(source, /useRouteError/);
  assert.match(source, /页面资源加载失败/);
  assert.match(source, /window\.location\.assign\('\/knowledge-assets'\)/);
});

test('server errors use the caller fallback instead of the raw axios message', async () => {
  const source = await read('src/utils/request.ts');

  assert.match(source, /error\?\.response\?\.status/);
  assert.match(source, /status\s*>=\s*500/);
  assert.match(source, /return fallback/);
});

test('knowledge asset joins use the shared timeout and surface failed requests', async () => {
  const source = await read('src/store/useKnowledgeAssetsStore.ts');

  assert.doesNotMatch(source, /request\.get\('\/resumes\/project-library',[\s\S]{0,80}?timeout:\s*20000/);
  assert.doesNotMatch(source, /request\.get\('\/resumes\/experience-summary',[\s\S]{0,120}?timeout:\s*30000/);
  assert.doesNotMatch(source, /request\.get\('\/resumes\/project-library'[\s\S]{0,140}?\.catch\(\(\) => \(\{\}\)\)/);
  assert.doesNotMatch(source, /request\.get\('\/resumes\/experience-summary'[\s\S]{0,180}?\.catch\(\(\) => \(\{\}\)\)/);
});
