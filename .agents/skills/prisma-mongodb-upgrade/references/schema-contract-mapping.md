# schema-contract-mapping

v6 の MongoDB のスキーマの概念が、Prisma Next の contract のモデルにどう対応するか。

## 優先度

高（HIGH）

## なぜ大事か

Prisma Next は、v6 の `schema.prisma` をそのままでは使いません。スキーマは *contract*
（PSL か、contract のビルダーを使った TypeScript で書く）になり、v6 の MongoDB のいくつかの書き方には、別の置き換えがあるか、意図して置き換えがありません。対応を知らずに機械的に書き換えると、確認に通らない contract ができたり、もっと悪い場合には、コレクションの指し方が気づかないうちに変わったりします。

## 対応表

| v6 の概念 | Prisma Next での置き換え | 注意 |
|------------|------------------------|-------|
| `datasource db { provider = "mongodb" }` + `url = env(...)`（[v6 のドキュメント](https://www.prisma.io/docs/orm/overview/databases/mongodb#example)） | `@prisma-next/mongo/config` の `defineConfig` で、mongo の family・target・adapter・driver の記述子をつなぐ | Next は、スキーマのプロバイダーの文字列ではなく、`@prisma-next/mongo` の窓口（façade）を import することで MongoDB を選ぶ。`prisma-next init` は、対象の名前として `mongodb` を受け付ける |
| `@id @default(auto()) @map("_id") @db.ObjectId`（[ObjectId を使う](https://www.prisma.io/docs/orm/overview/databases/mongodb#using-objectid)） | Next の contract での、ObjectId 型の ID の項目（PSL か TS のビルダー） | 正確な属性の書き方は、インストールした Next のバージョンの `prisma-next-contract` スキルで確認する。contract のビルダーには `index` と `valueObject` もある |
| 複合（埋め込み）型：v6 では MongoDB 専用（[複合型](https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/composite-types)） | Next の contract での値オブジェクトや埋め込みの形（Mongo の contract のビルダーの `valueObject`） | 考え方の役割は同じ：親のドキュメントに埋め込まれたドキュメント |
| モデル名で Client を指す（`prisma.user`） | **コレクションの保存先の名前**で ORM を指す：`db.orm.users`。つまり `@@map(...)` の名前か、小文字にしたモデル名で、`db.orm.User` ではない | prisma-next の `skills/prisma-next/SKILL.md`、`skills/prisma-next-quickstart/SKILL.md`。書き換えで一番よくある間違い |
| インデックスをスキーマで宣言し、`db push` で適用する | インデックスは contract で宣言し、マイグレーション（`createIndex`/`dropIndex` のファクトリー）で適用する | `migrations-mapping.md` を見る |
| ネイティブの多態性（ポリモーフィズム）はない | Mongo でも、スキーマの層での多態性はない。Next では `@@base`/`@@discriminator` は SQL 専用。明示的な `discriminator` の項目でモデルを作る | prisma-next の `skills/prisma-next-contract/SKILL.md` |

## 悪い例

```typescript
// v6 から書き換えて、モデル名で指している：
const user = await db.orm.User.first(); // undefined になる。Mongo の ORM のキーは保存先の名前
```

## 良い例

```typescript
// Mongo の ORM のキーは、コレクションの保存先の名前（@@map か、小文字にしたモデル名）：
const user = await db.orm.users.first();
```

## 環境の条件

Prisma Next の Mongo の対象には、MongoDB 8.0 以上と、利用者が peer dependency としてインストールした `mongodb@^7` が必要です（prisma-next の `CHANGELOG.md`、0.11→0.12）。v6 はもっと古い MongoDB のサーバーにも対応しているので、移行を計画する前にサーバーのバージョンを確認してください。

## 参考

- [v6 の MongoDB のスキーマのドキュメント](https://www.prisma.io/docs/orm/overview/databases/mongodb)
- [v6 の複合型（MongoDB 専用）](https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/composite-types)
- prisma-next のリポジトリにある、Prisma Next の contract のスキル（`skills/prisma-next-contract`）。Next 側についての正式な情報
