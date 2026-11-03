---
name: prisma-postgres
description: Console、create-db の CLI、Management API、Management API の SDK を使った、Prisma Postgres の準備と運用のガイド。Prisma Postgres のデータベースを作るとき、Prisma Console で作業するとき、create-db・create-pg・create-postgres で用意するとき、サービストークンや OAuth を使ってプログラムからの用意を組み込むときに使う。
license: MIT
metadata:
  author: prisma
  version: "7.9.1"
---

# Prisma Postgres

対話での作業とプログラムからの作業の両方で、Prisma Postgres を作成・管理・組み込むためのガイドです。

## 使う場面

次のようなときに、このスキルを参照します。
- Prisma Console から Prisma Postgres を準備する
- `create-db` で、すぐに使える一時的なデータベースを用意する
- `prisma postgres link` で、既存のローカルのプロジェクトをつなぐ
- Management API で Prisma Postgres のリソースを管理する
- TypeScript・JavaScript で `@prisma/management-api-sdk` を使う
- 引き取り（claim）の URL、接続文字列、リージョン、認証の流れを扱う

## 優先度別のルールの分類

| 優先度 | 分類 | 影響 | 接頭辞 |
|----------|----------|--------|--------|
| 1 | CLI での用意 | 最重要 | `create-db-cli` |
| 2 | Management API | 最重要 | `management-api` |
| 3 | Management API の SDK | 高 | `management-api-sdk` |
| 4 | Console と接続 | 高 | `console-and-connections` |

## クイックリファレンス

- `create-db-cli` - すぐに使えるデータベースと、今の CLI のフラグ（`--ttl`、`--copy`、`--quiet`、`--open`）
- `management-api` - サービストークンと OAuth を使った API の作業の流れ
- `management-api-sdk` - トークンの保存も含めた、型付きの SDK の使い方
- `console-and-connections` - Console での操作、`prisma postgres link`、TCP での直接の接続、サーバーレスのドライバーの選び方

## 主な作業の流れ

### 1. Console を中心にした流れ

手作業での準備や運用には、Prisma Console を使います。

- `https://console.prisma.io` を開く
- ワークスペースとプロジェクトを作成・選択する
- プロジェクトのサイドバーの Studio で、データを見たり編集したりする
- プロジェクトの画面から、直接つなぐための接続情報を取得する

### 2. create-db ですぐに用意する

すぐにデータベースが必要なときは、`create-db` を使います。

```bash
npx create-db@latest
```

別名：

```bash
npx create-pg@latest
npx create-postgres@latest
```

アプリに組み込む場合は、`create-db` の npm パッケージにある、プログラムから使う API（`create()` / `regions()`）も使えます。

一時的なデータベースは、引き取らない限り、約24時間後に自動で削除されます。

### 2b. Platform の CLI で残るデータベースを作る

（使い捨ての `create-db` のデータベースではなく）Project に属するデータベースには、`@prisma/cli` を使います。

```bash
npx -y @prisma/cli@latest database create --help
npx -y @prisma/cli@latest database list --json
npx -y @prisma/cli@latest database connection create db_123
npx -y @prisma/cli@latest database usage db_123
npx -y @prisma/cli@latest database backup list db_123
```

`database create` と `database connection create` は、一度だけ接続 URL を表示します。すぐに保存してください。データを壊すコマンド（`remove`、`restore`）には、正確な `--confirm <id>` が必要です。

この CLI はベータ版なので、自動化では `--json --no-interactive` を使い、変更の前に ID を確定させ、インストールしたコマンドのヘルプを確認してください。

### 3. 既存のローカルのプロジェクトをつなぐ

データベースがすでにあり、ローカルのプロジェクトをそれにつなぎたいときは、`prisma postgres link` を使います。

```bash
prisma postgres link
```

CI など、対話できない環境では：

```bash
prisma postgres link --api-key "<your-api-key>" --database "db_..."
```

この流れで、ローカルの `.env` に `DATABASE_URL` が書き込まれます。そのあと、`prisma generate` と `prisma migrate dev` を実行できます。

### 4. Management API でプログラムから用意する

次の場所の API のエンドポイントを使います。

```text
https://api.prisma.io/v1
```

スキーマとエンドポイントは、次で確認できます。

- OpenAPI のドキュメント：`https://api.prisma.io/v1/doc`
- Swagger Editor：`https://api.prisma.io/v1/swagger-editor`

認証の方法：

- サービストークン（ワークスペースの、サーバー同士の通信）
- OAuth 2.0（ユーザーの代わりに操作する）

### 5. Management API の SDK で型安全に組み込む

インストールして使います。

```bash
npm install @prisma/management-api-sdk
```

既存のトークンがあれば `createManagementApiClient` を、OAuth とトークンの更新が必要なら `createManagementApiSdk` を使います。

SDK には、ワークスペースのサービストークンの一覧・作成・取り消しのための、型付きのルートがあります。新しく作ったトークンの値は、一度だけ返されます。ベータ版のエンドポイントの正確な形は、インストールした SDK の型か OpenAPI のドキュメントで確認してください。

## ルールファイル

詳しい説明は、次のファイルにあります。

```
references/console-and-connections.md
references/create-db-cli.md
references/management-api.md
references/management-api-sdk.md
```

## 使い方

すばやく準備したいときは `references/create-db-cli.md` から始め、プログラムからの用意が必要になったら、`references/management-api.md` か `references/management-api-sdk.md` に切り替えてください。
