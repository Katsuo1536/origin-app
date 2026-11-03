# CockroachDB の準備

CockroachDB で Prisma を設定します。

## 前提条件

- CockroachDB のクラスター

## 1. スキーマの設定

`prisma/schema.prisma` に書きます。

```prisma
datasource db {
  provider = "cockroachdb"
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

## 3. 環境変数

`.env` に書きます。

```env
DATABASE_URL="postgresql://user:password@host:26257/db?sslmode=verify-full"
```

注意：CockroachDB は PostgreSQL の通信プロトコルを使うので、URL は postgresql のように見えることがよくあります。ただし、CRDB 固有の機能を正しく扱うために、スキーマのプロバイダーは**必ず** `cockroachdb` にしてください。

## ドライバーアダプター

標準の SQL の流れでは、ドライバーアダプターを使います。CockroachDB は PostgreSQL と互換性があるので、PostgreSQL のアダプターを使います。

1. アダプターとドライバーをインストールする：
   ```bash
   npm install @prisma/adapter-pg pg
   ```

2. アダプターを使って Prisma Client のインスタンスを作る：
   ```typescript
   import 'dotenv/config'
   import { PrismaClient } from '../generated/client'
   import { PrismaPg } from '@prisma/adapter-pg'

   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
   const prisma = new PrismaClient({ adapter })
   ```

## ID の生成

CockroachDB では、ID に `BigInt` や `UUID` を使うと効率的です。

```prisma
model User {
  id BigInt @id @default(autoincrement()) // unique_rowid() を使う
}
```

文字列の UUID を使う場合：

```prisma
model User {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
}
```

## よくある問題

### スキーマの取り込み（イントロスペクション）
`db pull` のときに型が正しく対応付けられるように、必ず `provider = "cockroachdb"` を使ってください。
