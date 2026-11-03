# 生のクエリ

Prisma のクエリ API で足りないときに、生の SQL を実行します。

## $queryRaw

SELECT のクエリを実行して、型付きの結果を受け取ります。

```typescript
const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE email LIKE ${'%@prisma.io'}
`
```

### 型を付ける

```typescript
type User = { id: number; email: string; name: string | null }

const users = await prisma.$queryRaw<User[]>`
  SELECT id, email, name FROM "User" WHERE role = ${'ADMIN'}
`
```

### テーブル名・列名を動的にする

識別子には `Prisma.raw()` を使います（ユーザーの入力に使うのは危険です）。

```typescript
import { Prisma } from '../generated/client'

const column = 'email'
const users = await prisma.$queryRaw`
  SELECT ${Prisma.raw(column)} FROM "User"
`
```

### Prisma.sql を使う

クエリを動的に組み立てます。

```typescript
import { Prisma } from '../generated/client'

const email = 'alice@prisma.io'
const query = Prisma.sql`SELECT * FROM "User" WHERE email = ${email}`
const users = await prisma.$queryRaw(query)
```

### 複数の SQL の部品をつなげる

```typescript
import { Prisma } from '../generated/client'

const conditions = [
  Prisma.sql`role = ${'ADMIN'}`,
  Prisma.sql`verified = ${true}`
]

const users = await prisma.$queryRaw`
  SELECT * FROM "User" 
  WHERE ${Prisma.join(conditions, ' AND ')}
`
```

## $executeRaw

INSERT、UPDATE、DELETE を実行します（影響した件数を返します）。

```typescript
const count = await prisma.$executeRaw`
  UPDATE "User" SET verified = true WHERE email LIKE ${'%@prisma.io'}
`
console.log(`Updated ${count} users`)
```

### 削除の例

```typescript
const deleted = await prisma.$executeRaw`
  DELETE FROM "User" WHERE "deletedAt" < ${thirtyDaysAgo}
`
```

### 追加の例

```typescript
const inserted = await prisma.$executeRaw`
  INSERT INTO "Log" (message, level, timestamp)
  VALUES (${message}, ${level}, ${new Date()})
`
```

## $queryRawUnsafe / $executeRawUnsafe

完全に動的なクエリ向けです（注意して使ってください！）。

```typescript
// ⚠️ SQL インジェクションの危険あり。信頼できる入力だけに使う
const table = 'User'
const users = await prisma.$queryRawUnsafe(
  `SELECT * FROM "${table}" WHERE id = $1`,
  userId
)
```

### パラメーターを使った unsafe のクエリ

```typescript
const result = await prisma.$executeRawUnsafe(
  'UPDATE "User" SET name = $1 WHERE id = $2',
  'Alice',
  1
)
```

## SQL インジェクションを防ぐ

### 安全（パラメーター化）

```typescript
// ✅ ユーザーの入力はパラメーターとして渡される
const email = userInput
const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE email = ${email}
`
```

### 危険（文字列の連結）

```typescript
// ❌ SQL インジェクションの脆弱性あり！
const email = userInput
const users = await prisma.$queryRawUnsafe(
  `SELECT * FROM "User" WHERE email = '${email}'`
)
```

## データベースごとの機能

### PostgreSQL

```typescript
// 配列の操作
const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE 'admin' = ANY(roles)
`

// JSON の操作
const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE metadata->>'theme' = 'dark'
`
```

### MySQL

```typescript
// 全文検索
const posts = await prisma.$queryRaw`
  SELECT * FROM Post WHERE MATCH(title, content) AGAINST(${searchTerm})
`
```

## 生のクエリでトランザクションを使う

```typescript
await prisma.$transaction(async (tx) => {
  await tx.$executeRaw`UPDATE "Account" SET balance = balance - ${amount} WHERE id = ${senderId}`
  await tx.$executeRaw`UPDATE "Account" SET balance = balance + ${amount} WHERE id = ${recipientId}`
})
```

## 結果の扱い

### BigInt の扱い

PostgreSQL は、COUNT の結果を BigInt で返します。

```typescript
const result = await prisma.$queryRaw<[{ count: bigint }]>`
  SELECT COUNT(*) as count FROM "User"
`
const count = Number(result[0].count)
```

### 日付の扱い

```typescript
type Result = { createdAt: Date }
const users = await prisma.$queryRaw<Result[]>`
  SELECT "createdAt" FROM "User"
`
// createdAt はすでに Date オブジェクトになっている
```

生のクエリに渡した JavaScript の `Date` が不正な値だと、黙って `null` に変換されるのではなく、検証でエラーになります。日付の入力はアプリの入り口で検証し、`new Date(badValue)` がそのままデータベースに届くことを当てにしないでください。

ドライバーアダプターが、対応付けられていないデータベース固有のエラーを返したときは、Prisma はアダプターが保持していた元のコードとメッセージ付きで `P2039` を返します。その情報が欠けている場合は、表示されたエラーの文を解析するのではなく、アダプターの対応付けを直してください。
