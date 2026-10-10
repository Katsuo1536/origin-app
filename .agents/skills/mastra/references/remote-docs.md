# リモートドキュメント リファレンス

ローカルにパッケージがない場合や、考え方の説明が必要な場合に、https://mastra.ai から最新のドキュメントを調べる方法です。

**次のような場合に使います。**

- Mastra のパッケージがローカルにインストールされていない
- 考え方の説明やガイドが必要
- 最新のドキュメントを見たい（インストール済みのバージョンより新しいことがある）

## ドキュメントサイトの構成

Mastra のドキュメントは **https://mastra.ai** にまとまっています。

- **Docs**：考え方、機能、実装の詳細を扱う中心的なドキュメント
- **Models**：複数のプロバイダーの LLM を、共通のインターフェースで扱うための情報
- **Guides**：特定のアプリケーションを作るための、手順を追ったチュートリアル
- **Reference**：API リファレンス

## 必要なドキュメントを探す

### 方法1：llms.txt を使う（おすすめ）

メインの llms.txt では、ドキュメント全体の概要が、エージェントに読みやすい形でまとまっています：https://mastra.ai/llms.txt

ここから、次の内容を含む構造化された Markdown が返ってきます。

- ドキュメントの構成と階層
- 用意されているすべてのトピックとセクション
- 関連するドキュメントへの直接リンク
- エージェント向けに最適化された内容の構成

どんなドキュメントがあり、どこに何が書かれているかを知るために、**まずこれを使ってください**。

### 方法2：URL のパターンから直接たどる

ドキュメントの URL は、決まったパターンになっています。

- 概要ページ：`https://mastra.ai/docs/{topic}/overview`
- API リファレンス：`https://mastra.ai/reference/{topic}/`
- ガイド：`https://mastra.ai/guides/{topic}/`

**例：**

- `https://mastra.ai/docs/agents/overview`
- `https://mastra.ai/docs/workflows/overview`
- `https://mastra.ai/reference/workflows/workflow-methods/`

## エージェントに読みやすいドキュメント

**重要な機能**：リクエストヘッダーに `text-markdown` を付けるか、ドキュメントの URL の末尾に `.md` を付けると、余計なものがない、エージェントに読みやすい Markdown が返ってきます。

### 通常の URL：

```
https://mastra.ai/reference/workflows/workflow-methods/then
```

### エージェントに読みやすい URL（Markdown）：

```
https://mastra.ai/reference/workflows/workflow-methods/then.md
```

`.md` 版の特徴：

- ナビゲーション、ヘッダー、フッターが取り除かれている
- 純粋な Markdown の内容だけが返る
- LLM が読むのに最適化されている
- コード例と説明はすべて含まれている

## 調べるときの流れ

### 1. メインのドキュメント索引を確認する

何があるかを知るために、**ここから始めます**。

```
https://mastra.ai/llms.txt
```

ここで分かること：

- ドキュメント全体の構成
- 用意されているトピックとセクション
- 関連するドキュメントページへのリンク

### 2. 必要なドキュメントを見つける

**方法A：llms.txt の情報を使う**
メインの llms.txt が、正しいセクションへ案内してくれます。

**方法B：URL を直接組み立てる**

```
https://mastra.ai/docs/{topic}/overview
https://mastra.ai/reference/{topic}/
```

### 3. エージェントに読みやすい版を取得する

ドキュメントの URL の末尾に `.md` を付けます。

```
https://mastra.ai/reference/workflows/workflow-methods/then.md
```

### 4. 必要な情報を取り出す

Markdown には、次の内容が含まれています。

- 関数のシグネチャ（引数と戻り値の形）
- 引数の説明
- 戻り値の型
- 使い方の例
- おすすめの使い方

## よく使うドキュメントのパス

### Agents（エージェント）

- 概要：`https://mastra.ai/docs/agents/overview`
- エージェントの作成：`https://mastra.ai/docs/agents/overview`
- エージェントのツール：`https://mastra.ai/docs/agents/tools`
- メモリ：`https://mastra.ai/docs/memory/overview`

### Workflows（ワークフロー）

- 概要：`https://mastra.ai/docs/workflows/overview`
- ワークフローの作成：`https://mastra.ai/docs/workflows/overview`
- ワークフローのメソッド：`https://mastra.ai/reference/workflows/workflow-methods/`

### Tools（ツール）

- 概要：`https://mastra.ai/docs/tools/overview`
- ツールの作成：`https://mastra.ai/docs/agents/tools`

### Memory（メモリ）

- 概要：`https://mastra.ai/docs/memory/overview`
- 設定：`https://mastra.ai/docs/memory/overview`

### RAG

- 概要：`https://mastra.ai/docs/rag/overview`
- ベクトルストア：`https://mastra.ai/reference/rag/vector-databases`

## 例：ワークフローの .then() メソッドを調べる

### 1. メインのドキュメント索引を確認する

```
WebFetch({
  url: "https://mastra.ai/llms.txt",
  prompt: "Where can I find documentation about workflow methods like .then()?"
})
```

これで、ワークフローのリファレンスのセクションが案内されます。

### 2. 特定のメソッドのドキュメントを取得する

```
https://mastra.ai/reference/workflows/workflow-methods/then.md
```

### 3. WebFetch ツールを使う

```
WebFetch({
  url: "https://mastra.ai/reference/workflows/workflow-methods/then.md",
  prompt: "What are the parameters for the .then() method and how do I use it?"
})
```

## リモートと同梱ドキュメントの使い分け

| 状況 | 使うもの |
| --- | --- |
| パッケージがローカルにインストール済み | **同梱のドキュメント**（バージョンが必ず一致する） |
| パッケージが未インストール | **リモートのドキュメント** |
| 考え方のガイドが必要 | **リモートのドキュメント** |
| 正確な API のシグネチャが必要 | **同梱のドキュメント**（ある場合） |
| 新機能を調べる | **リモートのドキュメント**（インストール済みのバージョンより新しいことがある） |
| 動くサンプルが必要 | **両方**（型は同梱、ガイドはリモート） |

## おすすめの使い方

1. ドキュメントを取得するときは、**必ず .md を使う**
2. URL の構成が分からないときは、**sitemap.xml を確認する**
3. パッケージがインストール済みなら、**同梱のドキュメントを優先する**（バージョンが正確）
4. 考え方の理解やガイドには、**リモートのドキュメントを使う**
5. 全体を理解するには、**両方を組み合わせる**