/**
 * The reasoning step: given a broken selector and the live DOM candidates, ask
 * Claude for the single best replacement locator.
 *
 * A code-controlled workflow (not open-ended tool use): the loop lives in
 * heal.ts; Claude is asked one well-scoped question and returns structured JSON.
 */
import Anthropic from '@anthropic-ai/sdk';
import { config } from './config';
import type { DomCandidate } from './tools';

export interface SelectorFix {
  newSelector: string;
  confidence: number; // 0..1
  rationale: string;
}

const SYSTEM = `You repair broken Playwright selectors for a web app's test suite.
You are given a selector registry key, the selector that no longer resolves, and a
list of stable locator candidates read from the live DOM. Choose the ONE candidate
that most likely refers to the same element the broken selector targeted, preferring
in order: a data-testid, a stable #id, then role=…[name="…"]. Never invent a selector
that is not derivable from the candidates. Respond with ONLY a JSON object:
{"newSelector": string, "confidence": number between 0 and 1, "rationale": string}.`;

export async function proposeSelectorFix(input: {
  key: string;
  oldSelector: string;
  errorExcerpt: string;
  candidates: DomCandidate[];
}): Promise<SelectorFix> {
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const user = [
    `Registry key: ${input.key}`,
    `Broken selector: ${input.oldSelector}`,
    `Test error excerpt:\n${input.errorExcerpt.slice(0, 800)}`,
    `Candidate locators (JSON):`,
    JSON.stringify(input.candidates.slice(0, 60), null, 2),
  ].join('\n\n');

  const res = await client.messages.create({
    // Opus 5 runs adaptive thinking by default when `thinking` is omitted, so we
    // don't set it here (the pinned SDK's types predate the "adaptive" literal).
    model: config.model,
    max_tokens: 1024,
    system: SYSTEM,
    messages: [{ role: 'user', content: user }],
  });

  const text = res.content
    .map((b) => (b.type === 'text' ? b.text : ''))
    .join('')
    .trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error(`no JSON in model response: ${text.slice(0, 200)}`);
  const parsed = JSON.parse(text.slice(start, end + 1)) as SelectorFix;
  if (typeof parsed.newSelector !== 'string' || typeof parsed.confidence !== 'number') {
    throw new Error('model response missing required fields');
  }
  return parsed;
}
