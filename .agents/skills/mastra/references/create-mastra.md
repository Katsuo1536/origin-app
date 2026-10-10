# Mastra プロジェクト作成リファレンス

新しい Mastra プロジェクトを作るための完全なガイドです。CLI ですぐに作る方法と、手動で詳しくインストールする方法の両方を載せています。

**公式ドキュメント：[mastra.ai/docs](https://mastra.ai/docs)**

## はじめに

次のように聞いてください：**「Mastra のプロジェクトをどの方法で作りますか？」**

1. **クイックセットアップ**：`npm create mastra@latest` をコピーして実行する
2. **ガイド付きセットアップ**：1ステップずつ案内し、コマンドはユーザーが承認する
3. **自動セットアップ**：API キーさえもらえれば、すべて作成する

> **AI エージェント向け：** CLI は対話形式です。下の「自動セットアップ／手動インストール」の手順で、**自動セットアップ** を使ってファイルを作成してください。

## 前提条件

- 対応しているモデルプロバイダー（OpenAI、Anthropic、Google など）の API キー

## クイックセットアップ（ユーザーが CLI を実行する）

1つのコマンドで新しい Mastra プロジェクトを作成します。

```bash
npm create mastra@latest
```

**他のパッケージマネージャーの場合：**

```bash
pnpm create mastra@latest
yarn create mastra@latest
bun create mastra@latest
```

## CLI のフラグ

**空のプロジェクトを作成する：**

```bash
npm create mastra@latest my-project --empty
```

`--empty` と `--template` は、別々の作成モードです。`--llm`（`-l`）と `--llm-api-key` のオプションは、デフォルトのスターターにだけ使えます。

**サンプルのエージェントを作らない：**

```bash
npm create mastra@latest --no-example
```

**特定のテンプレートを使う：**

```bash
npm create mastra@latest --template <template-name>
```

## 自動セットアップ／手動インストール

**自動セットアップ**（AI がすべてのファイルを作成する）の場合や、手動で細かく管理したい場合は、こちらを使ってください。

次の手順で、完全な Mastra プロジェクトを作成します。

### ステップ1：プロジェクトのディレクトリを作る

```bash
mkdir my-first-agent && cd my-first-agent
npm init -y
```

### ステップ2：依存パッケージをインストールする

```bash
npm install -D typescript @types/node mastra@latest
npm install @mastra/core@latest zod@^4
```

### ステップ3：package.json のスクリプトを設定する

`package.json` に次を追加します。

```json
{
  "scripts": {
    "dev": "mastra dev",
    "build": "mastra build"
  }
}
```

### ステップ4：TypeScript を設定する

`tsconfig.json` を作成します。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

**重要：** Mastra には `"module": "ES2022"` と `"moduleResolution": "bundler"` が必要です。CommonJS だとエラーになります。

### ステップ5：環境変数のファイルを作る

API キーを書いた `.env` を作成します。

```env
GOOGLE_GENERATIVE_AI_API_KEY=<your-api-key>
```

`OPENAI_API_KEY` や `ANTHROPIC_API_KEY` なども使えます。

### ステップ6：天気のツールを作る

`src/mastra/tools/weather-tool.ts` を作成します。

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("City name"),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  execute: async () => {
    return { output: "The weather is sunny" };
  },
});
```

### ステップ7：天気のエージェントを作る

`src/mastra/agents/weather-agent.ts` を作成します。

```typescript
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";

export const weatherAgent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: "google/gemini-2.5-pro",
  tools: { weatherTool },
});
```

（instructions の訳：あなたは正確な天気の情報を提供する、親切な天気アシスタントです。主な役割は、ユーザーが特定の場所の天気の詳細を知る手助けをすることです。回答するときは、場所の指定がなければ必ず場所を聞く／場所の名前が英語でなければ翻訳する／「New York, NY」のように複数の部分がある場所は、最も関係のある部分（例：「New York」）を使う／湿度、風の状況、降水量など関連する詳細を含める／回答は簡潔に、でも役に立つ内容にする。現在の天気のデータを取得するには weatherTool を使う。）

**メモ：** モデルの書き方は `"provider/model-name"` です。例：

- `"google/gemini-2.5-pro"`
- `"openai/gpt-5.4"`
- `"anthropic/claude-sonnet-4-5"`

### ステップ8：Mastra の入口ファイルを作る

`src/mastra/index.ts` を作成します。

```typescript
import { Mastra } from "@mastra/core";
import { weatherAgent } from "./agents/weather-agent";

export const mastra = new Mastra({
  agents: { weatherAgent },
});
```

### ステップ9：Mastra Studio を起動する

開発サーバーを起動します。

```bash
npm run dev
```

`http://localhost:4111` で Studio を開いて、エージェントをテストします。

## 次のステップ

`create mastra` でプロジェクトを作ったら：

- `src/mastra/agents/weather-agent.ts` の **サンプルのエージェントをカスタマイズする**
- **新しいエージェントを追加する** - [Agents のドキュメント](https://mastra.ai/docs/agents/overview) を参照
- **ワークフローを作る** - [Workflows のドキュメント](https://mastra.ai/docs/workflows/overview) を参照
- エージェントの機能を広げるために **ツールを追加する**
- **自分のアプリに組み込む** - [mastra.ai/docs](https://mastra.ai/docs) のフレームワーク別ガイドを参照

## トラブルシューティング

| 問題 | 解決方法 |
| --- | --- |
| API キーが見つからない | `.env` ファイルに正しいキーが書かれているか確認する |
| Studio が起動しない | ポート 4111 が空いているか確認する |
| CommonJS のエラー | `tsconfig.json` で `"module": "ES2022"` と `"moduleResolution": "bundler"` を使っているか確認する |
| コマンドが見つからない | Node.js 20 以上を使っているか確認する |

## リソース

- [ドキュメント](https://mastra.ai/docs)
- [インストール](https://mastra.ai/docs/getting-started/installation)
- [Agents](https://mastra.ai/docs/agents/overview)
- [Workflows](https://mastra.ai/docs/workflows/overview)
- [GitHub](https://github.com/mastra-ai/mastra)