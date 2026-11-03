# prisma db pull

既存のデータベースの構造を読み取り（イントロスペクション）、その内容に合わせてPrismaのスキーマを更新します。

## コマンド

```bash
prisma db pull [options]
```

## できること

- データベースに接続する
- データベースのスキーマ（テーブル・カラム・リレーション・インデックス）を読み取る
- それに対応するPrismaモデルで `schema.prisma` を更新する
- MongoDBの場合は、データを抜き出して調べ、スキーマを推測する

## オプション

| オプション | 説明 |
|--------|-------------|
| `--force` | 今のPrismaスキーマファイルを無視する |
| `--print` | 読み取ったPrismaスキーマを、ファイルに書かずに画面（標準出力）に表示する |
| `--schema` | Prismaスキーマの場所を指定する |
| `--config` | Prismaの設定ファイルの場所を指定する |
| `--url` | 設定ファイルのデータソースURLの代わりに、このURLを使う |
| `--composite-type-depth` | 複合型をどの深さまで読み取るかを指定する（デフォルトは -1＝無制限、0＝読み取らない） |
| `--schemas` | 読み取るデータベースのスキーマを指定する |
| `--local-d1` | ローカルの Cloudflare D1 データベースからPrismaスキーマを作る |

## 使用例

### 基本の読み取り

```bash
prisma db pull
```

### 書き込まずに確認する

```bash
prisma db pull --print
```

スキーマをターミナルに表示するだけなので、中身を確認できます。

### 強制的に上書きする

```bash
prisma db pull --force
```

スキーマファイルを丸ごと置き換えます。手で加えた変更は消えます。

## 事前の準備

`prisma.config.ts` でデータベースの接続先を設定しておきます。

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

## 作業の流れ

### 既存のデータベースから始める場合

1. Prismaを初期化する
   ```bash
   prisma init
   ```

2. データベースのURLを設定する

3. スキーマを取り込む
   ```bash
   prisma db pull
   ```

4. できたスキーマを確認して、手直しする

5. クライアントを生成する
   ```bash
   prisma generate
   ```

### データベース側の変更を取り込む場合

Prismaを使わずにデータベースを変更したときは、次を実行します。

```bash
prisma db pull
prisma generate
```

## 生成されるスキーマの例

データベースのテーブルが、Prismaのモデルになります。

```sql
-- データベースのテーブル
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100)
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author_id INTEGER REFERENCES users(id)
);
```

これが次のようになります。

```prisma
model users {
  id    Int     @id @default(autoincrement())
  email String  @unique @db.VarChar(255)
  name  String? @db.VarChar(100)
  posts posts[]
}

model posts {
  id        Int    @id @default(autoincrement())
  title     String @db.VarChar(255)
  author_id Int?
  users     users? @relation(fields: [author_id], references: [id])
}
```

## 読み取ったあとの手直し

`db pull` のあとは、次の手直しを検討してください。

1. **モデル名をパスカルケースにする**
   ```prisma
   model User {  // 元は users
     @@map("users")
   }
   ```

2. **フィールド名をキャメルケースにする**
   ```prisma
   authorId Int? @map("author_id")
   ```

3. **分かりやすいようにリレーション名を付ける**
   ```prisma
   author User? @relation("PostAuthor", fields: [authorId], references: [id])
   ```

4. **説明コメントを付ける**
   ```prisma
   /// ユーザーアカウントの情報
   model User {
     /// 認証に使うメインのメールアドレス
     email String @unique
   }
   ```

## MongoDBの場合

MongoDBでは、`db pull` はドキュメントを抜き出して調べ、スキーマを推測します。

```bash
prisma db pull
```

MongoDBにはスキーマがないので、手で直す必要が出ることがあります。

## 注意

`db pull` はスキーマファイルを上書きします。必ず次を守ってください。
- 取り込む前に、今のスキーマをコミットしておく
- まず `--print` で中身を確認する
- 残したい手直しはバックアップしておく