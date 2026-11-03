# Prisma Accelerate の利用者

Prisma Accelerate や、`prisma://`・`prisma+postgres://` の URL で Prisma Postgres を使っている人向けの、特別な移行の手順です。

## 大事なこと

**Accelerate の URL を、ドライバーアダプターに渡さないでください。**

（`PrismaPg` のような）ドライバーアダプターは、データベースに直接つなぐ接続文字列を前提にしています。`prisma://` や `prisma+postgres://` の URL では失敗します。

## Accelerate での正しい v7 の構成

### 1. Accelerate の URL はそのままにする

```env
# .env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
# または
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."
```

### 2. Accelerate の拡張機能をインストールする

```bash
npm install @prisma/extension-accelerate
```

### 3. prisma.config.ts を設定する

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),  // ここでは Accelerate の URL が使える
  },
})
```

### 4. accelerateUrl を使って Client のインスタンスを作る

```typescript
import { PrismaClient } from '../generated/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// adapter の代わりに accelerateUrl を使う
export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate())
```

## してはいけないこと

```typescript
// ❌ 間違い - Accelerate の URL でアダプターを使わない
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL  // prisma:// では失敗する
})
```

## Accelerate でのマイグレーション

マイグレーションには、データベースへの直接の接続が必要になることがあります。

### 方法1：すべてに Accelerate の URL を使う

Accelerate の URL は、Prisma CLI のコマンドで使えます。

```bash
# Accelerate の URL で動く
prisma migrate deploy
prisma db push
```

### 方法2：マイグレーションには直接つなぐ URL を使う

```env
DATABASE_URL="prisma+postgres://..."  # アプリ用
DIRECT_DATABASE_URL="postgresql://..."  # マイグレーション用
```

```typescript
// prisma.config.ts
export default defineConfig({
  datasource: {
    url: env('DIRECT_DATABASE_URL'),  // CLI 用の直接つなぐ URL
  },
})
```

## Prisma Postgres（クラウド）

Prisma Postgres のクラウドのデータベースを使っている場合：

### 同じ方法

```typescript
import { PrismaClient } from '../generated/client'
import { withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,  // prisma+postgres:// の URL
}).$extends(withAccelerate())
```

## Accelerate をやめる

あとで TCP での直接の接続に切り替える場合：

```typescript
// accelerateUrl から adapter に変える
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL  // 直接つなぐ postgres:// の URL
})

export const prisma = new PrismaClient({ adapter })
```

## Accelerate でのキャッシュ

この拡張機能で、キャッシュが使えるようになります。

```typescript
const users = await prisma.user.findMany({
  cacheStrategy: {
    ttl: 60,  // 60秒キャッシュする
    swr: 120, // 120秒の stale-while-revalidate（古いデータを返しつつ裏で更新する）
  },
})
```

## エッジのランタイム

Accelerate は、エッジのランタイムでよく動きます。

```typescript
// Vercel Edge、Cloudflare Workers などで動く
import { PrismaClient } from '../generated/client'
import { withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate())
```
