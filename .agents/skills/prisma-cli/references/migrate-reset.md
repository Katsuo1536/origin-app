# prisma migrate reset

データベースをリセットして、すべてのマイグレーションを適用し直します。

## コマンド

```bash
prisma migrate reset [options]
```

## できること

1. データベースを**削除**する（できる場合）。できなければ、すべてのデータとテーブルを消す
2. データベースを**作り直す**
3. `prisma/migrations/` のすべてのマイグレーションを**適用**する
4. ここで終わる。必要なら、シードと generate は明示的に実行する

**注意：すべてのデータが失われます。**

Prisma が AI エージェントによる実行だと判断すると、ユーザーがはっきり同意するまで、このコマンドは止められます。`agent-safety.md` に従ってください。`--force` は通常の確認をとばしますが、エージェントにとってのユーザーの同意にはなりません。

## オプション

| オプション | 説明 |
|--------|-------------|
| `--force` / `-f` | 確認をとばす |
| `--schema` | スキーマファイルの場所 |
| `--config` | Prisma の設定ファイルの場所を指定する |

## 使用例

### 基本のリセット

```bash
prisma migrate reset
```

対話できるターミナルでは、確認を求めてきます。

### 強制リセット（CI・自動化）

```bash
prisma migrate reset --force
```

### スキーマを指定する

```bash
prisma migrate reset --schema=./custom/schema.prisma
```

## 使う場面

- **開発**：まっさらな状態からやり直したいとき
- **テスト**：テストを流す前に、テスト用のデータベースをリセットする
- **ずれからの復旧**：データベースが同期していなくて、マイグレーションできないとき

## そのあとの手順

リセットのあとに最新の Client の出力やシードデータが必要なら、`prisma generate` と `prisma db seed` を明示的に実行してください。

## 設定

シードスクリプトを `prisma.config.ts` で設定して、リセットのあとに明示的に実行します。

```typescript
export default defineConfig({
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})
```

よくある流れ：

```bash
prisma migrate reset --force
prisma generate
prisma db seed
```
