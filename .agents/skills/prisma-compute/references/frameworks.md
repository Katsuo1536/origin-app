# Prisma Compute でのフレームワークの準備

アプリを Prisma Compute にデプロイできるか、どうデプロイするかを判断するときに、このリファレンスを使います。

## CLI を中心にした考え方

デプロイの手段は `@prisma/cli app deploy` だと考えてください。`create-prisma` は新しいプロジェクトのひな形を作るためのもので、便利なデフォルトと、一部のテンプレートでは `compute:deploy` スクリプトを生成できます。

Compute のデプロイが対応しているフレームワークのキーは次のとおりです。

```text
nextjs
nuxt
astro
hono
nestjs
tanstack-start
custom
bun
```

自動検出の条件：

- Next.js：`next.config.*` か、`next` の依存関係
- Nuxt：`nuxt.config.*` か、`nuxt` の依存関係
- Astro：`astro.config.*` か、`astro` の依存関係
- Hono：`hono` の依存関係
- NestJS：`nest-cli.json` か、`@nestjs/core` の依存関係
- TanStack Start：`@tanstack/react-start` か `@tanstack/solid-start`
- 独自の成果物：`prisma.compute.ts` での明示的な `framework: "custom"` と、`build.outputDirectory`、`build.entrypoint`
- Bun：明示的な `--entry <path>` か `--framework bun`

検出結果があいまいなときは、`prisma.compute.ts` で `framework` を設定するか、対応している `--framework` の値を渡します。アプリがソースのままのふつうのサーバーなら、サーバーのエントリーポイントを確認したうえで、`framework: "bun"` と `entry` を使うか、`--framework bun --entry <path>` を渡します。アプリがすでに実行できる Node の成果物を作るなら、`framework: "custom"` と `build.outputDirectory`、`build.entrypoint` を使います。

## CLI の対応表

| アプリの形 | デプロイのコマンドの形 | 自動検出 | 必要な出力・エントリーポイント | 注意 |
|-----------|----------------------|---------------|-----------------------|-------|
| Next.js | `--framework nextjs` | あり | standalone の `server.js` の出力 | `output: "standalone"` が必要 |
| Nuxt | `--framework nuxt` | あり | `.output/server/index.mjs` | フレームワークの方式がビルドのデフォルトを用意する。設定の `build` は省略可 |
| Astro | `--framework astro` | あり | standalone の Node サーバーの成果物 | フレームワークの方式がビルドのデフォルトを用意する。設定の `build` は省略可 |
| Hono | `--framework hono` | あり | `main`、`module`、`--entry`、`src/index.ts` から決まる Bun のエントリーポイント | 生成される設定やスクリプトでは、ふつうポートは `8080` に固定 |
| NestJS | `--framework nestjs` | あり | NestJS のサーバーの成果物 | ホストを省略するか `0.0.0.0` で待ち受ける。設定の `build` は省略可 |
| TanStack Start | `--framework tanstack-start` | あり | `.output/server/index.mjs` | Nitro の node の出力が必要 |
| 独自の成果物 | 設定を使う `framework: "custom"` | なし | 設定した `build.outputDirectory` と `build.entrypoint` | ビルド済みや独自にビルドした Node の成果物に使う |
| Bun・ふつうのサーバー | `--framework bun --entry <path>` | エントリーポイントの明示が必要 | サーバーのエントリーポイント | Elysia や独自の HTTP サーバーに使う |
| Elysia | `--framework bun --entry src/index.ts` | 専用のデプロイのキーなし | Bun のエントリーポイント | ポートとホストの扱いを残す |
| SvelteKit | デプロイのフレームワークのキーなし | なし | Node のアダプターかビルド済みの成果物 | `vite preview` をデプロイしない |
| Turborepo | 具体的なアプリのデプロイ先をデプロイする | なし | アプリごとのエントリーポイントや出力 | `apps` を使った `prisma.compute.ts` がおすすめ |

`app build --build-type` は、フレームワークのビルドの種類を使います。ビルドの種類は、`auto`、`nextjs`、`nuxt`、`astro`、`nestjs`、`tanstack-start`、`custom`、`bun` です。

`app run --build-type` はローカルでの開発向けで、`auto`、`bun`、`nextjs` に対応しています。ローカルの開発用サーバーの出力を流すもので、デプロイしたアプリに公開の入り口（ingress）から届くことの証明にはなりません。

`prisma.compute.ts` では、フレームワーク、エントリーポイント、HTTP のポート、環境変数の入力、アプリのルート、リージョン、ビルドの設定を指定できます。設定の `build` は対応しているすべてのフレームワークで使え、どのビルドの種類も設定で指定できます（`nextjs`、`nuxt`、`astro`、`nestjs`、`tanstack-start`、`custom`、`bun`。`hono` は `bun` の方式でビルドされる）。Nuxt、Astro、NestJS では、フレームワークの方式がデフォルトのビルドのコマンドと出力を用意するので、`build` は省略でき、ふつうは不要ですが、書けばそのデフォルトを上書きします。必須なのは `custom` だけです。

下の設定の例は、次の import を前提にしています。

```typescript
import { defineComputeConfig } from "@prisma/compute-sdk/config";
```

## すべてに共通するランタイムの条件

Compute には、サーバーのプロセスが必要です。

- デプロイ先の HTTP のポートで待ち受ける必要がある。`--http-port` を渡さなければ、`@prisma/cli app deploy` はフレームワークのデフォルトの HTTP のポート（ほとんどのフレームワークで 3000、Astro は 4321）を使う。
- すべてのネットワークで待ち受ける必要がある。デプロイするサーバーに `localhost` や `127.0.0.1` を直接書かず、`0.0.0.0`、`server.host: true`、またはフレームワークでそれに当たる設定を使う。
- デプロイできるエントリーポイントか、認識できるフレームワークの出力が必要。
- `vite preview` のような、プレビュー専用のコマンドに頼ってはいけない。
- 環境変数は、`--env`、プロジェクトの環境変数、ブランチの環境変数、または外部の自動化で受け取る必要がある。

ホストとポートは一緒に確認してください。正しいポートで待ち受けていても、自分のパソコン内（ループバック）だけで待ち受けていると、準備完了に見えても、公開の入り口から届きません。

## Next.js

デプロイの形：

```bash
bunx @prisma/cli@latest app deploy --framework nextjs --env .env
```

`next.config.ts` に standalone の出力を入れる必要があります。

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
}

export default nextConfig
```

`nextjs` では `--entry` を渡さないでください。CLI が、フレームワークのビルドの出力からランタイムのエントリーポイントを決めます。

デプロイの環境変数に、`HOSTNAME=localhost` や `HOSTNAME=127.0.0.1` を設定しないでください。standalone のサーバーのホストを上書きするなら、`0.0.0.0` を使います。

## Hono

デプロイの形：

```bash
bunx @prisma/cli@latest app deploy \
  --framework hono \
  --http-port 8080 \
  --env .env
```

設定の形：

```typescript
export default defineComputeConfig({
  app: {
    framework: "hono",
    entry: "src/index.ts",
    httpPort: 8080,
    env: ".env",
  },
});
```

プロジェクトに求められること：

- `package.json` の `main` か `module` がエントリーポイントを指している、または deploy で `--entry src/index.ts` を渡す
- サーバーが `@hono/node-server` を使う
- コードが `process.env.PORT` を読み、なければ `--http-port` と同じポートを使う
- コードで `hostname` を `localhost` や `127.0.0.1` にしない。hostname を明示するなら `0.0.0.0` を使う

ランタイムの例：

```typescript
const rawPort = (process.env.PORT ?? "").trim()
const parsedPort = rawPort.length > 0 ? Number(rawPort) : Number.NaN
const port = Number.isInteger(parsedPort) ? parsedPort : 8080
serve({ fetch: app.fetch, port })
```

## NestJS

デプロイの形：

```bash
bunx @prisma/cli@latest app deploy --framework nestjs --env .env
```

設定の形：

```typescript
export default defineComputeConfig({
  app: {
    framework: "nestjs",
    env: ".env",
  },
});
```

プロジェクトに求められること：

- 検出には `nest-cli.json` か `@nestjs/core` の依存関係が使われる。どちらもなければ `--framework nestjs` を渡す
- `src/main.ts` かコンパイルしたランタイムが、HTTP サーバーを起動する必要がある
- `process.env.PORT` を読み、なければ `--http-port` と同じポートを使う
- `app.listen(port)` でホストの引数を省略するか、`"0.0.0.0"` を渡す。`"localhost"` や `"127.0.0.1"` は渡さない
- Compute の成果物の確認には `app build --build-type nestjs` を使う。`app run --build-type nestjs` には対応していないので、ローカルでは Nest の開発用サーバーを使う

ランタイムの例：

```typescript
const port = Number(process.env.PORT ?? "3000")
await app.listen(port)
```

## TanStack Start

デプロイの形：

```bash
bunx @prisma/cli@latest app deploy --framework tanstack-start --env .env
```

`vite.config.ts` の想定される形：

```typescript
import { defineConfig } from "vite"
import viteReact from "@vitejs/plugin-react"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"

export default defineConfig({
  plugins: [tanstackStart(), nitro(), viteReact()],
})
```

次の点を残しておいてください。

- `nitro` を `dependencies` に残す
- `import { nitro } from "nitro/vite"` を残す
- Vite のプラグインの一覧に `nitro()` を残す
- React の Vite プラグインを `tanstackStart()` のあとに置いたままにする
- Nitro はデフォルトの node サーバーのプリセットのままにする。Compute 用に、edge、static、Cloudflare など、Node 以外のプリセットに切り替えない

ビルドのコマンドは `vite build` です。ビルドで `.output/server/index.mjs` が作られる必要があり、本番での起動の形は次のとおりです。

```json
{
  "scripts": {
    "build": "vite build",
    "start": "node .output/server/index.mjs"
  }
}
```

TanStack Start を、`src/router.tsx` のような Bun のエントリーポイントとしてデプロイしないでください。`.output/server/index.mjs` がなければ、TanStack と Nitro のビルドの流れを直してください。

デプロイしたときに、Nitro が localhost だけで待ち受けないようにしてください。ホストの環境変数や設定を変えている場合は、`localhost` ではなく、フレームワークのすべてのネットワークで待ち受ける設定を使います。

## Nuxt

デプロイの形：

```bash
bunx @prisma/cli@latest app deploy --framework nuxt --env .env
```

設定の形：

```typescript
export default defineComputeConfig({
  app: {
    framework: "nuxt",
    env: ".env",
  },
});
```

Nuxt は、`.output/server/index.mjs` にある Nitro の出力を使います。Nitro のプリセットは、Node のサーバーのランタイムで動くものにしておいてください。

## Astro

デプロイの形：

```bash
bunx @prisma/cli@latest app deploy --framework astro --env .env
```

設定の形：

```typescript
export default defineComputeConfig({
  app: {
    framework: "astro",
    httpPort: 4321,
    env: ".env",
  },
});
```

Astro で Compute に合ったサーバーの出力にするには、ふつう次のような設定が必要です。

```javascript
import { defineConfig } from "astro/config"
import node from "@astrojs/node"

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  server: { host: true },
})
```

## Bun、Elysia、ソースのままのふつうのサーバー

専用の `--framework` の値がないアプリの形には、Bun のデプロイのキーを使います。

```bash
bunx @prisma/cli@latest app deploy \
  --framework bun \
  --entry src/index.ts \
  --http-port 8080 \
  --env .env
```

`app deploy` は、`--framework` なしで `--entry <path>` を付けた場合も、Bun のアプリのデプロイとして扱います。

条件：

- `package.json` の `main` か `module` がランタイムのエントリーポイントを指していなければ、`--entry` を渡す
- エントリーポイントが、ハンドラーを export するだけでなく、HTTP サーバーを起動するようにする
- `process.env.PORT` を読むか、固定の待ち受けのポートに `--http-port` を合わせる
- すべてのネットワークで待ち受ける

Elysia の例：

```typescript
const port = Number(process.env.PORT ?? "8080")
app.listen({ port, hostname: "0.0.0.0" })
```

## 独自のビルドの成果物

アプリがすでにビルド済みのとき、または独自のコマンドで、Compute がそのまま配置すべき実行できる Node の成果物を作るときは、`framework: "custom"` を使います。

```typescript
export default defineComputeConfig({
  app: {
    framework: "custom",
    build: {
      command: "npm run build",
      outputDirectory: "build",
      entrypoint: "handler.js",
    },
    httpPort: 3000,
    env: ".env",
  },
});
```

条件：

- `build.outputDirectory` と `build.entrypoint` の両方を設定する
- `build.entrypoint` は `build.outputDirectory` からの相対パスにする
- 成果物が HTTP サーバーを起動し、すべてのネットワークで待ち受けるようにする
- `command: null` は、出力のディレクトリにデプロイできる成果物がすでにあるときだけ使う

## SvelteKit とそのほかのフレームワーク

`@prisma/cli app deploy --framework` には `svelte` のフレームワークのキーがありません。SvelteKit がその名前で直接デプロイできるとは言わないでください。

専用のデプロイのキーがないフレームワークでは、次のどちらかの方法を使います。

- Node のサーバーの成果物を作り、設定を使う `framework: "custom"` か、対応しているビルド済みや SDK の流れでデプロイする
- アプリにふつうの Node や Bun のサーバーのエントリーポイントがあれば、`--framework bun --entry <path>` でそのエントリーポイントをデプロイする

SvelteKit では、Node のアダプターか、ほかの本番用のサーバーの成果物を使ってください。デプロイするランタイムに `vite preview` を使わないでください。

## Turborepo

デフォルトでは、モノレポのルートではなく、具体的なアプリのパッケージをデプロイします。リポジトリのルートに `prisma.compute.ts` を置き、デプロイ先ごとに `apps` の項目を1つ書くのがおすすめです。

チェックリスト：

- `apps/api` のような、アプリのディレクトリを選ぶ
- 正しいルートやパッケージから、ワークスペースのビルドを実行する
- アプリのパッケージのランタイムのエントリーポイントかフレームワークを渡す
- 正しい環境変数ファイルを渡す（アプリのパッケージの外にあることもある）
- ブランチの環境変数やデータベースの範囲を、デプロイするアプリと揃える

設定の例：

```typescript
export default defineComputeConfig({
  apps: {
    web: { root: "apps/web", framework: "nextjs" },
    api: {
      root: "apps/api",
      framework: "bun",
      entry: "src/index.ts",
      httpPort: 3000,
      env: "packages/db/.env",
    },
  },
});
```

1つのデプロイ先をデプロイする：

```bash
bunx @prisma/cli@latest app deploy api --branch feature/foo --json
```

出力のパスを確認したあとの、フラグだけを使う形：

```bash
bun run build
bunx @prisma/cli@latest app deploy \
  --framework bun \
  --entry apps/api/dist/src/index.js \
  --http-port 3000 \
  --env packages/db/.env
```

このコマンドを使う前に、実際の出力のパスを確認してください。
