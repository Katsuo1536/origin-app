# PostgreSQL の準備

PostgreSQL で Prisma を設定します。

## 前提条件

- PostgreSQL のデータベース（ローカルまたはクラウド）
- 接続文字列

## 1. スキーマの設定

`prisma/schema.prisma` に書きます。

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output   = "../generated"
}
```

## 2. 設定ファイルの設定

`prisma.config.ts` に書きます。

```typescript
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## 3. 環境変数

`.env` に書きます。

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

### 接続文字列の形式

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

- **USER**：データベースのユーザー
- **PASSWORD**：パスワード（特殊文字があれば URL エンコードする）
- **HOST**：ホスト名（localhost、IP アドレス、ドメイン）
- **PORT**：ポート（デフォルトは 5432）
- **DATABASE**：データベース名
- **SCHEMA**：スキーマ名（デフォルトは `public`）

## ドライバーアダプター

標準の SQL の流れでは、ドライバーアダプターを使います。

1. アダプターとドライバーをインストールする：
   ```bash
   npm install @prisma/adapter-pg pg
   ```

2. アダプターを使って Prisma Client のインスタンスを作る：
   ```typescript
   import 'dotenv/config'
   import { PrismaClient } from '../generated/client'
   import { PrismaPg } from '@prisma/adapter-pg'

   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
   const prisma = new PrismaClient({ adapter })
   ```

## よくある問題

### "Can't reach database server"
- ホストとポートを確認する
- ファイアウォールの設定を確認する
- データベースが動いていることを確認する

### "Authentication failed"
- ユーザーとパスワードを確認する
- パスワードの特殊文字は URL エンコードする必要がある

### "Schema does not exist"
- URL に `?schema=public`（または使っているスキーマ）が入っていることを確認する
