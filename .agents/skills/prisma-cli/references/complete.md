# prisma complete

シェルの補完スクリプトを出力します。

```bash
prisma complete zsh
prisma complete bash
prisma complete fish
prisma complete powershell
```

CLIをグローバルに直接インストールしている場合は、そのシェルのいつもの起動時の仕組みで出力を読み込みます。たとえば zsh なら次のとおりです。

```bash
source <(prisma complete zsh)
```

Prismaは、対応しているパッケージマネージャーの補完の仕組みとも連携します。`npx` と `bunx` は、それ自体では補完に対応していません。インストール済みのバイナリを直接実行するか、`npm exec` や `bun x` など、パッケージマネージャーが対応している実行方法を使ってください。

## 参考

- [Prisma ORM 7.9.0 リリース](https://github.com/prisma/prisma/releases/tag/7.9.0)