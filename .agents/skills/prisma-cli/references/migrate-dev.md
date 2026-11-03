# prisma migrate dev

開発中に、マイグレーションを作成して適用します。シャドーデータベースが必要です。

## コマンド

```bash
prisma migrate dev [options]
```

## できること

1. 既存のマイグレーションをシャドーデータベースで実行して、ずれ（ドリフト）を検出する
2. まだ適用していないマイグレーションを適用する
3. スキーマの変更から、新しいマイグレーションを生成する
4. 新しいマイグレーションを、開発用のデータベースに適用する
5. `_prisma_migrations` テーブルを更新する

## オプション

| オプション | 説明 |
|--------|-------------|
| `--name` / `-n` | マイグレーションに名前を付ける |
| `--create-only` | 新しいマイグレーションを作成するが、適用はしない |
| `--schema` | Prisma スキーマの場所を指定する |
| `--config` | Prisma の設定ファイルの場所を指定する |
| `--url` | Prisma の設定ファイルにあるデータソースの URL を上書きする |

### そのあとに実行するコマンド

- 最新の Client の出力が必要なときは、`prisma generate` を明示的に実行する
- シードデータが必要なときは、`prisma db seed` を明示的に実行する

生成物を最新にしたいときは、続けて `prisma generate` を明示的に実行してください。ジェネレーターの実行が `migrate dev` に含まれると説明していた、以前の CLI のヘルプを当てにしないでください。

## 使用例

### マイグレーションを作成して適用する

```bash
prisma migrate dev
```

スキーマが変わっていれば、マイグレーションの名前を聞いてきます。

### 名前を付けたマイグレーション

```bash
prisma migrate dev --name add_users_table
```

### 適用せずに作成だけする

```bash
prisma migrate dev --create-only
```

適用する前に、マイグレーションの SQL を確認したいときに便利です。

### 一連の流れ

```bash
prisma migrate dev --name my_migration
prisma generate
prisma db seed
```

## マイグレーションのファイル

`prisma/migrations/` に作成されます。

```
prisma/migrations/
├── 20240115120000_add_users_table/
│   └── migration.sql
├── 20240116090000_add_posts/
│   └── migration.sql
└── migration_lock.toml
```

## スキーマのずれ（ドリフト）の検出

`migrate dev` がずれ（データベースを手で変更した、マイグレーションを編集した、など）を検出すると、リセットするかどうかを聞いてきます。

```
Drift detected: Your database schema is not in sync.

Do you want to reset your database? All data will be lost.
```

## 使う場面

- ローカルでの開発
- 新しいモデルやフィールドを追加するとき
- リレーションを変えるとき
- インデックスを作成するとき

## 使わない場面

- 本番環境へのデプロイ（`migrate deploy` を使う）
- CI/CD のパイプライン（`migrate deploy` を使う）
- MongoDB（代わりに `db push` を使う）

## よくあるパターン

### スキーマを変更したあと

```prisma
// schema.prisma - 新しいフィールドを追加する
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())  // 新しいフィールド
}
```

```bash
prisma migrate dev --name add_created_at
```

### データが失われる警告への対処

マイグレーションでデータが失われる場合は、次のように警告が出ます。

```bash
prisma migrate dev --name remove_field
# Warning: You are about to delete data...
# Accept with: --accept-data-loss
```

## シャドーデータベース

`migrate dev` は、ずれを検出するためにシャドーデータベースを使います。`prisma.config.ts` で設定します。

```typescript
export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})
```

ローカルの Prisma Postgres（`prisma dev`）では、シャドーデータベースは自動で用意されます。
