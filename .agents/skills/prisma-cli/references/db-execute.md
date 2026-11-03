# prisma db execute

データベースに対して、ネイティブのコマンド（SQL）を実行します。

## コマンド

```bash
prisma db execute [options]
```

## できること

- 設定済みのデータソースを使ってデータベースに接続する
- ファイル（`--file`）か標準入力（`--stdin`）で渡したスクリプトを実行する
- 生のSQLの実行、メンテナンス作業、`migrate diff` で出した差分の適用に使える
- MongoDBには対応していない

## オプション

| オプション | 説明 |
|--------|-------------|
| `--file` | 実行するスクリプトが書かれたファイルのパス |
| `--stdin` | ターミナルの標準入力をスクリプトとして使う |
| `--config` | Prismaの設定ファイルの場所を指定する |

## 現在のオプションについて

`prisma db execute` は、`prisma.config.ts` で設定したデータソースを使います。別の環境用に設定ファイルを分けたいときは `--config` を使ってください。

## 使用例

### ファイルから実行する

```bash
prisma db execute --file ./script.sql
```

### 標準入力から実行する

```bash
echo "TRUNCATE TABLE User;" | prisma db execute --stdin
```

### `migrate diff` の出力を実行する

`migrate diff` の出力を、そのままデータベースに流し込みます。

```bash
prisma migrate diff \
  --from-empty \
  --to-schema prisma/schema.prisma \
  --script \
| prisma db execute --stdin
```

## 設定

`prisma.config.ts` の `datasource` を使います。

```typescript
export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## 使いどころ

- **手動のマイグレーション**：生のSQLで変更を適用する
- **データのメンテナンス**：テーブルを空にする、データを片付ける
- **スキーマの同期**：`migrate diff` で作ったスクリプトを適用する
- **デバッグ**：テスト用のクエリを実行する（ただし、データを取り出す用途には普通は使わない）

## 制限

- **結果は返ってこない**：わかるのは成功したか失敗したかだけで、クエリの結果（行）は表示されません。データを見たいときは Prisma Client か `prisma studio` を使ってください。
- **SQL向け**：主にSQLのデータベースで使うものです。