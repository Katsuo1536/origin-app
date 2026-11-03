# prisma db push

マイグレーションを作らずに、スキーマの変更をデータベースに直接反映します。試作の段階に向いています。

## コマンド

```bash
prisma db push [options]
```

## できること

- Prismaスキーマの内容をデータベースに反映する
- データベースがなければ作成する
- マイグレーションファイルは作らない
- マイグレーションの履歴も残さない

## オプション

| オプション | 説明 |
|--------|-------------|
| `--force-reset` | 反映する前に、データベースを強制的にリセットする |
| `--accept-data-loss` | データが消えるという警告を無視する |
| `--schema` | Prismaスキーマの場所を指定する |
| `--config` | Prismaの設定ファイルの場所を指定する |
| `--url` | 設定ファイルのデータソースURLの代わりに、このURLを使う |

PrismaがAIエージェントを検知した場合、`--force-reset` と `--accept-data-loss` を使うにはユーザーの明確な同意が必要です。`agent-safety.md` の手順に従ってください。同意文を推測したり、でっち上げたりしてはいけません。

### このあとに実行するコマンド

- クライアントを最新にしたいときは、`prisma generate` を自分で実行する

## 使用例

### 基本の反映

```bash
prisma db push
```

### データが消えることを受け入れる

```bash
prisma db push --accept-data-loss
```

カラムの削除など、変更でデータが消える場合に必要です。

### 強制リセット

```bash
prisma db push --force-reset
```

データベースを完全にリセットしてから、スキーマを反映します。

### 一連の流れ

```bash
prisma db push
prisma generate
```

## 使う場面

- **試作**：スキーマをすばやく何度も変える
- **ローカル開発**：スキーマをさっと変える
- **MongoDB**：基本の進め方（マイグレーションに対応していないため）
- **テスト**：テスト用のデータベースを用意する

## 使わない場面

- **本番環境**：`migrate deploy` を使う
- **チーム開発**：変更を追えるように、マイグレーションを使う
- **元に戻したい可能性があるとき**：マイグレーションなら履歴が残る

## migrate dev との比較

| 項目 | db push | migrate dev |
|---------|---------|-------------|
| マイグレーションファイルを作る | いいえ | はい |
| 履歴を残す | いいえ | はい |
| シャドーデータベースが必要 | いいえ | はい |
| 速さ | 速い | 遅い |
| 元に戻せる | いいえ | はい |
| 向いている用途 | 試作 | 開発 |

## MongoDBでの進め方

MongoDBはマイグレーションに対応していないので、`db push` だけを使います。

```bash
# MongoDBのスキーマ変更
prisma db push
prisma generate
```

## よくある使い方

### 試作の流れ

```bash
# スキーマを変更する
# ...

# データベースに反映する
prisma db push

# クライアントを生成する
prisma generate

# 変更を試す
# 必要に応じてくり返す
```

### リセットして最初からやり直す

```bash
prisma db push --force-reset
prisma db seed
```

### 反映できないとき

`db push` が変更を安全に反映できない場合は、次のように表示されます。

```
Error: The following changes cannot be applied:
  - Removing field `email` would cause data loss
  
Use --accept-data-loss to proceed
```

（「`email` フィールドを削除するとデータが消えます。続けるには `--accept-data-loss` を使ってください」という意味です。）

データが消えてもよいかを判断してから、次を実行します。

```bash
prisma db push --accept-data-loss
```

## マイグレーションへの切り替え

本番に向けて準備ができたら、マイグレーションに切り替えます。

```bash
# 今のスキーマをもとに、基準になるマイグレーションを作る
prisma migrate dev --name init
```

それ以降の変更には `migrate dev` を使います。