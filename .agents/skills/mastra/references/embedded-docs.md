# 同梱ドキュメント リファレンス

`node_modules/@mastra/*/dist/docs/` に同梱されているドキュメントから、API のシグネチャを調べる方法です。これらはインストール済みのバージョンと一致しています。

Mastra のパッケージがローカルにインストールされている場合は、**まずこれを使ってください**。同梱のドキュメントは、インストール済みのバージョンについて常に正確です。

## 同梱のドキュメントを使う理由

- **バージョンが正確**：同梱のドキュメントは、インストールされているバージョンと完全に一致する
- **ネットワークが不要**：ドキュメントはすべて `node_modules/` の中にある
- **Mastra は変化が速い**：API はどんどん変わるが、同梱のドキュメントは常にそれに合っている
- **TypeScript の型定義**：JSDoc、型のシグネチャ、使用例が含まれている
- **学習データは古い可能性がある**：Claude の知識の締め切り時点では、最新の API が反映されていないことがある

## ドキュメントの構成

```
node_modules/@mastra/core/dist/docs/
├── SKILL.md # パッケージの概要、エクスポート一覧
├── assets/
│   └── SOURCE_MAP.json # エクスポート → ファイルの対応表
└── references/ # トピックごとのドキュメント
```

## 調べ方

### 1. パッケージがインストールされているか確認する

```bash
ls node_modules/@mastra/
```

`core`、`memory`、`rag` などのパッケージが表示されたら、同梱のドキュメントで調べていきます。

### 2. トピックごとのドキュメントを探す

`grep` を使って、`references/` の中から関係するドキュメントを探します。

```bash
grep -r "Agent" node_modules/@mastra/core/dist/docs/references
```

### ファイル名の付け方

ドキュメントのファイル名は、基本的に `<category>-<topic>.md` の形式です。category は `"docs"`、`"reference"`、`"guides"`、`"models"` のどれかです。

### 任意：ソースコードで型定義や詳細を確認する

`SOURCE_MAP.json` を見て、エクスポートのファイルパスを探します。

```bash
cat node_modules/@mastra/core/dist/docs/assets/SOURCE_MAP.json | grep '"Agent"'
```

返ってくる結果：`{ "Agent": { "types": "dist/agent/agent.d.ts", ... } }`

型定義を読むと、コンストラクタの正確な引数、型、JSDoc が分かります。

```bash
cat node_modules/@mastra/core/dist/agent/agent.d.ts
```

## よく使うパッケージ

| パッケージ | パス | 含まれる内容 |
| --- | --- | --- |
| `@mastra/core` | `node_modules/@mastra/core/dist/docs/` | Agent、Workflow、Tool、Mastra 本体 |
| `@mastra/memory` | `node_modules/@mastra/memory/dist/docs/` | メモリの仕組み、会話の履歴 |
| `@mastra/rag` | `node_modules/@mastra/rag/dist/docs/` | RAG の機能、ベクトルストア |
| `@mastra/pg` | `node_modules/@mastra/pg/dist/docs/` | PostgreSQL のストレージ |
| `@mastra/libsql` | `node_modules/@mastra/libsql/dist/docs/` | LibSQL／SQLite のストレージ |

## よく使うコマンド

```bash
# インストール済みの @mastra パッケージを一覧する
ls node_modules/@mastra/

# トピックごとのドキュメントを一覧する
ls node_modules/@mastra/core/dist/docs/references/

# SOURCE_MAP から特定のエクスポートを探す
cat node_modules/@mastra/core/dist/docs/assets/SOURCE_MAP.json | grep '"ExportName"'

# SOURCE_MAP で分かったパスから型定義を読む
cat node_modules/@mastra/core/dist/[path-from-source-map]

# パッケージの概要を見る
cat node_modules/@mastra/core/dist/docs/SKILL.md
```

## 同梱のドキュメントがない場合

パッケージがインストールされていない、または `dist/docs/` がない場合：

1. **インストールを勧める**：同梱のドキュメントを使えるよう、パッケージのインストールを提案する
2. **リモートのドキュメントに切り替える**：`references/remote-docs.md` を参照する

## おすすめの使い方

1. 考え方やパターンを理解するには、**トピックごとのドキュメントを確認する**
2. ドキュメントで答えが見つからなければ、**ソースコードを探す**
3. import しているものが、型定義でエクスポートされているものと **一致しているか確認する**