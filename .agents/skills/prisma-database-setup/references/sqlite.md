# SQLite の準備

SQLite で Prisma を設定します。

## 前提条件

- なし（ファイルを使う）

## 1. スキーマの設定

`prisma/schema.prisma` に書きます。

```prisma
datasource db {
  provider = "sqlite"
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
DATABASE_URL="file:./dev.db"
```

### 接続文字列の形式

```
file:PATH
```

- **PATH**：データベースのファイルへの相対パス。アプリがどう解決するかを確かめたいときは、`prisma.config.ts` を確認してください。

## ドライバーアダプター

標準の SQL の流れでは、ドライバーアダプターを使います。

1. アダプターとドライバーをインストールする：
   ```bash
   npm install @prisma/adapter-better-sqlite3 better-sqlite3
   ```

2. アダプターを使って Prisma Client のインスタンスを作る：
   ```typescript
   import { PrismaClient } from '../generated/client'
   import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

   const adapter = new PrismaBetterSqlite3({
     url: process.env.DATABASE_URL ?? 'file:./dev.db',
   })

   const prisma = new PrismaClient({ adapter })
   ```

## ドライバーアダプターを使う（LibSQL / Turso）

エッジ環境との互換性や Turso のために使います。

1. インストールする：
   ```bash
   npm install @prisma/adapter-libsql @libsql/client
   ```

2. インスタンスを作る：
   ```typescript
   import { PrismaClient } from '../generated/client'
   import { PrismaLibSql } from '@prisma/adapter-libsql'

   const adapter = new PrismaLibSql({
     url: process.env.TURSO_DATABASE_URL,
     authToken: process.env.TURSO_AUTH_TOKEN,
   })
   const prisma = new PrismaClient({ adapter })
   ```

## 制限

- **enum がない**：SQLite は enum に対応していません（Prisma が代わりの仕組みで補うか、String として扱います）。
- **スカラーのリストがない**：`String[]` は直接は使えません。
- **同時実行**：書き込みの操作では、ファイルがロックされます。

## よくある問題

### "Database file not found"
`DATABASE_URL` のパスが、Prisma を実行している場所やスキーマファイルからの相対パスとして正しいことを確認してください。`file:./dev.db` なら、スキーマの横に作られます。
