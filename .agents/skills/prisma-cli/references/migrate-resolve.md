# prisma migrate resolve

失敗したマイグレーションやベースライン作成など、マイグレーションの問題を解決します。

## コマンド

```bash
prisma migrate resolve [options]
```

## できること

`_prisma_migrations` テーブルを更新して、マイグレーションの状態を手動で変えます。復旧用のツールです。

## オプション

`--applied` と `--rolled-back` のどちらか1つだけを必ず指定します。

| オプション | 説明 |
|--------|-------------|
| `--applied <name>` | マイグレーションを**適用済み**（成功）にする |
| `--rolled-back <name>` | マイグレーションを**ロールバック済み**（無視・失敗）にする |
| `--schema` | スキーマファイルの場所 |
| `--config` | Prisma の設定ファイルの場所を指定する |

## 使用例

### 適用済みにする（ベースライン作成）

テーブルがすでにあり、SQL を実行せずにマイグレーションを始めたいとき：

```bash
prisma migrate resolve --applied 20240101000000_initial_migration
```

これで Prisma に「このマイグレーションはもう実行済みとみなして」と伝えます。

### ロールバック済みにする（失敗の修正）

マイグレーションが失敗して（構文エラーなど）、SQL を直した、またはもう一度試したいとき：

```bash
prisma migrate resolve --rolled-back 20240115120000_failed_migration
```

これで Prisma に「このマイグレーションの実行は忘れて、もう一度適用させて」と伝えます。

## 使いどころ

1. **ベースライン作成**：既存の本番データベースに Prisma Migrate を導入する。
2. **失敗したマイグレーション**：本番で失敗した `migrate deploy` から復旧する。
3. **緊急の修正**：データベースを手で変更した内容と整合させる（まれ）。

## 参考

- [ベースライン作成](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate/baselining)
- [トラブルシューティング](https://www.prisma.io/docs/guides/database/production-troubleshooting)
