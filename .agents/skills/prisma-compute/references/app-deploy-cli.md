# Prisma Platform の CLI でのアプリのデプロイ

既存のプロジェクトや、生成された `compute:deploy` スクリプトを扱うときに、このリファレンスを使います。

## パッケージとコマンド

Compute のアプリの作業は、Prisma Platform の CLI のパッケージで使えます。

```bash
bunx @prisma/cli@latest --help
bunx @prisma/cli@latest app --help
bunx @prisma/cli@latest app deploy --help
bunx @prisma/cli@latest build logs --help
```

ヘルプの出力の例では、バイナリが `prisma-cli` と呼ばれていることがあります。パッケージランナーを使うときは、次の書き方がおすすめです。

```bash
bunx @prisma/cli@latest app deploy
npx @prisma/cli@latest app deploy
pnpm dlx @prisma/cli@latest app deploy
```

## エージェントのスキルのインストール

`@prisma/cli` は、ローカルの AI コーディングエージェント向けに、Prisma のスキルをインストール・更新できます。

```bash
bunx @prisma/cli@latest agent install
bunx @prisma/cli@latest agent install --skill prisma-compute
bunx @prisma/cli@latest agent update
bunx @prisma/cli@latest agent status --json
```

`agent install` と `agent update` は、検出したパッケージランナーを使って、`skills@latest add prisma/skills` を実行します。ユーザーが Prisma のエージェント向けの情報をインストール・更新したいときに使います。デプロイのコマンドではありません。

## 型付きの Compute の設定

ふつうの単一のアプリのデプロイでは `prisma.compute.ts` は必須ではなく、使い回すデフォルトや複数のアプリのデプロイ先があるときに役立ちます。設定の形、デプロイ先の選び方、優先順位、モノレポのルールは、[`compute-config.md`](compute-config.md) を読んでください。このリファレンスでは、デプロイのコマンドがその設定をどう使うかだけを説明します。

## 認証とプロジェクトとのつなぎ込み

便利なコマンド：

```bash
bunx @prisma/cli@latest auth login
bunx @prisma/cli@latest auth whoami
bunx @prisma/cli@latest project list --json
bunx @prisma/cli@latest project show
bunx @prisma/cli@latest project link <project-id-or-name>
```

`@prisma/cli` は、ブラウザーでログインしたワークスペースのセッションを、ローカルに複数保存できます。別のワークスペースでもう一度 `auth login` を実行すると、そのワークスペースのセッションが追加・更新されて有効になります。既存のワークスペースのセッションは削除されません。どの保存済みの OAuth のワークスペースを通常のコマンドで使うかは、有効なワークスペースの指定で決まります。

エージェントは、プロジェクトやアプリを変更する前に、次の流れで確認するのがおすすめです。

```bash
bunx @prisma/cli@latest auth whoami --json
bunx @prisma/cli@latest auth workspace list --json
bunx @prisma/cli@latest auth workspace use <workspace-id>
```

できれば、`auth workspace list --json` で得たワークスペース ID を使ってください。名前は人には分かりやすいですが、どれを指すのかあいまいになることがあります。引数なしの `auth workspace use` は、人が対話で選ぶときに使います。ローカルの OAuth のワークスペースが複数あると、引数なしの `use` は対話なしでは失敗するので、人が見ていないスクリプトでは ID を渡してください。

有効なワークスペースがログアウトされた、または更新に失敗した場合、CLI は意図して、別の保存済みのワークスペースを自動で選びません。次のワークスペースは明示して選んでください。

`auth workspace list --json` を実行してから、`auth workspace use <workspace-id>` を実行します。

保存済みのワークスペースのセッションをすべて消さずに、ローカルの OAuth のワークスペースを1つだけ片付けるには：

```bash
bunx @prisma/cli@latest auth workspace logout <workspace-id-or-name>
# 同じ意味：
bunx @prisma/cli@latest auth logout --workspace <workspace-id-or-name>
```

引数なしの `auth logout` は、ローカルの OAuth のワークスペースのセッションをすべて消します。`PRISMA_SERVICE_TOKEN` は外しません。

新しいプロジェクトを作ってつなぎ込むには：

```bash
bunx @prisma/cli@latest project create my-app --json
```

対話なしの作業や CI では、`@prisma/cli` は `PRISMA_SERVICE_TOKEN` でワークスペースのサービストークンを受け付けます。空でないサービストークンは、ブラウザーでログインした保存済みの認証情報より優先されるので、この環境変数が設定されている間は、ローカルの OAuth のワークスペースを切り替えても、コマンドの実行には影響しません。`auth workspace list --json` にローカルの OAuth のセッションが表示されることはありますが、サービストークンの環境変数を外すまでは切り替えられません。認証は `auth whoami` で確認し、トークンの値は絶対に表示しないでください。

`PRISMA_SERVICE_TOKEN` が設定されているのに空の場合は、外すか、本物のトークンを指定してください。CLI は、黙ってローカルの OAuth の認証情報に切り替えずに、失敗するのが正しい動きです。

ローカルの認証の保存場所は、調査には役立ちますが、中身をそのまま表示しないでください。

- `PRISMA_COMPUTE_AUTH_FILE` で、認証ファイルのパスを上書きできる。
- macOS では、OAuth の認証情報のデフォルトのファイルは `~/Library/Application Support/prisma/auth.json`。
- ワークスペースの情報と有効なワークスペースの指定は、その横の `auth.context.json` に保存される。
- プロジェクトの固定設定は `.prisma/local.json` に保存される。
- 選んだアプリや、把握している稼働中のデプロイのような、ローカルの CLI の状態は `.prisma/cli/state.json` に保存される。設定が見つかった場合は、`prisma.compute.ts` の近くに置かれる。

## プロジェクト、ブランチ、データベース、環境変数の範囲

Compute のデプロイでは、デプロイ先のプロジェクト、アプリ、ブランチが決まります。ユーザーの意図が、すでにつなぎ込んであるデフォルトのプロジェクトやアプリではない場合は、明示してください。

```bash
bunx @prisma/cli@latest project show --json
bunx @prisma/cli@latest app deploy --project proj_123 --app my-api --branch feature/login --json
```

`prisma.compute.ts` に `name` か `apps` のキーがあれば、その設定からアプリ名が決まることがあります。`--app` と `PRISMA_APP_ID` は、設定の値より優先されます。`[app]` は、`apps` の中からデプロイ先を選びます。

```bash
bunx @prisma/cli@latest app deploy api --project proj_123 --branch feature/login --json
```

引数なしでのデプロイ先の推測、すべてのデプロイ、build や run のデプロイ先のルールは、[`compute-config.md`](compute-config.md) を見てください。

ブランチの範囲は、デプロイ、データベース、環境変数で揃える必要があります。

- `app deploy --branch <git-name>` は、そのブランチのデプロイを作る。
- `database create <name> --branch <git-name>` は、そのブランチの範囲の Prisma Postgres のデータベースを作る。
- `project env add/update/list/remove --branch <git-name>` は、ブランチごとの環境変数の上書きを管理する。
- `project env add/update/list/remove --role production` は、本番の環境変数を管理する。
- `project env add/update/list/remove --role preview` は、プレビューのひな形の環境変数を管理する。

生成されたスクリプトかコマンドの出力にそう書いていない限り、CLI がローカルの Git のブランチを使ったと決めつけないでください。ユーザーが `feature/login` を指定したら、アプリ、データベース、環境変数のコマンドに、同じように `--branch feature/login` を渡してください。

本番への昇格は、本番に対する別の操作です。`app promote <deployment-id>` は、本番の環境変数を使ってデプロイをビルドし直します。プレビューのブランチへのデプロイを、本番への昇格として扱わないでください。

## デプロイの方法：GitHub と CLI

Compute のアプリが GitHub の push によるデプロイにつながっている場合、デフォルトのブランチが本番へのデプロイの経路になります。PR が `main` やほかの設定されたデフォルトのブランチにマージされたなら、本番のデプロイが終われば変更が本番に反映される、というのが自然な答えです。CLI のデプロイは、手動で明示的にデプロイするとき、ローカルのソースからデプロイするとき、GitHub の push によるデプロイを使っていないリポジトリで使います。

`app show`、`app list-deploys`、`app logs` にあるのは、`--app`、`--project`、ログの場合の `--deployment` で、`--branch` はありません。ブランチの調査では、デプロイの JSON からデプロイ ID を控えて、そのデプロイやログを確認してください。

`app deploy --create-project <name>` は、デプロイの前に新しい Project を作ってつなぎ込みます。ユーザーが新しい Project を望んでいるときだけ使ってください。`--project` や `PRISMA_PROJECT_ID` とは一緒に使えず、`--yes` だけでは Project の範囲は決まりません。

`app deploy --region <region>` が効くのは、deploy で新しいアプリを作るときだけです。既存のアプリは今のリージョンのままです。長く使うデフォルトには `prisma.compute.ts` の `region` を使い、フラグは、新しいアプリを一度だけ特定の場所に置きたいときにだけ使います。

## データベースと環境変数

つなぎ込んだプロジェクトに、Prisma Postgres のデータベースを作る：

```bash
bunx @prisma/cli@latest database create main --branch main --json
```

プロジェクトの環境変数を管理する：

```bash
bunx @prisma/cli@latest project env list
bunx @prisma/cli@latest project env add --file .env --role production
bunx @prisma/cli@latest project env add --file .env.preview --role preview
bunx @prisma/cli@latest project env add DATABASE_URL=postgresql://... --branch feature/foo
bunx @prisma/cli@latest project env update --file .env --role production
bunx @prisma/cli@latest project env update DATABASE_URL=postgresql://... --branch feature/foo
bunx @prisma/cli@latest project env list --branch feature/foo
bunx @prisma/cli@latest project env remove STRIPE_KEY --role preview
```

`app deploy --env .env` は、デプロイ用の環境変数をファイルから読み込みます。設定を使うデプロイでは、代わりに `prisma.compute.ts` の `env` から環境変数を読み込めます。どちらも、マイグレーションやシードデータの投入のコマンドではありません。

データベースの準備は、`prisma.compute.ts` の役割ではありません。データベースについての意図は、`database create` とプロジェクトの環境変数のコマンドで明示してください。デプロイの例にデータベースの準備を含めないでください。生成された接続 URL は、一度しか表示されない秘密の情報として扱ってください。

データベースと環境変数についての注意：

- デプロイでは、マイグレーション、シードデータの投入、スキーマの反映は行われない。必要なら、デプロイの準備のあとに、アプリ自身の Prisma のデータベースのコマンドを実行する。
- すべてをデプロイするときは、アプリごとの環境変数を自分で割り当てない限り、同じブランチのすべてのデプロイ先が、ブランチの範囲のプロジェクトの環境変数を共有する。
- `--env DATABASE_URL=...`、`--env DIRECT_URL=...`、環境変数ファイル、プロジェクトの環境変数で渡された既存のデータベースの環境変数は、正しい値として扱う。
- PostgreSQL ではないことが分かっている Prisma のスキーマは、自動で Prisma Postgres につながないようにする。

## プロジェクトの Git、ブランチ、データベースの操作

次のコマンドも同じ Platform の CLI の一部で、Compute のデプロイを準備するときによく関わってきます。

```bash
bunx @prisma/cli@latest branch list --json
bunx @prisma/cli@latest git connect git@github.com:org/repo.git --project proj_123
bunx @prisma/cli@latest git disconnect --project proj_123
bunx @prisma/cli@latest database list --branch feature/foo --json
bunx @prisma/cli@latest database show db_123 --json
bunx @prisma/cli@latest database remove db_123 --confirm db_123
bunx @prisma/cli@latest database connection list db_123 --json
bunx @prisma/cli@latest database connection create db_123 --name readonly
bunx @prisma/cli@latest database connection remove conn_123 --confirm conn_123
bunx @prisma/cli@latest database connection rotate conn_123 --confirm conn_123
bunx @prisma/cli@latest database usage db_123 --json
bunx @prisma/cli@latest database backup list db_123 --json
bunx @prisma/cli@latest database restore db_123 --backup bkp_123 --confirm db_123
bunx @prisma/cli@latest project rename new-name --project proj_123
bunx @prisma/cli@latest project transfer proj_123 --to-workspace wksp_456 --confirm proj_123
bunx @prisma/cli@latest project remove proj_123 --confirm proj_123
```

データを壊すコマンドや持ち主を変えるコマンド（`remove`、`restore`、`transfer`、`connection rotate`）には、正確な `--confirm <id>` が必要です。`--yes` だけでは足りません。

Git の連携は、Project を GitHub のリポジトリにつなぎます。Console 側で GitHub から取り込むと、Compute のアプリが作られ、つないだリポジトリへの push によるデプロイ（デフォルトのブランチからの本番へのデプロイを含む）が動くことがあります。CLI の `git connect` コマンドは準備のためのもので、ローカルからデプロイするコマンドではありません。CLI で明示的にデプロイするには `app deploy` を使います。

GitHub からのデプロイでは、ローカルの CLI の出力があると決めつけずに、Console やビルドの実行環境の状態、デプロイの記録、ビルドログ、GitHub の `Prisma Compute Deploy` のチェックの実行結果を確認してください。ビルドの実行環境は、ブランチに応じてデータベースや環境変数をつなぎ込むことがあります。Prisma のスキーマがあって `DATABASE_URL` がないプレビューのブランチには、ブランチの範囲のプレビュー用データベースが用意されることがあり、本番では、すでに準備ができているデータベースから、足りない `DATABASE_URL` のひな形がつなぎ込まれることがあります。案内付きのフィードバックは GitHub のチェックの実行結果で行われます。Vercel のような PR へのコメントを約束しないでください。

データベースやデータベースの接続のコマンドは、list や show の出力で、保存された秘密の値を表示しません。`database create` と `database connection create` は一度だけ接続 URL を返します。それを秘密の情報として扱い、必要ならすぐに環境変数に保存して、まとめの中で繰り返し表示しないでください。削除には正確な `--confirm <id>` が必要で、`--yes` だけでは足りません。

## ローカルでのビルドと実行

デプロイの前に、アプリが Compute の成果物を作れることを確認します。

```bash
bunx @prisma/cli@latest app build --build-type auto
bunx @prisma/cli@latest app run --build-type auto --port 3000
```

Bun やサーバーのエントリーポイントの場合：

```bash
bunx @prisma/cli@latest app build --build-type bun --entry src/index.ts
bunx @prisma/cli@latest app run --build-type bun --entry src/index.ts --port 8080
```

NestJS では、`app build` で Compute の成果物を確認し、ローカルではフレームワーク自身の開発用コマンドを実行します。

```bash
bunx @prisma/cli@latest app build --build-type nestjs
bun run dev
```

Compute の設定があれば、フレームワーク・エントリーポイント・ポートのフラグを繰り返さずに、デプロイ先の名前を渡します。

```bash
bunx @prisma/cli@latest app build api
bunx @prisma/cli@latest app run api --port 8080
```

`app run --port` は、ローカルの開発用に `PORT` を設定します。アプリが明示しているホストの待ち受け先は書き換えないので、ローカルで動いても、デプロイしたサーバーに外部からの入り口（ingress）から届くことの証明にはなりません。

`app run --build-type nestjs` には対応していません。設定を使う NestJS のデプロイ先を選んだ場合は、代わりに Nest の開発用サーバーを直接実行してください。

## デプロイ

対話しながらデプロイする：

```bash
bunx @prisma/cli@latest app deploy
```

エージェントやスクリプト向けのデプロイ（本番だと決めつけないこと。ユーザーが本番へのデプロイを意図しているときだけ `--prod --yes` を付ける。App の最初の本番デプロイは `--prod` なしでも自動で本番に昇格することに注意）：

```bash
bunx @prisma/cli@latest app deploy \
  --json \
  --no-interactive \
  --env .env
```

CI でビルドしてから確かめる方法：`--no-promote` は、今動いているデプロイを変えずに候補のデプロイをビルドします。候補は専用の URL で確認でき、あとで `app promote <deployment-id>` で本番に昇格させます。

```bash
bunx @prisma/cli@latest app deploy --no-promote --json --no-interactive
```

プレビューのブランチでは、ユーザーが本番へのデプロイを明示的に意図していない限り、`--prod` を付けないでください。

```bash
bunx @prisma/cli@latest app deploy \
  --branch feature/foo \
  --json \
  --no-interactive \
  --env .env.preview
```

実際にデプロイしたあとは、公開されたデプロイの URL にアクセスして確かめてください。「deploy succeeded」やローカルの `app run` の確認で終わりにしないでください。

```bash
curl -i https://<deployment-url>
```

デプロイのコマンドが JSON を返したら、結果から URL を取り出して、その公開 URL にそのままアクセスしてください。うっかり、公開の入り口ではなく `localhost` や `127.0.0.1` を試さないようにしてください。

デプロイのときにプロジェクトを作ってつなぎ込む：

```bash
bunx @prisma/cli@latest app deploy \
  --create-project my-app \
  --prod \
  --yes \
  --env .env
```

フレームワークとポートを指定してデプロイする：

```bash
bunx @prisma/cli@latest app deploy \
  --framework hono \
  --http-port 8080 \
  --prod \
  --yes \
  --env .env
```

新しく作るアプリを、特定のリージョンにデプロイする：

```bash
bunx @prisma/cli@latest app deploy \
  --app my-api \
  --region us-west-1 \
  --prod \
  --yes \
  --env .env
```

`--region` は、新しいアプリをどこに置くかの指定です。既存のアプリは移動しません。

フレームワークとポートを指定して、プレビューのブランチにデプロイする：

```bash
bunx @prisma/cli@latest app deploy \
  --framework hono \
  --branch feature/foo \
  --http-port 8080 \
  --json \
  --no-interactive \
  --env .env.preview
```

エントリーポイントを明示した、Bun のようなアプリ：

```bash
bunx @prisma/cli@latest app deploy \
  --framework bun \
  --entry src/index.ts \
  --http-port 8080 \
  --prod \
  --yes \
  --env .env
```

`--framework` なしで `--entry <path>` を付けると、Bun のアプリのデプロイとして扱われます。

設定を使う、Bun のようなアプリ：

```bash
bunx @prisma/cli@latest app deploy api --prod --yes --env .env
```

変わらないアプリのデフォルトには設定を、その場限りのプロジェクト、ブランチ、リージョン、環境変数、本番の選択にはフラグを使います。データベースの準備は、データベースとプロジェクトの環境変数のコマンドで明示的に行ってください。

## 運用

確認して開く：

```bash
bunx @prisma/cli@latest app show --json
bunx @prisma/cli@latest app open
```

デプロイ：

```bash
bunx @prisma/cli@latest app list-deploys --json
bunx @prisma/cli@latest app show-deploy <deployment-id> --json
bunx @prisma/cli@latest app promote <deployment-id> --yes
bunx @prisma/cli@latest app rollback --to <deployment-id> --yes
bunx @prisma/cli@latest app remove --app my-api --yes
```

ログ：

```bash
bunx @prisma/cli@latest app logs
bunx @prisma/cli@latest app logs --deployment <deployment-id>
bunx @prisma/cli@latest app logs --json
```

GitHub や Console のビルドのビルドログ：

```bash
bunx @prisma/cli@latest build logs <build-id>
bunx @prisma/cli@latest build logs <build-id> --follow
bunx @prisma/cli@latest build logs <build-id> --json
```

`build logs` は、GitHub や Console のビルド、またはチェックの実行の Build ID を使って、ビルドの出力を流します。これは、今のアプリのデプロイやデプロイ ID を使うランタイムの `app logs` とは別物です。

ドメイン：

```bash
bunx @prisma/cli@latest app domain add shop.example.com
bunx @prisma/cli@latest app domain show shop.example.com
bunx @prisma/cli@latest app domain wait shop.example.com --timeout 15m
bunx @prisma/cli@latest app domain retry shop.example.com
bunx @prisma/cli@latest app domain remove shop.example.com
```

独自ドメインのコマンドは、本番のブランチのランタイムが対象です。本番のドメインの設定に、プレビューのブランチを使わないでください。

## 出力の扱い

`--json` が使えるときは、JSON を読み取って、次の内容をまとめます。

- プロジェクトの ID と名前
- ブランチ名
- アプリの ID と名前
- デプロイの ID と状態
- ビルド ID（ある場合）
- デプロイの URL
- データベースの ID と名前（作った場合）

秘密の環境変数の値を表示しないでください。
