---
name: prisma-cli
description: Prisma ORM の CLI コマンドのリファレンス。init、generate、migrate、db、dev、complete、studio、validate、format、debug、mcp を扱う。ORM・データベースの CLI 作業に使い、Prisma Platform の CLI には使わない。"prisma init"、"prisma generate"、"prisma migrate"、"prisma db"、"prisma complete"、"prisma studio"、"prisma mcp" で起動する。
license: MIT
metadata:
  author: prisma
  version: "7.9.1"
---

# Prisma CLI リファレンス

Prisma ORM の CLI コマンドのリファレンスです。このスキルでは、現在の Prisma ORM のリリースでのコマンドの使い方、オプション、おすすめの使い方を説明します。

## 境界：Platform と Compute

安定版の ORM コマンド（`prisma`）と、パブリックベータの Platform パッケージ（`@prisma/cli`、バイナリ名は `prisma-cli`）を混同しないでください。Compute のアプリやワークスペースの認証には `prisma-compute` を、Platform のプロジェクトやデータベースには `prisma-postgres` を使います。

## 使う場面

次のようなときに、このスキルを参照します。
- 新しい Prisma プロジェクトを準備する（`prisma init`）
- Prisma Client を生成する（`prisma generate`）
- データベースのマイグレーションを実行する（`prisma migrate`）
- データベースの状態を管理する（`prisma db push/pull`）
- ローカルの開発用データベースを使う（`prisma dev`）
- Prisma の問題を調べる（`prisma debug`）
- シェルの補完を生成する（`prisma complete`）

## 優先度別のルールの分類

| 優先度 | 分類 | 影響 | 接頭辞 |
|----------|----------|--------|--------|
| 1 | セットアップ | 高 | `init` |
| 2 | 生成 | 高 | `generate` |
| 3 | 開発 | 高 | `dev` |
| 4 | データベース | 高 | `db-` |
| 5 | マイグレーション | 最重要 | `migrate-` |
| 6 | ユーティリティ | 中 | `complete`, `studio`, `validate`, `format`, `debug`, `mcp` |

## コマンドの分類

| 分類 | コマンド | 目的 |
|----------|----------|---------|
| セットアップ | `init` | Prisma プロジェクトを初期化する |
| 生成 | `generate` | Prisma Client を生成する |
| 検証 | `validate`, `format` | スキーマの検証と整形 |
| 開発 | `dev` | 開発用のローカル Prisma Postgres |
| データベース | `db pull`, `db push`, `db seed`, `db execute` | データベースを直接操作する |
| マイグレーション | `migrate dev`, `migrate deploy`, `migrate reset`, `migrate status`, `migrate diff`, `migrate resolve` | スキーマのマイグレーション |
| ユーティリティ | `complete`, `studio`, `mcp`, `version`, `debug` | シェル、開発、AI 向けのツール |

## クイックリファレンス

### プロジェクトのセットアップ

```bash
# 新しいプロジェクトを初期化する（prisma/ フォルダと prisma.config.ts を作る）
prisma init

# データベースを指定して初期化する
prisma init --datasource-provider postgresql
prisma init --datasource-provider mysql
prisma init --datasource-provider sqlite

# Prisma Postgres（クラウド）で初期化する
prisma init --db

# サンプルのモデル付きで初期化する
prisma init --with-model

```

### Client の生成

```bash
# Prisma Client を生成する
prisma generate

# 開発用の監視モード
prisma generate --watch

# 特定のジェネレーターだけを生成する
prisma generate --generator client
```

### Bun ランタイム

Bun を使うときは、必ず `--bun` フラグを付けて、Prisma を Bun ランタイムで実行してください（付けないと、CLI の shebang のせいで Node.js で実行されます）。

```bash
bunx --bun prisma init
bunx --bun prisma generate
```

### ローカルの開発用データベース

```bash
# ローカルの Prisma Postgres を起動する
prisma dev

# 名前を指定して起動する
prisma dev --name myproject

# バックグラウンドで起動する（デタッチ）
prisma dev --detach

# ローカルのインスタンスをすべて表示する
prisma dev ls

# インスタンスを止める
prisma dev stop myproject

# インスタンスのデータを削除する
prisma dev rm myproject
```

### データベースの操作

```bash
# 既存のデータベースからスキーマを取り込む
prisma db pull

# スキーマをデータベースに反映する（マイグレーションなし）
prisma db push

# シードデータを入れる
prisma db seed

# 生の SQL を実行する
prisma db execute --file ./script.sql
```

### マイグレーション（開発）

```bash
# マイグレーションを作成して適用する
prisma migrate dev

# 名前を付けてマイグレーションを作成する
prisma migrate dev --name add_users_table

# 適用せずにマイグレーションだけを作成する
prisma migrate dev --create-only

# データベースをリセットして、すべてのマイグレーションを適用する
prisma migrate reset
```

### マイグレーション（本番）

```bash
# まだ適用していないマイグレーションを適用する（CI/CD）
prisma migrate deploy

# マイグレーションの状態を確認する
prisma migrate status

# スキーマを比べて差分を生成する
prisma migrate diff --from-config-datasource --to-schema schema.prisma --script
```

### ユーティリティのコマンド

```bash
# Prisma Studio（データベースの GUI）を開く
prisma studio

# AI ツール向けに Prisma の MCP サーバーを起動する
prisma mcp

# バージョン情報を表示する
prisma version
prisma -v

# デバッグ情報
prisma debug

# スキーマを検証する
prisma validate

# スキーマを整形する
prisma format

# シェルの補完コードを生成する
prisma complete zsh
```

## AI の安全確認

Prisma は、AI エージェントが実行していると判断すると、エージェントがユーザーからはっきり同意をもらうまで、データを壊すおそれのあるコマンドを止めます。対象は `migrate reset`、`db push --force-reset`、`db push --accept-data-loss` です。

- コマンドを実行する直前に、どのデータが失われるかを正確に説明して、同意を求めてください。
- 前のメッセージや関係のないメッセージから、同意したと決めつけないでください。
- 自動化で同意用の変数が必要なときは、`PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` に、ユーザーが同意したときの文章をそのまま入れてください。文章を作り上げないでください。
- Prisma の MCP サーバーには、意図的に `migrate-reset` ツールがありません。

データを壊すおそれのある Prisma のコマンドを使う前に、`references/agent-safety.md` を読んでください。

## 現在の Prisma CLI の設定

### 新しい設定ファイル

CLI の設定には `prisma.config.ts` を使います。

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### 現在のコマンドの動き

- 最新の Client の出力が必要なときは、`migrate dev`、`db push` などでスキーマを同期したあとに、`prisma generate` を明示的に実行する
- シードデータが必要なときは、`migrate dev` や `migrate reset` のあとに、`prisma db seed` を明示的に実行する
- 生の SQL スクリプトには `prisma db execute --file ...` を使う

### 環境変数

環境変数は、`prisma.config.ts` の中で明示的に読み込みます。よく使うのは `dotenv` です。

```typescript
// prisma.config.ts
import 'dotenv/config'
```

## ルールファイル

コマンドごとの詳しい説明は、それぞれのルールファイルを見てください。

```
references/init.md           - プロジェクトの初期化
references/generate.md       - Client の生成
references/dev.md            - ローカルの開発用データベース
references/db-pull.md        - データベースからのスキーマの取り込み
references/db-push.md        - スキーマの反映
references/db-seed.md        - シードデータの投入
references/db-execute.md     - 生の SQL の実行
references/migrate-dev.md    - 開発用のマイグレーション
references/migrate-deploy.md - 本番用のマイグレーション
references/migrate-reset.md  - データベースのリセット
references/migrate-status.md - マイグレーションの状態
references/migrate-resolve.md - マイグレーションの解決
references/migrate-diff.md   - スキーマの差分
references/studio.md         - データベースの GUI
references/mcp.md            - Prisma の MCP サーバー
references/complete.md       - シェルの補完の生成
references/agent-safety.md   - データを壊すコマンドの前の AI の同意確認
references/validate.md       - スキーマの検証
references/format.md         - スキーマの整形
references/debug.md          - デバッグ情報
```

## 使い方

上のコマンドの分類で目的のコマンドを探してから、そのコマンドのリファレンスファイルを開いてください。
