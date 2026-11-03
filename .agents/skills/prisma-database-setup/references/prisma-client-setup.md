# Prisma Client の準備

Prisma の標準の SQL のプロバイダーの流れで、Prisma Client を生成してインスタンスを作ります。MongoDB では、下の SQL のアダプターの例を写さずに、`references/mongodb.md` のプロバイダー専用の説明に従ってください。

## 1. 依存関係をインストールする

```bash
npm install prisma --save-dev
npm install @prisma/client
```

## 2. generator ブロックを追加する

`prisma/schema.prisma` に書きます。

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated"
}
```

`prisma-client` には `output` のパスの明示が必要で、デフォルトでは `node_modules` に生成しません。

## 3. Prisma Client を生成する

```bash
npx prisma generate
```

Client をスキーマと揃えておくために、スキーマを変えるたびに `prisma generate` をもう一度実行してください。

## 4. Prisma Client のインスタンスを作る

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
```

generator の `output` を変えたら、import のパスもそれに合わせて直してください。SQL のプロバイダーの流れでは、`PrismaPg` を使うデータベースのアダプターに置き換えます。

## 5. インスタンスは1つにする

`PrismaClient` のインスタンスは、それぞれコネクションプールを作ります。データベースの接続を使い切らないように、アプリのプロセスごとにインスタンスを1つだけ作って使い回してください。
