# SQL Server の準備

Microsoft SQL Server で Prisma を設定します。

## 前提条件

- SQL Server 2017、2019、2022、または Azure SQL
- TCP/IP が有効になっている

## 1. スキーマの設定

`prisma/schema.prisma` に書きます。

```prisma
datasource db {
  provider = "sqlserver"
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
DATABASE_URL="sqlserver://localhost:1433;database=mydb;user=sa;password=Password123;encrypt=true;trustServerCertificate=true"
```

### 接続文字列の形式

```
sqlserver://HOST:PORT;database=DB;user=USER;password=PASS;encrypt=true;trustServerCertificate=true
```

- **encrypt**：Azure では必須（true）。
- **trustServerCertificate**：自己署名の証明書（ローカルでの開発）では true。

## ドライバーアダプター

標準の SQL の流れでは、ドライバーアダプターを使います。

1. アダプターとドライバーをインストールする：
   ```bash
   npm install @prisma/adapter-mssql mssql
   ```

2. アダプターを使って Prisma Client のインスタンスを作る：
   ```typescript
   import 'dotenv/config'
   import { PrismaClient } from '../generated/client'
   import { PrismaMssql } from '@prisma/adapter-mssql'

   const adapter = new PrismaMssql({
     server: 'localhost',
     port: 1433,
     database: 'mydb',
     user: process.env.SQLSERVER_USER,
     password: process.env.SQLSERVER_PASSWORD,
     options: {
       encrypt: true,
       trustServerCertificate: true,
     },
   })

   const prisma = new PrismaClient({ adapter })
   ```

## よくある問題

### "Login failed for user"
- SQL Server の認証か Windows の認証かを確認する。Prisma は、ふつう SQL Server の認証（ユーザー名とパスワード）を使う。
- SQL Server Configuration Manager で TCP/IP が有効になっていることを確認する。

### "Table not found"（dbo スキーマ）
Prisma は、デフォルトで `dbo` スキーマを前提にしています。別のスキーマを使っているなら、モデルか接続文字列を直す必要があるかもしれません（元の文書でも疑問形で書かれています）。SQL Server のプロバイダーは、ほとんどの場合デフォルトのスキーマを使います。
