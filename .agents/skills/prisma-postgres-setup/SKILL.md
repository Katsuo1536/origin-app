---
name: prisma-postgres-setup
description: Management API を使って、新しい Prisma Postgres のデータベースを準備し、ローカルのプロジェクトにつなぐ。"set up a database"、"create a Prisma Postgres project"、"get a connection string"、"connect my app to Prisma Postgres"、"provision a database" と頼まれたときに使う。
license: MIT
metadata:
  author: prisma
  version: "1.1.0"
---

# Prisma Postgres の準備

Management API で新しい Prisma Postgres のデータベースを用意し、ローカルのプロジェクトにつなぐまでを案内する、手順のスキルです。

## 使う場面

次のようなときに、このスキルを使います。

- プロジェクト用に、新しい Prisma Postgres のデータベースを準備する
- Prisma Postgres のプロジェクトを作って、ローカルからつなぐ
- Prisma Postgres の接続文字列を手に入れる
- （Console の画面ではなく）Management API でデータベースを用意する

次のようなときには、このスキルを使い**ません**。

- CI/CD のプレビュー用のデータベースを準備する：`prisma-postgres-cicd` を使う
- アプリの中に、複数の利用者（マルチテナント）向けのデータベースの用意の仕組みを作る：`prisma-postgres-integrator` を使う
- すでにあって、つながっているデータベースを扱う（スキーマやマイグレーションの作業は、ふつうの Prisma CLI で行う）

## 前提条件

- Node.js 18 以上
- Prisma Postgres のワークスペース（必要なら https://console.prisma.io で作る）
- ワークスペースのサービストークン（`references/auth.md` を見る）

## 操作性についてのガイドライン

ユーザーに選択肢を出すとき（リージョンの選択、プロジェクトの削除など）は、**使っている環境の、対話で選べる仕組みを使ってください**（例：Claude Code の `ask` ツール、ほかのエージェントの構造化された質問）。固定の表を表示して、ユーザーに値を入力させないでください。ユーザーが最小限の手間で選べるように、選べる選択肢を出します。

## 作業の流れ

次の手順を順番に進めます。それぞれの手順に、呼び出す API と、返ってきた内容の扱い方を書いています。

### 手順1：認証する

サービストークンが必要です。次の方法を順番に試します。

**1a. ユーザーのメッセージにあるトークン**

ユーザーが最初のメッセージにサービストークンを入れていないかを確認します（例："Set up Prisma Postgres with token eyJ..."）。入っていれば、**渡されたとおりそのまま**使ってください。切り詰めたり、エンコードし直したり、ファイルを経由させたりしないでください。次からの呼び出しのために、シェルの変数に保存します。

**1b. 環境にあるトークン**

環境変数か `.env` ファイルに、`PRISMA_SERVICE_TOKEN` がないかを確認します。

**1c. ユーザーに作ってもらう**

トークンがなければ、ユーザーに次のように案内します。

> Prisma Console → Workspace Settings → Service Tokens で、サービストークンを作ってください。
> トークンをコピーして、ここに貼り付けてください。

サービストークンの作り方の詳細は、`references/auth.md` を読んでください。

トークンが手に入ったら、シェルの変数（`PRISMA_SERVICE_TOKEN`）に保存し、このあとのすべての API の呼び出しで使います。

### 手順2：使えるリージョンを一覧にする

ユーザーがデプロイ先を選べるように、使える Prisma Postgres のリージョンの一覧を取得します。

```bash
curl -s -H "Authorization: Bearer $PRISMA_SERVICE_TOKEN" \
  https://api.prisma.io/v1/regions/postgres
```

返ってくる内容には、`id`、`name`、`status` を持つリージョンの配列が入っています。`status` が `available` のリージョンだけを出してください。

**リージョンは、対話で選べるメニューとして出してください。** ユーザーにリージョンの ID を手で入力させるのではなく、選択肢から選んでもらいます。

返ってくる内容の全体の形は、`references/endpoints.md` を読んでください。

### 手順3：データベース付きのプロジェクトを作る

```bash
curl -s -X POST https://api.prisma.io/v1/projects \
  -H "Authorization: Bearer $PRISMA_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<project-name>",
    "region": "<region-id>",
    "createDatabase": true
  }'
```

デフォルトでは、今のディレクトリ名をプロジェクト名にします。

返ってくる内容は `{ "data": { ... } }` に包まれています。次の値を取り出します。

- `data.id`：プロジェクト ID（先頭に `proj_` が付く）
- `data.database.id`：データベース ID（先頭に `db_` が付く）
- `data.database.connections[0].endpoints.direct.connectionString`：PostgreSQL に直接つなぐ接続文字列

**直接つなぐ**接続文字列（`endpoints.direct.connectionString`）を使ってください。pooled や accelerate のエンドポイントは使わないでください。それらは以前の Accelerate の構成のためのもので、新しいプロジェクトには必要ありません。

返ってきた状態が `provisioning` なら、数秒待ってから、`status` が `ready` になるまで `GET /v1/databases/<database-id>` を繰り返し確認します。

**データベースの上限で作成に失敗した場合は**、ユーザーの既存のプロジェクトを一覧にし、削除するものを選べる対話のメニューとして出します。ユーザーが選んだら、それを削除して、もう一度試します。

リクエストと返ってくる内容の全体の形は、`references/endpoints.md` を読んでください。

### 手順4：名前付きの接続を作る（省略可）

専用の接続（例：開発者ごと、環境ごと）が必要なら、作ります。

```bash
curl -s -X POST https://api.prisma.io/v1/databases/<database-id>/connections \
  -H "Authorization: Bearer $PRISMA_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "dev" }'
```

`data.endpoints.direct.connectionString` から、直接つなぐ接続文字列を取り出します。

### 手順5：ローカルのプロジェクトを設定する

1. 依存関係をインストールする：

```bash
npm install prisma @prisma/client @prisma/adapter-pg pg dotenv
```

5つのパッケージはすべて必要です。
- `prisma`：マイグレーション、スキーマの反映、Client の生成のための CLI
- `@prisma/client`：生成されるクエリの Client
- `@prisma/adapter-pg`：PostgreSQL に直接つなぐための、Prisma 7 のドライバーアダプター
- `pg`：Node.js の PostgreSQL のドライバー（アダプターが使う）
- `dotenv`：`prisma.config.ts` のために `.env` の変数を読み込む

2. 直接つなぐ接続文字列を `.env` に書く。ファイルがすでにあれば、**末尾に追加**してください。既存の内容を上書きしないでください。

```
DATABASE_URL="<direct-connection-string>"
```

3. `.gitignore` に `.env` が入っていることを確認する。`.gitignore` がなければ作る。`.env` が Git の対象から外れていなければ、ユーザーに注意する。

4. `package.json` に `"type": "module"` が設定されていることを確認する（Prisma 7 は ESM の出力を生成する）。

5. `prisma/schema.prisma` がなければ、`npx prisma init` を実行してプロジェクトのひな形を作る。これで `prisma/schema.prisma` と `prisma.config.ts` の両方が作られる。

6. `schema.prisma` のプロバイダーが `postgresql` で、datasource ブロックに `url` や `directUrl` が**ない**ことを確認する（Prisma 7 では、接続 URL はスキーマではなく `prisma.config.ts` で管理する）。

```prisma
datasource db {
  provider = "postgresql"
}
```

7. `prisma.config.ts` が、環境変数から接続 URL を読み込むことを確認する：

```typescript
import path from 'node:path'
import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
```

**Prisma 7 の大事な注意：**
- 接続 URL は `prisma.config.ts` に書き、`schema.prisma` には絶対に書かない
- `schema.prisma` のプロバイダーは `"postgresql"` にする必要がある（`"prismaPostgres"` ではない）
- `.env` の変数を読み込むために、`prisma.config.ts` で `dotenv/config` を import する必要がある

### 手順6：スキーマを定義して反映する

スキーマにすでにモデルがあれば、反映の手順に進みます。なければ、**次の選択肢を対話のメニューとして出してください**。

1. **"I'll define my schema manually"**（自分でスキーマを書く）：ユーザーに `prisma/schema.prisma` を編集して、準備ができたら戻ってくるように伝える。先へ進む前に、ユーザーを待つ。
2. **"Give me a starter schema"**（最初のスキーマを用意してほしい）：`prisma/schema.prisma` に、ブログ用の最初のスキーマ（User、Post、Comment とリレーション）を追加する。追加した内容をユーザーに見せ、反映する前に直したいところがないかを聞く。
3. **"I'll describe what I need"**（必要なものを説明する）：ユーザーに、データのモデルを自然な言葉で説明してもらう（例："I'm building a task manager with projects, tasks, and team members"）。説明からスキーマを生成して見せ、反映する前に確認してもらう。

スキーマにモデルがあり、ユーザーの準備ができたら、マイグレーションを作って Client を生成します。

```bash
npx prisma migrate dev --name init
```

これで、`prisma/migrations/` にマイグレーションのファイルが作られ、**同時に** Client も生成されます。マイグレーションの履歴は、CI/CD の流れ（`prisma migrate deploy`）と本番へのデプロイに欠かせません。

`npx prisma db push` は、ユーザーが試作だけのモード（マイグレーションの履歴なし）を明示して頼んだときだけ使ってください。その場合は、続けて `npx prisma generate` を実行します。

### 手順7：接続を確認する

Client を生成したら、すべてが最初から最後まで動くことを確かめるために、簡単な確認用のスクリプトを作って実行します。これは**とても大事**です。この手順を飛ばさないでください。

`test-connection.ts` という名前のファイルを作ります。

```typescript
import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const result = await prisma.$queryRawUnsafe('SELECT 1 as connected')
console.log('Connected to Prisma Postgres:', result)

await prisma.$disconnect()
await pool.end()
```

実行します。

```bash
npx tsx test-connection.ts
```

**Prisma 7 の Client のインスタンスの作り方のルール：**
- `./generated/prisma/client.js` から import する（`./generated/prisma` ではない）
- `DATABASE_URL` の接続文字列で `pg.Pool` を作る
- それを `PrismaPg` のアダプターで包む
- `PrismaClient` のコンストラクターに `{ adapter }` を渡す
- `datasourceUrl` を使わ**ない**。このオプションは Prisma 7 にはない
- 引数なしの `new PrismaClient()` を使わ**ない**。エラーになる

確認に成功したら、`test-connection.ts` を削除します。

そのあと、ユーザーがデータベースを見て回れるように、次のリンクを伝えます。

- **Prisma Studio（CLI）：** `npx prisma studio`。ローカルで、データを見られる画面が開く
- **Console：** `https://console.prisma.io/<workspaceId>/<projectId>/<databaseId>/dashboard`。手順3で返ってきた ID から接頭辞（`wksp_`、`proj_`、`db_`）を取り除いて、この URL を組み立てる

Client のインスタンスの作り方の詳しいリファレンスは、`references/prisma7-client.md` を読んでください。

## エラーの扱い

エラーの詳しいリファレンスは、`references/api-basics.md` を読んでください。自分で直すときの主なパターン：

| HTTP のステータス | エラーコード | 対応 |
|---|---|---|
| 401 | `authentication-failed` | サービストークンが正しくないか、期限切れ。Console → Workspace Settings → Service Tokens で新しいものを作るよう、ユーザーに頼む。 |
| 404 | `resource-not-found` | リソースの ID に正しい接頭辞（`proj_`、`db_`、`con_`）が付いているかを確認する。 |
| 422 | `validation-error` | リクエストの本文を、エンドポイントのスキーマと照らし合わせる。よくあるのは、`name` がない、`region` が正しくない。 |
| 429 | `rate-limit-exceeded` | 少し間をあけて、数秒後にもう一度試す。 |

## リファレンスファイル

API と使い方の詳しい情報は、次のファイルにあります。

```
references/auth.md             — サービストークンの作り方と使い方
references/api-basics.md       — ベース URL、包みの形、ID、エラー、ページ分け
references/endpoints.md        — プロジェクト、データベース、接続、リージョンのエンドポイントの詳細
references/prisma7-client.md   — Prisma 7 の Client のインスタンスの作り方と使い方のパターン
```
