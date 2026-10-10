# Trace Intelligence リファレンス

Mastra プラットフォームの Trace Intelligence（プライベートベータ）に問い合わせる方法です。Trace Intelligence は、完了したエージェントのトレースを分析し、4つのトレースシグナル（`goal`、`outcome`、`behavior`、`sentiment`）ごとに、繰り返し現れるテーマにまとめます。

このリファレンスは、ユーザーから次のような依頼があったときに使います。エージェントの状態を調べたい、繰り返し起きる失敗や振る舞いの問題を見つけたい、エージェントの改善点を知りたい、ユーザーが何を求めているかを理解したい、goal／outcome／behavior／sentiment の繰り返しテーマを確認したい、Trace Intelligence のデータをプログラムから取得したい。

## 基本の考え方

- **トレースシグナル**：完了したトレース1件ごと、観点（`goal`、`outcome`、`behavior`、`sentiment`）ごとに生成される、1文の説明。
- **テーマ**：1つの観点について、似たトレースシグナルをまとめた、継続的なグループ。ラベルと説明が付いている。テーマ ID は、同じシグナルであればスナップショットをまたいでも変わらない。
- **スナップショット**：最近のトレースを対象に、移動しながら分析する期間の区切り。意味の分からない（opaque）`snapshotId` で識別される。
- **ノイズ**：スナップショットの中で、どのテーマにもまとめられなかったトレース。その期間だけのもので、継続的な識別子はない。

## 前提条件

- プロジェクトが Mastra プラットフォームのオブザーバビリティを使っていて、完了したトレースがあること。
- プロジェクトが Trace Intelligence のプライベートベータに登録されていること。登録されていないプロジェクトは、プロジェクトを直接読みにいくと `403` が返ります。

分析は非同期で行われます。テーマができるまでには、基本的に100件以上の完了したトレースが必要です。レスポンスが空なのは、多くの場合エラーではなく、分析済みのデータがまだ足りないという意味です。

## アクセス方法

Trace Intelligence のルートはすべて、`/api/learning/` の下にある読み取り専用の `GET` リクエストです。

1. **`mastra api learning` CLI**（おすすめ）：ホスト型のオブザーバビリティのコマンドと同じ認証の仕組みを使います。`MASTRA_PLATFORM_ACCESS_TOKEN` と `MASTRA_PROJECT_ID` が設定されているか、`.mastra-project.json` があれば、`--url` や `--header` は不要です。CLI は、`X-Mastra-Organization-Id` も `MASTRA_ORGANIZATION_ID` か `.mastra-project.json` から自動で設定します。

```bash
mastra api learning entities '{"entityType":"agent"}'
```

`--url` と `--header` は、ホスト型の Trace Intelligence の接続先や認証情報を上書きするときだけ指定してください。

2. **ローカル開発サーバーのプロキシ**：`mastra dev` は、`GET http://localhost:4111/api/learning/*` を、通常のプラットフォームの認証情報を使ってプラットフォームへ中継します。ループバック（自分のマシン）からのアクセスだけに対応しています。

```bash
curl -fsS "http://localhost:4111/api/learning/entities?entityType=agent" | jq
```

3. **プラットフォームのエンドポイントを直接呼ぶ**（CLI も開発サーバーも不要）：認証、プロジェクト、組織のヘッダーを明示して、`https://output.signals.mastra.ai` を呼びます。

```bash
BASE="https://output.signals.mastra.ai"
AUTH=(
  -H "Authorization: Bearer $MASTRA_PLATFORM_ACCESS_TOKEN"
  -H "X-Mastra-Project-Id: $MASTRA_PROJECT_ID"
  -H "X-Mastra-Organization-Id: $MASTRA_ORGANIZATION_ID"
)

curl -fsS "${AUTH[@]}" "$BASE/api/learning/entities?entityType=agent" | jq
```

以降の curl の例では、`$BASE` と `"${AUTH[@]}"` を使っています。ローカルのプロキシを使う場合は、`$BASE` を `http://localhost:4111` に置き換え、ヘッダーを外してください。

## CLI コマンド

すべてのルートに対応する CLI コマンドがあります。位置引数で `entityId`／`themeId` を渡し、JSON 入力で [ルートの一覧](#ルートの一覧) にあるクエリパラメータを渡します。どのコマンドでも、`--schema` を付けると入力スキーマが、`--pretty` を付けると読みやすい形で出力されます。

| コマンド | ルート |
| --- | --- |
| `mastra api learning entities '{"entityType":"agent"}'` | `/api/learning/entities` |
| `mastra api learning snapshots <entityId> <input>` | `.../theme-snapshots` |
| `mastra api learning flow <entityId> <input>` | `.../theme-flow` |
| `mastra api learning paths <entityId> <input>` | `.../theme-paths` |
| `mastra api learning theme list <entityId> <input>` | `.../themes` |
| `mastra api learning theme get <entityId> <themeId> <input>` | `.../themes/:themeId` |
| `mastra api learning theme examples <entityId> <themeId> <input>` | `.../themes/:themeId/examples` |
| `mastra api learning theme history <entityId> <themeId> <input>` | `.../themes/:themeId/history` |
| `mastra api learning noise get <entityId> <input>` | `.../noise` |
| `mastra api learning noise examples <entityId> <input>` | `.../noise/examples` |

下の curl の手順と同じ流れを、CLI で書くとこうなります。

```bash
# 1. エンティティと、使えるシグナルを調べる
mastra api learning entities '{"entityType":"agent"}'

# 2. スナップショットを一覧する（signalNames は順序付きのカンマ区切り）
mastra api learning snapshots my-agent \
  '{"entityType":"agent","signalNames":"goal,outcome,behavior,sentiment","limit":10}'

# 3. 1つのスナップショットにおける、1つのシグナルのテーマ（snapshotId は手順2から）
mastra api learning theme list my-agent \
  '{"entityType":"agent","signalName":"goal","snapshotId":"<snapshotId>"}'

# 4. 1つのテーマを掘り下げる（数値の themeId は手順3から）
mastra api learning theme examples my-agent 42 \
  '{"entityType":"agent","signalName":"goal","snapshotId":"<snapshotId>","limit":10}'
mastra api learning theme history my-agent 42 \
  '{"entityType":"agent","signalName":"goal"}'
```

## 調査の流れ

エージェントの状態や改善点についての全体的な質問では、まず Trace Intelligence で繰り返し現れるパターンを見つけ、そのあと trace／log／metric／score の API で、特定の実行から具体的な根拠を確認します。特定の失敗した実行やエラーについての質問では、まず `mastra api trace` か `mastra api log` から始め、そのあと Trace Intelligence で、その問題が繰り返し起きているかを確認します。

Trace Intelligence で全体を分析するときは、次の順番に従ってください。後の呼び出しには、前の呼び出しで返ってきた値が必要です。

### 1. エンティティを調べる

テーマの出力があるエンティティ（エージェント）と、それぞれで使えるシグナルを一覧します。

```bash
curl -fsS "${AUTH[@]}" "$BASE/api/learning/entities?entityType=agent" \
  | jq '.entities[] | {entityId, availableSignals, latestWindow}'
```

以降の呼び出しでは、`availableSignals` に含まれている `signalNames` だけを指定してください。

### 2. スナップショットを一覧する

`signalNames` は、順序付きのカンマ区切りのリスト（重複なしで1〜4個）です。指定したすべてのシグナルについて、その期間に使える出力がある場合だけ、スナップショットが返されます。

```bash
ENTITY="my-agent" # TODO: 手順1の entityId
curl -fsS "${AUTH[@]}" \
  "$BASE/api/learning/entities/$ENTITY/theme-snapshots?entityType=agent&signalNames=goal,outcome,behavior,sentiment&limit=10" \
  | jq '.snapshots[] | {snapshotId, ordinal, total, startedAt, endedAt, traceCount}'
```

任意の `from`／`to`（タイムゾーンのオフセット付き ISO タイムスタンプ）で、スナップショットの区切りの範囲を絞れます。`cursor` を使うと、`nextCursor` で新しい順にページ送りできます。

### 3. テーマ、またはシグナル間の流れを読む

トレースシグナルごとに、違う角度から診断します。

- `goal`：ユーザーが何をしようとしているか。
- `outcome`：何が完了し、何が失敗・ブロック・未解決のままか。
- `behavior`：エージェントがどう振る舞っているか（ツールの使い方、ループ、拒否、立て直し、ずれなど）。
- `sentiment`：やり取りの中で、ユーザーの感情がどう変わるか。

1つのスナップショットにおける、1つのシグナルのテーマ：

```bash
SNAPSHOT="..." # TODO: 手順2の snapshotId
curl -fsS "${AUTH[@]}" \
  "$BASE/api/learning/entities/$ENTITY/themes?entityType=agent&signalName=goal&snapshotId=$SNAPSHOT" \
  | jq '{themes: [.themes[] | {themeId, label, state, traceCount, coverage, trend}], noise}'
```

シグナル間の流れ（サンキー図のような段階とつながり。件数は重複を除いたトレース数）：

```bash
curl -fsS "${AUTH[@]}" \
  "$BASE/api/learning/entities/$ENTITY/theme-flow?entityType=agent&signalNames=goal,outcome&snapshotId=$SNAPSHOT" \
  | jq '{stages: [.stages[] | {signalName, nodes: [.nodes[] | {label, kind, traceCount, stageShare}]}], links}'
```

### 4. 1つのテーマを掘り下げる

全体のテーマから具体的なトレースへ進むには、例（examples）を使います。気になるテーマが見つかったら、その例を確認し、実行レベルの根拠が必要なときは、返ってきた `traceId` を `mastra api trace`、ログ、メトリクス、スコアで使ってください。

詳細、例（トレースシグナルの元のテキスト）、履歴：

```bash
THEME="42" # TODO: 手順3の数値の themeId
curl -fsS "${AUTH[@]}" \
  "$BASE/api/learning/entities/$ENTITY/themes/$THEME?entityType=agent&signalName=goal&snapshotId=$SNAPSHOT" | jq '.theme'

curl -fsS "${AUTH[@]}" \
  "$BASE/api/learning/entities/$ENTITY/themes/$THEME/examples?entityType=agent&signalName=goal&snapshotId=$SNAPSHOT&limit=10" \
  | jq '.examples[] | {traceId, signalText}'

curl -fsS "${AUTH[@]}" \
  "$BASE/api/learning/entities/$ENTITY/themes/$THEME/history?entityType=agent&signalName=goal" \
  | jq '{points: [.points[] | {state, traceCount, coverage}], relationships}'
```

履歴は `snapshotId` を受け付けません。スナップショットをまたいだテーマのライフサイクル（`birth`：誕生、`continue`：継続、`split`：分裂、`merge`：統合、`death`：消滅、`resurrection`：復活）と、分裂・統合の関係を返します。

### 5. ノイズとトレースごとの経路

ノイズのグループとその例（テーマと同じクエリの形で、`/noise` と `/noise/examples` を使う）：

```bash
curl -fsS "${AUTH[@]}" \
  "$BASE/api/learning/entities/$ENTITY/noise?entityType=agent&signalName=goal&snapshotId=$SNAPSHOT" | jq '.noise'
```

順序付きのシグナルをまたいだ、トレースごとの割り当て（`theme-flow` のトレース単位版。`nextOffset` がなくなるまで `limit`／`offset` でページ送りする）：

```bash
curl -fsS "${AUTH[@]}" \
  "$BASE/api/learning/entities/$ENTITY/theme-paths?entityType=agent&signalNames=goal,outcome&snapshotId=$SNAPSHOT&limit=100" \
  | jq '{themes, paths: .paths[:5]}'
```

`paths[].assignments` は、各シグナルをテーマのキー（`themes` の辞書で解決できる）か `"noise"` に対応づけます。これを使ってテーマを具体的な `traceId` に結びつけ、そのトレースを `mastra api trace` で確認してください（[`mastra-api.md`](mastra-api.md) を参照）。

## ルートの一覧

| ルート | 必須のクエリパラメータ | 任意 |
| --- | --- | --- |
| `GET /api/learning/entities` | `entityType` | `limit` |
| `GET .../:entityId/theme-snapshots` | `entityType`, `signalNames` | `limit`, `cursor`, `from`, `to` |
| `GET .../:entityId/theme-flow` | `entityType`, `signalNames`, `snapshotId` | `themeLimitPerStage` |
| `GET .../:entityId/theme-paths` | `entityType`, `signalNames`, `snapshotId` | `limit`, `offset` |
| `GET .../:entityId/themes` | `entityType`, `signalName`, `snapshotId` | — |
| `GET .../:entityId/themes/:themeId` | `entityType`, `signalName`, `snapshotId` | — |
| `GET .../:entityId/themes/:themeId/examples` | `entityType`, `signalName`, `snapshotId` | `limit`, `offset` |
| `GET .../:entityId/themes/:themeId/history` | `entityType`, `signalName` | `limit`, `cursor` |
| `GET .../:entityId/noise` | `entityType`, `signalName`, `snapshotId` | — |
| `GET .../:entityId/noise/examples` | `entityType`, `signalName`, `snapshotId` | `limit`, `offset` |

`:themeId` は数値です。flow／paths／snapshots は複数形の順序付き `signalNames` を、theme／noise のルートは単数形の `signalName` を受け付けます。

## ルールと注意点

- **`snapshotId` は意味の分からない値として扱う。** 受け取ったときと同じエンティティとシグナルの組み合わせで、そのまま送り返してください。別のプロジェクト、エンティティ、シグナルの組み合わせでは拒否されます。スナップショット ID を自分で作ったり、範囲をまたいで使い回したりしないでください。
- **件数は重複を除いたトレース数**であって、割り当ての行数ではありません。`coverage`、`stageShare`、`sourceShare`、`targetShare` は、重複を除いた件数に対する割合です。
- **`theme-flow` の `other` ノード**は、件数の少ないテーマを段階ごとにまとめたものです。`themeId` がないので掘り下げられません。展開したい場合は `themeLimitPerStage` を大きくしてください。
- **ノイズはその期間だけのもの。** 継続的な ID、ラベル、傾向はなく、スナップショットごとに異なります。
- **結果は AI が生成した要約です。** 行動に移す前に、テーマの例と元のトレースで結論を確認してください。

## エラー

- `401`：Bearer トークンが間違っているか、ありません。`MASTRA_PLATFORM_ACCESS_TOKEN` を確認してください。
- `X-Mastra-Organization-Id` に触れている `403`：組織のヘッダーがありません。直接 curl する場合は `MASTRA_ORGANIZATION_ID` を設定し、CLI の場合は `.mastra-project.json` があるディレクトリから実行してください。
- `403`：プロジェクトがプライベートベータに登録されていないか、ローカルのプロキシをループバック以外のホストから呼んでいます。
- ローカルのプロキシからの `503`：開発サーバーの環境に `MASTRA_PLATFORM_ACCESS_TOKEN`／`MASTRA_PROJECT_ID` が設定されていません。
- `entities` や `snapshots` が空：分析済みのトレースがまだ足りないか、指定した `signalNames` がすべては使えません。エンティティの呼び出しで返ってきた `availableSignals` を確認し直してください。