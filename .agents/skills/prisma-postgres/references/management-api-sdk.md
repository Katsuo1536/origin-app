# management-api-sdk

型付きで API を組み込むには、`@prisma/management-api-sdk` を使います。必要なら OAuth とトークンの更新も使えます。

Platform の API は、Prisma ORM とは別に変わっていきます。正確なパスと、リクエスト・返り値の形は、インストールしたパッケージの生成された `api.d.ts` で確認してください。

## 優先度

高（HIGH）

## なぜ大事か

SDK には型付きのエンドポイントのメソッドがあり、認証や更新の処理の決まりきったコードを書かずに済むので、本番での用意の流れのエラーが減ります。

## インストール

```bash
npm install @prisma/management-api-sdk
```

## シンプルな Client（既存のトークン）

```typescript
import { createManagementApiClient } from '@prisma/management-api-sdk'

const client = createManagementApiClient({ token: process.env.PRISMA_SERVICE_TOKEN! })
const { data: workspaces } = await client.GET('/v1/workspaces')
```

`data` を使う前に、生成された Client の結果を確認してください。型付きの Client は、HTTP の失敗を別に返します。接続やキーを作成したときの返り値は、一度だけの認証情報が入っていることがあるので、全体を絶対にログに出さないでください。

## ワークスペースのサービストークン

型付きの Client には、ワークスペースのサービストークンの一覧・作成・取り消しのためのルートがあります。

- `GET /v1/workspaces/{workspaceId}/service-tokens`
- `POST /v1/workspaces/{workspaceId}/service-tokens`
- `DELETE /v1/workspaces/{workspaceId}/service-tokens/{serviceTokenId}`

作成では、表示用の `name` を受け付けます。返り値の `data.value` がトークンの全体で、一度だけ返されます。返り値をログに出さずに、目的のシークレットの保存場所に直接移してください。そのあとの一覧の呼び出しが返すのは、情報と `valueHint` だけで、トークンの値は返りません。取り消しはデータを壊す操作として扱い、両方の ID を明示して確定させてください。

## 完全な SDK（OAuth と更新）

```typescript
import { createManagementApiSdk, type TokenStorage } from '@prisma/management-api-sdk'

const tokenStorage: TokenStorage = {
  async getTokens() { return null },
  async setTokens(tokens) {},
  async clearTokens() {},
}

const api = createManagementApiSdk({
  clientId: process.env.PRISMA_CLIENT_ID!,
  redirectUri: 'https://your-app.com/auth/callback',
  tokenStorage,
})
```

## SDK での OAuth の流れ

1. `getLoginUrl()` を呼び、`state` と `verifier` を保存する。
2. ユーザーをログインの URL にリダイレクトする。
3. `handleCallback()` でコールバックを処理する。
4. 型付きのエンドポイントの呼び出しには `api.client` を使う。
5. 必要なときに `logout()` を呼ぶ。

## 参考

- [Management API の SDK のドキュメント](https://www.prisma.io/docs/postgres/introduction/management-api-sdk)
