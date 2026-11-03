# クエリのオプション

クエリの動きを決めるオプションです。

## select

返すフィールドを選びます。

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    name: true,
    email: true,
    // password: false（書かなければ含まれない）
  }
})
// 戻り値：{ id: 1, name: 'Alice', email: 'alice@prisma.io' }
```

### リレーションを選ぶ

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    name: true,
    posts: {
      select: {
        title: true,
        published: true
      }
    }
  }
})
```

### select の中で include を使う

```typescript
const user = await prisma.user.findMany({
  select: {
    name: true,
    posts: {
      include: {
        comments: true
      }
    }
  }
})
```

### リレーションの件数を選ぶ

```typescript
const users = await prisma.user.findMany({
  select: {
    name: true,
    _count: {
      select: { posts: true }
    }
  }
})
// 戻り値：{ name: 'Alice', _count: { posts: 5 } }
```

## include

関連するレコードを含めます。

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,
    profile: true
  }
})
```

### 絞り込んだ include

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }
  }
})
```

### 入れ子の include

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      include: {
        comments: {
          include: {
            author: true
          }
        }
      }
    }
  }
})
```

### リレーションの件数を含める

```typescript
const users = await prisma.user.findMany({
  include: {
    _count: {
      select: { posts: true, followers: true }
    }
  }
})
```

## omit

特定のフィールドを除外します。

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  omit: {
    password: true
  }
})
// password 以外のすべてのフィールドを返す
```

### リレーションの中で omit を使う

```typescript
const users = await prisma.user.findMany({
  omit: { password: true },
  include: {
    posts: {
      omit: { content: true }
    }
  }
})
```

**注意：** `select` と `omit` は一緒に使えません。

## where

レコードを絞り込みます。

```typescript
const users = await prisma.user.findMany({
  where: {
    email: { contains: '@prisma.io' },
    role: 'ADMIN'
  }
})
```

絞り込みの演算子の詳細は `filters.md` を見てください。

## orderBy

結果を並べ替えます。

```typescript
// 1つのフィールド
const users = await prisma.user.findMany({
  orderBy: { name: 'asc' }
})

// 複数のフィールド
const users = await prisma.user.findMany({
  orderBy: [
    { role: 'desc' },
    { name: 'asc' }
  ]
})
```

### リレーションで並べ替える

```typescript
const users = await prisma.user.findMany({
  orderBy: {
    posts: { _count: 'desc' }
  }
})
```

### null の扱い

```typescript
const users = await prisma.user.findMany({
  orderBy: {
    name: { sort: 'asc', nulls: 'last' }
  }
})
```

## take と skip

ページ分け：

```typescript
// 1ページ目
const users = await prisma.user.findMany({
  take: 10,
  skip: 0
})

// 2ページ目
const users = await prisma.user.findMany({
  take: 10,
  skip: 10
})
```

### マイナスの take（逆向き）

```typescript
const lastUsers = await prisma.user.findMany({
  take: -10,
  orderBy: { id: 'asc' }
})
// 最後の10人を返す
```

## cursor

カーソルを使ったページ分け：

```typescript
// 1ページ目
const firstPage = await prisma.user.findMany({
  take: 10,
  orderBy: { id: 'asc' }
})

// カーソルを使って次のページ
const nextPage = await prisma.user.findMany({
  take: 10,
  skip: 1,  // カーソルのレコード自体はとばす
  cursor: { id: firstPage[firstPage.length - 1].id },
  orderBy: { id: 'asc' }
})
```

## distinct

重複しない値を返します。

```typescript
const cities = await prisma.user.findMany({
  distinct: ['city'],
  select: { city: true }
})
```

### 複数のフィールドで distinct

```typescript
const locations = await prisma.user.findMany({
  distinct: ['city', 'country']
})
```
