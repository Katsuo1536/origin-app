# 移行（マイグレーション）ガイド

公式ドキュメントと現在の API の確認を使って、Mastra のバージョンをアップグレードするためのガイドです。

## 移行の進め方

バージョンアップでは、次の流れで進めます。

### 1. 公式の移行ドキュメントを確認する

**必ず公式の移行ドキュメントから始めてください：** `https://mastra.ai/llms.txt`

**Migrations** か **Guides** のセクションを探してください。次の内容が載っています。

- バージョンごとの破壊的変更（これまでのコードが動かなくなる変更）
- 自動移行ツール
- 手順を追ったアップグレード方法

**探すセクションの例：**

- `/guides/migrations/upgrade-to-v1/`
- `/guides/migrations/upgrade-to-v2/`
- 破壊的変更の一覧

### 2. 同梱のドキュメントで現在の API を確認する

破壊的変更が分かったら、新しい API を確認します。

**インストールされているバージョンを確認する：**

```bash
cat node_modules/@mastra/core/dist/docs/assets/SOURCE_MAP.json | grep '"ApiName"'
cat node_modules/@mastra/core/dist/[path-from-source-map]
```

詳しい調べ方は [`embedded-docs.md`](embedded-docs.md) を参照してください。

### 3. リモートのドキュメントで最新の情報を確認する

まだパッケージを更新していない場合は、API がどうなるかを確認します：`https://mastra.ai/reference/[topic]`

詳しい調べ方は [`remote-docs.md`](remote-docs.md) を参照してください。

## 移行の簡単な流れ

```bash
# 1. 現在のバージョンを確認する
npm list @mastra/core

# 2. 公式ドキュメントから移行ガイドを取得する
# WebFetch を使う: https://mastra.ai/llms.txt
# 該当する移行のセクションを探す

# 3. 依存パッケージを更新する
npm install @mastra/core@latest @mastra/memory@latest @mastra/rag@latest mastra@latest

# 4. 自動移行を実行する（ある場合）
npx @mastra/codemod@latest v1  # または該当するバージョン

# 5. 同梱のドキュメントで新しい API を確認する
cat node_modules/@mastra/core/dist/docs/assets/SOURCE_MAP.json

# 6. 同梱のドキュメントで調べながら、破壊的変更を修正する
# 各 API の調べ方は embedded-docs.md を参照

# 7. テストする
npm run dev
npm test
```

## よくある移行のパターン

### 何が変わったかを調べる

**公式の移行ドキュメントを確認する：** `https://mastra.ai/guides/migrations/upgrade-to-v1/overview.md`

ここに載っている内容：

- 破壊的変更
- 非推奨になった API
- 新機能
- 移行ツール

### API の使い方を更新する

**破壊的変更ごとに：**

1. 自分のコードの中で **古い API を探す**
2. 同梱のドキュメントで **新しい API を調べる**
   ```bash
   cat node_modules/@mastra/core/dist/docs/assets/SOURCE_MAP.json | grep '"NewApi"'
   cat node_modules/@mastra/core/dist/[path]
   ```
3. 型のシグネチャをもとに **コードを更新する**
4. 変更を **テストする**

### 例：ツールの execute の引数が変わった場合

**公式ドキュメントの記載：**「Tool の execute のシグネチャが変更されました」

**現在のシグネチャを調べる：**

```bash
cat node_modules/@mastra/core/dist/docs/assets/SOURCE_MAP.json | grep '"createTool"'
cat node_modules/@mastra/core/dist/tools/tool.d.ts
```

**型定義をもとに更新する：**

```typescript
// 古い書き方（ドキュメントより）
execute: async (input) => { ... }

// 新しい書き方（同梱のドキュメントより）
execute: async (inputData, context) => { ... }
```

## 移行前のチェックリスト

- [ ] コードをバックアップする（git commit）
- [ ] 公式の移行ドキュメントを確認する：`https://mastra.ai/llms.txt`
- [ ] 現在のバージョンを控えておく：`npm list @mastra/core`
- [ ] 破壊的変更の一覧を読む
- [ ] テストが通っている

## 移行後のチェックリスト

- [ ] すべての依存パッケージをまとめて更新した
- [ ] TypeScript のコンパイルが通る：`npx tsc --noEmit`
- [ ] テストが通る：`npm test`
- [ ] Studio が動く：`npm run dev`
- [ ] コンソールに警告が出ていない
- [ ] 同梱のドキュメントで API を確認した

## 移行に使えるリソース

| リソース | 用途 |
| --- | --- |
| `https://mastra.ai/llms.txt` | 移行ガイドと破壊的変更を探す |
| [`embedded-docs.md`](embedded-docs.md) | 更新後に、新しい API のシグネチャを調べる |
| [`remote-docs.md`](remote-docs.md) | 更新前に、最新のドキュメントを確認する |
| [`common-errors.md`](common-errors.md) | 移行で出たエラーを直す |

## バージョンごとの注意点

### 共通の原則

1. **@mastra のパッケージは必ずまとめて更新する**

   ```bash
   npm install @mastra/core@latest @mastra/memory@latest @mastra/rag@latest mastra@latest
   ```

2. **自動移行ツールがあるか確認する**

   ```bash
   npx @mastra/codemod@latest [version]
   ```

3. **Node.js のバージョン要件を確認する**
   - 必要な最低バージョンは、公式の移行ドキュメントで確認する

4. **ストレージを使っている場合は、データベースの移行を実行する**
   - 公式ドキュメントのストレージ移行ガイドに従う

## 困ったときは

1. **公式の移行ドキュメントを確認する**：`https://mastra.ai/llms.txt` → Migrations のセクション
2. **新しい API を調べる**：[`embedded-docs.md`](embedded-docs.md) を参照
3. **エラーを確認する**：[`common-errors.md`](common-errors.md) を参照
4. **Discord で質問する**：https://discord.gg/BTYqqHKUrf
5. **Issue を立てる**：https://github.com/mastra-ai/mastra/issues

## 大事な原則

1. **公式ドキュメントが正解の情報源** - `https://mastra.ai/llms.txt` から始める
2. **同梱のドキュメントで確認する** - インストール済みのバージョンの API を確認する
3. **少しずつ更新する** - メジャーバージョンを飛ばさない
4. **しっかりテストする** - 変更のたびにテストを実行する
5. **自動化を使う** - codemod があれば使う