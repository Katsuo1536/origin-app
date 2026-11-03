# create-prisma での Compute の流れ

Prisma を使った新しいアプリを作り、必要なら Prisma Compute にデプロイするときに、このリファレンスを使います。

既存のアプリのデプロイに `create-prisma` を使わないでください。既存のプロジェクトでは、生成された `compute:deploy` スクリプトがあればそれを使い、なければ `bunx @prisma/cli@latest app deploy` を直接呼びます。

## 参考

ひな形について確認するのに便利なコマンド：

```bash
bunx create-prisma@latest --help
bunx create-prisma@latest --version
```

新しいプロジェクトのひな形作りには `create-prisma@latest` を使います。

## 対応しているテンプレート

`create-prisma@latest` が作れるひな形は、`hono`、`elysia`、`nest`、`next`、`svelte`、`astro`、`nuxt`、`tanstack-start`、`turborepo` です。

組み込みの `--deploy` に対応しているのは、`hono`、`elysia`、`nest`、`next`、`astro`、`nuxt`、`tanstack-start`、`turborepo` です。`turborepo` では、生成される設定のデプロイ先は、ふつう `api` です。

ひな形のテンプレート名は `nest` ですが、Compute のデプロイのフレームワークや設定のキーは `nestjs` です。

`@prisma/cli app deploy --framework` に `svelte` のキーがないため、`svelte` は Compute ではひな形作りだけに対応しています。

## 基本のコマンド

対話で作成する：

```bash
bunx create-prisma@latest
```

対話なしで、ひな形だけを作る：

```bash
bunx create-prisma@latest \
  --name my-api \
  --template hono \
  --provider postgresql \
  --no-install \
  --no-generate \
  --no-migrate-and-seed \
  --no-deploy
```

対応しているテンプレートを作成してデプロイする：

```bash
bunx create-prisma@latest \
  --name my-api \
  --template hono \
  --provider postgresql \
  --deploy
```

## PostgreSQL とデータベースの動き

PostgreSQL を使い、`--database-url` を明示せず、`--no-prisma-postgres` も付けない場合、Compute の流れで次のものが作られることがあります。

- Prisma Compute のプロジェクト
- `main` ブランチの `main` という Prisma Postgres のデータベース
- `DATABASE_URL` を含む `.env` ファイル
- `.env` から環境変数を読み込んだ、最初の Compute のデプロイ

`create-prisma` は新しいプロジェクトを作るための手段です。あとでプレビューのブランチにデプロイしたいときは、アプリができたあとに、生成された `compute:deploy` スクリプトか `@prisma/cli app deploy --branch <git-name>` を使います。ブランチ名は、`app deploy --branch`、`database create --branch`、`project env ... --branch` で揃えてください。

人が見ていないローカルのテストでは、意図して準備させたいのでなければ、`--no-prisma-postgres` を付けます。

```bash
bunx create-prisma@latest \
  --name smoke-app \
  --template hono \
  --provider postgresql \
  --no-prisma-postgres \
  --database-url "postgresql://USER:PASSWORD@HOST:PORT/DB" \
  --no-deploy
```

仮のデータベースの URL のままデプロイしないでください。`DATABASE_URL` が仮のデフォルトの値なら、デプロイの環境変数から外して、本番の本物のデータベースをユーザーに確認してください。

## 生成されるデプロイのスクリプト

デプロイの流れを選ぶと、`create-prisma` が次のようなスクリプトを追加することがあります。

```json
{
  "scripts": {
    "compute:deploy": "bunx @prisma/cli@latest app deploy --prod --yes ..."
  }
}
```

記憶から組み立て直さずに、`package.json` に実際に生成されたスクリプトを使ってください。このスクリプトは、生成されたフラグや `prisma.compute.ts` を使って、アプリのコードを再デプロイします。新しいプロジェクトやデータベースは作らず、マイグレーションもシードデータの投入もしません。ひな形で作ったプロジェクトに `compute:deploy` がなければ、`@prisma/cli app deploy` を直接使います。

デプロイの動きを編集する前に、生成された `package.json`、`prisma.compute.ts`、README を確認してください。

## 残しておくべき生成されたファイル

デプロイ先を意図して変えるのでなければ、生成されたフレームワークのランタイムのファイルと `prisma.compute.ts` は残しておいてください。フレームワークごとのデプロイやランタイムの詳細は、[`frameworks.md`](frameworks.md) を読んでください。

Prisma 7 のひな形はすべて、次のようになっています。

- `prisma.config.ts` を使う
- ランタイムが対応していれば `dotenv/config` を読み込む
- Prisma Client を、`src/generated/prisma` のようなテンプレート内の場所に生成する
- PostgreSQL では、`DATABASE_URL` の接続文字列と `@prisma/adapter-pg` を使う

## 追加機能についての注意

`create-prisma` は、`--skills`、`--mcp`、`--extension` に対応しています。これらは Compute のデプロイとは別物です。スキルや MCP を有効にすればアプリがデプロイされる、というような言い方をしないでください。

## 失敗したときの対処

`--deploy` を明示したのに、準備の段階で認証できない、Platform の CLI を実行できない、組み込みのデプロイを最後までできない、という場合は、デプロイが失敗したことを報告して、ひな形で作ったプロジェクトはそのまま残してください。ユーザーのファイルを削除しないでください。
