---
name: prisma-compute
description: Prisma Compute のデプロイとホスティングのガイド。ユーザーが Prisma Compute、`prisma.compute.ts`、`defineComputeConfig`、Prisma アプリのデプロイやホスティング、`@prisma/cli app deploy`、`compute:deploy`、`create-prisma --deploy`、`PRISMA_SERVICE_TOKEN`、Compute の認証やワークスペース、アプリ・デプロイ・ビルドログ・ドメイン、localhost と `0.0.0.0` の違い、デプロイ時のポートの割り当て、Hono・Elysia・Next.js・TanStack Start・Astro・Nuxt・Svelte・Nest・Turborepo・独自やビルド済みの成果物のデプロイ準備について話したときに使う。
license: MIT
metadata:
  author: prisma
  version: "1.5.1"
---

# Prisma Compute

エージェントが、Prisma Compute のアプリの作成、デプロイ、運用、フレームワークごとのデプロイ準備を進められるように案内します。

## Prisma Compute の CLI

Compute のアプリの作業には、Prisma Platform の CLI を使います。

```bash
bunx @prisma/cli@latest app deploy --help
bunx @prisma/cli@latest app --help
bunx @prisma/cli@latest build logs --help
bunx create-prisma@latest --help
```

Compute のアプリのデプロイには `@prisma/cli@latest` を、新しいプロジェクトのひな形作りには `create-prisma@latest` を使います。

## フィードバックを送る・CLI の問題を報告する

CLI には、フィードバックを送る機能が組み込まれています。コマンドがクラッシュした（`UNEXPECTED_ERROR`）、トラブルシューティングをしても失敗が解決しない、ユーザーが Prisma チームにフィードバックを送りたいと言った、といったときに使います。

```bash
bunx @prisma/cli@latest feedback "app deploy crashed: <first error line>"
bunx @prisma/cli@latest feedback "love the deploy flow" --email you@example.com
```

クラッシュしたときの出力も、自然にここへ案内します。`--json` のクラッシュ情報には、入力済みのコマンドがそのまま `nextActions` の `recover` として入っているので、それを書き換えずに実行します。人が読む形式のクラッシュ出力の最後には、`Tell us what happened:` という案内が出ます。フィードバックは `--email` を付けない限り匿名で、添付されるのは CLI のバージョン、Node のバージョン、OS のプラットフォームとアーキテクチャだけです。メッセージには、秘密の情報、接続 URL、ユーザーのデータを絶対に含めないでください。

## 判断の根拠にする順番

何を編集・実行するかを決めるときは、次の順番で根拠を確認します。

1. プロジェクトの生成されたスクリプトと設定。特に `prisma.compute.ts`、`compute:deploy`、フレームワークの設定、`package.json`。
2. `create-prisma` と `@prisma/cli` の CLI のヘルプの出力。
3. ローカルにインストールされたパッケージのコード、生成物、型定義。
4. 公式ドキュメント。

## 使う場面

次のようなときに、このスキルを使います。

- Prisma Compute にデプロイできる新しいアプリを作る
- 既存の TypeScript のアプリを Prisma Compute にデプロイする
- 型付きの `prisma.compute.ts` のデプロイ設定を作成・更新する
- フレームワークが Compute に対応できる状態かを判断する
- `create-prisma --deploy`、`compute:deploy`、`app deploy` の問題を調べる
- Compute のアプリのログ、デプロイ、環境変数、ドメインを管理し、Platform のブランチを一覧表示する（`branch list`。ブランチを作成・削除するコマンドはない）
- GitHub や Console のビルドログ、GitHub への push によるデプロイの状態を確認する
- ブラウザーでの認証、保存した複数のワークスペース、Prisma のサービストークンを使って、対話なしでデプロイする
- `@prisma/cli` 用のローカルの Prisma Platform のワークスペースを、切り替え・選択・一覧表示・ログアウトする
- 解決できない Compute の CLI の失敗について、`@prisma/cli feedback` でフィードバックを送る
- `@prisma/compute-sdk` や Management API を使って、プログラムからデプロイする

## 判断の流れ

1. 既存のプロジェクトのデプロイ・再デプロイ：
   [`references/app-deploy-cli.md`](references/app-deploy-cli.md) を読む。

2. 型付きの Compute の設定、モノレポ、デプロイ先、アプリのルート、ビルドや環境変数のデフォルト：
   [`references/compute-config.md`](references/compute-config.md) を読む。

3. フレームワークごとのビルドやランタイムの作業：
   [`references/frameworks.md`](references/frameworks.md) を読む。

4. ひな形から新しいプロジェクトを作る：
   [`references/create-prisma.md`](references/create-prisma.md) を読む。

5. プログラムからのデプロイ、SDK、API、App や Deployment の低いレベルの概念：
   [`references/sdk-api.md`](references/sdk-api.md) を読む。

6. ビルド、認証、環境変数、デプロイ、ランタイムの失敗：
   [`references/troubleshooting.md`](references/troubleshooting.md) を読む。

## 優先度別のルール

| 優先度 | 分類 | 影響 | 接頭辞 |
|----------|----------|--------|--------|
| 1 | コマンドの確認 | 最重要 | `verify-` |
| 2 | 認証とワークスペースの選択 | 最重要 | `auth-` |
| 3 | フレームワークの準備 | 最重要 | `framework-` |
| 4 | ランタイムのホストとポートの割り当て | 最重要 | `runtime-` |
| 5 | 型付きの Compute の設定 | 高 | `config-` |
| 6 | ブランチ、環境変数、データベースのつなぎ込み | 高 | `env-` |
| 7 | デプロイの操作 | 高 | `deploy-` |
| 8 | SDK と API による自動化 | 中 | `sdk-` |

## 簡単なルール

### 1. コマンドの確認

- `verify-help-first` - 作業中は、CLI のヘルプの出力でコマンドの書き方を確認する。
- `verify-prisma-vs-platform-cli` - ORM の CLI に `prisma app deploy` があると決めつけない。その作業で `@prisma/cli` を使うべきかを確認する。
- `verify-generated-scripts` - プロジェクトに生成済みの `compute:deploy` スクリプトがあれば、それを優先して使う。
- `verify-public-url` - 実際にデプロイしたあとは、ローカルや準備完了だけの確認を信じずに、公開されたデプロイの URL にアクセスして確かめる。
- `verify-config-support` - `prisma.compute.ts` を型付きの Compute の設定として扱う。編集やデプロイの前に、プロジェクトの設定と生成されたスクリプトを確認する。
- `verify-auth-workspace-support` - ローカルのワークスペースの一覧・使用・ログアウトには、`@prisma/cli auth workspace` のコマンドを使う。

### 2. 認証とワークスペースの選択

- `auth-source-precedence` - `PRISMA_SERVICE_TOKEN` が空でなければ、それがコマンドの認証に使われ、ローカルの OAuth のワークスペースは実行に使われない。設定されているのに空の場合、CLI は保存済みの OAuth に切り替えずに失敗するのが正しい動き。
- `auth-multi-workspace` - `auth login` では、同じパソコンに複数のワークスペースの OAuth のセッションを保存できる。どの OAuth の許可を通常のコマンドで使うかは、有効なワークスペースの指定で決まる。
- `auth-list-before-switch` - ローカルのセッションは `auth workspace list --json` で確認する。名前は重複することがあるので、エージェントは名前よりも JSON のワークスペース ID を使う。
- `auth-switch-explicitly` - 対話なしで切り替えるときは `auth workspace use <id-or-name>` を使う。引数なしの `auth workspace use` は、対話で選ぶときか、ローカルの OAuth のワークスペースが1つだけのときにだけ使う。
- `auth-no-fallthrough` - 有効な OAuth のワークスペースがログアウトされた、または更新に失敗したときに、CLI が黙って別の保存済みのワークスペースに切り替わってはいけない。`auth workspace use <id>` で次のワークスペースを選ぶ。
- `auth-single-workspace-logout` - ローカルの OAuth のワークスペースのセッションを1つだけ消すには、`auth workspace logout <id-or-name>` か `auth logout --workspace <id-or-name>` を使う。引数なしの `auth logout` は、ローカルの OAuth のワークスペースのセッションをすべて消す。
- `auth-service-token-switching` - `PRISMA_SERVICE_TOKEN` が設定されている間は、サービストークンが認証に使われるため、`auth workspace use` は使えない。ローカルの OAuth のワークスペースを切り替えるには、この環境変数を外す。ワークスペースのログアウトが消すのは、ローカルの OAuth の状態だけ。
- `auth-storage-awareness` - ローカルの OAuth の認証情報は Platform の認証ファイルに、ワークスペースの情報はその横の別のファイルに保存される。プロジェクトの固定設定は `.prisma/local.json` に、CLI のアプリやプロジェクトの状態は、`prisma.compute.ts` があればその近くの `.prisma/cli/state.json` に保存される。

### 3. フレームワークの準備

- `framework-cli-first` - デプロイできるかどうかは、`create-prisma` で作れるかではなく、`@prisma/cli app deploy` に対応しているかで判断する。
- `framework-supported-cli-deploy` - Compute のデプロイが対応しているのは、`nextjs`、`nuxt`、`astro`、`hono`、`nestjs`、`tanstack-start`、`custom`、`bun`。
- `framework-create-prisma-defaults-only` - `create-prisma` は、生成されたデフォルトの設定と `compute:deploy` を用意できるが、既存のアプリを一般的にデプロイする手段ではない。
- `framework-build-output` - Compute には、静的な出力だけではなく、サーバーの入り口（エントリーポイント）かフレームワークの成果物が必要。

### 4. ランタイムのホストとポートの割り当て

- `runtime-bind-all-interfaces` - デプロイしたサーバーは、`localhost` や `127.0.0.1` を直接書かずに、すべてのネットワーク（`0.0.0.0` かフレームワークでそれに当たる設定）で待ち受ける必要がある。
- `runtime-match-http-port` - アプリは、デプロイ先の HTTP のポートで待ち受ける必要がある。できれば `process.env.PORT` を読み、そうでなければ同じ値の `--http-port` を渡す。
- `runtime-readiness-port-only` - Compute の準備完了の判定は、待ち受けているポートを見ているだけ。自分のパソコン内（ループバック）でしか待ち受けていないと、準備完了に見えても、外部からの接続は届かない。

### 5. 型付きの Compute の設定

- `config-optional-simple-app` - ふつうの単一のアプリをデプロイするのに、`prisma.compute.ts` は必須ではない。残しておく設定がないなら、フラグを使う。
- `config-init-formalizer` - 新しい設定は `bunx @prisma/cli@latest init` で生成する。フレームワークを検出して、name・framework・httpPort（Bun や Hono なら entry も）を固定し、Project とのつなぎ込みも提案してくれる。`--format json` を付けると、代わりに依存関係のない `prisma.compute.json` を書き出す。`init` は、設定がすでにあれば実行を断り、コードのひな形は作らず、デプロイもしない。
- `config-use-prisma-compute-ts` - 使い回すデプロイのデフォルトは、`prisma.config.ts` ではなく、`defineComputeConfig` を使って `prisma.compute.ts` に書く。
- `config-app-vs-apps` - デプロイ先が1つなら `app`、モノレポや複数のアプリのリポジトリなら `apps` を使う。どちらか1つだけを書く。
- `config-monorepo-roots` - モノレポでは、`prisma.compute.ts` で、アプリのデプロイ先、ルート、フレームワークのデフォルト、エントリーポイント、ポート、環境変数の入力を宣言する。
- `config-targets` - 複数のアプリの設定では、`@prisma/cli app deploy web` で `apps.web` のデプロイ先を選ぶ。`[app]` を書かなければ、今いるディレクトリからデプロイ先を推測できる。推測できなければ、deploy はすべてのデプロイ先を実行できるが、build と run は1つを指定する必要がある。
- `config-region-new-app-only` - 設定の `region` は、新しく作るアプリのデフォルトにすぎない。既存のアプリへのデプロイでは、そのアプリの今のリージョンがそのまま使われる。
- `config-custom-artifact` - ビルド済みや独自にビルドした成果物には、`framework: "custom"` と `build.outputDirectory`、`build.entrypoint` を使う。
- `config-no-project-branch-secrets` - Workspace、Project、Branch、本番へのデプロイの意図、サービストークン、秘密の値を `prisma.compute.ts` に書いてコミットしない。これらは、フラグ、`.prisma/local.json`、環境変数の保存場所、CI のシークレットに置く。`region`、`root`、`framework`、`entry`、`httpPort`、秘密ではない環境変数ファイルの場所など、アプリ単位のデフォルトは設定に書いてよい。
- `config-flags-win` - `--framework`、`--entry`、`--http-port`、`--region`、`--env` などのデプロイのフラグを明示すると、設定の同じ項目より優先される。

### 6. ブランチ、環境変数、データベース

- `env-do-not-leak-secrets` - `DATABASE_URL` の全体、サービストークン、秘密の値を絶対に表示しない。
- `env-deploy-loads-dotenv` - 生成されたデプロイのスクリプトは、`prisma.compute.ts` や `--env .env` で環境変数を読み込むことがある。再デプロイの前に、実際のスクリプトと設定を確認する。
- `env-migrations-separate` - 再デプロイのスクリプトは、マイグレーションもシードデータの投入もしない。必要な Prisma のデータベースのスクリプトは、別に実行する。
- `env-cli-token-name` - `@prisma/cli` は、サービストークンの認証に `PRISMA_SERVICE_TOKEN` を使う。
- `env-branch-scope` - ブランチのデプロイ、ブランチの環境変数、ブランチのデータベースは、同じブランチ名を使う必要がある。プレビューのブランチにデプロイするときは、`--branch <git-name>` を明示する。
- `env-production-vs-preview` - 本番の環境変数には `--role production`、プレビューのひな形の環境変数には `--role preview`、ブランチごとの上書きには `--branch <git-name>` を使う。
- `env-db-explicit` - データベースと環境変数のつなぎ込みは、データベースとプロジェクトの環境変数のコマンドで明示する。デプロイの例にデータベースの準備を含めない。デプロイは、マイグレーション、シードデータの投入、アプリごとのデータベースの自動作成をしない。

### 7. デプロイの操作

- `deploy-prod-intent` - `--prod --yes` は、ユーザーが本番へのデプロイを意図しているときだけ使う。App の最初の本番デプロイは `--prod` なしでも自動で本番に昇格する。このフラグが関わるのは、その後の本番ブランチへのデプロイ。
- `deploy-no-promote` - ビルドしてから確かめたいときは `app deploy --no-promote` を使う。今動いているデプロイに触れずに、専用の URL で確認できる候補をビルドし、あとで `app promote <deployment-id>` で本番に昇格させる。
- `deploy-github-default-branch` - Compute のアプリが GitHub の push によるデプロイにつながっている場合、デフォルトのブランチへのマージが本番へのデプロイになる。マージした PR のブランチを再デプロイしたり、デフォルトのブランチのプレビューをデプロイしたりするようユーザーに伝えるのではなく、デプロイの記録か GitHub のチェックの実行結果を確認する。
- `deploy-build-logs` - GitHub や Console のビルドの出力には `@prisma/cli build logs <build-id>` を、ランタイムのデプロイのログには `app logs` を使う。2つの ID は別物。
- `deploy-noninteractive-auth` - 対話なしのデプロイには、正しい有効な保存済みの OAuth のワークスペースか、対応しているサービストークンの環境変数が必要。トークンは絶対に表示しない。
- `deploy-json-for-agents` - スクリプトやエージェントが読む出力には、`--json --no-interactive` を使う。
- `deploy-create-project` - `--create-project <name>` は、ユーザーがデプロイで新しいプロジェクトを作ってつなぎ込みたいときだけ使う。`--project` や `PRISMA_PROJECT_ID` とは一緒に使えない。
- `deploy-ops-targets` - App の show・open・logs・list-deploys・promote・rollback・remove と、ドメインのコマンドでも、`prisma.compute.ts` の `[app]` のデプロイ先を指定できる。
- `deploy-report-cli-bugs` - `UNEXPECTED_ERROR` や解決できない失敗が起きたら、feedback のコマンドで報告する。上の「フィードバックを送る・CLI の問題を報告する」を見る。

### 8. SDK と API

- `sdk-use-cli-first` - アプリの作業には `@prisma/cli app deploy` を優先して使う。ユーザーが低いレベルの自動化を作っているのでなければ、`create-prisma` は新しいアプリのひな形作りにだけ使う。
- `sdk-result-handling` - `@prisma/compute-sdk` は `Result` の値を返す。例外に頼らずに、`isOk()` や `isErr()` を確認する。
- `sdk-snapshot-detection` - ディスクに取り出していないリポジトリのスナップショットには、`detectComputeApp` を使う。ワークスペースは自分で列挙して、アプリのルートの候補ごとに1回ずつ呼ぶ。

## おすすめの進め方

1. プロジェクトを確認する：パッケージマネージャー、テンプレートやフレームワーク、`package.json` のスクリプト、Prisma のバージョン、Prisma Client の場所、`prisma.compute.ts`、既存の `compute:deploy`。
2. 実際に使うパッケージの CLI のヘルプの出力を確認する。
3. プロジェクトやアプリを変更する前に、認証の状態を確認する：`auth whoami --json`。ローカルのセッションが複数あるかもしれないときは `auth workspace list --json` も。
4. 進め方を選ぶ：
   - 既存のアプリのデプロイ：設定にデプロイ先があればそれ、生成された `compute:deploy`、または `@prisma/cli app build/run/deploy` のフラグ
   - 新しいアプリのひな形：`create-prisma` のあと、生成された `compute:deploy` か `@prisma/cli app deploy`
   - 低いレベルの自動化：`@prisma/compute-sdk` か Management API
5. フレームワークの準備に加えて、ホスト・ポート・環境変数・ランタイムの条件を、プロジェクトとブランチの範囲も含めて確認する。
6. できれば、デプロイの前にローカルでビルドするか `app build` を実行する。
7. 自動化するときは JSON の出力でデプロイし、公開 URL にアクセスして確かめてから、アプリの URL、アプリ ID、デプロイ ID、プロジェクト ID、ワークスペース ID、次にやることをまとめる。
8. GitHub や Console のビルドでは、ビルドが失敗した理由を推測する前に、`Prisma Compute Deploy` のチェックの実行結果か `build logs <build-id>` を確認する。

## 避けること

- Compute のデプロイの説明を、汎用の `prisma-cli` スキルの中に埋もれさせない。
- 既存のアプリをデプロイするためだけに、その中で `create-prisma` を実行しない。生成された `compute:deploy` スクリプトか `@prisma/cli app deploy` を使う。
- `create-prisma` のすべてのテンプレートが自動でデプロイできるとユーザーに伝えない。
- 仮の `DATABASE_URL` の値のままデプロイしない。
- `next start` が Compute のランタイムの手段だと決めつけない。Next.js のデプロイには standalone の出力が必要。
