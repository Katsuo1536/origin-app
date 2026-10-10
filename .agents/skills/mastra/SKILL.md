---
name: mastra
description: "現行の API でエージェント、ワークフロー、ツール、メモリ、ワークスペース、ストレージを作るための、Mastra フレームワークの総合ガイド。ドキュメントの調べ方、API の確認、TypeScript の設定、よくあるエラー、移行（マイグレーション）、そして `mastra api` CLI の作業（ローカル、Mastra プラットフォーム、Trace Intelligence、リモートサーバー上のリソースの確認・呼び出し）に使う。Mastra Factory の操作には、対になる mastra-factory スキルを探して有効にする。"
license: Apache-2.0
metadata:
  author: Mastra
  version: "2.2.0"
  repository: https://github.com/mastra-ai/skills
---

# Mastra フレームワークガイド

Mastra で AI アプリケーションを作ります。このスキルでは、最新のドキュメントの探し方と、エージェントやワークフローの作り方を説明します。

## 重要：自分の知識を信用しない

Mastra について知っていることは、古いか間違っている可能性が高いです。記憶に頼らず、必ず最新のドキュメントで確認してください。

学習データには、使われなくなった API、非推奨のパターン、誤った使い方が含まれています。Mastra は変化が速く、バージョンごとに API が変わり、コンストラクタの引数が変わり、書き方が作り直されます。

## 前提条件

Mastra のコードを書く前に、パッケージがインストールされているか確認してください。

```bash
ls node_modules/@mastra/
```

- パッケージがある場合：まず同梱のドキュメントを使う（最も確実）
- パッケージがない場合：先にインストールするか、リモートのドキュメントを使う

## リソース

### リファレンス

| ユーザーの質問 | 最初に見るもの | 調べ方 |
| --- | --- | --- |
| Mastra のプロジェクトを作成・インストールしたい | [`references/create-mastra.md`](references/create-mastra.md) | CLI と手動の両方のセットアップ手順 |
| Agent／Workflow／Tool／Memory／Storage のどれを使うか | [`references/core-concepts.md`](references/core-concepts.md) | 基本の考え方と、それぞれをいつ使うか |
| Agent／Workflow／Tool の使い方 | [`references/embedded-docs.md`](references/embedded-docs.md) | `node_modules/@mastra/*/dist/docs/` で調べる |
| X の使い方（パッケージなし） | [`references/remote-docs.md`](references/remote-docs.md) | `https://mastra.ai/llms.txt` から取得する |
| モデルを選ぶ・確認する | [`references/model-selection.md`](references/model-selection.md) | モデルの書き方と、プロバイダー一覧の調べ方 |
| エラーが出る | [`references/common-errors.md`](references/common-errors.md) | よくあるエラーと解決方法 |
| v0.x から v1.x にアップグレードしたい | [`references/migration-guide.md`](references/migration-guide.md) | バージョンアップの手順 |
| CLI でサーバーのリソースを確認・呼び出したい | [`references/mastra-api.md`](references/mastra-api.md) | ローカル、Mastra プラットフォーム、リモートサーバー向けの `mastra api` CLI |
| 複雑な条件でトレースを正確に探したい | [`references/trace-query.md`](references/trace-query.md) | トレースのフィールドや、関連するスパン・スコア・フィードバックで、完了したトレースを検索する |
| エージェントの状態、繰り返す失敗、改善点を調べたい | [`references/trace-intelligence.md`](references/trace-intelligence.md) | まず Trace Intelligence の集計テーマから始め、次にトレースやログで根拠を確認する |

### スクリプト

- `scripts/provider-registry.mjs`：モデルルーターで使える最新のプロバイダーとモデルを調べます。モデルを使う前には必ずこれを実行して、プロバイダーのキーとモデル名を確認してください。

## コードを書くときの優先順位

最新のドキュメントを確認せずに、コードを書かないでください。

1. 1番目は同梱のドキュメント（パッケージがインストール済みの場合）

   パッケージの最新ドキュメントを `node_modules` の中で調べます。インストールされているバージョンと完全に一致するので、最も確実な情報源です。[`references/embedded-docs.md`](references/embedded-docs.md) を参照してください。

2. 2番目はソースコード（パッケージがインストール済みの場合）

   同梱のドキュメントで分からない場合は、インストールされているソースコードと型定義を確認します。ドキュメントがない、または分かりにくいときは、これが正解の情報源になります。[`references/embedded-docs.md`](references/embedded-docs.md) を参照してください。

3. 3番目はリモートのドキュメント（パッケージが未インストールの場合）

   パッケージがインストールされていない場合や、新機能を調べる場合は、公開されている最新のドキュメントを使います。リモートのドキュメントは、ユーザーがインストールしているバージョンより新しいことがあります。[`references/remote-docs.md`](references/remote-docs.md) を参照してください。

## 基本の考え方

エージェント、ワークフロー、ツール、メモリ、ストレージのどれを使うか迷ったら、[`references/core-concepts.md`](references/core-concepts.md) を使ってください。

- Agent：判断をしながらツールを使う、決まった手順のない作業に使う。
- Workflow：手順が決まっている、複数ステップの処理に使う。

## Mastra Studio

Studio は、エージェント、ワークフロー、ツールを作成・テスト・管理するための対話的な画面です。人に画面で確認やデバッグをしてもらうよう案内するときに使います。

Mastra のプロジェクト内で、次を実行します。

```bash
npm run dev
```

そのあと、ブラウザで `http://localhost:4111` を開き、ユーザーに Mastra Studio を見てもらいます。

## Mastra API CLI

`mastra api` は、ローカルの開発サーバー、Mastra プラットフォームのデプロイ、リモートの Mastra エンドポイント上のリソースを、確認したり呼び出したりするのに使います。エージェントが読める形での状態の取得、実行、トレース、ログ、スコア、スレッド、ワークフローの操作に便利です。使い方のパターンは [`references/mastra-api.md`](references/mastra-api.md) を参照してください。

再帰的な条件や、関連するスパン・スコア・フィードバックに対する条件で、トレースを正確に選びたい場合は、[`references/trace-query.md`](references/trace-query.md) を読んでください。`mastra api trace query` を使う前に、インストール済みの CLI にそのコマンドがあるか確認してください。接続先のリクエスト・レスポンスの形や構造上の制約は `--schema` で、対応しているフィールド・演算子・意味は [`references/remote-docs.md`](references/remote-docs.md) から見つかる正式なドキュメントで確認してください。意味の分からないページ送りのカーソルはそのまま使い、トレースやスパンの詳細は、候補を絞り込んでから取得してください。

## Mastra Factory

Factory のプロジェクト、作業項目、キューのヘルス、判断、セッションの履歴、メモリの確認、許可された操作には、**`mastra-factory`** スキルを有効にしてください。Factory は運用管理のための仕組みであり、新しい Mastra アプリを作ったりデプロイしたりする理由にはなりません。

スキルがない場合は、このリポジトリからのインストールを提案してください。

```bash
npx skills add mastra-ai/skills --skill mastra-factory
```

ユーザーが使いたいエージェントとスコープを、対話形式で選んでください。グローバルにインストールする場合は、`--agent <agent> -g` で対応しているエージェントを明示してください。PromptScript はグローバルインストールに対応していません。別のエージェントへのインストールが失敗しても、対象のエージェントについて、インストールと参照ファイルを確認してください。

Factory スキルでは、CLI の確認、`mastra auth whoami` と許可を得たうえでの `mastra auth login`、そしてどのディレクトリからでもユーザーの実際のインスタンス URL で接続する方法を扱っています。`--url` を使えば、デプロイ済みのリポジトリや `.mastra-project.json` は必要ありません。共有の Factory ホストやプロジェクト ID を推測しないでください。接続とセッション確認のリファレンスでは、デプロイ固有の認証、プロジェクトの探し方、スレッド、観測メモリの制限について説明しています。

## Trace Intelligence

Trace Intelligence（Mastra プラットフォームのプライベートベータ）は、完了したエージェントのトレースを、4つのシグナル（目的、結果、振る舞い、感情）ごとに、繰り返し現れるテーマとしてまとめる機能です。エージェントの状態を全体として知りたいとき、たとえば「ユーザーが何を求めているか」「どこで結果が失敗・ブロックしているか」「どんな振る舞いが繰り返されているか」「感情がどう変化しているか」「エージェントのどこを改善できるか」を知りたいときは、まずこれを使ってください。そのあと、`mastra api trace`、`log`、`metric`、`score` のコマンドで、具体的なトレースから実行の根拠を確認します。Trace Intelligence には、`mastra api learning` の CLI コマンド、またはローカル開発サーバーのプロキシやプラットフォームのエンドポイント経由の HTTP で問い合わせます。調査の流れ、CLI コマンド、ルートの一覧は [`references/trace-intelligence.md`](references/trace-intelligence.md) を参照してください。

## 必須の要件

### TypeScript の設定

Mastra には ES2022 モジュールが必要です。CommonJS では失敗します。セットアップは [`references/create-mastra.md`](references/create-mastra.md)、トラブルシューティングは [`references/common-errors.md`](references/common-errors.md) を参照してください。

### モデルの書き方

Mastra のモデルルーターでモデルを指定するときは、必ず `"provider/model-name"` の形式を使ってください。

ユーザーがモデルやプロバイダーを使いたいと言ったら、必ず先に `scripts/provider-registry.mjs` を実行して、プロバイダーのキーとモデル名が正しいか確認してください。モデル名は頻繁に変わるので、記憶から推測しないでください。[`references/model-selection.md`](references/model-selection.md) を参照してください。

## エラーが出たとき

型エラーは、自分の知識が古いことを示している場合がよくあります。

知識が古いことを示す、よくあるサイン：

- `Property X does not exist on type Y`
- `Cannot find module`
- 型の不一致（`Type mismatch`）のエラー
- コンストラクタの引数のエラー

対応方法：

1. [`references/common-errors.md`](references/common-errors.md) を確認する
2. 同梱のドキュメントで現在の API を確認する
3. エラーをユーザーのミスだと決めつけない。自分の知識が古いせいかもしれない

## 開発の流れ

コードを書く前に、必ず確認してください。

1. Mastra のパッケージがインストールされているか確認する
2. 現在の API を調べる
   - インストール済みの場合：同梱のドキュメント [`references/embedded-docs.md`](references/embedded-docs.md) を使う
   - 未インストールの場合：リモートのドキュメント [`references/remote-docs.md`](references/remote-docs.md) を使う
3. 最新のドキュメントをもとにコードを書く
4. プロジェクトのスクリプトや、使える場合は Studio でテストする