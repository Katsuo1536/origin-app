# 作業・セッション・メモリを確認する

まず [connection.md](connection.md) を読んでください。ここでの手順は、`FACTORY_URL` がユーザーの確認済みの接続先であり、`PROJECT_ID` がその接続先の Factory プロジェクト一覧から取得したものであることを前提にしています。接続先と、デプロイ固有の認証・プレフィックスのオプションは、すべての呼び出しで付けたままにしてください。`PROJECT_ID` の代わりに、プラットフォームのデプロイ ID を使わないでください。

## ユーザーに関係する作業を探す

プラットフォームの認証を使っている場合は、`mastra auth whoami` で、認証情報を読まずに現在のユーザー ID を確認してください。それ以外の認証プロバイダーの場合は、実際の Factory 上のユーザーが誰なのかをユーザーと一緒に確認してください。プラットフォームのユーザー ID がそのまま使えるとは考えないでください。確認したユーザーを `USER_ID` に設定します。

```bash
mastra api --url "$FACTORY_URL" factory work-item list "$PROJECT_ID" \
  | jq --arg user "$USER_ID" '.data | {
      runningSessionIds, parkedSessionIds,
      workItems: [.workItems[] | select(
        .createdBy == $user or any(.sessions[]?; .startedBy == $user)
      ) | {id, title, board, stages, revision, sessions, updatedAt}]
    }'
```

これで見つかるのは「作成した」「開始した」という関係だけで、すべての割り当て、メンション、関与が見つかるわけではありません。何で一致したのかを説明してください。漏れなく確認できたと言う前に、実際のレスポンスの形とページ送りを確認してください。サーバー側のフィルタは推測せず、末端コマンドのスキーマで確認してください。

`execute` や `review` といったステージにあるからといって、モデルが実行中だとは限りません。`runningSessionIds`、セッションの紐づけ、現在の判断、最近のメッセージ、タイムスタンプ、ヘルスの指摘を突き合わせてください。実行中のセッション一覧に古い項目が残っていても、最近進んでいる証拠にはなりません。`board: null` は、作業ボード上のカードではなく、Slack やチャットの項目を表していることがあります。別扱いで報告し、パイプラインの作業として自動で再開しないでください。

## 作業項目からスレッドをたどる

1. 項目を選び、返ってきた `sessions` の各エントリを確認します。複数の役割が同じスレッドを共有していることがあるので、スレッド ID の重複を取り除いてください。
2. 作業項目の ID や、自分で考えたセッション／スレッドの命名規則ではなく、返ってきた `threadId` を使います。その値を `THREAD_ID` に設定します。
3. インストール済みのランタイムのコマンドを確認します。Factory には現在 `read-session` というコマンドはありません。同じ接続先で `thread` と `memory` を使ってください。

```bash
mastra api --url "$FACTORY_URL" thread --help
mastra api --url "$FACTORY_URL" thread list --schema
mastra api --url "$FACTORY_URL" thread get "$THREAD_ID" \
  | jq '.data | {id, resourceId, title, createdAt, updatedAt}'
mastra api --url "$FACTORY_URL" thread messages --schema \
  | jq '{positionals, input: .input.schema}'
mastra api --url "$FACTORY_URL" thread messages "$THREAD_ID" '{"page":0,"perPage":10}' \
  | jq '{page, messages: [.data[] | {id, role, createdAt, parts: .content.parts}]}'
```

スレッドの紐づけが分からない場合は、スキーマが対応しているフィルタを付けて `thread list` を使ってください。関係のないユーザーのメモリを一覧しないでください。Factory の仕様は CLI に同梱されていますが、ランタイムの `--schema` の確認には、到達可能で認証済みの接続先が必要な場合があります。`.page.hasMore` を見ながら、`page` を0から順に増やしてください。最新のメッセージを探す場合は、スキーマが対応している並び順を選んでください。表示するテキストやパーツは絞り、質問に答えられた時点でやめてください。確認したページや期間、確認できていない部分を報告してください。

### Factory の画面でセッションを開く

ホスト型の Factory の画面では、`$FACTORY_URL` と同じオリジンの `/factories/<factory-project-id>/workspaces/<sessionId>/threads/<threadId>` でセッションが表示されます。項目から返ってきた `sessions` の値で URL を組み立て、ユーザーのブラウザで開いてください（macOS は `open`、Linux は `xdg-open`）。

```bash
mastra api --url "$FACTORY_URL" factory work-item list "$PROJECT_ID" \
  | jq -r --arg id "$WORK_ITEM_ID" --arg base "$FACTORY_URL" --arg project "$PROJECT_ID" '
      (.data.workItems // .data)[] | select(.id == $id)
      | .sessions | to_entries[]
      | "\($base)/factories/\($project)/workspaces/\(.value.sessionId)/threads/\(.value.threadId)"' \
  | sort -u
# そのあと: open "<url>"（macOS） / xdg-open "<url>"（Linux）
```

その URL を認証なしで取得すると 401 が返ります。画面が表示されるのは、ユーザーのブラウザでログインしているからです。API の代わりにページをスクレイピングしないでください。

テキスト、ツールの呼び出しと結果、シグナル、OM のイベントは `content.parts` から読み取ってください。やり取りの記録には、結果が保存されていないツール呼び出しが含まれていることがあります。ユーザーの意図、試みた操作、観測された結果、エージェントの主張、独立して確認できた結果を分けて扱ってください。アシスタントの文章にある「テストは通りました」は、テストの実行結果よりも弱い根拠です。「実装しました」は、コミット・プッシュ・マージ済みであることの証明にはなりません。リポジトリや PR の根拠がなければ、それらの状態は「不明」として報告してください。

## 観測メモリ（OM）

対応していると決めつける前に、コマンドを確認してください。

```bash
mastra api --url "$FACTORY_URL" memory --help
mastra api --url "$FACTORY_URL" memory status --schema \
  | jq '{positionals, input: .input.schema}'
mastra api --url "$FACTORY_URL" agent list \
  | jq '.data[] | {id, name}'
```

`AGENT_ID` には、デプロイやセッションのメタデータで確認した、そのセッションのメモリを実際に持っているエージェントを設定してください（あいまいな場合は確認してください）。どこでも使える共通のエージェント ID があるとは考えないでください。`RESOURCE_ID` には、スレッドから返ってきた `resourceId` を設定してください。リソース、スレッド、セッション、プロジェクトの ID は、基本的に互いに置き換えられません。

```bash
mastra api --url "$FACTORY_URL" memory status \
  "$(jq -nc --arg agent "$AGENT_ID" --arg resource "$RESOURCE_ID" --arg thread "$THREAD_ID" \
    '{agentId:$agent,resourceId:$resource,threadId:$thread}')" \
  | jq '.data.observationalMemory'
```

status では、`enabled`、`hasRecord`、`lastObservedAt`、`observationTokenCount`、観測中・振り返り中のフラグが分かることがあります。これは観測の本文ではありません。status のブロックがなくても、メモリが空だとは限りません。まずエージェントとリソースを確認してください。観測トークン数が0の記録は、観測が成功した根拠にはなりません。

動作確認済みの CLI（Mastra 1.30.0）では、`memory` にあるのは `search`、`current`、`status` で、OM の中身を読む専用のコマンドはありません。サーバーの認証付き `GET /memory/observational-memory`（ランタイム API のプレフィックス配下）は `{record, history}` を返しますが、ルートのメタデータがあるからといって CLI のコマンドになるわけではありません。保存されたトークンを取り出したり、これを呼ぶための中継コマンドを作ったりしないでください。正式な現在の OM が必要な場合は、対応している認証付きの画面やクライアントを使うか、CLI の制約として報告してください。読み取りの代わりに、バッファ状態の POST を呼ばないでください。

過去の観測の本文は、保存されたメッセージのパーツに含まれていることもあります。これはバージョンに依存する診断用の代替手段であり、正式な現在の記録を再現するものではありません。

```bash
mastra api --url "$FACTORY_URL" thread messages "$THREAD_ID" '{"page":0,"perPage":10}' \
  | jq '{page, events: [.data[] | .content.parts[]? |
      select(.type | startswith("data-om-")) |
      {type, data: (.data | {cycleId, observations, error, tokensAttempted})}]}'
```

- `data-om-activation`、`data-om-buffering-end`、観測終了のイベントには、`data.observations` が含まれていることがあります。
- バッファされた観測が、有効化されているとは限りません。イベントは重なったり繰り返されたりするので、合計して現在のトークン数としたり、つなげて現在のメモリだと主張したりしないでください。
- 失敗のマーカーから、プロバイダーや認証のエラー、失敗したサイクルが分かることがあります。1つの失敗が2回報告されて2回の試行と数えられないよう、`cycleId` で突き合わせてください。
- 開始のイベントだけがあっても、強制終了された証拠にはなりません。保存が途中までのこともあります。同じように、停止した実行の近くに OM のエラーがあっても、それは根拠の1つであって、原因の証明ではありません。
- `remembered`（ピン留めされた知識）のシグナルは、OM の記録全体とは別物です。マーカーがなくても、OM が一度も動かなかったとは限りません。

## 修正を提案する前に、スーパーバイザーの指摘を解釈する

**シート（seat）** とは、エージェントの役割を作業項目に割り当てる、有効な実行の紐づけのことです。有料ユーザーのライセンスではありません。ステージと役割の対応はボードやデプロイによって異なります。ステージの名前から役割を推測せず、返ってきた根拠を使ってください。

| 指摘 | 意味／次に確認すること |
| --- | --- |
| `seat-missing` | 作業中のステージにある項目に、有効な紐づけも進行中の判断もない。作業がすでに終わっているのか、意図的に保留されているのか、本当に再開を待っているのかを確認する。それだけではクラッシュの証拠にはならず、経過時間のしきい値があるとも限らない。 |
| `seat-orphaned` | 有効な紐づけが、存在しない項目か終了済みの項目を参照している。取り消す前に、紐づけと項目の状態を確認する。 |
| `start-stalled` | 保留中の開始が失敗したか、スーパーバイザーの停滞しきい値を超えた。再開する前に、失敗の内容とセッションを確認する。 |
| `decision-stuck` | 保留中・再試行中の判断が長く待たされているか、リースの期限が切れている。再試行する前に、状態、試行回数、エラーを確認する。 |
| `held-waiting` | 作業が人による承認を待っている。エージェントを起動するのではなく、承認とトリアージの状態を確認する。 |
| `label-drift` | 外部のラベルが承認の状態と一致していない。同期の状態を確認する。 |

デプロイが実際に返した指摘だけを報告してください。承認待ちの提案は、実行の失敗とは別物です。`health thresholds` コマンドが示すのはキューの滞留時間の区分で、スーパーバイザーの判断・開始・リースのタイムアウトの設定ではありません。それらの指摘には、キューの滞留時間の基準ではなく、スーパーバイザーの根拠を使ってください。

修正の提案は、許可ではありません。スーパーバイザーのリファレンスにある変更の手順と、正式なセッションの要件に従ってください。完了済みのタスクは、コストの高い作業をやり直すより、状態を整合させる方が適切な場合があります。スーパーバイザーのセッションを、作業用のセッションの代わりに使わないでください。

## ページ送りと互換性の問題

- 要対応項目の一覧では、指定した `limit` に上限がかかることがあります（上限50が確認されています）。返ってきた `hasMore` と `nextCursor` を見ながら、`before` を使って次を取得し、意味の分からないカーソル値はそのまま渡してください。カーソルを自分で作ったり、デコードして組み立て直したりしないでください。
- 一部のデプロイ済みバージョンでは、スキーマに載っている要対応項目の `kind` フィルタが、HTTP 400 `invalid_attention_kind` で拒否されました。この場合は、そのフィルタを外し、対応している `search`／`view` のフィルタを使い、返ってきた項目を手元で絞り込んでください。1つのデプロイでの失敗を、すべてのバージョンに当てはめないでください。
- ページ送りで、続きがあるはずなのに空のページが返る、同じカーソルが繰り返される、壊れた JSON が返る、といった矛盾が起きたら、そこで止めて、一部しか確認できていないことを報告してください。診断のためにエラーは残し、壊れたページを黙って捨てたり、該当する作業がないと言い切ったりしないでください。
- ページサイズを大きくする前に、抜き出しを絞ってください。生の JSON を `head` に通して途中で切ってから、それを解析しようとしないでください。