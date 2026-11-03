# auth

サービストークンを使って、Prisma Management API で認証する方法。

## サービストークン

サービストークンは、サーバー同士のリクエストを認証します。範囲はワークスペースで、その中のすべてのリソースへのアクセスを許可します。

### サービストークンを作る

1. https://console.prisma.io を開く
2. **Workspace Settings** → **Service Tokens** に移動する
3. **Create Token** をクリックする
4. トークンをすぐにコピーする（一度しか表示されない）

### サービストークンを使う

トークンを環境変数に設定します。

```bash
export PRISMA_SERVICE_TOKEN="eyJ..."
```

すべての API のリクエストの `Authorization` ヘッダーに入れます。

```bash
curl -H "Authorization: Bearer $PRISMA_SERVICE_TOKEN" \
  https://api.prisma.io/v1/projects
```

### トークンの範囲

サービストークンの範囲はワークスペースです。1つのトークンで、ワークスペースの中のすべてのプロジェクト、データベース、接続にアクセスできます。今のところ、プロジェクト単位のトークンはありません。

### 安全のための習慣

- トークンは環境変数かシークレットの管理ツールに保存し、ソースコードには絶対に書かない
- うっかりコミットしないように、`.gitignore` に `.env` を追加する
- Console → Workspace Settings → Service Tokens で、定期的にトークンを入れ替える
- CI/CD では、トークンを暗号化されたシークレット（例：GitHub Secrets）として保存する

## OAuth 2.0（ユーザー単位のアクセス）

OAuth は、ユーザーの代わりに操作するときに使います。ふつうはパートナーや連携サービスの流れで使います。OAuth の詳細は、`prisma-postgres-integrator` スキルを見てください。

ふつうのデータベースの準備では、サービストークンがおすすめの認証の方法です。
