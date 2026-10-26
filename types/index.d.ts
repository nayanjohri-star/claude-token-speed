// The latest model request of the main thread, as the footer shows it.
export type SpeedStats = {
  speed: number | null // output tokens per second, from the first piece
  exact: boolean // false while the speed is still estimated from the text
  hit: number | null // share of the input served by the prompt cache, 0 to 1
}

declare module 'claude-code' {
  interface PluginState {
    'token-speed': { stats: SpeedStats | null; isHidden: boolean }
  }
}
