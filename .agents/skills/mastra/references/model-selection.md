# モデル選択リファレンス

Mastra のモデル指定の文字列を選んだり、正しいか確認したりするときに使うリファレンスです。

## モデルの書き方

Mastra のモデルルーターでモデルを指定するときは、必ず `"provider/model-name"` の形式を使ってください。

## プロバイダーのキーとモデル名を確認する

使えるプロバイダーとモデルは、プロバイダー一覧のスクリプトで調べます。

```bash
# 使えるプロバイダーをすべて表示する
node scripts/provider-registry.mjs --list

# 特定のプロバイダーのモデルを、新しい順にすべて表示する
node scripts/provider-registry.mjs --provider openai
node scripts/provider-registry.mjs --provider anthropic
```

ユーザーがモデルやプロバイダーを使いたいと言ったら、まずこのスクリプトを実行して、プロバイダーのキーとモデル名が正しいか確認してください。モデル名は頻繁に変わるので、記憶から推測しないでください。

新しいプロジェクトのひな形で使う例が必要な場合は、[`create-mastra.md`](create-mastra.md) を見てから、選んだモデルをプロバイダー一覧のスクリプトで確認してください。