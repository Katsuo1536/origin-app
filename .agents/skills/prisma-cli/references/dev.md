# prisma dev

開発用に、ローカルのPrisma Postgresデータベースを起動します。自分のPCの中だけで動く、PostgreSQL互換のデータベースです。

## コマンド

```bash
prisma dev [options]
```

## できること

- ローカルで、PostgreSQL互換のデータベースを起動する
- ターミナル上で、またはバックグラウンドで動かせる
- 開発やテストにぴったり
- 本番ではPrisma Postgresのクラウド版へ簡単に移行できる

## オプション

| オプション | 説明 | デフォルト |
|--------|-------------|---------|
| `--name` / `-n` | データベースのインスタンス名 | `default` |
| `--port` / `-p` | HTTPサーバーのポート | `51213` |
| `--db-port` / `-P` | データベースサーバーのポート | `51214` |
| `--shadow-db-port` | シャドーデータベースのポート（マイグレーション用） | `51215` |
| `--detach` / `-d` | バックグラウンドで動かす | `false` |
| `--debug` | デバッグ用のログを出す | `false` |

## 使用例

### ローカルのデータベースを起動する

```bash
prisma dev
```

対話モードでは、次のキーが使えます。
- `q`：終了する
- `h`：HTTPのURLを表示する
- `t`：TCPのURLを表示する

### 名前をつけて起動する

```bash
prisma dev --name myproject
```

複数のプロジェクトを扱うときに便利です。

### バックグラウンドで起動する

```bash
prisma dev --detach
```

ターミナルが空くので、ほかのコマンドを打てます。

### ポートを指定する

```bash
prisma dev --port 5000 --db-port 5432
```

## インスタンスの管理

### 一覧を表示する

```bash
prisma dev ls
```

ローカルのPrisma Postgresのインスタンスを、状態つきですべて表示します。

### 作成済みのインスタンスを起動する

```bash
prisma dev start myproject
```

前に作ったインスタンスを、バックグラウンドで起動します。

### インスタンスを止める

```bash
prisma dev stop myproject
```

### パターンを指定して止める

```bash
prisma dev stop "myproject*"
```

パターンに当てはまるインスタンスをすべて止めます。

### インスタンスを削除する

```bash
prisma dev rm myproject
```

インスタンスのデータをPCから削除します。

### 強制的に削除する（先に止めてから削除）

```bash
prisma dev rm myproject --force
```

## 設定

ローカルのPrisma Postgresを使うように、`prisma.config.ts` を設定します。

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // ローカルのPrisma PostgresのURL（prisma dev の出力に表示される）
    url: env('DATABASE_URL'),
  },
})
```

## 作業の流れ

1. ローカルのデータベースを起動する
   ```bash
   prisma dev
   ```

2. 別のターミナルで、マイグレーションを実行する
   ```bash
   prisma migrate dev
   ```

3. クライアントを生成する
   ```bash
   prisma generate
   ```

4. アプリを起動する

## 本番への移行

本番の準備ができたら、Prisma Postgresのクラウド版に切り替えます。

```bash
prisma init --db
```

`DATABASE_URL` を、クラウドの接続文字列に書き換えてください。