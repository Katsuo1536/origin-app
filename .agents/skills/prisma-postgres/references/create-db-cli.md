# create-db-cli

ターミナルからすぐに Prisma Postgres を用意するには、`create-db` を使います。

## 優先度

最重要（CRITICAL）

## なぜ大事か

`create-db` は、開発、デモ、CI のプレビューのために、動く Prisma Postgres のインスタンスを手に入れる一番早い方法です。プログラムで読める形式で出力したり、環境変数を直接書き込んだりもできます。

## コマンド

```bash
npx create-db@latest
npx create-db@latest create [options]
npx create-db@latest regions
```

別名：

```bash
npx create-pg@latest
npx create-postgres@latest
```

## コマンドを調べる（`--help`）

CLI のコマンドを組み込むときは、必ず最初に `--help` を使ってください。

```bash
npx create-db@latest --help
npx create-db@latest create --help
npx create-db@latest regions --help
```

今ある一番上の階層のコマンド：

- `create`（デフォルト）：データベースを用意する
- `regions`：使えるリージョンを一覧にする

## `create` のオプション

| フラグ | 短い形 | 説明 |
|---|---|---|
| `--region [string]` | `-r` | リージョンの選択：`ap-southeast-1`、`ap-northeast-1`、`eu-central-1`、`eu-west-3`、`us-east-1`、`us-west-1` |
| `--interactive [boolean]` | `-i` | リージョンの選択画面を開く |
| `--json [boolean]` | `-j` | プログラムで読める JSON で出力する |
| `--env [string]` | `-e` | 指定した `.env` に、`DATABASE_URL` と `CLAIM_URL` を書き込む |
| `--ttl [string]` | `-t` | `30m` や `1h-24h` のような有効期間（TTL）のあとに自動で削除する |
| `--copy [boolean]` | `-c` | 接続文字列をクリップボードにコピーする |
| `--quiet [boolean]` | `-q` | 接続文字列だけを表示する |
| `--open [boolean]` | `-o` | 引き取り（claim）の URL をブラウザーで開く |

## ライフサイクルと引き取りの流れ

- データベースは、デフォルトでは一時的なもの。
- 引き取られていないデータベースは、約24時間後に自動で削除される。
- ずっと残すには、コマンドの出力に表示された URL でデータベースを引き取る。

## プログラムから使う（ライブラリの API）

CLI をシェルから呼ぶ代わりに、Node.js や Bun のプログラムから `create-db` を使うこともできます。

インストール：

```bash
npm install create-db
# または
bun add create-db
```

データベースを作る：

```ts
import { create, isDatabaseSuccess, isDatabaseError } from "create-db";

const result = await create({
  region: "us-east-1",
  userAgent: "my-app/1.0.0",
});

if (isDatabaseSuccess(result)) {
  console.log(result.connectionString);
  console.log(result.claimUrl);
  console.log(result.deletionDate);
}

if (isDatabaseError(result)) {
  console.error(result.error, result.message);
}
```

プログラムからリージョンを一覧にする：

```ts
import { regions } from "create-db";

const available = await regions();
console.log(available);
```

プログラムから使う `create()` は、リージョンを渡さなければ `us-east-1` を使います。

## よくあるパターン

```bash
# すぐにデータベースを作る
npx create-db@latest

# リージョンを指定したデータベース
npx create-db@latest --region eu-central-1

# 対話でリージョンを選ぶ
npx create-db@latest --interactive

# アプリの立ち上げ用に環境変数を書き込む
npx create-db@latest --env .env

# もっと早く自動で削除する
npx create-db@latest --ttl 2h

# 接続文字列をクリップボードにコピーする
npx create-db@latest --copy

# 接続文字列だけを表示する
npx create-db@latest --quiet

# CI 向けの出力
npx create-db@latest --json
```

## 参考

- [npx create-db のドキュメント](https://www.prisma.io/docs/postgres/introduction/npx-create-db)
