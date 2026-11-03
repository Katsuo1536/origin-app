# SDK と API による自動化

`create-prisma` や `@prisma/cli app deploy` を使うのではなく、自動化の仕組みを作るときに、このリファレンスを使います。

## アプリの作業には CLI を優先する

ふつうのアプリのデプロイでは：

1. 生成された `compute:deploy` があれば、それを使う。
2. なければ `@prisma/cli app build/run/deploy` を使う。
3. SDK や API は、独自の自動化、Platform との連携、ツールを作る人向けにだけ使う。

## Compute SDK

インストール：

```bash
npm install @prisma/compute-sdk @prisma/management-api-sdk
```

設定のヘルパー：

```typescript
import { defineComputeConfig } from "@prisma/compute-sdk/config";
```

型チェックのために、`prisma.compute.ts` でこの import を使います。このヘルパーは受け取った値をそのまま返す関数です。CLI は設定ファイルを評価するときにこの import を置き換えるので、Compute の設定を読み込むためだけに、ユーザーのプロジェクトに SDK を入れる必要はありません。

認証済みの Management API の Client を作る：

```typescript
import { createManagementApiClient } from "@prisma/management-api-sdk"

const apiClient = createManagementApiClient({
  token: process.env.PRISMA_API_TOKEN,
})
```

トークンの名前は、使う場所によって違います。`@prisma/cli app ...` は、対話なしのサービストークンの認証に `PRISMA_SERVICE_TOKEN` を使います。ここでの SDK の例は、`createManagementApiClient` にトークンを渡すためのアプリ側の決まりとして `PRISMA_API_TOKEN` を使っています。SDK 自体が受け取るのは、`token` の文字列だけです。

ビルド済みの成果物をデプロイする：

```typescript
import { ComputeClient, PreBuilt } from "@prisma/compute-sdk"

const compute = new ComputeClient(apiClient)
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is required")

const result = await compute.deploy({
  strategy: new PreBuilt({
    appPath: "./dist",
    entrypoint: "index.js",
  }),
  projectId: "proj_abc",
  appName: "my-app",
  // region: "us-east-1", // 省略可：新しいアプリの配置先を明示する
  envVars: { DATABASE_URL: databaseUrl },
  portMapping: { http: 3000 },
})

if (result.isOk()) {
  console.log(result.value.deploymentEndpointDomain)
} else {
  console.error(result.error.message)
}
```

SDK のメソッドは `Result<T, E>` を返します。エラーで例外が投げられると決めつけずに、`isOk()` か `isErr()` を確認してください。デプロイの結果には、`appId`、`appName`、`projectId`、`region`、`deploymentId`、`deploymentEndpointDomain`、`appEndpointDomain`、`promoted`、`previousDeploymentId`、`previousDeploymentAction`、`resolvedConfig` など、App と Deployment に関する項目が入っています。

## SDK のビルドの方式

Compute SDK のビルドの方式：

- `AutoBuild`：Next.js、Nuxt、Astro、NestJS、TanStack Start、最後に Bun の順に、対応しているフレームワークの方式を試す
- `NextjsBuild`：standalone の出力が必要で、`server.js` を返す
- `NuxtBuild`：`.output/server/index.mjs` があることを前提にする
- `AstroBuild`：`dist/server/entry.mjs` があることを前提にする
- `NestjsBuild`：NestJS の HTTP サーバーの成果物をビルドする
- `TanstackStartBuild`：`vite build` を実行し、`.output/server/index.mjs` に Nitro の Node サーバーがあることを前提にする。Vite の設定に `tanstackStart()` と `nitro()` を残しておく
- `CustomBuild`：設定されたビルドの設定があれば実行し、設定された成果物のエントリーポイントを用意する
- `BunBuild`：`bun build` を実行する。エントリーポイントの明示か、`package.json` の `main` が必要
- `PreBuilt`：既存の成果物のディレクトリと、相対パスのエントリーポイントを使う

## リージョン

SDK で使えるリージョンの ID：

```text
us-east-1
us-west-1
eu-west-3
eu-central-1
ap-northeast-1
ap-southeast-1
```

`@prisma/cli app deploy` の `--region` や、SDK のデプロイの入力の `region` は、新しい Compute のアプリを作るときにだけ使います。既存のアプリは、今のリージョンのままです。

`region` は、`deploy` と `createApp` で省略できます。アプリを作るときに省略すると、Project や Platform のデフォルトが使われます。配置先がアプリの要件でない限り、リージョンを直接書かないでください。

## リポジトリのスナップショットからの検出

リポジトリのファイルの一覧をすでにメモリ上に持っているツールは、ファイルを取り出さずに、デプロイできるアプリを検出できます。

```typescript
import { detectComputeApp } from '@prisma/compute-sdk/config'

const detected = detectComputeApp({
  root: 'apps/api',
  manifest: {
    main: 'src/index.ts',
    scripts: { start: 'bun src/index.ts' },
    dependencies: { hono: '^4' },
  },
  filePaths: ['apps/api/package.json', 'apps/api/src/index.ts'],
})
```

結果には、`framework`、`frameworkName`、`buildType`、`httpPort`、`entrypoint` と、検出の根拠（`evidence`）が入ります。デプロイできるものがなければ `null` です。パスはリポジトリからの相対パスで、安全でない絶対パスや親ディレクトリへさかのぼるエントリーポイントは拒否されます。

このヘルパーが検出するのは、アプリのルート1つだけです。モノレポで使う場合は、ワークスペースを列挙して、候補ごとに1回ずつ呼ぶ必要があります。検出では `dependencies` と `devDependencies` を読み（peer dependencies は読まない）、設定ファイルやフレームワークのパッケージを認識し、正しい `start` や `serve` のスクリプトのエントリーポイントから、Bun で動くサーバーを推測することもできます。

## Management API の概念

Compute のリソースは、おおよそ次のように対応します。

- Project：親になる入れ物
- Branch：環境変数を決めたり、データベースや環境変数をつないだりするための、本番またはプレビューの範囲
- App：変わらないアプリの入り口（エンドポイント）と、ブランチとのつながり
- Deployment：ビルドの成果物と、実行の状態、プレビューの URL

低いレベルの公開のルートでは、App と Deployment という名前を使います。

- プロジェクトの中のアプリの一覧・作成は `/v1/apps`
- アプリの取得・更新・削除
- アプリのデプロイの作成・一覧
- デプロイの取得・開始・停止・削除は `/v1/deployments/:deploymentId`
- `deploymentId` を使って、アプリを昇格させる・ロールバックする
- ログの受け取りは `/v1/deployments/:deploymentId/logs`
- 独自ドメインの管理

コードの中には、互換性のための内部の別名がまだ出てくることがあります。新しいドキュメント、スキル、自動化では、App と Deployment の名前を使ってください。

環境変数は、低いレベルのデプロイ作成のデータに直接は入れません。どの範囲の環境変数を使うかは、つないだブランチの役割で決まります。プレビューのブランチならブランチ単位の変数が、本番のブランチ（またはブランチなし）ならプロジェクト単位の本番の変数が使われます。先に、プロジェクトや環境変数の API か、CLI の環境変数のコマンドで環境変数を書き込み、アプリの作成、データベースの作成、環境変数の書き込みで、ブランチ名を揃えてください。

CLI と SDK の自動化を一緒に使うとき：

```bash
bunx @prisma/cli@latest project env add --file .env.preview --branch feature/foo
bunx @prisma/cli@latest database create preview-db --branch feature/foo --json
bunx @prisma/cli@latest app deploy --branch feature/foo --json --no-interactive
```

本番への昇格は、「同じブランチに別のラベルを付けるだけ」ではありません。`app promote <deployment-id>` は、本番の環境変数を使ってビルドし直します。

## 秘密の情報と伏せ字

Management API でデプロイを調べると、環境変数の名前は見えますが、値は伏せ字になっています。`[redacted]` のような値は目印であり、実際にデプロイされた値ではありません。

次のものをログに出さないでください。

- サービストークン
- OAuth のトークン
- データベースの URL の全体
- 環境変数の値
- 署名付きのアップロード用 URL
