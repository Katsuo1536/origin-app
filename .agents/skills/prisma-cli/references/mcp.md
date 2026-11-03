# prisma mcp

AI開発ツール向けに、PrismaのMCPサーバーを起動します。

## コマンド

```bash
prisma mcp
```

## できること

- Prismaのプロジェクト用に、MCP（Model Context Protocol）サーバーを起動する
- 対応しているAIツールに、Prismaのスキーマとデータベースの情報を渡す
- AIアシスタントがモデルを理解したり、クエリを作ったり、マイグレーションを提案したりするのを助ける

## 使い方

```bash
prisma mcp
```

## 主な使いどころ

- PrismaをChatGPTやClaudeなど、MCPに対応したツールにつなぐ
- AIアシスタントが、Prismaスキーマの構造を見られるようにする
- エージェントがプロジェクトの状況をふまえて、クエリ、スキーマの変更、マイグレーションの手順を提案できるようにする

## 注意点

- Prismaスキーマと `prisma.config.ts` があるプロジェクトの中で実行する
- このコマンドはPrisma Studioとは別物で、ブラウザの画面は開かない
- MCPサーバーで使えるのは `migrate-status`、`migrate-dev`、Prisma Studio関連のツール。データを消す `migrate-reset` ツールはないので、使えると言ったり、この安全上の制限をすり抜けようとしたりしてはいけない
- データを消すシェルのコマンドを使うときは、`agent-safety.md` に従い、ユーザーの明確な同意を得る

## 参考

- [Prisma CLI の `mcp` コマンド](https://docs.prisma.io/docs/cli/mcp)
- [Prisma MCP サーバー](https://www.prisma.io/docs/ai/tools/chatgpt)