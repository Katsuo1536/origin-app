# ESM と CommonJS への対応

Prisma ORM v7 は ESM が基本ですが、`prisma-client` ジェネレーターは ESM と CommonJS のどちらも出力できます。デフォルトでは ESM を使い、プロジェクトでまだ必要なら `moduleFormat = "cjs"` で CommonJS を選びます。

## ESM のプロジェクト

`package.json` に `"type": "module"` を追加し、ESM に対応した `tsconfig.json` を使います。

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src/**/*", "prisma/**/*"]
}
```

## CommonJS のプロジェクト

アプリのほかの部分がまだ CommonJS なら、その構成のままにして、生成される Prisma Client も CommonJS にします。

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "target": "ES2022",
    "esModuleInterop": true
  }
}
```

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../generated/prisma"
  moduleFormat = "cjs"
}
```

## 関係のある generator の項目

- `moduleFormat`：`esm` か `cjs`
- `runtime`：`nodejs`、`bun`、`deno`、`workerd`、`vercel-edge`、`react-native`
- `generatedFileExtension`：`ts`、`mts`、`cts`
- `importFileExtension`：`ts`、`mts`、`cts`、`js`、`mjs`、`cjs`、または空

例：

```prisma
generator client {
  provider               = "prisma-client"
  output                 = "../generated/prisma"
  runtime                = "nodejs"
  moduleFormat           = "esm"
  generatedFileExtension = "ts"
  importFileExtension    = "ts"
}
```

## import のパス

### サーバーのコード

```typescript
import { PrismaClient } from '../generated/prisma/client'
```

### ブラウザーで使っても安全な型

```typescript
import { Prisma } from '../generated/prisma/browser'
import { Role } from '../generated/prisma/enums'
import type { UserModel } from '../generated/prisma/models/User'
```

## ファイルの拡張子

`moduleResolution: "Node16"` や `"NodeNext"` では、出力されるファイルに合った `.js`・`.mjs`・`.cjs` の拡張子を使います。

`moduleResolution: "bundler"` では、拡張子なしの相対パスの import で、ふつうは問題ありません。

## 最低限のバージョン

| 必要なもの | 最低限のバージョン |
|-------------|-----------------|
| Node.js | 20.19.0 |
| TypeScript | 5.4.0 |

## フレームワークごとの注意

### Next.js

Next.js は、デフォルトの ESM の出力でうまく動きます。クライアントコンポーネントで生成された型が必要なら、`client` からではなく、`browser`、`models`、`enums` から import してください。

### Bun

Bun は `.env` ファイルを自動で読み込むので、ESM と `env()` の組み合わせが一番スムーズなデフォルトです。プロジェクトのほかの部分が必要とするなら、`moduleFormat = "cjs"` も選べます。

## トラブルシューティング

### "ERR_REQUIRE_ESM"

生成された Client は ESM なのに、アプリが CommonJS として require しています。プロジェクトを ESM に切り替えるか、`moduleFormat = "cjs"` を設定して生成し直してください。

### "Cannot use import statement outside a module"

アプリがまだ CommonJS として実行されています。`"type": "module"` を追加するか、代わりに `moduleFormat = "cjs"` を使ってください。

### TypeScript のコンパイルのエラー

`module`、`moduleResolution`、ジェネレーターの `moduleFormat` が、互いに合っていることを確認してください。
