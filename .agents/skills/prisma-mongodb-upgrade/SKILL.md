---
name: prisma-mongodb-upgrade
description: v6 の Prisma ORM の MongoDB プロジェクト向けの、判断と移行のガイド。これらには v7 へのバージョンアップの方法がない。MongoDB のプロジェクトで Prisma のバージョンアップについて聞かれたとき、provider = "mongodb" のプロジェクトで "upgrade to prisma 7" の話が出たとき、Prisma Next への移行を検討するときに使う。"upgrade prisma mongodb"、"prisma 7 mongodb"、"mongodb prisma migration"、"prisma next mongodb" で起動する。
license: MIT
metadata:
  author: prisma
  version: "0.1.0"
---

# Prisma の MongoDB のバージョンアップの道筋

MongoDB のプロジェクトは、Prisma 7 へ進む道がない唯一の Prisma の利用者のグループです。**MongoDB にとって v6 は、これまでの ORM の最後のメジャーバージョンで、v7 に MongoDB のコネクターが入ることはありません**。後継の道は
[Prisma Next](https://github.com/prisma/prisma-next) で、MongoDB への対応は Early
Access（先行公開）の段階にあり、Postgres のあとに GA（正式公開）の予定です。このスキルでは、実際に選ぶこと（Prisma Next に移行する（おすすめの道）か、決定的な妨げがあって v6 のままにするか）を整理し、移行の具体的な手順も扱います。

**次のどちらも、絶対にしないでください。**

- MongoDB のプロジェクトに「Prisma 7 にバージョンアップする」ことを勧めない。そこにはコネクターがありません。`prisma-upgrade-v7` のガイドは、MongoDB のプロジェクトには当てはまりません。
- アプリを SQL のデータベースに書き換えて、バージョンの問題を解決しない。データベースのエンジンを変えるのは、別の、ずっと大きな判断で、あなたが勝手に決めてよいことではありません。

## バージョンの状況

| バージョン | MongoDB への対応の状況 |
|---------|----------------|
| Prisma ORM v6 | 完全に対応（`mongodb` のプロバイダー）。最新の 6.x が今の安定した道。保守のための系統 |
| Prisma ORM v7 | **MongoDB のコネクターはない。この先もずっと選択肢にならない** |
| Prisma Next | MongoDB への対応は **Early Access** で、活発に開発中。Postgres のあとに GA の予定。MongoDB のプロジェクトの後継の道 |

## 先に結論

**Prisma Next への移行が、おすすめの道です。** Prisma Next での MongoDB への対応は Early
Access の段階です。ちゃんと動き、開発も速く進んでいて、Postgres のあとに GA の予定です。Prisma チームは、MongoDB の利用者に早めに移行してフィードバックを送ってほしいと考えています。移行の具体的な手順は、リファレンスに詳しく書いてあります。

**決定的な妨げがある場合は、最新の v6 のままにするのも正当な選択です。** はっきり言うと、Next の Mongo の窓口（façade）は、まだトランザクションを包んでいません（下にあるドライバーは直接使えます。これはもうすぐ変わる見込みです）。また、1.0 より前のマイナーバージョンには、互換性のない変更が入ることがあります（バージョンアップの手順は公開されます）。

### 判断の表

| 状況 | 方向 |
|--------|-----------|
| 下の妨げがどれも当てはまらない | Next に移行する。`verify-cutover-checklist` を実行して、Prisma チームにフィードバックを送る |
| 新規・試作・社内ツール | Next に移行する |
| コードが複数のドキュメントにまたがるトランザクション（`$transaction`）を使っている（聞かずに grep で確認する） | 先に、ドライバーを直接使うセッションでの置き換えを計画する（`client-api-mapping` を見る）か、窓口でトランザクションを包めるようになるまで v6 のままにする |
| チームが、マイナーバージョンの間の 1.0 より前の互換性のない変更に対応できない | GA まで v6 のままにする |
| リスクは避けたいが興味がある | コピーで、段階的に Next を一通り試してから（`verify-cutover-checklist` を見る）、移行する |

注意：トランザクションが足りない問題は、もうすぐ解消される見込みです。窓口でのトランザクションが Prisma Next に取り込まれたら、この部分は更新されます。

### v6 のままにする場合：きちんと手入れする（放置ではなく、意図して残す）

- Prisma のパッケージを最新の 6.x の系統に固定し、6.x のパッチのリリースを入れ続ける。
- 6.x の系統の Prisma のリリースノートとセキュリティの勧告を追う。
- これまでの v6 の MongoDB の構成を保つ：スキーマに `url = env("DATABASE_URL")`、`db push`
  の流れ、SQL のドライバーアダプターは使わない（v6 の MongoDB の形は `prisma-database-setup` を見る）。
- Prisma Next の MongoDB が GA になったとき、または EA を試す妨げが解消されたときに、もう一度判断する。

## リファレンスファイル

| リファレンス | 扱う内容 |
|-----------|----------------|
| `references/decision-stay-or-migrate.md` | 判断の考え方の全体、妨げの確認、v6 のままにするときの手入れの詳細 |
| `references/schema-contract-mapping.md` | v6 のスキーマ（`mongodb` のプロバイダー、`@db.ObjectId`、複合型）→ Next の contract の概念 |
| `references/client-api-mapping.md` | v6 の Client の呼び出し → Next での置き換え。生の操作の抜け道とトランザクションも含む。名前は対応するが、同じ機能があるとは限らない |
| `references/migrations-mapping.md` | v6 の `db push` だけの流れ → Next の plan・migrate・verify・sign の流れ |
| `references/verify-cutover-checklist.md` | データを動かさない確認：同じデータベース、インデックスの一致、切り替え前の段階的な一通りの試し |

## 確認した対象

このスキルの Prisma Next の動きについての説明は、
[prisma/prisma-next](https://github.com/prisma/prisma-next) のコミット
`a2791c5dd59d579b4b3052942ae7f8fe5e2ee852`（1.0 より前、v0.14・0.15 ごろの系統）で確認しました。Prisma Next は Early Access の段階で速く変わっています。**Next 側についての説明をもとに作業する前に、実際にインストールされているバージョンで確かめてください**（プロジェクトの `@prisma-next/*` のバージョンと、一緒にインストールされた prisma-next のスキルを確認する）。Next の Mongo の対象には MongoDB 8.0 以上が必要で、`mongodb@^7` を、利用者が用意する peer dependency として想定しています。

## 引き継ぎのルール

このスキルは、**見つけるための橋渡し**であって、Prisma Next 自身のドキュメントの代わりではありません。プロジェクトが Prisma Next に切り替わったら、Prisma Next の `init` やスキルのインストールを実行し、ふだんの作業ではそのスキル（quickstart、contract、queries、migrations、runtime）に従ってください。このスキルのまとめをもとに作業を続けないでください。
