# Prisma の設定ファイル

Prisma v7 では、Prisma CLI の中心になる設定ファイルとして、`prisma.config.ts` が導入されました。

## 置き場所

`prisma.config.ts` は、プロジェクトのルート（`package.json` の横）に置きます。

## 基本の設定

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## 設定の項目

### schema

Prisma のスキーマファイルへのパス：

```typescript
schema: 'prisma/schema.prisma'
```

### datasource.url

データベースの接続 URL：

```typescript
datasource: {
  url: env('DATABASE_URL'),
}
```

### datasource.directUrl

直接つなぐ接続 URL（コネクションプーラーを通さない）：

```typescript
datasource: {
  url: env('DATABASE_URL'),
  directUrl: env('DIRECT_DATABASE_URL'),
}
```

### datasource.shadowDatabaseUrl

マイグレーションに使うシャドーデータベース：

```typescript
datasource: {
  url: env('DATABASE_URL'),
  shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
}
```

### migrations.path

マイグレーションのファイルのディレクトリ：

```typescript
migrations: {
  path: 'prisma/migrations',
}
```

### migrations.seed

`prisma db seed` で使うシードのコマンド：

```typescript
migrations: {
  path: 'prisma/migrations',
  seed: 'tsx prisma/seed.ts',
}
```

## すべてを使った例

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // スキーマの場所
  schema: 'prisma/schema.prisma',
  
  // マイグレーションの設定
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  
  // データベースの接続
  datasource: {
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_DATABASE_URL'),
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})
```

## 環境変数

### env() ヘルパー

環境変数を参照するには `env()` を使います。

```typescript
import { env } from 'prisma/config'

datasource: {
  url: env('DATABASE_URL'),
}
```

これで型の安全性は得られますが、.env ファイルは自動では読み込まれ**ません**。

### .env ファイルを読み込む

dotenv をインストールして import します。

```bash
npm install dotenv
```

```typescript
import 'dotenv/config'  // 最初の import にする必要がある
import { defineConfig, env } from 'prisma/config'
```

## v6 からの移行

### 変更前（v6）- schema.prisma

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 変更後（v7）- prisma.config.ts

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
  },
})
```

さらに schema.prisma を更新します。

```prisma
datasource db {
  provider = "postgresql"
  // URL は prisma.config.ts に移った
}
```

## 設定ファイルの場所を指定する

CLI のコマンドで `--config` フラグを使います。

```bash
prisma migrate dev --config ./config/prisma.config.ts
```

## モノレポの設定

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
import path from 'path'

export default defineConfig({
  schema: path.join(__dirname, 'packages/database/prisma/schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'packages/database/prisma/migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```
