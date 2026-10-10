# Mastra API CLI リファレンス

`mastra api` CLI を使って Mastra サーバーとやり取りする方法です。速くて対象を絞ったコマンドと、コンパクトな JSON の抜き出しを優先してください。調べる必要があるときは、インストール済みの CLI とサーバーのスキーマを正解の情報源として扱ってください。

このリファレンスは、ユーザーからエージェント、ワークフロー、ツール、MCP サーバー、メモリのスレッド、トレース、ログ、メトリクス、スコア、データセット、実験の確認や呼び出しを頼まれたとき、または `mastra api` コマンドのデバッグやテストを頼まれたときに使います。

## セットアップ

CLI は、到達できる Mastra サーバーであれば、どれとでもやり取りできます。

- ローカルの開発サーバー：`npm run dev` で起動した `http://localhost:4111`
- Mastra プラットフォームのデプロイ：デプロイの URL を使う
- リモート／セルフホストのサーバー：サーバーの URL を使う
- ホスト型の Mastra プラットフォームのオブザーバビリティ：`https://observability.mastra.ai`（`trace`、`log`、`score`、`metric` のコマンドで自動的に接続先になる）

ローカルサーバーの場合、`mastra api` のデフォルトの接続先は `http://localhost:4111` です。

```bash
npx mastra api agent list
```

Mastra プラットフォームやリモートサーバーの場合は、`--url` を指定します。例を簡潔にするため、実際のサーバー URL の代わりに `$MASTRA_URL` を使っています。値は自分で設定してください。

```bash
npx mastra api --url $MASTRA_URL agent list
```

Factory の操作では、まず `mastra-factory` スキルを有効にしてください。プラットフォームの API やダッシュボードの URL ではなく、ユーザーの実際の Factory インスタンスの URL を使います。`--url` を明示すれば、空のディレクトリからでも動きます。認識されているホスト型の Factory のドメインでは、`mastra auth login` で保存された認証情報が使われます。`mastra auth whoami` で確認し、必要ならログインを提案してください。独自ドメインやセルフホストのデプロイでは、認証方式が異なる場合があります。Factory の確認では、下にあるランタイムのスキーマ確認ではなく、CLI に同梱された末端コマンドの仕様と、ルート直下の `/web/*` のルートを使います。

認証なしのローカルのランタイムサーバーでは、リソースを呼び出す前に、軽いチェックでサーバーを一度確認してください。

```bash
MASTRA_URL="${MASTRA_URL:-http://localhost:4111}"
curl -fsS "$MASTRA_URL/api/system/api-schema" >/dev/null
```

`$MASTRA_URL` に到達できない場合は、正しいデプロイの URL を聞き、それに合わせて `--url` を設定してください。認証が必要な接続先では、認証なしのスキーマ確認が失敗しても「到達できない」とはみなさず、対応している読み取り専用の CLI 呼び出しを使ってください。認識されているプラットフォームのホストでは、保存されたログインを CLI に使わせてください。独自のサーバーでは、そのデプロイで認められている認証の仕組みを、チャットの外でユーザーに設定してもらってください。チャットでシークレットの値を聞いたり、保存された認証情報のファイルを確認したりしないでください。

認証が必要なサーバーでは、ヘッダーを（何度でも）指定して渡します。

```bash
npx mastra api --url "$MASTRA_URL" --header "Authorization: Bearer $TOKEN" agent list
```

### 接続先の決まり方

ランタイムのコマンド（`agent`、`workflow`、`tool`、`mcp`、`thread`、`memory`、`dataset`、`experiment`）は、次の順番で接続先を決めます。

1. `--url <url>`：リモートやセルフホストのサーバーを明示した場合
2. `http://localhost:4111`：ローカルの `mastra dev` サーバー
3. `.mastra-project.json`：Mastra プラットフォームのプロジェクト

オブザーバビリティのコマンド（`trace`、`log`、`score`、`metric`）は、プロジェクトのデプロイ URL ではなく、デフォルトで `https://observability.mastra.ai` に接続します。CLI は、次の順番で認証情報を決めます。

1. `--header` で渡した `Authorization` と `X-Mastra-Project-Id` のヘッダー
2. 環境変数の `MASTRA_PLATFORM_ACCESS_TOKEN` と `MASTRA_PROJECT_ID`
3. プロジェクト ID については、`.mastra-project.json` のプロジェクト情報
4. 認証の最後の手段として、Mastra CLI のログイントークン

オブザーバビリティの呼び出しでは、`MASTRA_PLATFORM_ACCESS_TOKEN` と `MASTRA_PROJECT_ID` が設定されているか、`.mastra-project.json` があれば、`--url` や `--header` は不要です。

```bash
npx mastra api trace list '{"page":0,"perPage":10}'
npx mastra api metric names
```

`--url` と `--header` は、ホスト型のオブザーバビリティの接続先や認証情報を上書きするときだけ指定してください。

## 判断の流れ

1. はっきりした読み取り専用の依頼（「X の一覧」「最新の X」「X を取得」「最近の X をまとめて」）：リソースを推測し、まず「速い方法」を使う。
2. 変更を伴う依頼（`create`、`update`、`delete`、`run`、`resume`、`execute`）、リソースや操作がはっきりしない、速い方法が失敗した、正確な書き方を求められた：対象を絞った CLI の確認を使う。
3. JSON の入力が分からない：そのコマンドの `--schema` を使う。
4. ルートの動きが分かりにくい：`/api/system/api-schema` を確認する。

次のコマンドグループがあれば、ここから始めてください。グループの呼び出しが失敗したら、`mastra api --help` で確認してください。

```text
agent workflow tool mcp thread memory trace log metric score dataset experiment
```

## 読み取り専用の依頼での「速い方法」

まずは一般的な `list`／`get` コマンドを使います。ページは小さくし、すぐに `jq` に渡してください。

最新の1件：

```bash
npx mastra api <resource> list '{"page":0,"perPage":1}' \
  | jq '.data[0]'
```

最近の項目：

```bash
npx mastra api <resource> list '{"page":0,"perPage":10}' \
  | jq '.data[]'
```

形が分かっている場合は、作業に必要なフィールドだけを抜き出します。

```bash
npx mastra api <resource> list '{"page":0,"perPage":10}' \
  | jq '.data[] | {id, name, createdAt, status}'
```

詳細を取得する：

```bash
npx mastra api <resource> get <id> \
  | jq '.data'
```

形が分かっている場合は、作業に必要なフィールドだけを抜き出します。

```bash
npx mastra api <resource> get <id> \
  | jq '.data | {id, name, createdAt, status}'
```

リソースが一般的な形に対応していない場合は、そのリソース・操作に絞った `--help` に切り替えてください。

## 出力の絞り方

- 調べている段階で、フィルタなしの `--pretty` を使わない。
- list／get の出力は、詳細を読む前に必ず `jq` で抜き出す。
- 最新なら `perPage:1`、最近の一覧なら `perPage:10` 以下にする。
- 出力が途中で切れる、またはうるさい場合は、`jq` の抜き出しを絞って実行し直す。生の JSON をもっと見るために、ターミナルの出力を増やさない。
- JSON 全体を取得するのは、ユーザーが生の出力を求めた場合か、コンパクトな抜き出しでは足りない場合だけにする。

## 確認方法（速い方法がだめなとき）

質問に答えられる、最も対象を絞った確認コマンドを使ってください。トレースの例：

```bash
npx mastra api trace --help
npx mastra api trace list --help
npx mastra api trace list --schema
npx mastra api trace query --help
npx mastra api trace query --schema
```

再帰的な条件、メタデータでの絞り込み、関連するスパン・スコア・フィードバックへの条件で選ぶ必要がある場合は、`trace list` ではなく `trace query` を使います。まず `trace query --help` で、インストール済みの CLI にこのコマンドがあるか確認してください。インラインの JSON クエリは必須で、カーソルを含むレスポンスは `data` の下に入れ子になったままです。使えるかどうかの確認、CLI のスキーマ確認と正式なドキュメントの使い分け、クエリの組み立て方、ページ送りについては、[`trace-query.md`](trace-query.md) を読んでください。

トップレベルのヘルプは、リソースが分からない場合だけ使ってください。

```bash
npx mastra api --help
```

`--schema` の出力は、仕様として読んでください。

- `command`：使い方の文字列
- `examples`：動作が確認された例
- `positionals`：必須のパスや識別子の引数
- `input.required`：JSON の入力が必須かどうか
- `input.schema`：CLI が受け付ける JSON 入力（クエリとボディのフィールドを含む）
- `schemas`：さらに詳しくデバッグするための、サーバーのルートの生のスキーマ

## JSON と出力の仕様

`mastra api` が受け付ける入力は、インラインの JSON オブジェクト最大1つです。ユーザーが明示的に頼まない限り、標準入力やファイルは使わないでください。

GET 以外のルートでは、CLI がサーバーのルートのスキーマに従って、1つの JSON オブジェクトをクエリパラメータとリクエストボディに振り分けます。

出力の形：

```json
{ "data": {} }
{ "data": [], "page": { "total": 0, "page": 0, "perPage": 0, "hasMore": false } }
{ "error": { "code": "...", "message": "...", "details": {} } }
```

## エラーへの対応

- `INVALID_JSON`：シェルのクォートを直す。入力は JSON オブジェクト1つでなければならない。
- `MISSING_INPUT`：同じコマンドを `--schema` 付きで実行し、必要な JSON を渡す。
- `MISSING_ARGUMENT`：`--help`／`--schema` に表示される位置引数を渡す。
- `HTTP_ERROR`：`error.details` を確認し、`--schema` やルートのスキーマと見比べる。
- `REQUEST_TIMEOUT`：`--timeout` を大きくして再試行する。特にワークフローの実行で起きやすい。
- `SERVER_UNREACHABLE`：URL とサーバーのチェックを確認する。localhost が起動していない場合は、Mastra プラットフォームのデプロイか、別のリモートサーバーの URL を使いたいか、ユーザーに確認する。

## ルート単位でのデバッグ

CLI の動きがおかしいと感じたら、推測せずに、ルートから生成されたスキーマのマニフェストを確認してください。

パスでルートを探す：

```bash
curl -fsS "$MASTRA_URL/api/system/api-schema" \
  | jq '.routes[] | select(.path | contains("/memory"))'
```

1つのルートを確認する：

```bash
curl -fsS "$MASTRA_URL/api/system/api-schema" \
  | jq '.routes[] | select(.method == "POST" and .path == "/tools/:toolId/execute") | {pathParamSchema, queryParamSchema, bodySchema, responseShape}'
```

## 知っておくとよいこと

- ツールと MCP ツールの実行は、ツールの入力をそのまま受け付けます。`{ "data": ... }` と明示しても動きます。
- ワークフローの再開（resume）は、一時停止中のワークフローの実行にだけ使えます。
- ワーキングメモリの更新には、エージェントのメモリでワーキングメモリが有効になっている必要があります。
- 一覧が空でも、サーバーにまだ該当するデータが保存されていないだけ、ということがあります。
- `trace list` と `trace get` は、デフォルトでは軽量なデータを返します（スパンの入力、出力、属性、メタデータは含まれない）。スパンの記録を全部取得するには `--verbose` を付けるか、`trace span <traceId> <spanId>` で特定のスパンを詳細まで取得してください。
- `trace query` はインラインの JSON が必須で、完了したトレースを検索し、意味の分からないカーソルを `data.page.next` に保持します。その値は書き換えずに、同じ形のクエリの `page.after` に渡してください。