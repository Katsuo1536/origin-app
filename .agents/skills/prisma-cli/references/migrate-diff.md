# prisma migrate diff

データベースのスキーマを比べて、差分（SQL または要約）を生成します。

## コマンド

```bash
prisma migrate diff [options]
```

## できること

- 2つの比較元（`--from-...` と `--to-...`）を比べる
- 比較元に使えるもの：
    - 空の状態（`empty`）
    - スキーマファイル（`schema`）
    - マイグレーションのディレクトリ（`migrations`）
    - データベースの URL（`url`）または設定済みのデータソース（`config-datasource`）
- 差分を出力する：
    - 人が読める要約（デフォルト）
    - SQL スクリプト（`--script`）

## オプション

| オプション | 説明 |
|--------|-------------|
| `--script` | SQL スクリプトを標準出力に出す |
| `--exit-code` | 変更があれば 2、なければ 0、エラーなら 1 で終了する |
| `--config` | Prisma の設定ファイルの場所を指定する |

### 比較元（`from` と `to` を1つずつ必ず指定する）

- `--from-empty`, `--to-empty`
- `--from-schema <path>`, `--to-schema <path>`
- `--from-migrations <path>`, `--to-migrations <path>`
- `--from-url <url>`, `--to-url <url>`
- `--from-config-datasource`, `--to-config-datasource`（`prisma.config.ts` を使う）

## 使用例

### スキーマの変更から SQL を生成する

今の本番のデータベースと、ローカルのスキーマを比べます。

```bash
prisma migrate diff \
  --from-url "$PROD_DB_URL" \
  --to-schema ./prisma/schema.prisma \
  --script
```

### まだ適用していないマイグレーションを確認する

データベースの状態と、マイグレーションのディレクトリを比べます。

```bash
prisma migrate diff \
  --from-config-datasource \
  --to-migrations ./prisma/migrations
```

### 基準（ベースライン）のマイグレーションを作成する

空の状態と、今のスキーマを比べます。

```bash
prisma migrate diff \
  --from-empty \
  --to-schema ./prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql
```

### ずれ（ドリフト）を確認する（CI）

データベースがスキーマと一致しているかを確認します。

```bash
prisma migrate diff \
  --from-config-datasource \
  --to-schema ./prisma/schema.prisma \
  --exit-code
```

## 使いどころ

- **マイグレーションを先に生成する**：`migrate dev` を使わずに SQL を作る。
- **ずれの検出**：データベースが同期しているかを確認する。
- **ベースライン作成**：既存のデータベースから、最初のマイグレーションを作る。
- **デバッグ**：`migrate dev` が何をしようとしているかを理解する。
