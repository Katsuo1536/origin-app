# PrismaClient のコンストラクター

インスタンスを作るときに、Prisma Client を設定します。

## 基本の作り方

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })
```

## コンストラクターのオプション

### adapter（SQL のプロバイダーを使う場合は必須）

ドライバーアダプターのインスタンス：

```typescript
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })
```

### accelerateUrl（Accelerate を使う場合）

```typescript
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,  // prisma:// の URL
}).$extends(withAccelerate())
```

### log

ログを設定します。

```typescript
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
})
```

#### ログのレベル

| レベル | 説明 |
|-------|-------------|
| `query` | すべての SQL のクエリ |
| `info` | お知らせのメッセージ |
| `warn` | 警告 |
| `error` | エラー |

#### ログをイベントとして受け取る

```typescript
const prisma = new PrismaClient({
  adapter,
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
})

prisma.$on('query', (e) => {
  console.log('Query:', e.query)
  console.log('Duration:', e.duration, 'ms')
})
```

### errorFormat

エラーの表示の形式を決めます。

```typescript
const prisma = new PrismaClient({
  adapter,
  errorFormat: 'pretty',  // 'pretty' | 'colorless' | 'minimal'
})
```

### comments

監視、トレース、クエリの分析のために、SQL commenter プラグインを付けます。

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights'
import { queryTags, withQueryTags } from '@prisma/sqlcommenter-query-tags'
import { traceContext } from '@prisma/sqlcommenter-trace-context'

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
  comments: [prismaQueryInsights(), traceContext(), queryTags()],
})

await withQueryTags({ route: '/api/users', requestId: 'req-123' }, () =>
  prisma.user.findMany(),
)
```

`comments` は SQL のプロバイダーでだけ使います。クエリの呼び出し方を変えずに、トレースやクエリの形の情報を付け加えられる、すっきりした方法です。

### transactionOptions

トランザクションのデフォルトの設定です。

```typescript
const prisma = new PrismaClient({
  adapter,
  transactionOptions: {
    maxWait: 5000,      // トランザクションを始められるまで待つ最大時間（ミリ秒）
    timeout: 10000,     // トランザクションの最大の長さ（ミリ秒）
    isolationLevel: 'Serializable',
  },
})
```

### queryPlanCacheMaxSize

`queryPlanCacheMaxSize` で、メモリ上のクエリプランのキャッシュの大きさを制限します。

```typescript
const prisma = new PrismaClient({
  adapter,
  queryPlanCacheMaxSize: 2_000,
})
```

値は 0 以上の整数にします。`0` にするとクエリプランのキャッシュを使わなくなり、指定しなければ Prisma のデフォルトが使われます。これはプロセスごとのメモリと性能の調整で、データベースのプリペアドステートメントの設定ではありません。

## シングルトンの書き方

開発中に Client のインスタンスがいくつも作られるのを防ぎます。

```typescript
// lib/prisma.ts
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

## Next.js での書き方

```typescript
// lib/prisma.ts
import { PrismaClient } from '@/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const createAdapter = () => new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter: createAdapter() })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
```

## クエリのイベント

クエリのイベントを受け取ります。

```typescript
const prisma = new PrismaClient({
  adapter,
  log: [{ level: 'query', emit: 'event' }],
})

prisma.$on('query', (e) => {
  console.log('Query:', e.query)
  console.log('Params:', e.params)
  console.log('Duration:', e.duration)
})
```

## ログのイベント

```typescript
prisma.$on('info', (e) => console.log(e.message))
prisma.$on('warn', (e) => console.warn(e.message))
prisma.$on('error', (e) => console.error(e.message))
```
