# prisma debug

デバッグやバグ報告に役立つ情報を表示します。

## コマンド

```bash
prisma debug [options]
```

## できること

Prismaの環境について、次のような情報を表示します。
- Prisma CLI のバージョン
- Prisma Client のバージョン（インストールしている場合）
- エンジンのバイナリ（Query Engine、Migration Engine など）
- 環境の情報（OS、CPUアーキテクチャ）
- Node.js のバージョン
- 設定しているデータソースのプロバイダー

## オプション

| オプション | 説明 |
|--------|-------------|
| `--schema` | スキーマファイルのパス |
| `--config` | Prismaの設定ファイルの場所を指定する |

## 出力の例

```
prisma               : 7.3.0
@prisma/client       : 7.3.0
Operating System     : darwin
Architecture         : arm64
Node.js              : v20.10.0
TypeScript           : 5.3.3
Query Compiler       : enabled
PSL                  : ...
Schema Engine        : ...
```

## 使う場面

- **トラブルの原因を調べる**：バージョンがずれていないか確認する
- **不具合を報告する**：GitHubのIssueに環境の情報を載せる
- **インストールを確認する**：正しいバイナリがダウンロードされているか確かめる