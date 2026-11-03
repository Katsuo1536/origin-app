# なくなった機能

Prisma v7 では、いくつかの機能がなくなりました。移行の方法を説明します。

## Client のミドルウェア

### なくなったもの

```typescript
// ❌ v7 ではもう動かない
prisma.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  console.log(`Query took ${after - before}ms`)
  return result
})
```

### 代わりに Client Extensions を使う

```typescript
// ✅ v7 での方法
const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const before = Date.now()
        const result = await query(args)
        const after = Date.now()
        console.log(`${model}.${operation} took ${after - before}ms`)
        return result
      },
    },
  },
})
```

### よくあるミドルウェアのパターン

#### 論理削除（ソフトデリート）

```typescript
const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    user: {
      async delete({ args, query }) {
        // 削除を論理削除に置き換える
        return prisma.user.update({
          where: args.where,
          data: { deletedAt: new Date() },
        })
      },
      async findMany({ args, query }) {
        // 論理削除されたレコードを除く
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
    },
  },
})
```

#### ログ

```typescript
const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        console.log(`${model}.${operation}`, JSON.stringify(args))
        return query(args)
      },
    },
  },
})
```

## メトリクス

### なくなったもの

メトリクスのプレビュー機能はなくなりました。

```typescript
// ❌ もう動かない
const metrics = await prisma.$metrics.json()
```

### 代わりの方法

#### 拡張機能で独自のカウンターを作る

```typescript
let totalQueries = 0

const prisma = new PrismaClient({ adapter }).$extends({
  client: {
    async $totalQueries() {
      return totalQueries
    },
  },
  query: {
    $allModels: {
      async $allOperations({ query, args }) {
        totalQueries += 1
        return query(args)
      },
    },
  },
})

// 使い方
const count = await prisma.$totalQueries()
```

#### ドライバーのメトリクスを使う

下にあるドライバーアダプターから、メトリクスを取得します。

## なくなった CLI のフラグ

### --skip-generate

`migrate dev` と `db push` からなくなりました。

```bash
# v6
prisma migrate dev --skip-generate

# v7 - generate は自動で実行されない
prisma migrate dev
prisma generate  # 必要なら明示的に実行する
```

Prisma `7.6.0` でローカルで確かめたところ、CLI のヘルプの一部には今も `migrate dev` が "trigger[s] generators"（ジェネレーターを実行する）と書かれているものの、`migrate dev` や `db push` で Client のファイルは生成されませんでした。

### --skip-seed

`migrate dev` からなくなりました。もっと大事なのは、Prisma v7 では `migrate dev` や `migrate reset` のときにシードが自動で実行されなくなったことです。必要なときは明示的にシードを実行してください。

```bash
# v6
prisma migrate dev --skip-seed

# v7 - シードは自動で実行されない
prisma migrate dev
prisma db seed  # 必要なら明示的に実行する
```

### db execute の --schema と --url

```bash
# v6
prisma db execute --file ./script.sql --url "$DATABASE_URL"

# v7 - prisma.config.ts で設定する
prisma db execute --file ./script.sql
```

## migrate diff のオプション

| なくなったもの | 置き換え |
|---------|-------------|
| `--from-url` | `--from-config-datasource` |
| `--to-url` | `--to-config-datasource` |
| `--from-schema-datasource` | `--from-config-datasource` |
| `--to-schema-datasource` | `--to-config-datasource` |
| `--shadow-database-url` | `prisma.config.ts` で設定する |

### 例

```bash
# v6
prisma migrate diff --from-url "$DATABASE_URL" --to-schema schema.prisma

# v7
prisma migrate diff --from-config-datasource --to-schema schema.prisma
```

## なくなった自動の動き

### migrate のあとの自動の生成

```bash
# v7 での作業の流れ
prisma migrate dev --name add_field
prisma generate  # 明示的に実行する必要がある
```

### migrate のあとの自動のシード

```bash
# v7 での作業の流れ
prisma migrate reset --force
prisma db seed  # 明示的に実行する必要がある
```

## Prisma.validator

`prisma-client` ジェネレーターには、`Prisma.validator` がなくなりました。代わりに TypeScript の `satisfies` 演算子を使ってください。

```typescript
import { Prisma } from '../generated/prisma/client'

const userSelect = {
  id: true,
  email: true,
} satisfies Prisma.UserSelect
```

## rejectOnNotFound

v5.0.0 でなくなりました（すでに非推奨だった）。

```typescript
// ❌ なくなった
const prisma = new PrismaClient({
  rejectOnNotFound: true,
})

// ✅ OrThrow のメソッドを使う
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 1 },
})

const user = await prisma.user.findFirstOrThrow({
  where: { email: 'test@example.com' },
})
```
