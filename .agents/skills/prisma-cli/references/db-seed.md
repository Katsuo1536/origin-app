# prisma db seed

シードスクリプトを実行して、データベースにデータを入れます。

## コマンド

```bash
prisma db seed [options]
```

## できること

- 設定したシードスクリプトを実行する
- 初期データやテスト用のデータをデータベースに入れる
- 単独で実行する（v7では、マイグレーションのときに自動では実行されない）

## オプション

| オプション | 説明 |
|--------|-------------|
| `--config` | Prismaの設定ファイルの場所を指定する |
| `--` | シードスクリプトに好きな引数を渡す |

## 設定

`prisma.config.ts` でシードスクリプトを設定します。

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',  // シードを実行するコマンド
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### よく使うシードコマンド

```typescript
// TypeScript（tsx を使う場合）
seed: 'tsx prisma/seed.ts'

// TypeScript（ts-node を使う場合）
seed: 'ts-node prisma/seed.ts'

// JavaScript
seed: 'node prisma/seed.js'
```

## シードスクリプトの例

```typescript
// prisma/seed.ts
import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()

async function main() {
  // ユーザーを作成する
  const alice = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      name: 'Alice',
      posts: {
        create: {
          title: 'Hello World',
          published: true,
        },
      },
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      name: 'Bob',
    },
  })

  console.log({ alice, bob })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

## 使用例

### シードを実行する

```bash
prisma db seed
```

### 引数を渡して実行する

```bash
prisma db seed -- --environment development
```

`--` のあとに書いた引数が、シードスクリプトに渡されます。

## 今の進め方

シードデータが必要なときは、マイグレーションのあとに自分で実行します。

```bash
prisma migrate dev --name init
prisma generate
prisma db seed  # 自分で実行する必要がある
```

## 何度実行しても同じ結果になるシード

`upsert` を使うと、シードを何回でも実行し直せます。

```typescript
// 良い例：何回実行しても大丈夫
await prisma.user.upsert({
  where: { email: 'alice@prisma.io' },
  update: {},  // すでにあるデータは変えない
  create: { email: 'alice@prisma.io', name: 'Alice' },
})

// 悪い例：2回目の実行で失敗する
await prisma.user.create({
  data: { email: 'alice@prisma.io', name: 'Alice' },
})
```

## よくある使い方

### 開発中のリセット

```bash
prisma migrate reset --force
prisma db seed
```

### 条件つきのシード

```typescript
// prisma/seed.ts
const count = await prisma.user.count()
if (count === 0) {
  // 空のときだけシードする
  await seedUsers()
}
```

### 環境ごとにシードを分ける

```typescript
// prisma/seed.ts
const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
  await seedDevData()
} else if (env === 'test') {
  await seedTestData()
}
```

## おすすめのやり方

1. 何度実行しても同じ結果になるよう、`upsert` を使う
2. シードは目的をしぼって、必要最小限にする
3. 本物らしいけれど架空のデータを使う
4. どんなシードデータが必要かを書き残しておく
5. シードスクリプトもGitで管理する