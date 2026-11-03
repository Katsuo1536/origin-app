# リレーションのクエリ

関連するレコードを取得したり変更したりします。

## リレーションを含める

関連するレコードを読み込みます。

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
      take: 5,
      select: { id: true, title: true }
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
          include: { author: true }
        }
      }
    }
  }
})
```

## リレーションを選ぶ

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    name: true,
    posts: {
      select: { title: true }
    }
  }
})
```

## 入れ子の書き込み

### リレーションと一緒に作成する

```typescript
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

### 作成するか、既存のものにつなげる

```typescript
const post = await prisma.post.create({
  data: {
    title: 'New Post',
    author: {
      connectOrCreate: {
        where: { email: 'alice@prisma.io' },
        create: { email: 'alice@prisma.io', name: 'Alice' }
      }
    }
  }
})
```

### 既存のものにつなげる

```typescript
const post = await prisma.post.create({
  data: {
    title: 'New Post',
    author: {
      connect: { id: 1 }
    }
  }
})

// 外部キーで書く省略形
const post = await prisma.post.create({
  data: {
    title: 'New Post',
    authorId: 1
  }
})
```

## リレーションを更新する

### 関連するレコードを更新する

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      update: {
        where: { id: 1 },
        data: { title: 'Updated Title' }
      }
    }
  }
})
```

### 関連するレコードをまとめて更新する

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      updateMany: {
        where: { published: false },
        data: { published: true }
      }
    }
  }
})
```

### 関連するレコードを upsert する

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: {
      upsert: {
        create: { bio: 'New bio' },
        update: { bio: 'Updated bio' }
      }
    }
  }
})
```

### つながりを外す

```typescript
// 省略できる1対1
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: { disconnect: true }
  }
})

// 多対多
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: {
      disconnect: [{ id: 1 }, { id: 2 }]
    }
  }
})
```

### 関連するレコードを削除する

```typescript
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      delete: { id: 1 }
    }
  }
})

// まとめて削除する
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      deleteMany: { published: false }
    }
  }
})
```

### set（すべて置き換える）

```typescript
// 関連するレコードをすべて置き換える
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: {
      set: [{ id: 1 }, { id: 2 }]
    }
  }
})
```

## リレーションの絞り込み

### some

1件以上が条件に合う：

```typescript
const users = await prisma.user.findMany({
  where: {
    posts: { some: { published: true } }
  }
})
```

### every

すべてが条件に合う：

```typescript
const users = await prisma.user.findMany({
  where: {
    posts: { every: { published: true } }
  }
})
```

### none

1件も条件に合わない：

```typescript
const users = await prisma.user.findMany({
  where: {
    posts: { none: { published: true } }
  }
})
```

### is / isNot（1対1）

```typescript
const users = await prisma.user.findMany({
  where: {
    profile: { is: { country: 'USA' } }
  }
})
```

## リレーションの件数を数える

```typescript
const users = await prisma.user.findMany({
  select: {
    name: true,
    _count: {
      select: { posts: true, followers: true }
    }
  }
})
// { name: 'Alice', _count: { posts: 5, followers: 100 } }
```

### 数えるリレーションを絞り込む

```typescript
const users = await prisma.user.findMany({
  select: {
    name: true,
    _count: {
      select: {
        posts: { where: { published: true } }
      }
    }
  }
})
```
