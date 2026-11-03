# モデルのクエリ

Prisma のモデルに対する CRUD 操作です。

## 読み取りの操作

### findUnique

一意のフィールドで1件探します。

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 }
})

const user = await prisma.user.findUnique({
  where: { email: 'alice@prisma.io' }
})
```

#### 複合の一意キーで探す

```typescript
// @@unique([firstName, lastName]) のあるモデル
const user = await prisma.user.findUnique({
  where: {
    firstName_lastName: {
      firstName: 'Alice',
      lastName: 'Smith'
    }
  }
})
```

### findUniqueOrThrow

findUnique と同じですが、見つからなければエラーを投げます。

```typescript
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 1 }
})
// 見つからなければ PrismaClientKnownRequestError を投げる
```

### findFirst

条件に合う最初の1件を探します。

```typescript
const user = await prisma.user.findFirst({
  where: { role: 'ADMIN' },
  orderBy: { createdAt: 'desc' }
})
```

### findFirstOrThrow

```typescript
const user = await prisma.user.findFirstOrThrow({
  where: { role: 'ADMIN' }
})
```

### findMany

複数件を探します。

```typescript
const users = await prisma.user.findMany({
  where: { role: 'USER' },
  orderBy: { name: 'asc' },
  take: 10,
  skip: 0
})
```

## 作成の操作

### create

1件を作成します。

```typescript
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    name: 'Alice'
  }
})
```

#### リレーションと一緒に作成する

```typescript
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    posts: {
      create: [
        { title: 'First Post' },
        { title: 'Second Post' }
      ]
    }
  },
  include: { posts: true }
})
```

### createMany

複数件を作成します。

```typescript
const result = await prisma.user.createMany({
  data: [
    { email: 'alice@prisma.io', name: 'Alice' },
    { email: 'bob@prisma.io', name: 'Bob' }
  ],
  skipDuplicates: true  // 一意のフィールドが重複するレコードはとばす
})
// { count: 2 } を返す
```

### createManyAndReturn

複数作成して、作成したものを返します。

```typescript
const users = await prisma.user.createManyAndReturn({
  data: [
    { email: 'alice@prisma.io', name: 'Alice' },
    { email: 'bob@prisma.io', name: 'Bob' }
  ]
})
// 作成したユーザーの配列を返す
```

## 更新の操作

### update

1件を更新します。

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Smith' }
})
```

#### アトミックな操作

```typescript
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    views: { increment: 1 },
    likes: { decrement: 1 },
    score: { multiply: 2 },
    rating: { divide: 2 },
    version: { set: 5 }
  }
})
```

### updateMany

複数件を更新します。

```typescript
const result = await prisma.user.updateMany({
  where: { role: 'USER' },
  data: { verified: true }
})
// { count: 42 } を返す
```

### updateManyAndReturn

```typescript
const users = await prisma.user.updateManyAndReturn({
  where: { role: 'USER' },
  data: { verified: true }
})
// 更新したユーザーの配列を返す
```

### upsert

更新、なければ作成します。

```typescript
const user = await prisma.user.upsert({
  where: { email: 'alice@prisma.io' },
  update: { name: 'Alice Smith' },
  create: { email: 'alice@prisma.io', name: 'Alice' }
})
```

## 削除の操作

### delete

1件を削除します。

```typescript
const user = await prisma.user.delete({
  where: { id: 1 }
})
// 削除したレコードを返す
```

### deleteMany

複数件を削除します。

```typescript
const result = await prisma.user.deleteMany({
  where: { role: 'GUEST' }
})
// { count: 5 } を返す

// すべて削除する
const result = await prisma.user.deleteMany({})
```

## 集計の操作

### count

```typescript
const count = await prisma.user.count({
  where: { role: 'ADMIN' }
})
```

### aggregate

```typescript
const result = await prisma.post.aggregate({
  _avg: { views: true },
  _sum: { views: true },
  _min: { views: true },
  _max: { views: true },
  _count: { _all: true }
})
```

### groupBy

```typescript
const groups = await prisma.user.groupBy({
  by: ['country'],
  _count: { _all: true },
  _avg: { age: true },
  having: {
    age: { _avg: { gt: 30 } }
  }
})
```

## 戻り値の型

| メソッド | 戻り値 |
|--------|---------|
| `findUnique` | Record \| null |
| `findUniqueOrThrow` | Record（見つからなければエラーを投げる） |
| `findFirst` | Record \| null |
| `findFirstOrThrow` | Record（見つからなければエラーを投げる） |
| `findMany` | Record[] |
| `create` | Record |
| `createMany` | { count: number } |
| `createManyAndReturn` | Record[] |
| `update` | Record |
| `updateMany` | { count: number } |
| `delete` | Record |
| `deleteMany` | { count: number } |
| `count` | number |
| `aggregate` | 集計の結果 |
| `groupBy` | グループの結果の配列 |
