# prisma init

今いるフォルダに、Prisma ORMの新しいプロジェクトをひと通り用意します。

## コマンド

```bash
prisma init [options]
```

## Bunを使う場合

Bunを使っているときは、Node.jsで実行されないように `bunx --bun` でPrismaを実行します。

```bash
bunx --bun prisma init
```

## 作られるもの

- `prisma/schema.prisma`：Prismaのスキーマファイル
- `prisma.config.ts`：Prisma CLI用のTypeScriptの設定ファイル
- `.env`：環境変数（DATABASE_URL）
- `.gitignore`：`.env` がGitの管理から外れるようにし、生成されるクライアントのパスも書き足す

## オプション

| オプション | 説明 | デフォルト |
|--------|-------------|---------|
| `--datasource-provider` | データベースの種類：`postgresql`、`mysql`、`sqlite`、`sqlserver`、`mongodb`、`cockroachdb` | `postgresql` |
| `--db` | Prisma Data Platform 上に、管理がすべておまかせのPrisma Postgresデータベースを用意する | - |
| `--url` | データソースのURLを指定する | - |
| `--generator-provider` | 使うgeneratorの種類を指定する | `prisma-client` |
| `--output` | Prisma Clientの生成先のパスを指定する | - |
| `--preview-feature` | 使うプレビュー機能を指定する | - |
| `--with-model` | 作るスキーマファイルにサンプルのモデルを入れる | - |
| `--no-skills` | Prismaのエージェント用スキルのインストールを省く | - |

`prisma init` は、AIエージェントを検知すると `prisma/skills` のインストールを試みます。これはできる範囲で行うもので、失敗してもプロジェクトの初期化自体は失敗しません。必要なものだけにしたい環境や、管理された環境では `--no-skills` を使ってください。

## 使用例

### 基本の初期化

```bash
prisma init
```

PostgreSQL用のプロジェクト構成を作ります。

### SQLiteのプロジェクト

```bash
prisma init --datasource-provider sqlite
```

### MySQLで、URLを指定する

```bash
prisma init --datasource-provider mysql --url "mysql://user:password@localhost:3306/mydb"
```

### Prisma Postgres（クラウド）

```bash
prisma init --db
```

ブラウザが開いて認証を行い、クラウドのデータベースを作ります。

### サンプルのモデルを入れる

```bash
prisma init --with-model
```

作られるスキーマに、最初のモデルを1つ書き足します。

### プレビュー機能を使う

```bash
prisma init --preview-feature relationJoins --preview-feature fullTextSearch
```

## 作られるスキーマ

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

## 作られる設定ファイル（Node.jsの場合・デフォルト）

```typescript
// prisma.config.ts
import "dotenv/config";
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
})
```

## 作られる設定ファイル（Bunの場合）

```typescript
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## 初期化のあとにやること

1. `.env` に `DATABASE_URL` を設定する（`prisma.config.ts` がそれを読み込む）
2. `prisma/schema.prisma` にモデルを書く
3. ローカルで開発するなら `prisma dev` を実行する。または外部のDBにつなぐ
4. `prisma migrate dev` を実行して、マイグレーションを作る
5. `prisma generate` を実行して、Prisma Clientを生成する
6. シードデータが必要なら、`prisma db seed` を自分で実行する