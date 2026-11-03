# client-api-mapping

v6 の Prisma Client の呼び出しが、Prisma Next の Mongo の Client にどう対応するか。名前は対応しますが、同じ機能があるとは限りません。

## 優先度

最重要（CRITICAL）

## なぜ大事か

v6 と Next の Client の API は、見た目は似ています。しかし、v6 の MongoDB の生の操作のメソッドは、どれも元の名前では存在せず、集計はまったく別の仕組みに移り、トランザクションは窓口（façade）で包まれずにドライバーを通ります。同じ機能があると思い込むと、コンパイルできないコードや、トランザクションの場合には、気づかないうちに処理の一体性（原子性）が失われるコードができてしまいます。

## 対応表

| v6 の呼び出し | Prisma Next での置き換え | 注意 |
|---------|------------------------|-------|
| `prisma.user.findMany(...)` | `db.orm.users.where(...).all()` | メソッドをつなげて書く ORM の仕組み。キーは保存先の名前（`schema-contract-mapping.md` を見る） |
| `prisma.user.findFirst(...)` | `db.orm.users.where(...).first()` | |
| `create` / `update` / `upsert` / `delete` / `updateMany` / `deleteMany` | `db.orm.<collection>` の `create` / `update` / `upsert` / `delete` / `updateAll` / `deleteAll` | Prisma Next の `prisma-next-queries` スキルを見る |
| `prisma.user.aggregate(...)`、`groupBy(...)` | **ORM には置き換えがない。** 型付きの集計パイプラインのビルダーを使う：`db.query.from(...).match(...).group(...).build()` | ビルダーの仕組みは、Prisma Next の `prisma-next-queries` スキルで扱っている |
| `$runCommandRaw(...)`（[v6 のドキュメント](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries#runcommandraw)） | **Next にはこの名前はない。** 生の操作の仕組みは `mongoRaw(...)` で、`aggregate`、`insertOne/Many`、`updateOne/Many`、`deleteOne/Many`、`findOneAndUpdate/Delete` を持つ生のコレクションを返す。任意のデータベースのコマンドには、下にある `mongodb` のドライバーを直接使う（利用者が用意する peer dependency で、すべて使える） | インストールしたバージョンの生の操作の機能を確認する |
| `<model>.findRaw(...)`（[v6 のドキュメント](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries#findraw)） | `mongoRaw(...)` のコレクションでの読み取り（例：`$match` の段階を持つ `aggregate`） | `findRaw` という名前は直接はない |
| `<model>.aggregateRaw(...)`（[v6 のドキュメント](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries#aggregateraw)） | `mongoRaw(...).aggregate(...)` か、型付きのパイプラインのビルダー | |
| `$transaction(...)`：v6 ではレプリカセットで動く（[v6 のドキュメント](https://www.prisma.io/docs/orm/overview/databases/mongodb#replica-set-configuration)） | 窓口は、まだ `db.transaction(...)` を包んでいない。**ただし、下にある `mongodb` のドライバーを直接使える**（利用者が用意する peer dependency）。レプリカセットなら、ドライバーのセッション（`client.startSession()` / `session.withTransaction(...)`）で、今でも複数のドキュメントにまたがる一体的な処理ができる | 窓口で包む仕組みはもうすぐ入る見込み。取り込まれたらこの行は更新される |
| `$connect` / `$disconnect` | Mongo の窓口の Client の `connect()` / `close()` | |

## 悪い例

```typescript
// v6 の名前が Prisma Next にもあると思い込んでいる：
await db.user.$runCommandRaw({ collStats: 'users' }); // そんなメソッドはない
await db.transaction(async (tx) => { ... });          // Mongo の窓口にはそんなメソッドはない
```

## 良い例

```typescript
// Next での名前を使った、生の操作の仕組み：
const raw = mongoRaw(db);
await raw.users.aggregate([{ $match: { status: 'active' } }]);

// 型付きのパイプラインのビルダーを使った集計：
const stats = await db.query.from('users').group({ _id: '$role', n: { $count: {} } }).build();

// 今できる、複数のドキュメントにまたがる一体的な処理：mongodb のドライバー（プロジェクトが
// 直接依存している）は、いつもどおりセッションとトランザクションを使える：
const session = mongoClient.startSession();
await session.withTransaction(async () => {
  // ...書き込み...
});
```

## 参考

- [v6 の MongoDB の生のクエリ](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries#raw-queries-with-mongodb)
- [トランザクションには v6 でレプリカセットが必要](https://www.prisma.io/docs/orm/overview/databases/mongodb#replica-set-configuration)
- Prisma Next の queries と runtime のスキル（`skills/prisma-next-queries`。専用の `mongo.md` も含む。`skills/prisma-next-runtime`）。Next 側についての正式な情報。確認した対象 @ `a2791c5dd59d579b4b3052942ae7f8fe5e2ee852`
