---
name: prisma-client-api
description: Prisma Client の API リファレンス。モデルのクエリ、絞り込み、演算子、Client のメソッドを扱う。データベースのクエリを書く、CRUD 操作をする、データを絞り込む、Prisma Client を設定するときに使う。"prisma query"、"findMany"、"create"、"update"、"delete"、"$transaction" で起動する。
license: MIT
metadata:
  author: prisma
  version: "7.9.1"
---

# Prisma Client API リファレンス

Prisma Client の API の総合リファレンスです。このスキルでは、現在の Prisma プロジェクトでの、モデルのクエリ、絞り込み、リレーション、Client のメソッドについて説明します。

## 使う場面

次のようなときに、このスキルを参照します。
- Prisma Client でデータベースのクエリを書く
- CRUD 操作（作成・読み取り・更新・削除）をする
- データを絞り込んだり並べ替えたりする
- リレーションを扱う
- トランザクションを使う
- Client のオプションを設定する

## 優先度別のルールの分類

| 優先度 | 分類 | 影響 | 接頭辞 |
|----------|----------|--------|--------|
| 1 | Client の作成 | 高 | `constructor` |
| 2 | モデルのクエリ | 最重要 | `model-queries` |
| 3 | クエリの形 | 高 | `query-options` |
| 4 | 絞り込み | 高 | `filters` |
| 5 | リレーション | 高 | `relations` |
| 6 | トランザクション | 最重要 | `transactions` |
| 7 | 生の SQL | 最重要 | `raw-queries` |
| 8 | Client のメソッド | 中 | `client-methods` |

## クイックリファレンス

- `constructor` - `PrismaClient` の設定、アダプターの接続、ログ、SQL commenter プラグイン
- `model-queries` - CRUD 操作と一括操作
- `query-options` - `select`、`include`、`omit`、並べ替え、ページ分け
- `filters` - 値の絞り込みと論理演算子
- `relations` - リレーションの読み取りと、入れ子の書き込み
- `transactions` - 配列形式と対話形式のトランザクションの書き方
- `raw-queries` - `$queryRaw` と `$executeRaw` を安全に使う
- `client-methods` - ライフサイクルのメソッド、拡張、`prisma-client` での `satisfies` の書き方

## Client の作成

```typescript
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })
```

## モデルのクエリのメソッド

| メソッド | 説明 |
|--------|-------------|
| `findUnique()` | 一意のフィールドで1件探す |
| `findUniqueOrThrow()` | 1件探し、なければエラーを投げる |
| `findFirst()` | 条件に合う最初の1件を探す |
| `findFirstOrThrow()` | 最初の1件を探し、なければエラーを投げる |
| `findMany()` | 複数件を探す |
| `create()` | 新しいレコードを作成する |
| `createMany()` | 複数のレコードを作成する |
| `createManyAndReturn()` | 複数作成して、作成したものを返す |
| `update()` | 1件を更新する |
| `updateMany()` | 複数件を更新する |
| `updateManyAndReturn()` | 複数更新して、更新したものを返す |
| `upsert()` | 更新、なければ作成する |
| `delete()` | 1件を削除する |
| `deleteMany()` | 複数件を削除する |
| `count()` | 条件に合うレコードを数える |
| `aggregate()` | 値を集計する（合計、平均など） |
| `groupBy()` | グループ化して集計する |

## クエリのオプション

| オプション | 説明 |
|--------|-------------|
| `where` | 絞り込みの条件 |
| `select` | 取得するフィールド |
| `include` | 読み込むリレーション |
| `omit` | 除外するフィールド |
| `orderBy` | 並び順 |
| `take` | 取得する件数の上限 |
| `skip` | とばす件数（ページ分け） |
| `cursor` | カーソルを使ったページ分け |
| `distinct` | 重複しない値だけ |

## Client のメソッド

| メソッド | 説明 |
|--------|-------------|
| `$connect()` | データベースに明示的に接続する |
| `$disconnect()` | データベースとの接続を切る |
| `$transaction()` | トランザクションを実行する |
| `$queryRaw()` | 生の SQL のクエリを実行する |
| `$executeRaw()` | 生の SQL のコマンドを実行する |
| `$on()` | イベントを受け取る |
| `$extends()` | 拡張を追加する |

## 簡単な例

### レコードを探す

```typescript
// 一意のフィールドで探す
const user = await prisma.user.findUnique({
  where: { email: 'alice@prisma.io' }
})

// 条件で絞り込んで探す
const users = await prisma.user.findMany({
  where: { role: 'ADMIN' },
  orderBy: { createdAt: 'desc' },
  take: 10
})
```

### レコードを作成する

```typescript
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    name: 'Alice',
    posts: {
      create: { title: 'Hello World' }
    }
  },
  include: { posts: true }
})
```

### レコードを更新する

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Smith' }
})
```

### レコードを削除する

```typescript
await prisma.user.delete({
  where: { id: 1 }
})
```

### トランザクション

```typescript
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'alice@prisma.io' } }),
  prisma.post.create({ data: { title: 'Hello', authorId: 1 } })
])
```

## ルールファイル

API の詳しい説明：

```
references/constructor.md        - PrismaClient のコンストラクターのオプション
references/model-queries.md      - CRUD 操作
references/query-options.md      - select、include、omit、where、orderBy
references/filters.md            - 絞り込みの条件と演算子
references/relations.md          - リレーションのクエリと入れ子の操作
references/transactions.md       - トランザクションの API
references/raw-queries.md        - $queryRaw、$executeRaw
references/client-methods.md     - $connect、$disconnect、$on、$extends
```

## 絞り込みの演算子

| 演算子 | 説明 |
|----------|-------------|
| `equals` | 完全に一致する |
| `not` | 等しくない |
| `in` | 配列のどれかに含まれる |
| `notIn` | 配列のどれにも含まれない |
| `lt`, `lte` | より小さい（以下） |
| `gt`, `gte` | より大きい（以上） |
| `contains` | 文字列を含む |
| `startsWith` | 文字列で始まる |
| `endsWith` | 文字列で終わる |
| `mode` | 大文字・小文字を区別するか |

## リレーションの絞り込み

| 演算子 | 説明 |
|----------|-------------|
| `some` | 関連するレコードのうち、1件以上が条件に合う |
| `every` | 関連するレコードがすべて条件に合う |
| `none` | 関連するレコードが1件も条件に合わない |
| `is` | 関連するレコードが条件に合う（1対1） |
| `isNot` | 関連するレコードが条件に合わない |

## 参考資料

- [Prisma Client API リファレンス](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
- [CRUD 操作](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [絞り込みと並べ替え](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting)

## 使い方

上の表で分類を選んでから、対応するリファレンスファイルを開いて、実装の詳しい説明と例を見てください。
