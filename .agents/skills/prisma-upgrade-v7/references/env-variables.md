# 環境変数

Prisma v7 は、環境変数を自動で読み込まなくなりました。明示的に読み込む必要があります。

## 変更点

### v6 の動き

Prisma CLI が、`.env` ファイルを自動で読み込んでいました。

### v7 の動き

`dotenv` などを使って、環境変数を手で読み込む必要があります。

## 準備

### 1. dotenv をインストールする

```bash
npm install dotenv
```

### 2. prisma.config.ts で import する

```typescript
import 'dotenv/config'  // 最初の import にする必要がある
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## Bun の利用者

Bun は `.env` ファイルを自動で読み込みます。追加の準備は必要ありません。

```typescript
// prisma.config.ts (Bun)
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## 複数の .env ファイル

### dotenv-cli を使う

```bash
npm install -D dotenv-cli
```

```json
{
  "scripts": {
    "db:migrate": "dotenv -e .env.local -- prisma migrate dev",
    "db:push": "dotenv -e .env.development -- prisma db push"
  }
}
```

### パスを指定して dotenv を使う

```typescript
// prisma.config.ts
import { config } from 'dotenv'
import path from 'path'

// 特定の .env ファイルを読み込む
config({ path: path.join(__dirname, '.env.local') })

import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## アプリのコード

アプリでは、起動するときに環境変数を読み込みます。

### 入り口（エントリーポイント）

```typescript
// index.ts
import 'dotenv/config'

import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

const prisma = new PrismaClient({ adapter })
```

### または、dotenv を明示的に使う

```typescript
import { config } from 'dotenv'
config()

// これで process.env.DATABASE_URL が使える
```

## なくなった環境変数

次の Prisma 専用の環境変数は、v7 でなくなりました。

| なくなった変数 | 代わり |
|-----------------|-------------|
| `PRISMA_CLI_QUERY_ENGINE_TYPE` | 不要（エンジンがない） |
| `PRISMA_CLIENT_ENGINE_TYPE` | 不要（エンジンがない） |
| `PRISMA_QUERY_ENGINE_BINARY` | 不要 |
| `PRISMA_QUERY_ENGINE_LIBRARY` | 不要 |
| `PRISMA_GENERATE_SKIP_AUTOINSTALL` | 不要 |
| `PRISMA_SKIP_POSTINSTALL_GENERATE` | 不要 |
| `PRISMA_GENERATE_IN_POSTINSTALL` | 不要 |
| `PRISMA_GENERATE_DATAPROXY` | ドライバーアダプターを使う `prisma-client` に移行する |
| `PRISMA_GENERATE_NO_ENGINE` | ドライバーアダプターを使う `prisma-client` に移行する |
| `PRISMA_CLIENT_NO_RETRY` | アダプターで設定する |
| `PRISMA_MIGRATE_SKIP_GENERATE` | 不要（自動の生成がなくなった） |
| `PRISMA_MIGRATE_SKIP_SEED` | 不要（自動のシードがなくなった） |

## TypeScript の env() ヘルパー

`prisma/config` の `env()` 関数で、型の安全性が得られます。

```typescript
import { env } from 'prisma/config'

// 型安全な環境変数へのアクセス
const url = env('DATABASE_URL')  // string
```

注意：これが使えるのは `prisma.config.ts` の中だけで、アプリのコードでは使えません。

## CI/CD での注意

CI の環境で、環境変数が設定されていることを確認してください。

```yaml
# GitHub Actions
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

steps:
  - run: npx prisma migrate deploy
```

変数を直接設定しているなら、CI では dotenv は必要ありません。
