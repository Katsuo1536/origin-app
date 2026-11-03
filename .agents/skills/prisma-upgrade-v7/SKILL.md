---
name: prisma-upgrade-v7
description: Prisma ORM v6 から v7 への、互換性のない変更をすべて扱う完全な移行ガイド。Prisma のバージョンを上げるとき、v7 のエラーが出たとき、既存のプロジェクトを移行するときに使う。"upgrade to prisma 7"、"prisma 7 migration"、"prisma-client generator"、"driver adapter required" で起動する。
license: MIT
metadata:
  author: prisma
  version: "7.6.0"
---

# Prisma ORM 7 へのバージョンアップ

Prisma ORM v6 から v7 へ移行するための完全なガイドです。このバージョンアップでは、新しい `prisma-client` ジェネレーター、ドライバーアダプター、`prisma.config.ts`、環境変数の明示的な読み込み、生成される Client の入り口（エントリーポイント）について、大きな互換性のない変更が入ります。

## 使う場面

次のようなときに、このスキルを参照します。
- Prisma v6 から v7 に上げる
- `prisma-client` ジェネレーターに切り替える
- ドライバーアダプターを準備する
- `prisma.config.ts` を設定する
- バージョンアップのあとの import のエラーを直す

## 優先度別のルールの分類

| 優先度 | 分類 | 影響 | 接頭辞 |
|----------|----------|--------|--------|
| 1 | スキーマの移行 | 最重要 | `schema-changes` |
| 2 | データベースへの接続 | 最重要 | `driver-adapters` |
| 3 | モジュールの仕組み | 最重要 | `esm-support` |
| 4 | 設定と環境変数 | 高 | `prisma-config`, `env-variables` |
| 5 | なくなった機能 | 高 | `removed-features` |
| 6 | Accelerate | 高 | `accelerate-users` |

## クイックリファレンス

- `schema-changes` - ジェネレーターの移行、必須になった出力先のパス、生成される入り口、`Prisma.validator` の置き換え
- `driver-adapters` - SQL のプロバイダーで必須のアダプターのインストール、プールの違い、Prisma Postgres のアダプターの選び方
- `esm-support` - ESM を基本にした構成と、`moduleFormat = "cjs"` を使った CommonJS の代わりの方法
- `prisma-config` - `prisma.config.ts` の作り方と使い方
- `env-variables` - 環境変数の明示的な読み込み
- `removed-features` - なくなったミドルウェア、メトリクス、以前の CLI の動き
- `accelerate-users` - Accelerate の利用者向けの移行の注意

## MongoDB を使っている？ このガイドは当てはまりません

Prisma 7 には MongoDB のコネクターがありません。
`provider = "mongodb"` のプロジェクトに、このガイドの手順を1つも当てはめないでください。実際に選ぶこと（意図して v6 のままにするか、Prisma Next に移行するか）は、`prisma-mongodb-upgrade` スキルを見てください。

## 大事な注意

- **MongoDB のプロジェクトは、Prisma 6.x のままにするか、Prisma Next に移行する** - MongoDB のアプリを、Prisma 7 の SQL の Client の流れに移さない（`prisma-mongodb-upgrade` を見る）
- **Node.js 20.19.0 以上**が必要
- **TypeScript 5.4.0 以上**が必要
- **最新の安定版の Prisma ORM のバージョン**：`7.6.0`

## バージョンアップの手順の概要

1. パッケージを v7 に上げる
2. モジュールの形式を選ぶ（デフォルトは `esm`、必要なら `cjs`）
3. TypeScript の設定を更新する
4. スキーマの generator ブロックを更新する
5. `prisma.config.ts` を作る
6. SQL のプロバイダーでは、ドライバーアダプターをインストールして設定する
7. Prisma Client の import を更新する
8. Client のインスタンスの作り方を更新する
9. `Prisma.validator` のような非推奨の補助のパターンを置き換える
10. `prisma generate` を実行してテストする

## バージョンアップのためのコマンド

```bash
# パッケージを上げる
npm install @prisma/client@7
npm install -D prisma@7

# ドライバーアダプターをインストールする（PostgreSQL、または TCP で直接つなぐ Prisma Postgres）
npm install @prisma/adapter-pg pg

# 環境変数を読み込むために dotenv をインストールする
npm install dotenv

# Client を生成し直す
npx prisma generate
```

## 互換性のない変更のまとめ

| 変更 | v6 | v7 |
|--------|----|----|
| モジュールの形式 | 暗黙・混在 | ESM が基本。`moduleFormat = "cjs"` にも対応 |
| ジェネレーターのプロバイダー | `prisma-client-js` | `prisma-client` がデフォルト。以前の構成のために `prisma-client-js` も残っている |
| 出力先のパス | 自動（node_modules） | 明示が必須 |
| ドライバーアダプター | 省略可 | SQL のプロバイダーでは必須 |
| 設定ファイル | `.env` + スキーマ | `prisma.config.ts` |
| 環境変数の読み込み | 自動 | 手動（dotenv） |
| 生成される入り口 | パッケージの1つの export | `client`、`browser`、`models`、`enums` の入り口 |
| 型安全なクエリの部品 | `Prisma.validator()` | TypeScript の `satisfies` |
| ミドルウェア | `$use()` | Client Extensions |
| メトリクス | プレビュー機能 | 廃止 |

## ルールファイル

互換性のない変更ごとの、詳しい移行のガイド：

```
references/esm-support.md        - ESM と CommonJS の設定
references/schema-changes.md     - ジェネレーター、出力先、import、生成される入り口
references/driver-adapters.md    - 必須のドライバーアダプターの準備
references/prisma-config.md      - 新しい設定ファイル
references/env-variables.md      - 環境変数の読み込み
references/removed-features.md   - ミドルウェア、メトリクス、CLI のフラグ
references/accelerate-users.md   - Accelerate の特別な扱い
```

## 一歩ずつの移行

### 1. ESM を基本にするプロジェクトで package.json を更新する

```json
{
  "type": "module"
}
```

CommonJS のままにする必要があるなら、ESM を無理に使わずにアプリは CJS のままにして、generator ブロックで `moduleFormat = "cjs"` を設定します。

### 2. tsconfig.json を更新する

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### 3. schema.prisma を更新する

```prisma
// 変更前（v6）
generator client {
  provider = "prisma-client-js"
}

// 変更後（v7）
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
  // CommonJS が必要なら（省略可）：
  // moduleFormat = "cjs"
}
```

### 4. prisma.config.ts を作る

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

### 5. ドライバーアダプターをインストールする（SQL のプロバイダーだけ）

```bash
# PostgreSQL
npm install @prisma/adapter-pg pg

# MySQL
npm install @prisma/adapter-mariadb mariadb

# SQLite
npm install @prisma/adapter-better-sqlite3 better-sqlite3

# ふつうの Node.js のアプリでの Prisma Postgres（おすすめ）
npm install @prisma/adapter-pg pg

# Prisma Postgres のサーバーレスのドライバー（エッジ・サーバーレス）
npm install @prisma/adapter-ppg @prisma/ppg

# Neon
npm install @prisma/adapter-neon
```

公開されている Prisma 7.6.0 のパッケージには、MongoDB 用の SQL の `@prisma/adapter-*` パッケージはありません。MongoDB のプロジェクトを上げようとしているなら、そこで止めて、ふつうの Prisma 7 の移行の手順に従わずに、そのプロジェクトを最新の Prisma 6.x のリリースのままにしてください。

### 6. Client のインスタンスの作り方を更新する

```typescript
// 変更前（v6）
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// 変更後（v7）
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })
```

### 7. Prisma.validator を satisfies に置き換える

```typescript
import { Prisma } from '../generated/prisma/client'

const userSelect = {
  id: true,
  email: true,
  name: true,
} satisfies Prisma.UserSelect
```

### 8. マイグレーションと生成を実行する

```bash
npx prisma generate
npx prisma migrate dev  # 必要なら
```

## トラブルシューティング

### "Cannot find module" のエラー
- generator の `output` のパスが、import のパスと合っているかを確認する
- `prisma generate` が成功したことを確認する

### SSL の証明書のエラー
- 以前の動きを残したいなら、アダプターの設定に `ssl: { rejectUnauthorized: false }` を追加する
- または、`NODE_EXTRA_CA_CERTS` や OpenSSL の CA の設定で、証明書を正しく設定する

### 接続のタイムアウトの問題
- ドライバーアダプターは、下にあるドライバーのデフォルトを使うので、v6 とは違う
- 必要なら、アダプターでプールの設定を明示する

## 資料

- [公式の v7 へのバージョンアップのガイド](https://www.prisma.io/docs/orm/more/upgrades/to-v7)
- [ドライバーアダプターのドキュメント](https://www.prisma.io/docs/orm/core-concepts/supported-databases/database-drivers)
- [Prisma Config のリファレンス](https://www.prisma.io/docs/orm/reference/prisma-config-reference)

## 使い方

まず `references/schema-changes.md` と `references/driver-adapters.md` に従い、そのあと、プロジェクトの構成に合わせて残りのリファレンスファイルを当てはめてください。
