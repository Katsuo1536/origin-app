# Prisma Postgres の準備

Prisma Postgres（管理されたデータベース）で Prisma を設定します。

## 概要

Prisma Postgres は、Prisma 向けに最適化された、サーバーレスで管理された PostgreSQL のデータベースです。

## CLI で準備する

CLI から直接、Prisma Postgres のインスタンスを用意できます。

```bash
prisma init --db
```

このコマンドは次のことをします。
1. Prisma Data Platform にログインする。
2. 新しいプロジェクトとデータベースのインスタンスを作る。
3. `.env` を接続文字列で更新する。

## 接続文字列

Prisma CLI の流れや Accelerate のような使い方では、`prisma+postgres://` の URL を見かけることがあります。

Node.js でドライバーアダプターと一緒に Prisma Client を使うときは、Prisma Postgres のダッシュボードにある、TCP で直接つなぐ接続文字列を使うのがおすすめです。

```env
DATABASE_URL="postgres://identifier:key@db.prisma.io:5432/postgres?sslmode=require"
```

## 1. スキーマの設定

`prisma/schema.prisma` に書きます。

```prisma
datasource db {
  provider = "postgresql" // postgresql のプロバイダーを使う
}

generator client {
  provider = "prisma-client"
  output   = "../generated"
}
```

## 2. 設定ファイルの設定

`prisma.config.ts` に書きます。

```typescript
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## ドライバーアダプター

標準の SQL の流れでは、Prisma Postgres でもドライバーアダプターを使います。

### ふつうの Node.js のアプリにおすすめの方法

1. アダプターとドライバーをインストールする：
   ```bash
   npm install @prisma/adapter-pg pg
   ```

2. Prisma Console にある、TCP で直接つなぐ接続文字列を使う：
   ```typescript
   import 'dotenv/config'
   import { PrismaClient } from '../generated/client'
   import { PrismaPg } from '@prisma/adapter-pg'

   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
   const prisma = new PrismaClient({ adapter })
   ```

`PrismaPg` は、接続文字列を直接受け取ることもできます。

```typescript
const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })
```

PostgreSQL のプリペアドステートメントの名前の付け方を指定するには、2つ目の引数にアダプターのオプションを渡します。

```typescript
import { createHash } from 'node:crypto'

const adapter = new PrismaPg(process.env.DATABASE_URL!, {
  statementNameGenerator: ({ sql }) =>
    `prisma_${createHash('sha1').update(sql).digest('hex').slice(0, 16)}`,
})
```

### エッジ・サーバーレス向けの方法

Prisma Postgres のサーバーレスのドライバーは、Workers や Edge Functions のような環境で、HTTP や WebSocket での通信が必要なときだけ使ってください。

```bash
npm install @prisma/adapter-ppg @prisma/ppg
```

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaPostgresAdapter } from '@prisma/adapter-ppg'

const prisma = new PrismaClient({
  adapter: new PrismaPostgresAdapter({
    connectionString: process.env.PRISMA_DIRECT_TCP_URL,
  }),
})
```

このサーバーレスのドライバーは、HTTP や WebSocket を使うエッジ・サーバーレスのランタイム向けの特別な方法で、ふつうの Node.js のアプリに対するデフォルトのおすすめではありません。

## 機能

- **サーバーレス**：使っていないときはゼロまで縮小する。
- **キャッシュ**：クエリのキャッシュが組み込まれている（Accelerate）。
- **リアルタイム**：データベースのイベント（Pulse）。

## Prisma Client と一緒に使う

Prisma Client のインスタンスを作るときは、上の Prisma Postgres のアダプターを使ってください。
