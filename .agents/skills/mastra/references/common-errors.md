# よくあるエラーとトラブルシューティング

Mastra でよく出るエラーと、その解決方法をまとめた総合ガイドです。

## まず試すこと

多くの場合、最初に Mastra Studio で動きを確認すると、エラーの調査がずっと楽になります。Studio では、エージェントやワークフローを対話的にテストし、ログを確認し、エラーメッセージをリアルタイムで見られます。

```bash
npm run dev
```

ブラウザで `http://localhost:4111` を開くと、Mastra Studio が使えます。

## ビルドと設定のエラー

### 「Cannot find module」や import のエラー

**症状**：

```bash
Error: Cannot find module '@mastra/core'
SyntaxError: Cannot use import statement outside a module
```

**原因**：

- `tsconfig.json` が CommonJS の設定になっている
- `package.json` に `"type": "module"` がない
- モジュールの解決方法が正しくない

**解決方法**：

1. `tsconfig.json` を更新する：

   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ES2022",
       "moduleResolution": "bundler"
     }
   }
   ```

2. `package.json` に追加する：

   ```json
   {
     "type": "module"
   }
   ```

3. ローカルファイルの import に `.js` の拡張子が付いているか確認する（バンドラーが必要とする場合）

### 「Property X does not exist on type Y」

**症状**：

```bash
Property 'tools' does not exist on type 'Agent'
Property 'memory' does not exist on type 'AgentConfig'
```

**原因**：

- 古い API の使い方をしている（Mastra は活発に開発されている）
- import や型が正しくない
- ドキュメントとインストール済みのパッケージのバージョンが合っていない

**解決方法**：

1. 同梱のドキュメント（`embedded-docs.md` を参照）で、現在の API を確認する
2. `node_modules/@mastra/core/dist/docs/assets/SOURCE_MAP.json` で、現在のエクスポートを確認する
3. パッケージのバージョンを確認する：`npm list @mastra/core`
4. 依存パッケージを更新する：`npm update @mastra/core`

## エージェントのエラー

### エージェントが割り当てたツールを使わない

**症状**：

- エージェントが「そのツールにはアクセスできません」と答える
- 関係のある場面なのに、ツールが一度も呼ばれない

**原因**：

- ツールが Mastra 本体に登録されていない
- ツールが Agent のコンストラクタに渡されていない
- ツールの ID が一致していない

**解決方法**：

**正しい書き方**：

```typescript
// 1. ツールを作る
const weatherTool = createTool({
  id: "get-weather",
  // ... ツールの設定
});

// 2. Mastra 本体に登録する
const mastra = new Mastra({
  tools: {
    weatherTool, // または 'weatherTool': weatherTool
  },
});

// 3. エージェントに割り当てる
const agent = new Agent({
  id: "weather-agent",
  tools: { weatherTool }, // ツールを参照する
  // ... その他の設定
});
```

**別の書き方（直接割り当てる）**：

```typescript
const agent = new Agent({
  id: "weather-agent",
  tools: {
    weatherTool: createTool({ id: "get-weather" /* ... */ }),
  },
});
```

### エージェントのメモリが保存されない

**症状**：

- エージェントが前のメッセージを覚えていない
- 呼び出しのたびに会話の履歴が消える

**原因**：

- ストレージ（保存先）が設定されていない
- `threadId` がない、または毎回違う
- メモリがエージェントに割り当てられていない

**解決方法**：

```typescript
// 1. ストレージを設定する
const storage = new PostgresStore({
  connectionString: process.env.DATABASE_URL,
});

// 2. ストレージを指定してメモリを作る
const memory = new Memory({
  id: "chat-memory",
  storage,
  options: {
    lastMessages: 10, // 取り出すメッセージの件数
  },
});

// 3. メモリをエージェントに割り当てる
const agent = new Agent({
  id: "chat-agent",
  memory,
});

// 4. 同じ threadId を使い続ける
await agent.generate("Hello", {
  threadId: "user-123-conversation", // 1つの会話の間は同じ threadId
  resourceId: "user-123",
});
```

## ワークフローのエラー

### 「Cannot read property 'then' of undefined」

**症状**：

```bash
TypeError: Cannot read property 'then' of undefined
Workflow execution fails immediately
```

**原因**：

- ワークフローで `.commit()` を呼び忘れている
- ステップが undefined を返している

**解決方法**：

**正しい書き方**：

```typescript
const workflow = createWorkflow({
  id: "my-workflow",
  inputSchema: z.object({ data: z.string() }),
  outputSchema: z.object({ result: z.string() }),
})
  .then(step1)
  .then(step2)
  .commit(); // 必須！

// そのあと実行する
const run = await workflow.createRun();
const result = await run.start({ inputData: { data: "test" } });
```

### ワークフローの状態が更新されない

**症状**：

- ステップをまたいで、状態の変更が残らない
- `getStepResult()` が undefined を返す

**原因**：

- 状態の更新に `setState` を使っていない
- ステップが終わる前に状態を読んでいる

**解決方法**：

```typescript
const step1 = createStep({
  id: "step1",
  execute: async ({ state, setState }) => {
    // 状態を更新する
    await setState({ ...state, counter: (state.counter || 0) + 1 });
    return { result: "done" };
  },
});

// 後のステップで状態を読む
const step2 = createStep({
  id: "step2",
  execute: async ({ state }) => {
    console.log(state.counter); // 更新された状態を読む
    return { result: "complete" };
  },
});
```

## メモリのエラー

### 「Storage is required for Memory」

**症状**：

```bash
Error: Storage is required for Memory
Memory instantiation fails
```

**原因**：

- ストレージを指定せずにメモリを作っている

**解決方法**：

```typescript
// メモリを作るときは、必ずストレージを渡す
const memory = new Memory({
  id: "my-memory",
  storage: postgresStore, // 必須
  options: {
    lastMessages: 10,
  },
});
```

### 意味による呼び出し（セマンティックリコール）が動かない

**症状**：

- 意味の近いメッセージをメモリが取り出してくれない
- 最近のメッセージしか返ってこない

**原因**：

- ベクトルストアが設定されていない
- 埋め込み（embedder）が設定されていない
- `semanticRecall` が有効になっていない

**解決方法**：

```typescript
const memory = new Memory({
  id: "semantic-memory",
  storage: postgresStore,
  vector: chromaVectorStore, // セマンティックリコールに必須
  embedder: openaiEmbedder, // セマンティックリコールに必須
  options: {
    lastMessages: 10,
    semanticRecall: true, // 必須
  },
});
```

## ツールのエラー

### 「Tool validation failed」

**症状**：

```bash
Error: Input validation failed for tool 'my-tool'
ZodError: Expected string, received number
```

**原因**：

- 入力が inputSchema と一致していない
- 必須のフィールドが足りない
- 型が一致していない

**解決方法**：

```typescript
const tool = createTool({
  id: "my-tool",
  inputSchema: z.object({
    name: z.string(),
    age: z.number().optional(), // 任意のフィールドは明示する
  }),
  execute: async (input) => {
    // input はバリデーション済みで、型も付いている
    return { result: `Hello ${input.name}` };
  },
});

// 正しい使い方
await tool.execute({ name: "Alice" }); // 動く
await tool.execute({ name: "Bob", age: 30 }); // 動く
await tool.execute({ age: 30 }); // エラー：name は必須
```

### ツールの一時停止から再開しない

**症状**：

- ツールが一時停止したまま、再開しない
- resumeData が undefined になる

**原因**：

- resumeData を付けて workflow.resume() や agent.generate() を呼んでいない
- resumeSchema が正しくない

**解決方法**：

```typescript
const approvalTool = createTool({
  id: "approval",
  inputSchema: z.object({ request: z.string() }),
  outputSchema: z.object({ approved: z.boolean() }),
  suspendSchema: z.object({ requestId: z.string() }),
  resumeSchema: z.object({ approved: z.boolean() }),
  execute: async (input, context) => {
    if (!context.resumeData) {
      // 1回目の呼び出し - 一時停止する
      const requestId = generateId();
      context.suspend({ requestId });
      return; // ここで実行が止まる
    }

    // 再開された - resumeData を使う
    return { approved: context.resumeData.approved };
  },
});

// ワークフロー／エージェントを再開する
await run.resume({
  resumeData: { approved: true },
});
```

## ストレージのエラー

### 「Connection refused」や「Database does not exist」

**症状**：

```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: database "mastra" does not exist
```

**原因**：

- データベースが起動していない
- 接続文字列が正しくない
- データベースが作成されていない

**解決方法**：

1. データベースを起動する（Postgres の例）：

```bash
docker run -d \
  --name mastra-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mastra \
  -p 5432:5432 \
  postgres:16
```

2. 接続文字列を確認する：

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/mastra
```

3. ストレージを初期化する：

```typescript
const storage = new PostgresStore({
  connectionString: process.env.DATABASE_URL,
});
await storage.init(); // 必要ならテーブルを作成する
```

## 環境変数のエラー

### 「API key not found」

**症状**：

```bash
Error: OPENAI_API_KEY environment variable is not set
401 Unauthorized
```

**原因**：

- .env ファイルがない
- 環境変数が読み込まれていない
- 変数名が間違っている

**解決方法**：

1. .env ファイルを作る：

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

2. 環境変数を読み込む（Node.js の場合）：

```typescript
import "dotenv/config"; // 入口のファイルの先頭に書く
```

3. 変数が読み込まれているか確認する：

```typescript
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}
```

## モデルのエラー

### 「Model not found」や「Invalid model」

**症状**：

```bash
Error: Model 'gpt-4' not found
Error: Invalid model format
```

**原因**：

- モデルの書き方が正しくない（`provider/model` の形式にする必要がある）
- 対応していないモデル
- プロバイダーの API キーがない

**解決方法**：

**正しいモデルの書き方**：

```typescript
const agent = new Agent({
  model: "openai/gpt-5.4", // ✅ 正しい
  // ダメな例: model: 'gpt-5.4'       // ❌ プロバイダーがない
});
```

**よく使うモデル**：

- OpenAI：`openai/gpt-5.4`、`openai/gpt-5-mini`
- Anthropic：`anthropic/claude-sonnet-4-5`、`anthropic/claude-haiku-4-5`、`anthropic/claude-opus-4-6`
- Google：`google/gemini-2.5-pro`、`google/gemini-2.5-flash`

**同梱のドキュメントで確認する**：

```bash
# 対応しているモデルを確認する
ls node_modules/@mastra/core/dist/docs/
# 調べ方は embedded-docs.md を参照
```

## デバッグのコツ

### 詳しいログを出す

```typescript
const mastra = new Mastra({
  logger: new PinoLogger({
    name: "mastra",
    level: "debug", // さらに詳しくするなら 'trace'
  }),
});
```

### パッケージのバージョンを確認する

```bash
npm list @mastra/core
npm list @mastra/memory
npm list @mastra/rag
```

### TypeScript の設定を確認する

```bash
npx tsc --showConfig
# target: ES2022、module: ES2022 になっているか確認する
```

## 困ったときは

1. **同梱のドキュメントを確認する**：同梱のドキュメントを確認する（`embedded-docs.md` を参照）
2. **ドキュメントを検索する**：[mastra.ai/docs](https://mastra.ai/docs)
3. **バージョンの互換性を確認する**：@mastra のパッケージがすべて同じバージョンになっているか確認する
4. **Issue を立てる**：[github.com/mastra-ai/mastra](https://github.com/mastra-ai/mastra)