# api-basics

Prisma Management API の基本の決まりごと。3つの `prisma-postgres-*` スキルは、どれもこのパターンを共有しています。

## ベース URL

```
https://api.prisma.io/v1
```

API のドキュメント：https://api.prisma.io/v1/doc

## 返ってくる内容の包み（envelope）

### 1つのリソース

```json
{
  "data": {
    "id": "proj_clx7abc123def456",
    "type": "project",
    "name": "My Project",
    "createdAt": "2025-06-15T10:30:00.000Z"
  }
}
```

### 一覧

```json
{
  "data": [
    { "id": "proj_aaa", "type": "project", "name": "Alpha" },
    { "id": "proj_bbb", "type": "project", "name": "Beta" }
  ],
  "pagination": {
    "hasMore": true,
    "nextCursor": "clx7cursor123"
  }
}
```

## リソースの ID の接頭辞

すべてのリソースの ID には、種類を表す接頭辞が付いています。

| 接頭辞 | リソース |
|---|---|
| `proj_` | Project |
| `db_` | Database |
| `con_` | Connection |
| `wksp_` | Workspace |

API のリクエストで ID を送るときは、必ず接頭辞を含めてください。

## ページ分け

一覧のエンドポイントは、カーソルを使ったページ分けを使います。

```
GET /v1/projects?limit=10
GET /v1/projects?cursor=clx7abc123&limit=10
```

| パラメーター | 型 | デフォルト | 説明 |
|---|---|---|---|
| `cursor` | string | — | `nextCursor` から得た、中身を気にしなくてよいカーソル |
| `limit` | number | 100 | 1ページあたりの最大の件数 |

`pagination.hasMore` が `true` の間は、`pagination.nextCursor` を `cursor` のパラメーターにして、取得を続けます。

## エラーのとき返ってくる内容

すべてのエラーは、次の形になります。

```json
{
  "error": {
    "code": "resource-not-found",
    "message": "database with id db_abc not found"
  }
}
```

### HTTP のステータスごとのエラーコード

| HTTP のステータス | エラーコード | 意味 |
|---|---|---|
| 400 | `client-error` | リクエストの形が正しくない |
| 401 | `authentication-failed` | トークンがない、または正しくない |
| 403 | `permission-denied` | トークンに必要な権限がない |
| 404 | `resource-not-found` | リソースが存在しない、またはアクセスできない |
| 422 | `validation-error` | リクエストの本文が検証に通らなかった |
| 429 | `rate-limit-exceeded` | リクエストが多すぎる |
| 500 | `internal-server-error` | サーバーのエラー。少し待ってからもう一度試す |

### 自分で直すときのパターン

- **401**：トークンが正しくないか、期限切れ。Console → Workspace Settings → Service Tokens で、新しいサービストークンを作る。
- **404**：リソースの ID に正しい接頭辞（`proj_`、`db_`、`con_`）が付いているかを確認する。使えるリソースの一覧は、`GET /v1/projects` か `GET /v1/databases` で取得する。
- **422**：リクエストの本文を、エンドポイントのスキーマと照らし合わせる。よくある問題：必須の項目がない、リージョンの ID が正しくない、`name` が空。
- **429**：2〜5秒待ってから、もう一度試す。繰り返し起きるなら、待つ間隔を長くする。
