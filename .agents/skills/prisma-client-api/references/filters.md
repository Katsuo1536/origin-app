# 絞り込みの条件と演算子

`where` で使う絞り込みの演算子です。

## 等しい

```typescript
// 完全に一致する（省略形）
where: { email: 'alice@prisma.io' }

// equals を明示する
where: { email: { equals: 'alice@prisma.io' } }

// 等しくない
where: { email: { not: 'alice@prisma.io' } }
```

## 比較

```typescript
// より大きい
where: { age: { gt: 18 } }

// 以上
where: { age: { gte: 18 } }

// より小さい
where: { age: { lt: 65 } }

// 以下
where: { age: { lte: 65 } }

// 組み合わせ
where: { age: { gte: 18, lte: 65 } }
```

## リスト

```typescript
// 配列のどれかに含まれる
where: { role: { in: ['ADMIN', 'MODERATOR'] } }

// 配列のどれにも含まれない
where: { role: { notIn: ['GUEST', 'BANNED'] } }
```

## 文字列の絞り込み

```typescript
// 含む
where: { email: { contains: 'prisma' } }

// で始まる
where: { email: { startsWith: 'alice' } }

// で終わる
where: { email: { endsWith: '@prisma.io' } }

// 大文字・小文字を区別しない（データベースによってはこれがデフォルト）
where: { 
  email: { 
    contains: 'PRISMA',
    mode: 'insensitive' 
  } 
}
```

## null の確認

```typescript
// null である
where: { deletedAt: null }

// null でない
where: { deletedAt: { not: null } }

// isSet を使う（省略できるフィールド向け）
where: { middleName: { isSet: true } }
```

## 論理演算子

### AND（省略形）

```typescript
// 条件を複数並べる = AND
where: {
  email: { contains: '@prisma.io' },
  role: 'ADMIN'
}
```

### AND（明示）

```typescript
where: {
  AND: [
    { email: { contains: '@prisma.io' } },
    { role: 'ADMIN' }
  ]
}
```

### OR

```typescript
where: {
  OR: [
    { email: { contains: '@gmail.com' } },
    { email: { contains: '@prisma.io' } }
  ]
}
```

### NOT

```typescript
where: {
  NOT: {
    role: 'GUEST'
  }
}

// NOT の条件を複数
where: {
  NOT: [
    { role: 'GUEST' },
    { verified: false }
  ]
}
```

### 組み合わせ

```typescript
where: {
  AND: [
    { verified: true },
    {
      OR: [
        { role: 'ADMIN' },
        { role: 'MODERATOR' }
      ]
    }
  ],
  NOT: { deletedAt: { not: null } }
}
```

## リレーションの絞り込み

### some

関連するレコードのうち、1件以上が条件に合う：

```typescript
// 公開済みの投稿が1件以上あるユーザー
where: {
  posts: {
    some: { published: true }
  }
}
```

### every

関連するレコードがすべて条件に合う：

```typescript
// 投稿がすべて公開済みのユーザー
where: {
  posts: {
    every: { published: true }
  }
}
```

### none

関連するレコードが1件も条件に合わない：

```typescript
// 公開済みの投稿が1件もないユーザー
where: {
  posts: {
    none: { published: true }
  }
}
```

### is / isNot（1対1）

```typescript
// 特定の国のプロフィールを持つユーザー
where: {
  profile: {
    is: { country: 'USA' }
  }
}

// プロフィールのないユーザー
where: {
  profile: {
    isNot: null
  }
}
```

## 配列のフィールドの絞り込み

`String[]` のようなフィールド向け：

```typescript
// 要素を持つ
where: { tags: { has: 'typescript' } }

// どれかの要素を持つ
where: { tags: { hasSome: ['typescript', 'javascript'] } }

// すべての要素を持つ
where: { tags: { hasEvery: ['typescript', 'prisma'] } }

// 空である
where: { tags: { isEmpty: true } }
```

## JSON の絞り込み

```typescript
// パスを指定した絞り込み
where: {
  metadata: {
    path: ['settings', 'theme'],
    equals: 'dark'
  }
}

// JSON の中の文字列が含む
where: {
  metadata: {
    path: ['bio'],
    string_contains: 'developer'
  }
}
```

## 全文検索

```typescript
// @@fulltext インデックスが必要
where: {
  content: {
    search: 'prisma database'
  }
}
```
