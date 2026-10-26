import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { SpeedStats } from '../types'

const statsAtom = atom({ plugin: 'token-speed', key: 'stats' } as const, null)
const isHidden = atom({ plugin: 'token-speed', key: 'isHidden' } as const, false)

// How often a streaming response redraws the label.
const REDRAW_MS = 250

// A live estimate until the response reports its count: CJK text runs near a
// token per character, other text near four characters per token.
function estimateTokens(text: string): number {
  let wide = 0
  for (const ch of text) {
    if ((ch.codePointAt(0) ?? 0) > 0x2e7f) {
      wide += 1
    }
  }
  return wide + (text.length - wide) / 4
}

// Tokens per second over the time the response was generating, from its first
// piece; a response over in a moment has no meaningful rate.
const rate = (tokens: number, ms: number) => (ms >= 300 ? (tokens * 1000) / ms : null)

function label(stats: SpeedStats | null): string | undefined {
  if (stats === null) {
    return undefined
  }
  const parts: string[] = []
  if (stats.speed !== null) {
    parts.push(`⚡${stats.exact ? '' : '≈'}${stats.speed.toFixed(1)} tok/s`)
  }
  if (stats.hit !== null) {
    parts.push(`☀${Math.round(stats.hit * 100)}%`)
  }
  // Em spaces: the footer collapses ordinary ones, and the two figures read
  // apart from each other and from the model beside them.
  return parts.length > 0 ? parts.join('  ') + ' ' : undefined
}

// Keeps the stats and pins the label as this plugin's status line: the CLI
// draws it under the prompt, the desktop in the prompt footer beside the model.
async function publish($: EngineInterface, stats: SpeedStats | null): Promise<void> {
  await update($, statsAtom, () => stats)
  $.ui.status((await read($, isHidden)) ? undefined : label(stats))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'speed', description: 'Show or hide ⚡ output speed and ☀ cache hit rate / 显示或隐藏 ⚡ 速度和 ☀ 缓存命中' })
    await publish($, await read($, statsAtom))
    return next(e)
  })

  on('command.run', { command: 'speed' }, async $ => {
    const hidden = await update($, isHidden, was => !was)
    await publish($, await read($, statsAtom))
    return { text: hidden ? '⚡ ☀ hidden; /speed shows them again. 已隐藏，再输入 /speed 显示。' : '⚡ ☀ shown. 已显示。' }
  })

  // Subagents stream past: the label follows the main thread.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId) {
      return yield* next(e)
    }
    // The cache figure is the last finished request's until this one reports.
    const hit = (await read($, statsAtom))?.hit ?? null
    let firstAt = 0
    let estTokens = 0
    let drawnAt = 0
    for await (const c of next(e)) {
      yield c
      if (c.kind === 'text' || c.kind === 'thinking' || c.kind === 'input') {
        const now = await $.clock.now()
        firstAt = firstAt || now
        estTokens += estimateTokens(c.kind === 'input' ? c.json : c.text)
        if (now - drawnAt >= REDRAW_MS) {
          drawnAt = now
          await publish($, { speed: rate(estTokens, now - firstAt), exact: false, hit })
        }
      } else if (c.kind === 'stop' && c.usage) {
        const now = await $.clock.now()
        const u = c.usage
        const input = u.input_tokens + u.cache_read_input_tokens + u.cache_creation_input_tokens
        await publish($, {
          speed: firstAt ? rate(u.output_tokens, now - firstAt) : null,
          exact: true,
          hit: input > 0 ? u.cache_read_input_tokens / input : hit,
        })
      }
    }
  })
}
