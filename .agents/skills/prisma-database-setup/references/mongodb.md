# MongoDB の準備

MongoDB のプロジェクトは、最新の Prisma 6.x のリリースのままにしてください。MongoDB のアプリを、Prisma 7 の SQL の Client の流れに上げないでください。

## 前提条件

- MongoDB 4.2 以上
- レプリカセットの設定（トランザクションに必要）
- 最新の Prisma 6.x のリリース、またはチームで固定している Prisma 6 のバージョン
- Node.js 20.19.0 以上
- TypeScript 5.4.0 以上

## 1. スキーマの設定

`prisma-client-js` を使う、標準の Prisma 6 の MongoDB の構成を使います。

`prisma/schema.prisma` に書きます。

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### ドライバーアダプター

ここでは、Prisma 7 の SQL のアダプターの構成を当てはめ**ない**でください。MongoDB は、SQL 用の `@prisma/adapter-*` パッケージを使いません。

### ID の項目の条件

MongoDB のモデルには、`@id` と `@map("_id")` を使って `_id` に対応付けた項目が**必要**です。ふつうは、`auto()` と `db.ObjectId` を使った `String` 型にします。

```prisma
model User {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  email String @unique
  name  String?
}
```

### リレーション

MongoDB のリレーションでは、ID が `db.ObjectId` 型であることが前提です。

```prisma
model Post {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  author   User   @relation(fields: [authorId], references: [id])
  authorId String @db.ObjectId
}
```

## 2. 環境変数

`.env` に書きます。

```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/mydb?retryWrites=true&w=majority"
```

## マイグレーションと取り込み（イントロスペクション）

- **マイグレーションはない**：MongoDB にはスキーマがありません。`prisma migrate` のコマンドは**動きません**。
- **db push**：インデックスと制約を同期するには、`prisma db push` を使います。
- **db pull**：既存のデータから（サンプリングして）スキーマを生成するには、`prisma db pull` を使います。

## 現時点での確認結果

- `prisma init --datasource-provider mongodb` は、今も Prisma の CLI のソースに実装されている。
- Prisma の本家のリポジトリには、今も MongoDB のテスト用データ（fixtures）とテストがある。
- ローカルで確かめたところ、Prisma 7 は今も MongoDB の入力を認識できるが、生成された Client の流れには、対応している MongoDB のバージョンアップの方法がない。
- ローカルで確かめたところ、Prisma 6.x は、MongoDB のレプリカセットに対して、`prisma-client-js`、`prisma db push`、`new PrismaClient()` で最初から最後まで動く。

## バージョンについての案内

- MongoDB では、使える最新の Prisma 6.x のリリースのままにする。
- Prisma が本当の MongoDB のバージョンアップの方法を出すまでは、Prisma 7 への MongoDB の移行は対応していないものとして扱う。

## よくある問題

### "Transactions not supported"
MongoDB のインスタンスが**レプリカセット**であることを確認してください。単独（standalone）のインスタンスは、トランザクションに対応していません。Atlas のクラスターは、デフォルトでレプリカセットです。

### "Invalid ObjectID"
参照先が ObjectID なら、ID を参照する項目に `@db.ObjectId` が付いていることを確認してください。
