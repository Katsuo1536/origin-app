# prisma generate

Prismaスキーマに書いたgeneratorブロックをもとに、必要なファイルを生成します。生成するのは、ほとんどの場合 Prisma Client です。

## コマンド

```bash
prisma generate [options]
```

## Bunを使う場合

Bunを使っているときは、Node.jsで実行されないように `bunx --bun` でPrismaを実行します。

```bash
bunx --bun prisma generate
```

## できること

1. `schema.prisma` ファイルを読み込む
2. モデルに合わせた Prisma Client を生成する
3. generatorブロックで指定したフォルダに出力する

## オプション

| オプション | 説明 |
|--------|-------------|
| `--schema` | Prismaスキーマの場所を指定する |
| `--config` | Prismaの設定ファイルの場所を指定する |
| `--sql` | 型つきSQLのモジュールを生成する |
| `--watch` | Prismaスキーマを監視して、変更されたらもう一度実行する |
| `--generator` | 使うgeneratorを指定する（複数指定できる） |
| `--no-hints` | ヒントのメッセージを隠す（エラーと警告は表示される） |
| `--require-models` | モデルがないときはクライアントを生成しない |

## 使用例

### 基本の生成

```bash
prisma generate
```

### 監視モード（開発中）

```bash
prisma generate --watch
```

`schema.prisma` が変わると、自動で生成し直します。

### generatorを指定する

```bash
prisma generate --generator client
```

### 複数のgeneratorを使う

```bash
prisma generate --generator client --generator zod_schemas
```

### 型つきSQLを生成する

```bash
prisma generate --sql
```

## スキーマの設定

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated"
}
```

### 今のgeneratorの仕様

- 標準のgeneratorは `prisma-client`
- `prisma-client` を使うときは `output` の指定が必須
- `prisma-client` は、`moduleFormat` でESMとCommonJSの両方に対応している
- `compilerBuild` では、クエリコンパイラの成果物を `fast` か `small` から選べる
- `prisma-client` で型つきのクエリの一部を書くときは、TypeScriptの `satisfies` を使う
- Prisma Clientは、生成先のパスからimportする。たとえば次のとおり

```typescript
import { PrismaClient } from '../generated/prisma/client'
```

### コンパイラのビルドの調整

デフォルトのビルドより成果物のサイズを優先したいときは、`compilerBuild` を使います。

```prisma
generator client {
  provider      = "prisma-client"
  output        = "../generated"
  compilerBuild = "small"
}
```

- `fast` は、ほとんどの環境でのデフォルト
- `small` は、サイズに制限がある環境で役立つ
- `vercel-edge` 向けでは、Prismaが自動で `small` にする

## よくある使い方

### スキーマを変えたあと

```bash
prisma migrate dev --name my_migration
prisma generate
```

スキーマを変えるコマンドのあと、クライアントのコードを最新にしたいときは `prisma generate` を実行します。

### CI/CDのパイプライン

```bash
prisma generate
```

アプリをビルドする前に実行します。

### 複数のgenerator

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated"
}

generator zod {
  provider = "zod-prisma-types"
  output   = "../generated/zod"
}
```

```bash
prisma generate  # すべてのgeneratorを実行する
```

## 出力されるフォルダの中身

`prisma generate` を実行すると、出力先のフォルダは次のようになります。

```
generated/
├── browser.ts
├── client.ts
├── commonInputTypes.ts
├── models/
├── enums.ts
├── models.ts
└── ...
```

クライアントをimportするときは次のとおりです。

```typescript
import { PrismaClient, Prisma } from '../generated/prisma/client'
```

ブラウザで使っても安全な型をimportするときは次のとおりです。

```typescript
import { Prisma } from '../generated/prisma/browser'
import { Role } from '../generated/prisma/enums'
import type { UserModel } from '../generated/prisma/models/User'
```