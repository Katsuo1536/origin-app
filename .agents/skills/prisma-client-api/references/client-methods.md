# Client のメソッド

Prisma Client のインスタンスのメソッドです。

## $connect()

データベースに明示的に接続します。

```typescript
const prisma = new PrismaClient({ adapter })

// 明示的に接続する
await prisma.$connect()
```

### 使う場面

ふつうは必要ありません。Prisma は最初のクエリで自動的に接続します。次のようなときに使います。
- 起動時に、接続できなければすぐに失敗させたい
- ヘルスチェック
- 接続を前もって温めておく

```typescript
async function main() {
  try {
    await prisma.$connect()
    console.log('Database connected')
  } catch (e) {
    console.error('Failed to connect:', e)
    process.exit(1)
  }
}
```

## $disconnect()

データベースとの接続を閉じます。

```typescript
await prisma.$disconnect()
```

### きれいに終了する

```typescript
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// または SIGTERM で
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
```

### テストで使う

```typescript
afterAll(async () => {
  await prisma.$disconnect()
})
```

## $on()

イベントを受け取ります。

### クエリのイベント

```typescript
const prisma = new PrismaClient({
  adapter,
  log: [{ level: 'query', emit: 'event' }]
})

prisma.$on('query', (e) => {
  console.log('Query:', e.query)
  console.log('Params:', e.params)
  console.log('Duration:', e.duration, 'ms')
})
```

### ログのイベント

```typescript
const prisma = new PrismaClient({
  adapter,
  log: [
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' }
  ]
})

prisma.$on('info', (e) => console.log(e.message))
prisma.$on('warn', (e) => console.warn(e.message))
prisma.$on('error', (e) => console.error(e.message))
```

## $extends()

拡張を追加して、独自の動きを加えます。

### 独自のメソッドを追加する

```typescript
const prisma = new PrismaClient({ adapter }).$extends({
  client: {
    $log: (message: string) => console.log(message)
  }
})

prisma.$log('Hello!')
```

### モデルにメソッドを追加する

```typescript
const prisma = new PrismaClient({ adapter }).$extends({
  model: {
    user: {
      async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } })
      }
    }
  }
})

const user = await prisma.user.findByEmail('alice@prisma.io')
```

### クエリの拡張

```typescript
const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    user: {
      async findMany({ args, query }) {
        // デフォルトの絞り込みを追加する
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      }
    }
  }
})
```

### 結果の拡張

```typescript
const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`
        }
      }
    }
  }
})

const user = await prisma.user.findFirst()
console.log(user.fullName) // 計算で求めたフィールド
```

### 拡張をつなげる

```typescript
const prisma = new PrismaClient({ adapter })
  .$extends(loggingExtension)
  .$extends(softDeleteExtension)
  .$extends(computedFieldsExtension)
```

## $transaction()

詳しくは `transactions.md` を見てください。

## $queryRaw() / $executeRaw()

詳しくは `raw-queries.md` を見てください。

## 型のユーティリティ

### Prisma 名前空間

```typescript
import { Prisma } from '../generated/client'

// 入力の型
type UserCreateInput = Prisma.UserCreateInput
type UserWhereInput = Prisma.UserWhereInput

// 出力の型
type User = Prisma.UserGetPayload<{}>
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>
```

### satisfies を使った型安全なクエリの部品

型安全なクエリの部品：

```typescript
import { Prisma } from '../generated/client'

const userSelect = {
  id: true,
  email: true,
  name: true
} satisfies Prisma.UserSelect

const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: userSelect
})
```

`prisma-client` ジェネレーターでは、型付きのクエリの部品に TypeScript の `satisfies` を使います。`prisma-client-js` で `Prisma.validator()` を使う古い例を見かけることもあります。
