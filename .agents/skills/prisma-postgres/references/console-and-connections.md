# console-and-connections

プロジェクトの状況の確認、データの確認、接続の準備には、Prisma Console での作業の流れを使います。

## 優先度

高（HIGH）

## なぜ大事か

Prisma Postgres の作業の多くは、Console で行うのが一番早く済みます。Studio でデータを見る、利用状況の数値を確認する、接続情報を取得する、などです。簡単な運用の作業で、API や CLI を使う手間をかけずに済みます。

## Console での作業の流れ

1. `https://console.prisma.io` を開く。
2. ワークスペースとプロジェクトを選ぶ。
3. ダッシュボードの数値で、利用状況と請求を確認する。
4. サイドバーの **Studio** タブを開いて、データを確認・編集する。

## ローカルの Studio

ローカルでもデータを確認できます。

```bash
npx prisma studio
```

## 既存のプロジェクトをつなぐ

Prisma Postgres のデータベースがすでにあれば、新しく用意せずに、ローカルのプロジェクトをつなぎます。

```bash
prisma postgres link
```

CI や対話なしで使うときは：

```bash
prisma postgres link --api-key "<your-api-key>" --database "db_..."
```

このコマンドは、`DATABASE_URL` を入れた `.env` を更新、またはなければ作成します。プロジェクトがすでにつながっていれば、`--force` でつなぎ直します。つないだあとは `prisma generate` を実行し、スキーマを反映する必要があれば `prisma migrate dev` を実行します。

## 接続の準備

PostgreSQL に直接つなぐツールやドライバーでは：

- プロジェクトの接続の画面で、直接つなぐための認証情報を生成・コピーする。
- 得られた PostgreSQL の URL を、`pg` と `@prisma/adapter-pg` の `DATABASE_URL` として使う。
- Prisma Postgres に TCP で直接つなぐときは、`sslmode=require` を入れる。

TCP で直接つなぐときの、よくある形：

```env
DATABASE_URL="postgres://identifier:key@db.prisma.io:5432/postgres?sslmode=require"
```

Management API の接続についての返り値には、`endpoints.direct`（`db.prisma.io:5432`）と `endpoints.pooled`（`pooled.db.prisma.io:5432`）の両方があります。非推奨になった平らな `connectionString` よりも、これらの項目を使ってください。接続の秘密の情報は、作成したときに一度だけ表示されます。すぐに保存してください。

## アダプターの選び方

- ふつうの Node.js のアプリ：上の TCP で直接つなぐ URL と一緒に、`@prisma/adapter-pg` を使うのがおすすめ。
- エッジ・サーバーレスのランタイム：Prisma Postgres のサーバーレスのドライバーがどうしても必要なときだけ、`@prisma/adapter-ppg` と `@prisma/ppg` を使う。

## 参考

- [Prisma Postgres の概要](https://www.prisma.io/docs/postgres/introduction/overview)
- [データを見る](https://www.prisma.io/docs/postgres/integrations/viewing-data)
- [直接の接続](https://www.prisma.io/docs/postgres/database/direct-connections)
