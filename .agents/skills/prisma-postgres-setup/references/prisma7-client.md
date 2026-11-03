# Prisma 7 の Client のインスタンスの作り方

Prisma 7 では、PrismaClient がデータベースにつなぐ方法が変わりました。CLI（`prisma db push`、`prisma migrate`）は、URL を `prisma.config.ts` から読みます。しかし**実行時**には、PrismaClient にドライバーアダプターを明示して渡す必要があります。

## 必要なパッケージ

```bash
npm install @prisma/client @prisma/adapter-pg pg
```

- `@prisma/adapter-pg`：`pg` の PostgreSQL のドライバー用の、Prisma のアダプター
- `pg`：下で使われる、Node.js の PostgreSQL のドライバー

## 基本のインスタンスの作り方

```typescript
import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

## 大事なルール

1. **import のパス**：必ず `./generated/prisma/client.js` にする。`./generated/prisma` でも `@prisma/client` でもない。

2. **アダプターは必須**：引数なしの `new PrismaClient()` はエラーになる。`new PrismaClient({ datasourceUrl: '...' })` もエラーになる。`datasourceUrl` は Prisma 7 にはない。

3. **ESM が必要**：生成される Client は ESM を使う。`package.json` に `"type": "module"` があることを確認する。

4. **プールのライフサイクル**：終了するときは（`prisma.$disconnect()` のあとに）`await pool.end()` を呼ぶ。

## アプリのコードでの使い方

```typescript
import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// 作成する
const user = await prisma.user.create({
  data: { email: 'alice@example.com', name: 'Alice' },
})

// リレーションも含めて読み取る
const posts = await prisma.post.findMany({
  where: { published: true },
  include: { author: true },
})

// 更新する
await prisma.post.update({
  where: { id: 1 },
  data: { published: true },
})

// 削除する
await prisma.post.delete({ where: { id: 1 } })

// 後片付け
await prisma.$disconnect()
await pool.end()
```

## よくある間違い

| 間違い | エラー | 直し方 |
|---|---|---|
| `import { PrismaClient } from './generated/prisma'` | `Cannot find module` | `./generated/prisma/client.js` を使う |
| `new PrismaClient()` | `PrismaClient needs non-empty options` | `{ adapter }` を渡す |
| `new PrismaClient({ datasourceUrl: url })` | `Unknown property datasourceUrl` | 代わりにアダプターのパターンを使う |
| package.json に `"type": "module"` がない | ESM の import のエラー | `"type": "module"` を追加する |
| `import { PrismaClient } from '@prisma/client'` | 間違った export | `./generated/prisma/client.js` を使う |
