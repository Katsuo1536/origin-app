---
name: prisma-database-setup
description: いろいろなデータベースのプロバイダー（PostgreSQL、MySQL、SQLite、MongoDB など）で Prisma を設定するためのガイド。新しいプロジェクトの準備、データベースの変更、接続の問題の調査のときに使う。"configure postgres"、"connect to mysql"、"setup mongodb"、"sqlite setup" で起動する。
license: MIT
metadata:
  author: prisma
  version: "7.6.0"
---

# Prisma のデータベースの準備

いろいろなデータベースのプロバイダーで Prisma ORM を設定するための、まとまったガイドです。

## 使う場面

次のようなときに、このスキルを参照します。
- 新しい Prisma プロジェクトを初期化する
- データベースのプロバイダーを切り替える
- 接続文字列と環境変数を設定する
- データベースの接続の問題を調べる
- データベースに固有の機能を準備する
- Prisma Client を生成してインスタンスを作る

## 優先度別のルールの分類

| 優先度 | 分類 | 影響 | 接頭辞 |
|----------|----------|--------|--------|
| 1 | プロバイダーごとのガイド | 最重要 | プロバイダー名 |
| 2 | Prisma Postgres | 高 | `prisma-postgres` |
| 3 | Client の準備 | 最重要 | `prisma-client-setup` |

## システムの前提条件

- **Node.js 20.19.0 以上**
- **TypeScript 5.4.0 以上**

## Bun ランタイム

Bun を使っている場合は、Prisma が Node.js にフォールバックせずに Bun ランタイムを使うように、Prisma CLI のコマンドを `bunx --bun prisma ...` で実行してください。

## 対応しているデータベース

| データベース | プロバイダーの文字列 | 注意 |
|----------|-----------------|-------|
| PostgreSQL | `postgresql` | デフォルト。すべての機能に対応 |
| MySQL | `mysql` | 幅広く対応。JSON に一部違いあり |
| SQLite | `sqlite` | ローカルのファイルを使う。enum やスカラーのリストはない |
| MongoDB | `mongodb` | MongoDB 専用の流れ。SQL のドライバーアダプターの説明は当てはめない |
| SQL Server | `sqlserver` | Microsoft の製品群 |
| CockroachDB | `cockroachdb` | 分散 SQL。Postgres と互換性あり |
| Prisma Postgres | `postgresql` | 管理されたサーバーレスのデータベース |

## 設定ファイル

設定の形は、プロバイダーと Prisma のメジャーバージョンによって変わります。

1. **すべてのプロバイダー**で、**`prisma/schema.prisma`** を使う。
2. **Prisma 7 の SQL の構成**では、ふつうデータソースの URL に **`prisma.config.ts`** を使う。
3. **MongoDB のプロジェクトは Prisma 6.x のまま**にし、スキーマに `url = env("DATABASE_URL")` を残して、これまでの MongoDB の構成を使い続ける。

## ドライバーアダプター

標準の SQL の流れでは、ドライバーアダプターを使います。データベースに合ったアダプターとドライバーを選び、アダプターを `PrismaClient` に渡します。

| データベース | アダプター | JS のドライバー |
|----------|---------|-----------|
| PostgreSQL | `@prisma/adapter-pg` | `pg` |
| CockroachDB | `@prisma/adapter-pg` | `pg` |
| Prisma Postgres (Node.js) | `@prisma/adapter-pg` | `pg` |
| Prisma Postgres (edge/serverless) | `@prisma/adapter-ppg` | `@prisma/ppg` |
| MySQL / MariaDB | `@prisma/adapter-mariadb` | `mariadb` |
| SQLite | `@prisma/adapter-better-sqlite3` | `better-sqlite3` |
| SQLite (Turso/LibSQL) | `@prisma/adapter-libsql` | `@libsql/client` |
| SQL Server | `@prisma/adapter-mssql` | `node-mssql` |

MongoDB は、Prisma 7 の SQL のアダプターの流れに従わないでください。MongoDB のプロジェクトには最新の Prisma 6.x のリリースを使い、SQL 用の `@prisma/adapter-*` パッケージを入れないでください。

例（PostgreSQL）：

```ts
import 'dotenv/config'
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
```

## Prisma Client の準備（必須）

どのデータベースでも、Prisma Client をインストールして生成する必要があります。

1. Prisma CLI と Prisma Client をインストールする：
   ```bash
   npm install prisma --save-dev
   npm install @prisma/client
   ```

1. generator ブロックを追加する（`prisma-client` には出力先のパスの明示が必要）：
   ```prisma
   generator client {
     provider = "prisma-client"
     output   = "../generated"
   }
   ```

1. Prisma Client を生成する：
   ```bash
   npx prisma generate
   ```

1. SQL のプロバイダーでは、データベースに合ったドライバーアダプターを使って Prisma Client のインスタンスを作る：
   ```typescript
   import { PrismaClient } from '../generated/client'
   import { PrismaPg } from '@prisma/adapter-pg'

   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
   const prisma = new PrismaClient({ adapter })
   ```

1. スキーマを変えるたびに、`prisma generate` をもう一度実行する。

## クイックリファレンス

### PostgreSQL
```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output   = "../generated"
}
```

### MySQL
```prisma
datasource db {
  provider = "mysql"
}

generator client {
  provider = "prisma-client"
  output   = "../generated"
}
```

### SQLite
```prisma
datasource db {
  provider = "sqlite"
}

generator client {
  provider = "prisma-client"
  output   = "../generated"
}
```

### MongoDB
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

MongoDB では、最新の Prisma 6.x のままにし、接続 URL は `schema.prisma` に残してください。MongoDB のプロジェクトを、Prisma 7 の SQL のアダプターの構成に移さないでください。MongoDB のプロジェクトで Prisma のバージョンアップについて聞かれたら、`prisma-mongodb-upgrade` スキルに回してください（実際に選ぶのは v6 のままにするか Prisma Next にするかで、Prisma 7 は選択肢にない）。

## ルールファイル

詳しい準備の手順は、それぞれのルールファイルを見てください。

```
references/postgresql.md
references/mysql.md
references/sqlite.md
references/mongodb.md
references/sqlserver.md
references/cockroachdb.md
references/prisma-postgres.md
references/prisma-client-setup.md
```

## 使い方

使うデータベースのプロバイダーのリファレンスファイルを選び、そのあと `references/prisma-client-setup.md` に沿って、Client の生成とアダプターの準備を終わらせます。MongoDB では、SQL のアダプターの例や Prisma 7 の設定のパターンを写さずに、`references/mongodb.md` を使ってください。
