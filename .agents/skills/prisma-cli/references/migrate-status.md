# prisma migrate status

データベースのマイグレーションの状態を確認します。

## コマンド

```bash
prisma migrate status [options]
```

## できること

- データベースに接続する
- `_prisma_migrations` テーブルを確認する
- 適用済みのマイグレーションと、ローカルのマイグレーションのファイルを比べる
- 次の内容を報告する：
    - **状態**：データベースが最新か、遅れているか
    - **未適用のマイグレーション**：まだ適用していないマイグレーションの数
    - **見つからないマイグレーション**：データベースにはあるが、ローカルにないマイグレーション
    - **失敗したマイグレーション**：適用に失敗したマイグレーション

## オプション

| オプション | 説明 |
|--------|-------------|
| `--schema` | スキーマファイルの場所 |
| `--config` | Prisma の設定ファイルの場所を指定する |

## 使用例

### 状態を確認する

```bash
prisma migrate status
```

出力の例（最新の場合）：
```
Database schema is up to date!
```

出力の例（未適用がある場合）：
```
Following migration have not yet been applied:
  20240115120000_add_user

To apply migrations in development, run:
  prisma migrate dev

To apply migrations in production, run:
  prisma migrate deploy
```

## 使う場面

- **デバッグ**：`migrate dev` がずれ（ドリフト）があると言ってくる理由を調べる
- **CI/CD**：デプロイの前にデータベースの状態を確認する
- **本番**：マイグレーション（`migrate deploy`）が必要か、デプロイが失敗していないかを確認する

## 終了コード

- `0`：成功（未適用のマイグレーションがあっても、コマンド自体が正常に動けば 0）
- `1`：エラー

未適用のマイグレーションがあるかをプログラムで判定したいときは、出力を解析するか、終了コードのフラグを付けた `migrate diff` を使う必要があるかもしれません。
