# Factory スーパーバイザー CLI リファレンス

`mastra api factory` は、Factory の運用を管理する「コントロールプレーン」として使います。このリファレンスは、Factory の状態確認、運用状況のまとめ、キューやヘルスの調査、そしてプロジェクト・作業項目（work item）・判断（decision）・要対応項目（attention）への変更（対話的なもの、または自律的に委任されたもの）に使います。

初回の CLI 設定、ログイン、接続先、インストールについては [connection.md](connection.md) を読んでください。作業の担当、セッション／スレッドのメッセージ、観測メモリ、ヘルスの解釈については [session-inspection.md](session-inspection.md) を読んでください。対象を絞ったコマンド、コンパクトな JSON の抜き出し、小さなページサイズ、インストール済み CLI のスキーマを優先し、読み取り専用の確認と変更操作をはっきり分けてください。

## 安全と委任のルール

- ユーザーが変更の権限を与えていない場合は、読み取り専用の確認を基本にします。「確認して」「まとめて」「診断して」「提案して」という依頼だけでは、変更の許可にはなりません。
- `.env`、Bearer トークン、プロバイダーやプラットフォームの認証情報、保存されたログイン内容、認証情報のファイルは、読んだり表示したりしないでください。認証は、`mastra auth login` で保存されたものを CLI に使わせてください。
- プロジェクト、作業項目、判断、要対応項目、ステージ、リビジョン、リクエスト、セッションの ID を作り上げないでください。
- 許可は「個別の操作ごとの許可」と「継続的な委任」のどちらでも受け付けます。継続的な委任では、対象のプロジェクト、リソースの種類、許可される操作、目的、期間、停止条件などが決められていることがあります。
- 明確な継続的委任の範囲内であれば、作成、更新、遷移、開始、判断への操作、要対応項目の状態変更、自動化設定の変更を、毎回確認を取らずに実行してください。
- 削除、要対応項目のアーカイブ、一括既読、実行（run）の開始、自律動作の有効化は「影響の大きい操作」として扱います。継続的な委任にその種類の操作が明確に含まれている場合だけ自律的に実行し、それ以外は実行前に確認してください。
- 変更の前には現在のリソースを取得し、範囲内で最小のコマンドを使い、実行後にもう一度取得して、影響を受けた ID、リビジョン、状態を報告してください。
- リビジョンの競合が起きても、やみくもに再試行しないでください。もう一度取得し、依頼された遷移が現在の状態でも妥当かを見直し、妥当な場合だけ新しいリビジョンで実行してください。
- CLI にない機能を補うために、非公開のルートを `curl` で直接叩かないでください。

運用範囲の例：

- 単発の操作：「作業項目 X を Planning に移動して」
- 範囲を限った自律：「このセッションの間、プロジェクト X のトリアージを続けて。作業項目の作成・更新、Intake の項目の Triage への移動、再試行可能な失敗した判断の再試行はしてよい。削除、アーカイブ、実行の開始、自動化設定の変更はしないで」
- 広い自律：「キューが健全になるまで、プロジェクト X を自律的に運用して。遷移、判断への操作、要対応項目の管理、実行の開始も含めてよい。プロジェクトは削除しないで」

これらは単なる提案ではなく、委任された権限として扱ってください。範囲内の操作である限りは、操作ごとの確認なしで進め、範囲の境界、停止条件、重大なあいまいさに当たったら止まるか確認してください。ユーザーから新しい指示があれば、その時点で範囲が狭まる・広がる・取り消されることになります。

## Factory 固有のルーティングと確認方法

Factory のコマンドは次の下にあります。

```bash
mastra api factory ...
```

Factory の HTTP ルートは、`/api/*` ではなくルート直下の `/web/*` です。CLI の Factory コマンドは、意図的に `--server-api-prefix` を使いません。`/api` を付け足したり、`/api/system/api-schema` を確認したり、そのマニフェストに Factory のルートがあると考えたりしないでください。

インストール済みの CLI には、生成された Factory のルート定義が同梱されています。JSON を受け付ける末端のコマンド（leaf）では、そのコマンドの `--schema` を正式な仕様として使ってください。

```bash
mastra api factory work-item transition --schema \
  | jq '{command, examples, positionals, input: .input.schema}'
```

位置引数だけを取る末端のコマンドの中には、`--schema` がないものがあります。その場合は、最も対象を絞ったヘルプを使い、引数を推測しないでください。

```bash
mastra api factory decision approve --help
```

## 運用の決まり

次の判断の流れに従ってください。

1. 状態確認、一覧、取得、確認、まとめ、診断、提案の依頼では、ユーザーが変更の目的も与えていない限り、読み取り専用の手順をそのまま使います。
2. 作成、更新、削除、遷移、開始、承認、却下、再試行、既読、一括既読、アーカイブ、復元の依頼では、その操作が今回の依頼または継続的な委任で許可されているかを確認し、まず対象を絞った末端コマンドで仕様を確認します。
3. JSON 入力を受け付ける場合は、末端コマンドの `--schema` を実行し、それを正式な仕様として扱います。
4. 位置引数だけの末端コマンドに `--schema` がない場合は、その `--help` を実行します。引数は絶対に推測しないでください。

CLI が受け付けるインライン JSON オブジェクトは最大1つです。GET 以外の入力は、同梱のルート定義に従って、クエリパラメータとリクエストボディに振り分けられます。ユーザーが明示的に頼まない限り、標準入力やファイルは使わないでください。

標準の出力の形は次のとおりです。

```json
{ "data": {} }
{ "data": [], "page": { "total": 0, "page": 0, "perPage": 10, "hasMore": false } }
{ "error": { "code": "...", "message": "...", "details": {} } }
```

Factory の一覧系のレスポンスでは、配列が `data` の中の名前付きフィールド（`workItems`、`decisions`、`items`、`findings` など）に入っていることもあります。抜き出し方を書く前に、実際のレスポンスの形を確認してください。すべての一覧が `.data[]` に直接入っているとは考えないでください。

出力のルール：

- フィルタなしの `--pretty` で中身を探らないでください。
- 出力はすぐに `jq` に渡し、作業に必要なフィールドだけを残してください。
- スキーマがページ番号方式のページ送りに対応している場合、最新の1件なら `perPage: 1`、最近の項目なら `perPage: 10` 以下にしてください。
- カーソル方式の一覧では、`limit` を小さい値にしてください。
- 出力がうるさい、または途中で切れる場合は、生の出力を増やすのではなく、`jq` の抜き出しを絞ってください。
- JSON 全体を取得するのは、コンパクトな抜き出しでは足りない場合か、ユーザーが明示的に求めた場合だけにしてください。

### 接続先の解決

ホスト型、ローカル、リモート、セルフホストのどの Factory でも、確認済みのインスタンス URL を明示する方法を優先してください。リポジトリやリンクファイルは必要ありません。認証と接続先の確認は [connection.md](connection.md) に従ってください。下の `FACTORY_URL` は、プラットフォームのダッシュボードの URL ではなく、ユーザーの実際のデプロイでなければなりません。

```bash
mastra api --url "$FACTORY_URL" factory project list '{"page":0,"perPage":10}' \
  | jq '{page, projects: [.data[] | {id, name}]}'
```

簡潔にするため、以降の例では `--url` を省略しています。**接続先を明示する場合は、スキーマやヘルプの確認も含め、すべての例で `mastra api` の直後に `--url "$FACTORY_URL"` を入れてください。** そうしないと、コマンドが localhost を確認しにいったり、別のディレクトリのデプロイ設定を使ったりすることがあります。必要な認証オプションも、同じように付けたままにしてください。

プロジェクトの一覧が空の場合は、意図した接続先、組織、アクセス権、ページ送りを確認してください。保存された認証情報を調べたり、プロジェクトがないと決めつけたりしないでください。

## コマンド一覧

書き込みの前には、末端コマンドの `--help` と `--schema` で、インストール済みのコマンドを確認してください。

```text
project      list | get | create | update | delete
work-item    list | create | update | delete | transition | start
metrics
health       thresholds
decision     list | approve | dismiss | retry
attention    list | read | read-all | archive | restore
supervisor   session | health
```

重要な仕様：

- `project create` には `name` が必須です。
- `project update` では、プロジェクトのメタデータと自動化設定を変更できます。`autoRunEnabled` や `autoApprovePlans` を有効にするのは、今回の依頼または継続的な委任に自動化設定の変更が含まれている場合だけにしてください。
- `work-item create` には `title` が必須で、新しい作業を Intake に作成します。
- `work-item update` は、ステージ以外のフィールドだけを変更します。カードの移動には絶対に使わないでください。
- `work-item transition` には、`board`、`stage`、現在の `expectedRevision`、新しく生成した UUID の `requestId`、正確な `cause` が必要です。
- `work-item start` には、`sessionId`、`threadTitle`、`kickoffKey`、`destinationStage`、`workItem` が必要です。
- `metrics` は、任意で `from` と `to` のタイムスタンプを受け付けます。
- `decision list` は、`before`、`limit`、`statuses` を受け付けます。
- `attention list` は、`before`、`limit`、`search`、`tier`、`view` を受け付けます。
- `attention read-all` は、任意で `before` を受け付けます。

## 読み取り専用のスーパーバイザー手順

Factory の状態、キューの確認、スーパーバイザーのまとめ、ブロックされている作業、おすすめの次の行動を聞かれたときは、何も変更せずに次の手順を使ってください。

### 1. プロジェクトを選ぶ

```bash
mastra api factory project list '{"page":0,"perPage":10}' \
  | jq '{page, projects: [.data[] | {id, name}]}'
```

- プロジェクトが1つだけなら、それを選びます。
- ユーザーがプロジェクト名を挙げた場合は、完全に一致するものを選び、選んだ ID と名前を報告します。
- 候補が複数残る場合は、選択肢を簡潔に示し、ユーザーに選んでもらいます。
- 1件も返ってこない場合は、プロジェクトを作り上げずに、接続先や組織があいまいなことを報告します。

選んだプロジェクトを取得します。

```bash
mastra api factory project get <project-id> \
  | jq '.data.project | {id, name, description, autoRunEnabled, autoApprovePlans}'
```

### 2. 作業と実行中のセッションを確認する

```bash
mastra api factory work-item list <project-id> \
  | jq '.data | {
      runningSessionIds,
      workItems: [.workItems[] | {
        id, title, board, stages, revision, sessions, updatedAt
      }]
    }'
```

現在のステージ、リビジョン、紐づいたセッション、`runningSessionIds`、タイムスタンプ、ステージの履歴を突き合わせてください。進行中の作業と、待機中・ブロック中・放置・完了・キャンセルの作業は、思い込みではなく、返ってきた状態をもとに区別してください。

### 3. メトリクスとしきい値を確認する

```bash
mastra api factory metrics <project-id> \
  | jq '.data.metrics | {wipTotal, throughput, leadTime, agentCoverage, sourceMix, daysCovered}'

mastra api factory health thresholds <project-id> \
  | jq '.data.thresholds'
```

返ってきたしきい値は、キューの滞留時間の区分に使ってください。これはスーパーバイザーの判断・開始・リースのタイムアウトのしきい値ではありません。それらの指摘には、スーパーバイザーが返した根拠を使ってください。アラートの基準値を自分で作らないでください。

### 4. 判断と人による対応が必要な項目を確認する

```bash
mastra api factory decision list <project-id> '{"limit":10}' \
  | jq '.data.decisions[] | {
      id, workItemId, type, status, role, retryable, attempts, failure, createdAt
    }'

mastra api factory attention list <project-id> '{"limit":10,"view":"open"}' \
  | jq '.data | {
      openCount, unreadCount, badgeCount, hasMore, nextCursor,
      items: [.items[] | {
        kind, sourceId, occurrence, workItemId, tier, read, archivedAt,
        suggestedRepair, evidence
      }]
    }'
```

保留中の判断は提案であって、許可ではありません。要対応項目は指摘であって、命令ではありません。行動を提案する前に、どちらも参照先の作業項目と突き合わせてください。

### 5. スーパーバイザーのヘルスとセッションを確認する

```bash
mastra api factory supervisor health <project-id> \
  | jq '.data | {checkedAt, counts, findings: [.findings[] | {kind, id, workItemId, evidence, suggestedRepair}]}'

mastra api factory supervisor session <project-id> \
  | jq '.data | {factoryProjectId, sessionId, threadId}'
```

ヘルスの指摘の種類は、`decision-stuck`、`start-stalled`、`seat-orphaned`、`seat-missing`、`held-waiting`、`label-drift` です。それぞれの指摘には、固定の `id`、`evidence`（根拠）、`beganAt`（開始時刻）、`suggestedRepair`（修正の提案）が含まれます。サーバーが返した種類だけを報告してください。解釈については [session-inspection.md](session-inspection.md) を参照してください。

スーパーバイザーのセッションは、スーパーバイザーによる確認と調整のためのものです。`work-item start` に使える正式なユーザーセッションだとは考えないでください。

### 6. まとめを返す

次の内容を報告します。

1. 選んだプロジェクトと接続先の種類
2. 進行中と待機中の作業（現在のステージとリビジョンを含む）
3. ブロック中・放置・不健全な項目と、それぞれをそう判断した根拠
4. 実行中のセッションと、紐づいている作業項目
5. 保留中・失敗した判断と、再試行できるかどうか
6. 未対応・未読の、人による対応が必要な項目
7. スーパーバイザーのヘルスの指摘
8. おすすめの次の行動を1つ（提案であり、実行していないことを明記する）

## 変更の手順

今回の依頼または継続的な委任で変更が許可されている場合は、この手順に従ってください。

1. 適用される権限とその範囲（プロジェクト、リソース、許可される操作の種類、目的、停止条件）を確認します。一般的な状態確認の依頼から、より広い権限を勝手に作らないでください。
2. JSON 入力のコマンドでは、末端コマンドの `--schema` を実行します。位置引数だけのコマンドは `--schema` がないことがあるので、末端コマンドの `--help` を実行します。
3. 現在のプロジェクト・作業項目・判断・要対応項目を取得し、すべての ID が選んだプロジェクトに属していることを確認します。
4. 対象と操作が範囲内にあることを内部で確認します。範囲がはっきりしない場合や、範囲を超える場合だけ確認を取ります。
5. 有効な最小の変更を送ります。
6. 影響を受けた一覧やリソースをもう一度取得します。
7. 対象の ID、変更前後のリビジョン（該当する場合）、最終的な状態、返ってきた監査情報や失敗の詳細を報告します。自律実行の場合は、実行した操作をまとめ、委任された停止条件に達したら止まります。

### プロジェクトを作成する

```bash
mastra api factory project create --schema \
  | jq '{command, positionals, input: .input.schema}'

mastra api factory project create '{"name":"<project-name>"}' \
  | jq '.data.project | {id, name}'
```

プロジェクトの削除は破壊的な操作です。プロジェクトを取得し、今回の依頼または継続的な委任にプロジェクトの削除が明確に含まれている場合だけ削除してください。`project delete --help` を実行し、その ID だけを削除し、`project list` に表示されなくなったことを確認してください。

### 作業項目を作成・更新する

新しい作業は Intake に入ります。

```bash
mastra api factory work-item create --schema \
  | jq '{command, positionals, input: .input.schema}'

mastra api factory work-item create <project-id> '{"title":"<title>"}' \
  | jq '.data.workItem | {id, title, stages, revision}'
```

`work-item update` は、ステージ以外のフィールドにだけ使ってください。更新の前後で、`work-item list` から項目を取得してください。

作業項目の削除は破壊的な操作です。今回の依頼または継続的な委任に作業項目の削除が明確に含まれている場合だけ進めてください。現在の項目とプロジェクトを確認し、`work-item delete --help` を実行し、その作業項目の ID だけを削除し、プロジェクトの作業項目一覧をもう一度取得してください。

### 作業項目を遷移させる

ライフサイクルのステージを `work-item update` で変えないでください。楽観的排他制御のある遷移用のエンドポイントを使ってください。

```bash
mastra api factory work-item transition --schema \
  | jq '{command, positionals, required: .input.schema.required, input: .input.schema}'

REQUEST_ID="$(uuidgen | tr '[:upper:]' '[:lower:]')"
mastra api factory work-item transition <project-id> <work-item-id> \
  "$(jq -nc \
    --arg requestId "$REQUEST_ID" \
    --argjson expectedRevision <current-revision> \
    '{
      board: "work",
      stage: "planning",
      expectedRevision: $expectedRevision,
      requestId: $requestId,
      cause: "delegated move to planning"
    }')" \
  | jq '.data.workItem | {id, board, stages, revision}'
```

ルール：

- `expectedRevision` は、遷移の直前に取得してください。
- 新しい遷移のリクエストごとに、新しい UUID を生成してください。
- ボードとステージは、スキーマに列挙されているものだけを使ってください。
- `cause` には、この遷移を行う理由を正確に書いてください。関係のない例の値をコピーしないでください。
- `reenter` は、インストール済みのスキーマにあり、かつ今回の依頼または継続的な委任に再投入が含まれている場合だけ使ってください。
- 競合が起きたら、もう一度取得して見直してください。リビジョンを手元で1つ増やしたり、やみくもに再試行したりしないでください。

### 判断への操作

`approve`（承認）、`dismiss`（却下）、`retry`（再試行）は、監査対象の明示的な操作です。実行する前に：

1. 現在の判断と、紐づいている作業項目を一覧・取得します。
2. 状態、種類、役割、再試行可否、試行回数、失敗の詳細を確認します。
3. その操作が、今回の依頼または継続的な委任に含まれていることを確認します。判断の記録そのものを権限とみなさないでください。
4. 末端コマンドのヘルプを確認して1回だけ実行し、判断と作業項目をもう一度取得します。

```bash
mastra api factory decision approve --help
mastra api factory decision approve <project-id> <decision-id>
```

移動の提案を承認すると、その移動に伴ってキューに入っている実行にも同意したことになる場合があります。保留中だからという理由だけで承認しないでください。再試行は、サーバーが再試行可能と示している失敗した判断にだけ行ってください。

### 要対応項目への操作

既読、一括既読、アーカイブ、復元は、どれも受信箱の状態を変える操作です。今回の依頼または継続的な委任に含まれている場合に実行し、`attention list` が返す複合 ID（`kind`、`sourceId`、`occurrence`）をそのまま使ってください。

```bash
mastra api factory attention read --help
mastra api factory attention read <project-id> <kind> <source-id> <occurrence>
```

`read-all` は一括の変更操作です。要対応項目を確認してほしいという依頼から、この許可を推測しないでください。アーカイブと復元は、今回の依頼または委任された操作の種類に含まれていなければなりません。すでに範囲内であれば、1件ずつ確認を取る必要はありません。

### 作業項目を開始する

`work-item start` は、自律的で影響の大きい操作です。開始が今回の依頼または継続的な委任に含まれている場合だけ実行し、まずスキーマを確認してください。

```bash
mastra api factory work-item start --schema \
  | jq '{command, positionals, required: .input.schema.required, input: .input.schema}'
```

このコマンドには、認証済みのユーザーと組織が所有し、選んだ Factory プロジェクトに接続されている、既存の正式な Factory ユーザーセッションが必要です。現在のコマンド一覧には、セッションを新しく立ち上げたり、ソース管理の接続を管理したりする機能はありません。

対応するセッションがまだない場合：

- 開始がブロックされていることを報告します。
- セッションの UUID を作り上げないでください。
- スーパーバイザーのセッションで代用しないでください。
- 非公開の HTTP ルートを `curl` で呼ばないでください。
- 回避策として別のリソースを作らないでください。

## エラー

シェルのエラーと、CLI の JSON エラーを区別してください。シェルのエラーは、実行ファイルがない、CLI に届く前にクォートが壊れている、`jq` などパイプラインのコマンドが失敗した、といった意味の場合があります。標準エラー出力と終了コードを残し、原因を絞って直し、安全な場合だけ再実行してください。

CLI のエラーへの対応：

- `INVALID_JSON`：シェルのクォートを直してください。入力はインラインの JSON オブジェクト1つでなければなりません。
- `MISSING_INPUT`：末端コマンドの `--schema` を実行し、必要な JSON オブジェクトを渡してください。
- `MISSING_ARGUMENT`：末端コマンドの `--help` か `--schema` を実行し、足りない位置引数を渡してください。
- `HTTP_ERROR`：`error.details` のうち安全なフィールドだけを確認してください。ヘッダー、シークレットを含むリクエストボディ、認証情報は出力せず、HTTP ステータスとサーバーのメッセージを報告してください。
- `REQUEST_TIMEOUT`：読み取りであれば、`--timeout` を大きくして再試行してください。書き込みは、冪等性と前回の結果が分かっている場合を除き、自動で再試行しないでください。
- `SERVER_UNREACHABLE`：意図した作業ディレクトリ、ローカルサーバー、または明示した `--url` を確認してください。
- `PLATFORM_RESOLUTION_FAILED`：プロジェクトの自動検出が有効なデプロイを指しているかを確認するか、ユーザーから受け取った `--url` を明示してください。
- プロジェクト一覧が空：意図した接続先と組織を確認してください。組織が違うと、データがないように見えることがあります。
- リビジョンの競合：作業項目をもう一度取得し、遷移を見直してください。
- 管理されたステージ変更の拒否：`work-item update` ではなく `work-item transition` を使ってください。
- Factory セッションが見つからない、またはプロジェクトが違う：正式なセッションが必要という制約を報告してください。ID を作り上げたり、代用したりしないでください。

## 最終の安全確認

返答する前に、次を確認してください。

- 読み取り専用の依頼で、変更が行われていないこと。
- 出力がコンパクトで、一覧系のレスポンスは名前付きフィールドから読み取っていること。
- JSON 入力の書き込みはすべて末端コマンドの `--schema` を使い、位置引数だけの書き込みは末端コマンドの `--help` を使って、引数を推測していないこと。
- すべての遷移で、直前に取得したリビジョンと新しいリクエスト UUID を使っていること。
- すべての変更が、今回の依頼または明確な継続的委任の範囲内であり、影響の大きい種類の操作はその範囲に明示的に含まれていたこと。
- 結果に、シークレット、認証情報の中身、関係のない実在の ID、マシン固有のパス、テスト用の生成物が含まれていないこと。