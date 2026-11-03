# スキーマの変更

Prisma v7 では、`prisma-client` がデフォルトのジェネレーターになりました。それに合わせて、generator ブロック、出力先のパス、import を更新します。

このガイドは、実際に Prisma 7 に移行するプロジェクト向けです。これらのスキーマの変更を MongoDB のプロジェクトに当てはめないでください。MongoDB のプロジェクトは Prisma 6.x のままにします。

## generator ブロック（v7）

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

## 主な変更

### 1. プロバイダー名

Prisma v7 では `prisma-client` を使います。以前の構成のために、古い `prisma-client-js` ジェネレーターもリポジトリに残っていますが、今のプロジェクトでは `prisma-client` がデフォルトの道です。

### 2. output が必須

`prisma-client` を使うときは、`output` の項目が必須です。このジェネレーターでは、Prisma Client は `node_modules` に生成されなくなりました。

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

### 3. engineType が変わった

以前の Rust のエンジンの設定はなくなりました。`prisma-client` で明示したいときの値は `engineType = "client"` ですが、ふつうは推測されるので省略できます。

```prisma
generator client {
  provider   = "prisma-client"
  output     = "../generated/prisma"
  engineType = "client"
}
```

### 4. 必要なら moduleFormat を明示する

CommonJS のままにする必要があるなら：

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../generated/prisma"
  moduleFormat = "cjs"
}
```

## 出力先のパスの例

### ふつうのプロジェクト

```prisma
output = "../generated/prisma"
```

次のようなファイルが作られます。

```text
generated/prisma/
  client.ts
  browser.ts
  enums.ts
  models.ts
  models/
```

### モノレポ

```prisma
output = "../../packages/database/generated/prisma"
```

### スキーマと同じディレクトリ

```prisma
output = "./generated/prisma"
```

作られるファイル：`prisma/generated/prisma/client.ts`

## datasource ブロック

Prisma v7 では、`datasource` ブロックの `url`、`directUrl`、`shadowDatabaseUrl` の項目は非推奨です。これらを `prisma.config.ts` に移し、`schema.prisma` にはプロバイダーだけを残します。

```prisma
datasource db {
  provider = "postgresql"
}
```

```typescript
export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})
```

## スキーマを変えたあと

1. `prisma generate` を実行する：
   ```bash
   npx prisma generate
   ```

2. コード全体の import を更新する：
   ```typescript
   import { PrismaClient } from '../generated/prisma/client'
   ```

3. 手で管理しているなら、`.gitignore` を更新する：
   ```
   /generated/prisma
   ```

4. `prisma-client` を使うときは、`Prisma.validator()` を TypeScript の `satisfies` に置き換える：
   ```typescript
   import { Prisma } from '../generated/prisma/client'

   const userSelect = {
     id: true,
     email: true,
   } satisfies Prisma.UserSelect
   ```

## 生成される入り口（エントリーポイント）

- `client` - サーバー側の Prisma Client と Prisma の名前空間
- `browser` - 本物の `PrismaClient` を含まない、ブラウザーで使っても安全な型と enum
- `enums` - enum だけの軽い入り口
- `models` - モデルの型と、そこから作られる補助の型

## プレビュー機能

プレビュー機能は、これまでどおり使えます。

```prisma
generator client {
  provider        = "prisma-client"
  output          = "../generated/prisma"
  previewFeatures = ["relationJoins", "fullTextSearch"]
}
```

最近のプレビュー機能の例には、PostgreSQL、SQLite、SQL Server、CockroachDB 向けの `partialIndexes` もあります。

```prisma
generator client {
  provider        = "prisma-client"
  output          = "../generated/prisma"
  previewFeatures = ["partialIndexes"]
}
```
