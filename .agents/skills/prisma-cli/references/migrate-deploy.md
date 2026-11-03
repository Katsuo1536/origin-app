# prisma migrate deploy

本番やステージングの環境で、まだ適用していないマイグレーションを適用します。

## コマンド

```bash
prisma migrate deploy
```

## できること

- `prisma/migrations/` にある、まだ適用していないマイグレーションをすべて適用する
- `_prisma_migrations` テーブルを更新する
- 新しいマイグレーションは作成しない
- シードスクリプトは実行しない
- CI/CD や本番環境でも安全に使える

## オプション

| オプション | 説明 |
|--------|-------------|
| `--schema` | Prisma スキーマの場所を指定する |
| `--config` | Prisma の設定ファイルの場所を指定する |

## 使う場面

- 本番環境へのデプロイ
- ステージング環境
- CI/CD のパイプライン
- 開発環境以外のすべての環境

## 使用例

### 基本のデプロイ

```bash
prisma migrate deploy
```

### CI/CD のパイプラインで使う

```yaml
# GitHub Actions の例
- name: Apply migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Docker でのデプロイ

```dockerfile
# アプリを起動する前にマイグレーションを実行する
CMD npx prisma migrate deploy && node dist/index.js
```

## migrate dev との比較

| 機能 | migrate dev | migrate deploy |
|---------|-------------|----------------|
| マイグレーションを作成する | する | しない |
| マイグレーションを適用する | する | する |
| ずれ（ドリフト）を検出する | する | しない |
| 入力を求める | 求める | 求めない |
| シャドーデータベースを使う | 使う | 使わない |
| 本番環境で安全に使える | いいえ | はい |
| 問題があったとき | リセットするか確認してくる | 失敗して止まる |

## 本番での作業の流れ

1. **開発**：ローカルでマイグレーションを作成する
   ```bash
   prisma migrate dev --name add_feature
   ```

2. **コミット**：マイグレーションのファイルをバージョン管理に含める
   ```bash
   git add prisma/migrations
   git commit -m "Add feature migration"
   ```

3. **デプロイ**：本番環境で適用する
   ```bash
   prisma migrate deploy
   ```

## エラーへの対処

### マイグレーションが失敗したとき

マイグレーションが失敗すると、`migrate deploy` はエラーで終了します。失敗したマイグレーションは、`_prisma_migrations` に失敗として記録されます。

直し方：
1. 原因を解決する（SQL やデータベースの状態を直すなど）
2. 解決済みにする：`prisma migrate resolve --applied <migration_name>`
3. もう一度実行する：`prisma migrate deploy`

### 先に状態を確認する

```bash
prisma migrate status
```

デプロイの前に、まだ適用していないマイグレーションと、適用済みのマイグレーションを表示します。

## 設定

`prisma.config.ts` に、本番のデータベースの URL が設定されていることを確認してください。

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## おすすめの使い方

1. CI では、`migrate deploy` の前に必ず `migrate status` を実行する
2. 元に戻す手段を用意しておく（マイグレーションの前にバックアップを取る）
3. マイグレーションは、先にステージング環境で試す
4. 本番環境では、`migrate dev` を絶対に使わない
