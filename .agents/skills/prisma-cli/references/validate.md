# prisma validate

Prisma のスキーマファイルを検証します。

## コマンド

```bash
prisma validate [options]
```

## できること

- `schema.prisma` ファイルを読み取る
- 構文のエラーを確認する
- モデルの定義、リレーション、型を検証する
- コードは生成せずに、エラーや警告を報告する

## オプション

| オプション | 説明 |
|--------|-------------|
| `--schema` | スキーマファイルの場所 |
| `--config` | Prisma の設定ファイルの場所を指定する |

## 使用例

### デフォルトのスキーマを検証する

```bash
prisma validate
```

### スキーマを指定して検証する

```bash
prisma validate --schema=./custom/schema.prisma
```

### CI で使う

CI のパイプラインで `validate` を実行すると、スキーマのエラーを早めに見つけられます。

```yaml
- name: Validate Schema
  run: npx prisma validate
```

## よくあるエラー

- `@relation` のフィールドがない
- 型が正しくない
- モデル名が重複している
- 構文のエラー（かっこの閉じ忘れなど）
