# endpoints

データベースの準備の流れで使う、Management API のエンドポイントの詳細。

## リージョンを一覧にする

```
GET /v1/regions/postgres
```

リクエストの本文はありません。使える Prisma Postgres のリージョンを返します。

**返ってくる内容：**

```json
{
  "data": [
    {
      "id": "us-east-1",
      "type": "region",
      "name": "US East (N. Virginia)",
      "status": "available"
    },
    {
      "id": "eu-west-1",
      "type": "region",
      "name": "EU West (Ireland)",
      "status": "available"
    }
  ]
}
```

`status` が `available` のリージョンだけを使ってください。

## プロジェクトを作る（データベース付き）

```
POST /v1/projects
```

**リクエストの本文：**

```json
{
  "name": "my-project",
  "region": "us-east-1",
  "createDatabase": true
}
```

| 項目 | 型 | 必須 | デフォルト | 説明 |
|---|---|---|---|---|
| `name` | string | いいえ | 自動で生成 | プロジェクトの表示名 |
| `region` | string | いいえ | `us-east-1` | データベースのリージョン |
| `createDatabase` | boolean | いいえ | `true` | プロジェクトと一緒にデフォルトのデータベースを作る |

**返ってくる内容**（`createDatabase: true` の場合）：

```json
{
  "data": {
    "id": "proj_clx7abc123",
    "type": "project",
    "url": "https://api.prisma.io/v1/projects/proj_clx7abc123",
    "name": "my-project",
    "createdAt": "2025-06-15T10:30:00.000Z",
    "defaultRegion": "us-east-1",
    "workspace": {
      "id": "wksp_xyz789",
      "url": "https://api.prisma.io/v1/workspaces/wksp_xyz789",
      "name": "My Workspace"
    },
    "database": {
      "id": "db_def456",
      "type": "database",
      "url": "https://api.prisma.io/v1/databases/db_def456",
      "name": "my-project",
      "status": "ready",
      "createdAt": "2025-06-15T10:30:00.000Z",
      "isDefault": true,
      "defaultConnectionId": "con_ghi789",
      "connections": [
        {
          "id": "con_ghi789",
          "type": "connection",
          "url": "https://api.prisma.io/v1/connections/con_ghi789",
          "name": "Default",
          "createdAt": "2025-06-15T10:30:00.000Z",
          "kind": "postgres",
          "endpoints": {
            "direct": {
              "host": "db.prisma.io",
              "port": 5432,
              "connectionString": "postgres://user:pass@db.prisma.io:5432/postgres?sslmode=require"
            }
          }
        }
      ],
      "region": {
        "id": "us-east-1",
        "name": "US East (N. Virginia)"
      }
    }
  }
}
```

取り出す大事な項目：

- `data.database.connections[0].endpoints.direct.connectionString` → `DATABASE_URL` として使う

返ってくる内容には `pooled` と `accelerate` のエンドポイントも入っていますが、新しいプロジェクトでは無視してください。必要なのは、直接つなぐ接続文字列だけです。

`data.database.status` が `provisioning` なら、`status` が `ready` になるまで `GET /v1/databases/{id}` を繰り返し確認します。

## データベースを取得する

```
GET /v1/databases/{databaseId}
```

作成後にデータベースの状態を確認するときや、データベースの詳細を取得するときに使います。

**返ってくる内容：**

```json
{
  "data": {
    "id": "db_def456",
    "type": "database",
    "url": "https://api.prisma.io/v1/databases/db_def456",
    "name": "my-project",
    "status": "ready",
    "createdAt": "2025-06-15T10:30:00.000Z",
    "isDefault": true,
    "defaultConnectionId": "con_ghi789",
    "connections": [],
    "project": {
      "id": "proj_clx7abc123",
      "url": "https://api.prisma.io/v1/projects/proj_clx7abc123",
      "name": "my-project"
    },
    "region": {
      "id": "us-east-1",
      "name": "US East (N. Virginia)"
    }
  }
}
```

## 接続を作る

```
POST /v1/databases/{databaseId}/connections
```

データベースに、名前付きの新しい接続文字列を作ります。開発者ごとや環境ごとの接続に使います。

**リクエストの本文：**

```json
{
  "name": "dev"
}
```

| 項目 | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | はい | 接続の表示名 |

**返ってくる内容：**

```json
{
  "data": {
    "id": "con_newcon123",
    "type": "connection",
    "url": "https://api.prisma.io/v1/connections/con_newcon123",
    "name": "dev",
    "createdAt": "2025-06-15T10:31:00.000Z",
    "kind": "postgres",
    "endpoints": {
      "direct": {
        "host": "db.prisma.io",
        "port": 5432,
        "connectionString": "postgres://user:pass@db.prisma.io:5432/postgres?sslmode=require"
      }
    },
    "database": {
      "id": "db_def456",
      "url": "https://api.prisma.io/v1/databases/db_def456",
      "name": "my-project"
    }
  }
}
```

取り出す項目：`data.endpoints.direct.connectionString` → `DATABASE_URL` として使う。

## データベースを削除する

```
DELETE /v1/databases/{databaseId}
```

データベースと、そのすべての接続を完全に削除します。成功すると `204 No Content` を返します。

## プロジェクトを一覧にする

```
GET /v1/projects
```

ワークスペースのすべてのプロジェクトを返します。カーソルを使ったページ分け（`?cursor=...&limit=...`）に対応しています。

## プロジェクトを削除する

```
DELETE /v1/projects/{projectId}
```

プロジェクトと、そのすべてのデータベースを完全に削除します。成功すると `204 No Content` を返します。
