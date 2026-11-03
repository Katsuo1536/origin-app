# decision-stay-or-migrate

MongoDB のプロジェクトを Prisma Next に移行するか、Prisma v6 のままにするかの決め方。

## 優先度

最重要（CRITICAL）

## なぜ大事か

MongoDB のプロジェクトは、ふつうの「Prisma をバージョンアップする」という助言に従えません。Prisma 7 には MongoDB のコネクターがないので、先へ進む道は Prisma Next です。できない v7 へのバージョンアップを勧めることも、黙ってアプリを SQL に書き換えることも、どちらも深刻な失敗です。おすすめの道は Prisma Next への移行です（MongoDB への対応は Early Access の段階で、Prisma チームは早く使い始めた人からのフィードバックを求めています）。決定的な妨げがある場合は、意図して v6 のままにします。

## 判断のもとになる事実

Prisma Next 側（prisma/prisma-next @ `a2791c5dd59d579b4b3052942ae7f8fe5e2ee852` で確認。状況は 2026-07 に Prisma チームが確認）：

- **MongoDB への対応は Early Access** で、活発に開発されており、Postgres のあとに GA の予定。
- 実装は、形だけのものではなく本格的。パッケージ一式（ORM、型付きの集計パイプラインのビルダー、生の操作の仕組み、公式の `mongodb` パッケージを使うドライバー）、contract を中心にした本格的なマイグレーション、本物のメモリ上の MongoDB を使った多くのテストがある。
- **Mongo の Client の窓口（façade）は、まだ `db.transaction(...)` を包んでいない。** 複数のドキュメントにまたがる一体的な処理は、MongoDB のドライバーのセッションの API で行う。これは直接使える（`mongodb` パッケージは利用者が用意する peer dependency）。窓口で包む仕組みは入る見込みで、取り込まれたらこのスキルは更新される。
- Early Access なので、1.0 より前のマイナーバージョンには、互換性のない変更が入ることがある。その場合はバージョンアップの手順が公開される（例：0.11→0.12 では、Mongo の validator の出力が変わり、`mongodb` が利用者が用意する peer dependency になった）。最低条件：MongoDB 8.0 と `mongodb@^7`。

Prisma v6 側：

- v6 は、レプリカセットでのトランザクションも含めて、MongoDB に完全に対応している。ドキュメントには、MongoDB はレプリカセットでしかトランザクションを始められず、Prisma ORM は内部でトランザクションを使うと書かれている
  （[レプリカセットの設定](https://www.prisma.io/docs/orm/overview/databases/mongodb#replica-set-configuration)）。
- v6 の MongoDB には Prisma Migrate がなく、作業の流れは `db push`
  （[Prisma Migrate には対応していない](https://www.prisma.io/docs/orm/overview/databases/mongodb#no-support-for-prisma-migrate)）。

## 移行の前に確認する妨げ

次の確認は、ユーザーに聞かずに、コードから自分で行ってください。

- **コードで `$transaction` を使っているかを探す**（`$transaction` で grep する）。使っていれば、移行の前に、ドライバーを直接使うセッションでの置き換えを計画する（`client-api-mapping.md` を見る）か、窓口で包めるようになるまで v6 のままにする。
- **MongoDB のサーバーのバージョンを確認する**（Next では 8.0 以上が必要。v6 はもっと古くても動いた）。
- **チームが 1.0 より前のバージョンアップに対応できるかを確かめる。** Next は、マイナーバージョンの間のバージョンアップの手順を、バージョンごとに公開しています。誰かがそれを実行する必要があります。本番のアプリでは、移行の前に、ユーザーが Early Access の段階であることを受け入れているかを確かめてください。

## 悪い例

```text
User: "We're on Prisma 6 with MongoDB. Should we upgrade to Prisma 7?"
Agent: "Yes — here's the v7 upgrade guide. Step 1: install a driver adapter..."
```

（ユーザーが「Prisma 6 と MongoDB を使っている。Prisma 7 に上げるべき？」と聞き、エージェントが「はい。v7 のバージョンアップのガイドです。手順1：ドライバーアダプターを入れて……」と答えている。）

Prisma 7 には MongoDB のコネクターがありません。この移行はできず、SQL のドライバーアダプターの手順は、動いている v6 の構成を壊します。

## 良い例

```text
User: "We're on Prisma 6 with MongoDB. Should we upgrade to Prisma 7?"
Agent: "Prisma 7 does not support MongoDB — v6 is the last classic-ORM
major for MongoDB. The path forward is Prisma Next, the successor: its MongoDB support is
Early Access and migrating is encouraged. Let me check the codebase for blockers first —
searching for $transaction usage and checking the MongoDB server version..."
```

（エージェントが「Prisma 7 は MongoDB に対応していない。MongoDB にとって v6 がこれまでの ORM の最後のメジャーバージョン。先へ進む道は後継の Prisma Next で、MongoDB への対応は Early Access の段階にあり、移行がおすすめ。まず、$transaction を使っているかと MongoDB のサーバーのバージョンを調べて、妨げがないか確認する……」と答えている。）

## v6 のままにするときの手入れ

残すのは判断であって、放置した結果ではありません。

- `prisma` と `@prisma/client` を最新の 6.x に固定し、6.x のパッチを入れ続ける。
- 保守のための 6.x の系統について、Prisma のリリースノートとセキュリティの勧告を見ておく。
- これまでの構成を保つ（スキーマに `url = env("DATABASE_URL")`、`db push`、SQL のドライバーアダプターは使わない）。
- Prisma Next の MongoDB が GA になったとき、または EA を試す妨げが解消されたときに、もう一度判断する。

## 参考

- [Prisma Next のリポジトリ](https://github.com/prisma/prisma-next)
- [Prisma v6 の MongoDB のドキュメント](https://www.prisma.io/docs/orm/overview/databases/mongodb)
