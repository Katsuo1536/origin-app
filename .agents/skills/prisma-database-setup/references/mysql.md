# MySQL の準備

MySQL（または MariaDB）で Prisma を設定します。

## 前提条件

- MySQL か MariaDB のデータベース
- 接続文字列

## 1. スキーマの設定

`prisma/schema.prisma` に書きます。

```prisma
datasource db {
  provider = "mysql"
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
DATABASE_URL="mysql://user:password@localhost:3306/mydb"
```

### 接続文字列の形式

```
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

- **USER**：データベースのユーザー
- **PASSWORD**：パスワード
- **HOST**：ホスト名
- **PORT**：ポート（デフォルトは 3306）
- **DATABASE**：データベース名

## ドライバーアダプター

標準の SQL の流れでは、ドライバーアダプターを使います。

1. アダプターとドライバーをインストールする：
   ```bash
   npm install @prisma/adapter-mariadb mariadb
   ```

2. アダプターを使って Prisma Client のインスタンスを作る：
   ```typescript
   import 'dotenv/config'
   import { PrismaClient } from '../generated/client'
   import { PrismaMariaDb } from '@prisma/adapter-mariadb'

   const adapter = new PrismaMariaDb({
     host: 'localhost',
     port: 3306,
     connectionLimit: 5,
     user: process.env.MYSQL_USER,
     password: process.env.MYSQL_PASSWORD,
     database: process.env.MYSQL_DATABASE,
   })

   const prisma = new PrismaClient({ adapter })
   ```

### テキストプロトコルのオプション

デフォルトのバイナリの `execute()` の経路ではなく、MariaDB のドライバーのテキストプロトコルが必要なときは、`useTextProtocol` を明示して有効にします。

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!, {
  useTextProtocol: true,
})

const prisma = new PrismaClient({ adapter })
```

使っている MariaDB の構成で、どうしてもテキストプロトコルとの互換性が必要なときだけ使ってください。

## PlanetScale の準備

PlanetScale は MySQL を使いますが、外部キー制約に対応していないので、専用の設定が必要です。

`prisma/schema.prisma` に書きます。

```prisma
datasource db {
  provider     = "mysql"
  relationMode = "prisma" // 外部キーを Prisma の側で再現する
}
```

## よくある問題

### "Too many connections"
MySQL には接続数の上限があります。URL でコネクションプールの大きさを調整します。
```env
DATABASE_URL="mysql://...?connection_limit=5"
```

### JSON への対応
MySQL 5.7 以上は JSON に対応しています。MariaDB 10.2 以上も JSON に対応しています（チェック制約付きの LONGTEXT の別名として）。Prisma はこれを扱えますが、使っているバージョンを確認してください。
