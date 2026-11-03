# Prisma Compute の設定

`prisma.compute.ts` を作成・更新するときに、このリファレンスを使います。特に、モノレポ、複数のアプリのデプロイ、使い回すフレームワークのデフォルト、環境変数の入力、ポート、エントリーポイント、ビルドの設定を扱うときに使います。

`prisma.compute.ts` は、すべてのデプロイで必須ではありません。シンプルなアプリなら、`@prisma/cli app deploy --framework ... --entry ... --http-port ... --env ...` でデプロイできます。設定ファイルは、こうしたアプリ単位のデフォルトに型を付けて、何度でも同じように使えるようにするためのものです。

モノレポや複数のアプリのリポジトリでは、`prisma.compute.ts` を使います。どのアプリのデプロイ先がどの `root` にあり、それぞれのデプロイ先にどのフレームワーク・エントリーポイント・環境変数のデフォルトを使うかを Compute に伝える、現実的な方法だからです。

## `init` で設定を生成する

単一のアプリの新しい設定は、手で書くよりも `bunx @prisma/cli@latest init` で生成するのがおすすめです。deploy と同じ仕組みでフレームワークを検出し、`name`、`framework`、`httpPort`（Bun と Hono では `entry` も）を固定し、それぞれの値とその根拠を事前に表示します。エディターで型を使うための `@prisma/compute-sdk` の devDependency の追加と、Project とのつなぎ込みも提案してくれます。便利なフラグは、`--framework`、`--entry`、`--http-port`、`--name`、`--no-link`、`--json` です。

`--format json` を付けると、TypeScript の設定ではなく、依存関係のない静的な `prisma.compute.json` を書き出します。あとで設定をプログラムで書く必要が出てきたら、`init --format ts` を明示して実行すると、その場で変換されます。`init` は、Compute の設定がすでにあると `INIT_CONFIG_EXISTS` で失敗し、アプリのコードのひな形は作らず、デプロイもしません。複数のアプリのモノレポの設定は、今も手で書きます。

## ファイル名と検出

正式なファイル名は `prisma.compute.ts` です。読み込みの仕組みは、次のファイル名も受け付けます。

```text
prisma.compute.mts
prisma.compute.js
prisma.compute.mjs
prisma.compute.cjs
prisma.compute.json
```

`prisma.compute.json` は、同じ設定を静的に、依存関係なしで書いたものです。ほかのファイルと同じように検出され、読み込まれます。

1つのディレクトリには、Compute の設定ファイルを1つだけ置いてください。複数の名前のファイルが一緒にあると、CLI は `COMPUTE_CONFIG_INVALID` を報告します。

CLI は、実行したディレクトリから、リポジトリやワークスペースの境界まで、上にさかのぼって探します。境界になるのは、`.git`、`pnpm-workspace.yaml`、`bun.lock`、`bun.lockb`、`package.json#workspaces` です。`root` や `env.file` のような設定の中の相対パスは、設定ファイルのディレクトリから解決されます。`--env` フラグのパスは、これまでどおり実行したディレクトリから解決されます。

設定が見つかると、そのディレクトリがローカルの状態を保存する Compute のプロジェクトのディレクトリになります。`.prisma/local.json` と `.prisma/cli/state.json` は、アプリのルートの中とは限らず、その設定ファイルの横に置かれます。

## 基本の形

`@prisma/compute-sdk/config` から `defineComputeConfig` を import します。CLI は設定を読み込むときにこのヘルパーを置き換えるので、実行時に読み込むためだけにローカルに SDK を入れなくても、コマンドは設定を評価できます。

```typescript
import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "api",
    framework: "hono",
    httpPort: 8080,
    env: ".env",
  },
});
```

JavaScript の設定では、ふつうのオブジェクトを default export してもかまいませんが、型チェックのために `prisma.compute.ts` を使うのがおすすめです。

次のどちらか1つだけを書きます。

- デプロイ先が1つなら `app`
- モノレポや複数のアプリのリポジトリなら `apps`

両方を書かないでください。`app`・`apps` のほかに一番上の階層に書けるキーは `region` だけです。これは、deploy で新しいアプリを作るときに使われるプロジェクト単位のデフォルトのリージョンで、アプリごとの設定や `--region` で上書きできます。

## アプリの項目

それぞれのアプリのデプロイ先には、次の項目を書けます。

| 項目 | 意味 |
|-------|---------|
| `name` | デプロイするアプリの名前。省略すると `apps` のキー、それもなければ CLI の推測が使われる。 |
| `region` | deploy で新しいアプリを作るときにだけ使う、Compute のリージョンの ID。既存のアプリは今のリージョンのまま。 |
| `root` | 設定ファイルからの相対パスで書く、アプリのディレクトリ。省略すると設定ファイルのディレクトリ。 |
| `framework` | デプロイのフレームワーク：`nextjs`、`nuxt`、`astro`、`hono`、`nestjs`、`tanstack-start`、`custom`、`bun`。 |
| `entry` | Bun や Hono のようなデプロイでの、アプリのルートからの相対パスで書くエントリーポイント。 |
| `httpPort` | デプロイ先の HTTP のポート。ポートが固定のアプリで使う。 |
| `env` | dotenv ファイルのパスの文字列、または `{ file, vars }`。パスは設定ファイルのディレクトリから解決される。 |
| `build` | `{ command, outputDirectory, entrypoint }`。書いた場合、そのデプロイ先のビルドの設定は、この設定で決まる。 |

`env` の例：

```typescript
export default defineComputeConfig({
  app: {
    framework: "nextjs",
    env: {
      file: [".env", ".env.production"],
      vars: {
        NODE_ENV: "production",
      },
    },
  },
});
```

コミットする `vars` に、秘密の値を直接書かないでください。秘密の値は、Platform の環境変数、CI のシークレット、またはバージョン管理の外で意図して管理している dotenv ファイルに置きます。

`build` の例：

```typescript
export default defineComputeConfig({
  app: {
    framework: "nextjs",
    build: {
      command: "pnpm build",
      outputDirectory: ".next/standalone",
    },
  },
});
```

`command: null` でビルドの手順を飛ばすのは、アプリのルートにデプロイできる成果物がすでにあるときだけにしてください。

独自やビルド済みの成果物では、デプロイ先を明示します。

```typescript
export default defineComputeConfig({
  app: {
    framework: "custom",
    build: {
      command: "npm run build",
      outputDirectory: "build",
      entrypoint: "handler.js",
    },
  },
});
```

出力のディレクトリを設定している場合、`build.entrypoint` は `build.outputDirectory` からの相対パスになります。出力のディレクトリがない Bun や Hono の設定では、エントリーポイントを使うビルドが、ソースのエントリーポイントを指定できます。`entry` と `build.entrypoint` が同じファイルを指すのでなければ、両方を書かないでください。

設定の `build` は、対応しているすべてのフレームワークで使えます。設定でビルドできる種類は、`nextjs`、`nuxt`、`astro`、`nestjs`、`tanstack-start`、`custom`、`bun` です（`hono` は `bun` の方式でビルドされる）。必須なのは `custom` だけで（`build.outputDirectory` と `build.entrypoint`）、ほかのフレームワークでは、推測されたビルドの設定を上書きします。

## モノレポと複数のアプリのリポジトリ

モノレポでは、リポジトリやワークスペースのルートに `prisma.compute.ts` を置いて、`apps` を使います。こうすると、プロジェクトとのつなぎ込みやローカルの `.prisma/` の状態はリポジトリのルートに置いたまま、それぞれのアプリを自分の `root` からビルドできます。

```typescript
import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  apps: {
    web: {
      root: "apps/web",
      framework: "nextjs",
      env: "apps/web/.env",
    },
    api: {
      root: "apps/api",
      framework: "hono",
      entry: "src/index.ts",
      httpPort: 8080,
      env: {
        file: "apps/api/.env",
        vars: {
          LOG_LEVEL: "info",
        },
      },
    },
    frontend: {
      root: "apps/frontend",
      framework: "custom",
      build: {
        command: "pnpm --filter frontend build",
        outputDirectory: "dist/server",
        entrypoint: "index.mjs",
      },
    },
  },
});
```

デプロイ先の選び方：

```bash
bunx @prisma/cli@latest app deploy web
bunx @prisma/cli@latest app deploy api
bunx @prisma/cli@latest app build api
bunx @prisma/cli@latest app run api --port 8080
```

`[app]` の引数を渡さなくても、実行したディレクトリが設定された `root` の中なら、コマンドはデプロイ先を推測できます。当てはまるルートが複数あれば、一番深いものが使われます。複数のアプリの設定でデプロイ先を推測できない場合、引数なしの deploy は、書かれた順にすべてのデプロイ先をデプロイできます。

```bash
bunx @prisma/cli@latest app deploy --branch feature/foo --json --no-interactive
```

すべてをデプロイするときは、`--app`、`--framework`、`--entry`、`--http-port`、`--region`、`--env`、`PRISMA_APP_ID` のような、アプリごとの上書きは受け付けられません。プロジェクト、ブランチ、本番、確認のフラグは、実行全体に効きます。データベースの準備は、データベースとプロジェクトの環境変数のコマンドで明示的に行ってください。

ローカルのビルドや実行のコマンドは、一度に複数のアプリを扱えないため、複数のアプリの設定でも、`app build` と `app run` には1つのデプロイ先の指定が必要です。

そのほかのデプロイ先のルール：

- 項目が1つだけの `apps` なら、引数なしでその唯一のデプロイ先をデプロイできる。
- 単一の `app` の設定では、`[app]` は設定された `name` と同じときだけ受け付けられる。
- Compute の設定ファイルがないのに `[app]` を書くと、使い方のエラーになる。

## 優先順位

明示したフラグは、設定の値より優先されます。

- `--framework` は `framework` を上書きする
- `--entry` は `entry` を上書きする
- `--http-port` は `httpPort` を上書きする
- `--region` は `region` を上書きする
- `--env` フラグを1つでも付けると、設定の環境変数の入力がすべて置き換わる
- `--app` と `PRISMA_APP_ID` は、設定のアプリ名より優先される

`region` は、アプリを選ぶためのものではありません。設定の `region` と `--region` は、deploy で新しいアプリを作るときにだけ使われます。選んだアプリがすでにあれば、deploy はそのアプリの今のリージョンのままにします。

`prisma.compute.ts` で、Workspace、Project、Branch、本番へのデプロイの意図を選ぶことはありません。これらは、CLI のフラグ、環境変数、`.prisma/local.json`、CI の設定に置きます。

```bash
bunx @prisma/cli@latest app deploy api \
  --project proj_123 \
  --branch feature/foo \
  --prod \
  --yes
```

## データベースの範囲

設定でデータベースは宣言しません。データベースについての意図は、`database create`、プロジェクトの環境変数のコマンド、または外部の自動化に置いてください。すべてをデプロイするとき、マイグレーション、環境変数についての注意は、[`app-deploy-cli.md`](app-deploy-cli.md) を読んでください。

## `prisma.config.ts` との関係

Compute のデプロイのデフォルトを `prisma.config.ts` に書かないでください。Prisma ORM は `prisma.config.ts` を、Compute は `prisma.compute.ts` を使います。
