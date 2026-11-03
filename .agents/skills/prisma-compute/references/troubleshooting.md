# Prisma Compute のトラブルシューティング

準備、ビルド、デプロイ、環境変数、ランタイムの動きがうまくいかないときに、このリファレンスを使います。

## 最初に確認すること

実行する：

```bash
bunx @prisma/cli@latest --help
bunx @prisma/cli@latest app deploy --help
bunx @prisma/cli@latest auth whoami
bunx @prisma/cli@latest auth workspace list --json
```

そのあと、次の内容を確認します。

```bash
pwd
cat package.json
find .. -maxdepth 3 \( -name 'prisma.compute.ts' -o -name 'prisma.compute.mts' -o -name 'prisma.compute.js' -o -name 'prisma.compute.mjs' -o -name 'prisma.compute.cjs' \) -print
test -f .env && sed -n 's/=.*/=<redacted>/p' .env
```

秘密の情報を、伏せ字にしないまま表示しないでください。

## `prisma.compute.ts` が読み込まれない

これが問題になるのは、プロジェクトが設定を使うデプロイを前提にしているときだけです。`prisma.compute.ts` のないシンプルなアプリでも、`app deploy` のフラグを明示すればデプロイできます。

症状：

- 想定したフレームワーク、エントリーポイント、ポート、環境変数ファイル、アプリのルートが、deploy で無視される
- `api` のようなモノレポのデプロイ先が認識されない
- ローカルの状態が、間違った `.prisma/` ディレクトリに保存される

確認：

```bash
pwd
find .. -maxdepth 4 \( -name 'prisma.compute.ts' -o -name 'prisma.compute.mts' -o -name 'prisma.compute.js' -o -name 'prisma.compute.mjs' -o -name 'prisma.compute.cjs' \) -print
bunx @prisma/cli@latest app deploy --help
```

直し方：

- Compute の設定ファイルは、置いてあるディレクトリに1つだけにする
- リポジトリ全体やモノレポの設定は、リポジトリやワークスペースのルートに置く
- 設定までさかのぼって探せるように、リポジトリやワークスペースの境界の中でコマンドを実行する
- `bunx @prisma/cli@latest app deploy api` のように、`apps` のキーを `[app]` のデプロイ先として使う
- `root` や `env.file` のような設定の中の相対パスは、設定ファイルのディレクトリから解決されることを覚えておく

## Compute の設定が正しくない

症状：

- `COMPUTE_CONFIG_INVALID`
- `COMPUTE_CONFIG_TARGET_REQUIRED`
- `COMPUTE_CONFIG_TARGET_UNKNOWN`
- "Multiple compute config files found"

直し方：

- `defineComputeConfig({ app: ... })` か `defineComputeConfig({ apps: ... })` を export する
- `app` か `apps` のどちらか1つだけを書く
- 一番上の階層の不明なキーを消す
- 複数のアプリの build や run のコマンドでは、`app build web` のようにデプロイ先を渡す
- 複数のアプリのデプロイでは、`app deploy api` のように、存在する `apps` のキーを渡す
- `nuxt`、`astro`、`nestjs` では、意図して独自の `build` で上書きするのでなければ、方式のデフォルトを使う（今の設定では上書きもできる）
- `framework: "custom"` では、`build.outputDirectory` と `build.entrypoint` の両方を設定する
- 設定できるフレームワークで `build.outputDirectory` を設定したとき、そのフレームワークがランタイムのエントリーポイントの設定を必要とするなら、`build.entrypoint` も設定する

立て直すための最小限の設定：

```typescript
import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    framework: "hono",
    entry: "src/index.ts",
    httpPort: 8080,
  },
});
```

## `create-prisma --yes` でデプロイされなかった

`--yes` は質問を飛ばすだけで、デプロイを選ぶわけではありません。`--deploy` を明示してください。

```bash
bunx create-prisma@latest --name my-api --template hono --provider postgresql --deploy
```

組み込みのデプロイを最後までできなかった場合は、ひな形の作成は成功していても、デプロイは失敗したと報告してください。

## 意図せず Prisma Postgres が用意された

PostgreSQL を使い、`--database-url` も `--no-prisma-postgres` もないと、準備の段階で Prisma Postgres が用意されることがあります。ローカルの簡単な動作確認では、次を渡します。

```bash
--no-prisma-postgres --database-url "postgresql://USER:PASSWORD@HOST:PORT/DB"
```

Prisma のコマンドを実行する必要があるなら、使い捨ての本物のデータベースの URL を使ってください。

## 認証に失敗する

症状：

- `project list` が失敗する
- `auth whoami` が失敗する
- ブラウザーでのログインが終わっていない
- 2回目のログインのあと、コマンドが違うワークスペースを使う
- 別のワークスペースがローカルに保存されているのに、コマンドがログアウトしたような動きをする
- `PRISMA_SERVICE_TOKEN` がない、空、期限切れ、またはワークスペースやプロジェクトの権限がない

直し方：

```bash
bunx @prisma/cli@latest auth login
bunx @prisma/cli@latest auth whoami
bunx @prisma/cli@latest auth workspace list --json
```

ローカルの OAuth のワークスペースが複数あるときは、明示して切り替えます。JSON の ID を使うのがおすすめです。

```bash
bunx @prisma/cli@latest auth workspace use <workspace-id>
bunx @prisma/cli@latest auth whoami --json
bunx @prisma/cli@latest project list --json
```

人が使うターミナルでは、引数なしの `auth workspace use` で、対話の選択画面が開くか、ローカルの OAuth のワークスペースが1つだけなら質問なしでそれが選ばれます。対話なしや `--json` のモードでは、代わりに `auth workspace use <id-or-name>` を使ってください。

有効なワークスペースがログアウトされた、またはトークンの更新に失敗した場合、CLI は意図して、別の保存済みのワークスペースに切り替えずに、OAuth のコマンドではログアウトした状態のままにします。`auth workspace list --json` を実行してから `auth workspace use <workspace-id>` を実行して、元に戻してください。

ローカルの OAuth のワークスペースのセッションを1つだけ消すには：

```bash
bunx @prisma/cli@latest auth workspace logout <workspace-id-or-name>
# または：
bunx @prisma/cli@latest auth logout --workspace <workspace-id-or-name>
```

引数なしの `auth logout` は、ローカルの OAuth のワークスペースのセッションをすべて消したいときだけ使ってください。

CI では、`@prisma/cli` は `PRISMA_SERVICE_TOKEN` で認証できます。

```bash
test -n "${PRISMA_SERVICE_TOKEN:-}" && echo "PRISMA_SERVICE_TOKEN is set"
bunx @prisma/cli@latest auth whoami
bunx @prisma/cli@latest app deploy --json --no-interactive --prod --yes --env .env
```

`PRISMA_SERVICE_TOKEN` が設定されていて空でなければ、それが有効な認証の手段になり、コマンドの実行では、ローカルの OAuth のワークスペースを切り替えられません。`auth workspace use` でローカルの OAuth のワークスペースを変える前に、`PRISMA_SERVICE_TOKEN` を外してください。

`PRISMA_SERVICE_TOKEN` が設定されているのに空の場合、CLI はブラウザーでログインした認証情報を試す前にエラーになります。外すか、正しいワークスペースのサービストークンを指定してください。トークンの値を絶対に表示・記録・貼り付けしないでください。確認するのは、あるかどうかだけにします。

調査のための、ローカルの保存場所についてのヒント：

- テストを切り分けるときは、`PRISMA_COMPUTE_AUTH_FILE` で認証の保存場所を上書きする。
- macOS の OAuth の認証情報のデフォルトのファイル：`~/Library/Application Support/prisma/auth.json`。
- 有効なワークスペースの情報を入れた横のファイル：`~/Library/Application Support/prisma/auth.context.json`。
- プロジェクトとのつなぎ込み：`.prisma/local.json`。
- ローカルのアプリやプロジェクトの状態：`.prisma/cli/state.json`。ふつうは、見つかった `prisma.compute.ts` の横にある。

認証情報のファイルやトークンの値を、ログに出さないでください。

## プロジェクトの準備に失敗する

症状：

- `PROJECT_SETUP_REQUIRED`
- 対話なしのデプロイで Project を選べない
- デプロイで Project が作られるはずだったのに、作られなかった

直し方：

```bash
bunx @prisma/cli@latest app deploy --project <id-or-name> --json --no-interactive
bunx @prisma/cli@latest app deploy --create-project <name> --yes
```

`--yes` だけで Project の範囲が決まると思わないでください。`--project`、`--create-project`、`PRISMA_PROJECT_ID` は一緒に使えません。

## `DATABASE_URL` がない、または仮の値のまま

症状：

- Prisma Client が `DATABASE_URL is required` のエラーを出す
- マイグレーションのスクリプトがすぐに失敗する
- デプロイは動くが、アプリがデータベースにアクセスするときに失敗する

直し方：

1. 本番で使える本物の `DATABASE_URL` を、`.env` かプロジェクトの環境変数に入れる。
2. `prisma generate` を実行する。
3. プロジェクトの `db:migrate` か、本番用のマイグレーションのコマンドでマイグレーションを実行する。
4. `--env .env` を付けるか、プロジェクトの環境変数を設定して、再デプロイする。

はっきりした失敗の原因が、Prisma Client の生成やランタイムでの環境変数の読み込みなら、Prisma に関する設定を確認します。

```bash
test -f prisma.config.ts && sed -n '1,160p' prisma.config.ts
test -f prisma/schema.prisma && sed -n '1,220p' prisma/schema.prisma
```

`postgresql://USER:PASSWORD@HOST:PORT/DATABASE` のような仮の値のまま、絶対にデプロイしないでください。

## ブランチ、環境変数、データベースが違う

症状：

- プレビューのデプロイが、本番の環境変数を読む
- ブランチのデプロイで `DATABASE_URL` が見つからない
- アプリは想定したブランチにデプロイされているが、違うデータベースを指している
- 失敗している URL が別のデプロイ ID のものなのに、今のアプリのログを確認している

確認：

```bash
bunx @prisma/cli@latest project show --json
bunx @prisma/cli@latest project env list --role production --json
bunx @prisma/cli@latest project env list --role preview --json
bunx @prisma/cli@latest project env list --branch feature/foo --json
bunx @prisma/cli@latest app list-deploys --json
bunx @prisma/cli@latest app logs --deployment <deployment-id> --json
```

直し方：

- `app deploy`、`database create`、ブランチごとの `project env` のコマンドに、同じ `--branch <git-name>` を渡す
- 本番の環境変数には `--role production`、プレビューのひな形の環境変数には `--role preview` を使う
- デプロイの JSON からデプロイ ID と URL を控えて、`app logs --deployment <deployment-id>` でログを確認する
- `app show`、`app list-deploys`、`app logs` はブランチで絞り込めないので、デプロイ ID を控えて使う
- `app promote <deployment-id>` は、本番の環境変数でビルドし直すので、本番に対する操作として扱う
- `prisma.compute.ts` で Project、Branch、本番、データベースの範囲が選ばれるとは思わない。設定が用意するのは、アプリのデプロイのデフォルトだけ

## データベースのつなぎ込みやスキーマが反映されない

症状：

- デプロイは動くが、アプリが `DATABASE_URL` を見つけられない
- データベースの環境変数はあるが、データベースが空
- すべてをデプロイしたときに、複数のアプリが同じブランチのデータベースを指している

直し方：

- データベースと環境変数についての注意は、[`app-deploy-cli.md`](app-deploy-cli.md) の `Database and Env` を読む
- 意図したブランチやアプリの範囲に、データベースの環境変数を明示して作成・割り当てする
- データベースの準備のあとに、マイグレーション、シードデータの投入、スキーマの反映を自分で実行する。Compute がスキーマの変更を反映してくれることはない
- 複数のアプリをすべてデプロイするときに、アプリごとにデータベースを分けたいなら、デプロイの前に、それぞれのデータベースの環境変数を明示して作成・割り当てする

## ワークスペースのプランの上限に達した

インストールした CLI が `PLAN_LIMIT_REACHED` を返したら、Compute やデータベースの障害ではなく、ワークスペースのプランによる制限として扱います。

エージェントや CI で扱うときは、関係するデータベースのコマンドを `--json` 付きで実行し、`error.code === "PLAN_LIMIT_REACHED"` で処理を分けます。`error.meta.upgradeUrl`、`planName`、`workspaceId`、`usageBlocked` を読み取ります。省略できる値は `null` のことがあります。これは Compute やデータベースの障害ではなく、ワークスペースのプランによる制限です。正式なアップグレードの URL が返されたらそれを使い、なければ Prisma Console をユーザーに案内してください。障害として再試行したり、ステータスコードやメッセージの文章からプランの上限だと推測したりしないでください。

## Next.js の standalone がない

エラーの形：

```text
Next.js build did not produce standalone output
```

`next.config.ts` を直します。

```typescript
const nextConfig = {
  output: "standalone",
}

export default nextConfig
```

そのあと、必要ならインストールやビルドをやり直して、もう一度デプロイします。

## ビルドは成功したのに Next.js の依存関係が見つからない

pnpm や Bun の分離されたワークスペースでは、デプロイのビルドは成功するのに、役に立つランタイムのログが出る前に終了する、という症状が出ることがあります。多くの場合、`styled-jsx` やほかの追跡された依存関係で `Cannot find module` になります。

今の Compute SDK は、Next の standalone の出力を配置するときに、成果物の中のパッケージストアのシンボリックリンクを残し、成果物の外を指す安全なものだけを実体化します。`.next/standalone/node_modules` のシンボリックリンクを手で平らにしたり書き換えたりしないでください。分離されたストアの構成が壊れることがあります。

直し方：

1. `@prisma/compute-sdk` と `@prisma/cli` を今のバージョンに上げる。
2. プロジェクトに合わせて、生成されたビルドの成果物やキャッシュだけを消してから、ビルドし直す。
3. `output: "standalone"` を確認して再デプロイし、新しいデプロイのログを確認する。
4. それでも直らなければ、パッケージマネージャー、ワークスペースの構成、最初に見つからなかったモジュール、SDK と CLI のバージョンを、秘密の情報を含めずに `@prisma/cli feedback` で報告する。

## Nitro のエントリーポイントがない

Nuxt や TanStack Start のエラーの形：

```text
.output/server/index.mjs
```

全般的な直し方：

- 正しいフレームワークのプラグインがインストールされていることを確認する
- フレームワークのビルドをローカルで実行する
- Node 以外を対象にする、独自の Nitro のプリセットを使わない
- Nitro のデフォルトの node サーバーのプリセットを使う

TanStack Start に限った直し方：

- `nitro` を `dependencies` に残す
- `vite.config.ts` に `import { nitro } from "nitro/vite"` を残す
- `plugins: [tanstackStart(), nitro(), viteReact()]`、またはフレームワークでそれに当たるプラグインの順番を残す
- `bun run build` を実行して、`.output/server/index.mjs` があることを確認する
- 本番のサーバーを `vite preview` に置き換えない

Compute の検出は、`@tanstack/react-start` か `@tanstack/solid-start` を見つけると TanStack Start を選びます。そのうえで Nitro のエントリーポイントがない場合は、TanStack と Nitro のビルドの出力を直してください。Compute が黙って Bun のデプロイを使ってくれるとは思わないでください。

## Bun のエントリーポイントがない

エラーの形：

```text
Entrypoint is required
Entrypoint file does not exist
```

次のどちらかで直します。

```json
{
  "main": "src/index.ts"
}
```

または、次のようにデプロイします。

```bash
bunx @prisma/cli@latest app deploy --framework bun --entry src/index.ts
```

## ポートが合っていない

症状：

- デプロイは成功するが、アプリにアクセスできない
- ヘルスチェックが失敗する
- ログに、サーバーが別のポートで待ち受けていると出る

直し方：

- `process.env.PORT` を読む
- アプリのポートが固定なら、`--http-port <port>` を渡す
- 生成された `compute:deploy` スクリプトがあれば、それを使う
- `@prisma/cli app deploy` のデフォルトは HTTP の `3000` であることを覚えておく。生成された Hono や Elysia のプロジェクトは、ふつう `prisma.compute.ts` か、`--http-port 8080` のフラグを使うスクリプトで `8080` を設定している
- テンプレートのデフォルトを使う：Hono・Elysia は `8080`、Next・TanStack・Nuxt は `3000`、Astro は `4321`

## 公開 URL での簡単な動作確認に失敗する

症状：

- デプロイのコマンドは完了した
- `app show` かデプロイの出力に URL がある
- 公開 URL がタイムアウトする、5xx を返す、または想定外のページを返す

確認：

```bash
curl -i https://<deployment-url>
curl -i https://<deployment-url>/health
bunx @prisma/cli@latest app logs --json
```

最初に出たはっきりした失敗に沿って直します。

- 接続のタイムアウトや 5xx：ログ、ホストの待ち受け先、ポートの割り当てを確認する
- 想定外のステータスや本文：ルートのパスと、アプリのフレームワークの出力を確認する
- 間違えてローカルの URL を試していた：`localhost` や `127.0.0.1` ではなく、公開されたデプロイの URL でやり直す

## localhost で待ち受けている

症状：

- デプロイで、アプリが起動した、またはポートが確認されたと出るのに、公開 URL にアクセスできない
- ログに、サーバーが `localhost` や `127.0.0.1` で待ち受けていると出る
- `app run` ではローカルで動くのに、デプロイしたアプリが外部からの通信を受け取れない

起きる理由：

Compute の起動の監視は、`/proc/net/tcp` と `/proc/net/tcp6` を定期的に見て、設定したポートが `LISTEN` になったかを確認しています。この準備完了の判定はポートを見ているだけで、アプリが `127.0.0.1` で待ち受けているか、すべてのネットワークで待ち受けているかは見ていません。そのため、自分のパソコン内（ループバック）だけで待ち受けていても準備完了に見え、公開の入り口からは届かないままになることがあります。

直し方：

- サーバーのホストに直接書いた `localhost` や `127.0.0.1` を消す
- `0.0.0.0`、または Astro の `server.host: true` のような、フレームワークでそれに当たる設定で待ち受ける
- Next.js の standalone では、`HOSTNAME=localhost` でデプロイしない。ホストを上書きするなら `HOSTNAME=0.0.0.0` を使う
- ポートとホストは一緒に直す：`0.0.0.0:<deployed-http-port>`

## 環境変数の変更が反映されない

生成された `compute:deploy` スクリプトは、生成されたフラグや `prisma.compute.ts` を使って再デプロイします。マイグレーションもシードデータの投入もしません。

環境変数を変えたあと：

```bash
bunx @prisma/cli@latest project env list
bunx @prisma/cli@latest project env list --branch feature/foo
bunx @prisma/cli@latest app deploy --prod --yes --env .env
bunx @prisma/cli@latest app deploy --branch feature/foo --env .env.preview
```

ブランチごとの環境変数を使っている場合は、ブランチ名と役割（role）を確認してください。

## ログが必要なとき

今のアプリのランタイムのログ：

```bash
bunx @prisma/cli@latest app logs
```

特定のデプロイ：

```bash
bunx @prisma/cli@latest app logs --deployment <deployment-id>
```

プログラムで読める形式：

```bash
bunx @prisma/cli@latest app logs --json
```

GitHub や Console のビルドのビルドログ：

```bash
bunx @prisma/cli@latest build logs <build-id>
bunx @prisma/cli@latest build logs <build-id> --follow
bunx @prisma/cli@latest build logs <build-id> --json
```

GitHub のチェックの実行、Console のビルドのページ、Management API のビルドの記録から得た Build ID を使うビルドの出力には `build logs` を、今のアプリのデプロイやデプロイ ID を使うランタイムのログには `app logs` を使います。

関係するエラーをまとめてください。秘密の情報は貼り付けないでください。

## 解決できない CLI の問題を報告する

上の確認をしても CLI の失敗が直らないとき、またはコマンドが `UNEXPECTED_ERROR` でクラッシュしたときは、Prisma チームに報告します。

```bash
bunx @prisma/cli@latest feedback "app deploy crashed: <first error line>"
```

`--json` のクラッシュ情報の `nextActions` に入力済みのコマンドがあれば、それをそのまま使うのがおすすめです。報告は匿名です。メッセージに、秘密の情報、接続 URL、トークンを絶対に含めないでください。
