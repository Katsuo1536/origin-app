# トランザクション

複数の操作を、ひとまとまり（アトミック）で実行します。

## 順番に実行するトランザクション

操作の配列を、順番に実行します。

```typescript
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'alice@prisma.io' } }),
  prisma.post.create({ data: { title: 'Hello', authorId: 1 } })
])
```

### 全部成功するか、全部取り消すか

どれか1つでも失敗すると、すべて取り消されます（ロールバック）。

```typescript
try {
  await prisma.$transaction([
    prisma.user.create({ data: { email: 'alice@prisma.io' } }),
    prisma.user.create({ data: { email: 'alice@prisma.io' } }) // 重複！
  ])
} catch (e) {
  // 両方の操作が取り消される
}
```

## 対話形式のトランザクション

複雑な処理や、前の結果に応じて変わる操作向けです。

```typescript
await prisma.$transaction(async (tx) => {
  // 送金する人の残高を減らす
  const sender = await tx.account.update({
    where: { id: senderId },
    data: { balance: { decrement: amount } }
  })
  
  // 残高を確認する
  if (sender.balance < 0) {
    throw new Error('Insufficient funds')
  }
  
  // 受け取る人の残高を増やす
  await tx.account.update({
    where: { id: recipientId },
    data: { balance: { increment: amount } }
  })
})
```

### トランザクションのオプション

```typescript
await prisma.$transaction(
  async (tx) => {
    // 操作
  },
  {
    maxWait: 5000,    // ロックを取れるまで待つ最大時間（ミリ秒）
    timeout: 10000,   // トランザクションの最大の長さ（ミリ秒）
    isolationLevel: 'Serializable'  // 分離レベル
  }
)
```

### 分離レベル

| レベル | 説明 |
|-------|-------------|
| `ReadUncommitted` | いちばん分離が弱い。まだ確定していない変更も読める |
| `ReadCommitted` | 確定した変更だけを読む |
| `RepeatableRead` | トランザクションの中で、読み取りの結果が変わらない |
| `Serializable` | いちばん分離が強い。順番に実行したのと同じ結果になる |

## 入れ子の書き込み

入れ子の操作は、自動でトランザクションになります。

```typescript
// これは自動でトランザクションになる
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    posts: {
      create: [
        { title: 'Post 1' },
        { title: 'Post 2' }
      ]
    },
    profile: {
      create: { bio: 'Hello!' }
    }
  }
})
```

## トランザクション用の Client

`tx` の引数は、そのトランザクションの中だけで使う Prisma Client です。

```typescript
await prisma.$transaction(async (tx) => {
  // prisma ではなく tx を使う
  await tx.user.create({ ... })
  await tx.post.create({ ... })
  
  // メソッドも呼べる
  const count = await tx.user.count()
})
```

## トランザクションの中で OrThrow を使う

対話形式のトランザクションと一緒に使います。

```typescript
await prisma.$transaction(async (tx) => {
  // 見つからなければエラーを投げて、トランザクション全体を取り消す
  const user = await tx.user.findUniqueOrThrow({
    where: { id: 1 }
  })
  
  await tx.post.create({
    data: { title: 'New Post', authorId: user.id }
  })
})
```

## おすすめの使い方

### トランザクションは短くする

```typescript
// 良い例：トランザクションの中はデータベースの操作だけ
const data = prepareData() // トランザクションの外で準備する
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data })
})
```

### エラーを処理する

```typescript
try {
  await prisma.$transaction(async (tx) => {
    // 操作
  })
} catch (e) {
  if (e.code === 'P2002') {
    // 一意制約の違反を処理する
  }
  throw e
}
```

### ちょうどよい分離レベルを使う

```typescript
// ほとんどの場合はデフォルトで十分
await prisma.$transaction(async (tx) => {
  // 操作
})

// 厳密な一貫性が必要なら Serializable を使う
await prisma.$transaction(
  async (tx) => { /* operations */ },
  { isolationLevel: 'Serializable' }
)
```

## 順番に実行する形式と対話形式の比較

| 項目 | 順番に実行 | 対話形式 |
|---------|------------|-------------|
| 書き方 | 配列 | async 関数 |
| 前の結果に応じた操作 | できない | できる |
| 条件による分岐 | できない | できる |
| 性能 | 良い | 柔軟 |
| 使いどころ | 単純なまとめ処理 | 複雑な処理 |
