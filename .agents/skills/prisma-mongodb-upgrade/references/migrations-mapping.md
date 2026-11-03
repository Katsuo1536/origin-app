# migrations-mapping

v6 の MongoDB の「マイグレーションがない」流れが、Prisma Next の本格的なマイグレーションの流れにどう対応するか。

## 優先度

高（HIGH）

## なぜ大事か

これは、移行の中で一番大きな作業の流れの変化です。v6 では MongoDB にははっきりと Prisma Migrate がありませんが、Prisma Next では MongoDB もマイグレーションのライフサイクル全体に加わります。plan・verify・sign の流れを理解しないまま、`db push` の習慣を Next に持ち込むと、ツールとぶつかったり、安全のための仕組みを迂回したりすることになります。

## v6：`db push` だけ

v6 の MongoDB には Prisma Migrate がなく、追加する予定もありません。ドキュメントには、MongoDB のプロジェクトは内部のスキーマに頼らないと書かれています（[Prisma Migrate には対応していない](https://www.prisma.io/docs/orm/overview/databases/mongodb#no-support-for-prisma-migrate)）。
作業の流れは、`prisma db push` でインデックスと一意制約を同期するもので、ディスクにマイグレーションの履歴は残りません。

## Prisma Next：contract を中心にした本格的なマイグレーション（Mongo も含む）

Next では、マイグレーションの作成は、Postgres でも **Mongo でも**本格的に扱われます（prisma-next の
`skills/prisma-next-migrations/SKILL.md`）。MongoDB は、push だけの特別扱いではありません。

- **流れ：** contract を *emit*（出力）→ 差分 → *plan*（内容のハッシュ付きのマイグレーションのパッケージを書き出す）→
  *migrate*（グラフの順に適用する）→ *verify*（実際のスキーマと、目標の contract を比べる）→
  *sign*（verify に通ったら、目印を進める）。
- **Mongo のマイグレーションの操作**は、専用のファクトリーから作ります：`createCollection`、
  `dropCollection`、`validatedCollection`、`setValidation`、`createIndex`、`dropIndex`、
  `collMod`、データを後から埋めるための `dataTransform`。
- **目印の保存場所：** Next は、マイグレーションの状態を、
  `_prisma_migrations` コレクションのドキュメントに（空間ごとに）記録します。v6 の利用者が SQL で知っているのと同じ系統のコレクション名を、Mongo の状態のために使い直しています。
- **Mongo では DDL はトランザクションにならない：** 実行の仕組みは、操作を適用し、実際のスキーマを目標の contract と比べて確認し、verify に通ったときだけ目印を進めます。そのため、途中で止まった実行は、一体的に巻き戻すのではなく、再開できるようになっています（Prisma Next の
  `prisma-next-migrations` スキルを見る）。
- **push のような別の方法も残っている：** `db update` は、実際のデータベースと contract の差分を取り、マイグレーションのディレクトリを書かずに直接適用します。v6 の `db push` の習慣に一番近いものですが、履歴は残りません。
- validator：Next は 0.12 から、デフォルトで閉じた `$jsonSchema` の validator を出力します（prisma-next の
  `CHANGELOG.md`）。コレクションには、v6 では一度もかからなかったスキーマの強制がかかるようになります。

## 悪い例

```text
Porting the v6 habit: run the Next equivalent of `db push` for every change in production,
accumulating no migration history, and hand-editing collections when verification fails.
```

（v6 の習慣を持ち込み、本番での変更のたびに Next 版の db push を実行して、マイグレーションの履歴を残さず、確認に失敗したらコレクションを手で直している。）

## 良い例

```text
Adopt the Next lifecycle: emit the contract, plan a migration package, apply it with
migrate, let verify gate the marker, and sign. Reserve `db update` for local prototyping,
mirroring how `db push` was used on v6.
```

（Next のライフサイクルに従う。contract を出力し、マイグレーションのパッケージを plan し、migrate で適用し、目印を進めるかどうかを verify に任せて、sign する。db update は、v6 で db push を使っていたのと同じように、ローカルでの試作だけに使う。）

## 参考

- [v6：MongoDB には Prisma Migrate がない](https://www.prisma.io/docs/orm/overview/databases/mongodb#no-support-for-prisma-migrate)
- Prisma Next の migrations のスキル（`skills/prisma-next-migrations`）。Next 側についての正式な情報。確認した対象 @ `a2791c5dd59d579b4b3052942ae7f8fe5e2ee852`
