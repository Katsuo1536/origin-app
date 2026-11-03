# ドライバーアダプター

Prisma v7 では、SQL のデータベースへの接続にドライバーアダプターが必須です。これが、今の Prisma のリリースでの標準の SQL の実行の流れです。

MongoDB は、この流れに従わないでください。MongoDB 用の `@prisma/adapter-*` パッケージは公開されていません。MongoDB のプロジェクトは、Prisma 7 の SQL のアダプターの仕組みに無理に合わせようとせず、最新の Prisma 6.x のリリースのままにしてください。

## なぜドライバーアダプターなのか

- Prisma Client の SQL の流れに、ネイティブのエンジンのバイナリがない
- バンドルのサイズが小さい
- サーバーレスやエッジ環境との互換性が高い
- Node.js のふつうのデータベースのドライバーを使う
- コネクションプールを細かく制御できる

## 使えるアダプター

| データベース | アダプターのパッケージ | 下で使うドライバー |
|----------|-----------------|-------------------|
| PostgreSQL | `@prisma/adapter-pg` | `pg` |
| MySQL / MariaDB | `@prisma/adapter-mariadb` | `mariadb` |
| SQLite | `@prisma/adapter-better-sqlite3` | `better-sqlite3` |
| Prisma Postgres (Node.js) | `@prisma/adapter-pg` | `pg` |
| Prisma Postgres (edge/serverless) | `@prisma/adapter-ppg` | `@prisma/ppg` |
| SQL Server | `@prisma/adapter-mssql` | `mssql` |
| Neon | `@prisma/adapter-neon` | `@neondatabase/serverless` |
| PlanetScale | `@prisma/adapter-planetscale` | `@planetscale/database` |
| Turso/libSQL | `@prisma/adapter-libsql` | `@libsql/client` |
| D1 (Cloudflare) | `@prisma/adapter-d1` | Cloudflare D1 |

## インストール

### PostgreSQL

```bash
npm install @prisma/adapter-pg
```

### MySQL

```bash
npm install @prisma/adapter-mariadb mariadb
```

### SQLite

```bash
npm install @prisma/adapter-better-sqlite3
```

### Prisma Postgres

```bash
npm install @prisma/adapter-pg pg
```

### SQL Server

```bash
npm install @prisma/adapter-mssql mssql
```

## 設定

### PostgreSQL

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })
```

### MySQL

```typescript
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

### SQLite

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })
```

### Neon（サーバーレスの PostgreSQL）

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })
```

### Prisma Postgres

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })
```

### Prisma Postgres のサーバーレスのドライバー

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaPostgresAdapter } from '@prisma/adapter-ppg'

const prisma = new PrismaClient({
  adapter: new PrismaPostgresAdapter({
    connectionString: process.env.PRISMA_DIRECT_TCP_URL,
  }),
})
```

### SQL Server

```typescript
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

## コネクションプールの設定

ドライバーアダプターは、下にあるドライバーのプールの設定を使います。これは v6 のデフォルトとは違います。

### プールを独自に設定した PostgreSQL

```typescript
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // プールの設定
  max: 10,                    // 最大の接続数
  idleTimeoutMillis: 30000,   // 使われていない接続を30秒後に閉じる
  connectionTimeoutMillis: 5000, // 接続のタイムアウト（v6 のデフォルトは5秒だった）
})
```

### v6 の動きに合わせる

```typescript
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,  // v6 は5秒のタイムアウトを使っていた
})
```

## SSL の設定

### 自己署名の証明書を受け入れる

```typescript
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // 自己署名の証明書を受け入れる
  }
})
```

### 正しい SSL の設定

```typescript
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: fs.readFileSync('/path/to/ca-cert.pem'),
    rejectUnauthorized: true
  }
})
```

## v6 からの移行

### 変更前（v6）

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
})
```

### 変更後（v7）

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })
```

## シングルトンのパターン

```typescript
// lib/prisma.ts
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```
