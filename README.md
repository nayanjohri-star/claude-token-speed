# token-speed

A Claude Code plugin that shows, under the prompt, how fast the model is writing and how much of the prompt came from the cache:

```
⚡62.4 tok/s    ☀99%
```

- **⚡ output speed**: output tokens per second, timed from the first token of the response. While a response streams it is estimated from the text and marked `≈`, refreshed about four times a second; when the response ends it switches to the exact count the API reports.
- **☀ cache hit rate**: the share of the request's input served by the prompt cache, `cache_read / (input + cache_read + cache_write)`, from the last finished request.

Only the main conversation is measured; subagents are left out. Type `/speed` to hide or show the figures.

It runs in the Claude Code CLI and in the Claude Desktop app's Code tab. It needs a Claude Code version with plugin function hooks (2.1.308 or newer; the hooks API is in early access).

## Install

At the prompt of a terminal session:

```
/plugin install token-speed --marketplace nayanjohri-star/claude-token-speed
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session).

From a shell:

```
claude plugin install token-speed --marketplace nayanjohri-star/claude-token-speed
```

In the Claude Desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `nayanjohri-star/claude-token-speed`, then **Add plugin**. A plugin installed from a terminal at the user scope also loads in the Desktop app.

## Notes

- The live estimate counts CJK characters as about one token each and other text as about four characters per token, so it can be off while streaming; the figure after the response ends is exact.
- A response shorter than 0.3 s shows no speed.
- The host shows the plugin's name (`token-speed`) before the figures.

---

# token-speed（中文说明）

在输入框下方显示模型的实时输出速度和缓存命中率的 Claude Code 插件：

```
⚡62.4 tok/s    ☀99%
```

- **⚡ 输出速度**：每秒输出多少 token，从回答的第一个 token 开始计时。生成过程中按已输出的文字估算，前面带 `≈`，每秒刷新约 4 次；回答结束后换成接口报告的准确值。
- **☀ 缓存命中率**：请求的输入里由提示缓存提供的比例，即 `缓存读取 / (未缓存输入 + 缓存读取 + 缓存写入)`，取最近一次已结束的请求。

只统计主对话，子代理的请求不算在内。输入 `/speed` 可以隐藏或重新显示。

支持 Claude Code 命令行和 Claude Desktop 的 Code 标签页，需要支持插件函数钩子的 Claude Code（2.1.308 或更新，钩子接口仍在早期测试阶段）。

## 安装

在终端会话的输入框里：

```
/plugin install token-speed --marketplace nayanjohri-star/claude-token-speed
```

提示添加插件市场时输入 `y`，再选安装范围（选用户范围则所有会话都会加载）。

在命令行里：

```
claude plugin install token-speed --marketplace nayanjohri-star/claude-token-speed
```

在 Claude Desktop 里（不能用 `/plugin`）：点输入框旁的 **+**，选 **Plugins**，**Add marketplace** 填 `nayanjohri-star/claude-token-speed`，再 **Add plugin**。在终端按用户范围装好的插件，桌面版也会加载。

## 说明

- 生成过程中的估算按中日韩文字约 1 字 1 个 token、其他文字约 4 个字符 1 个 token 计算，可能有偏差；回答结束后的数字是准确值。
- 不足 0.3 秒的回答不显示速度。
- 数字前面会显示插件名 `token-speed`，这是宿主程序加的。

## License

MIT
