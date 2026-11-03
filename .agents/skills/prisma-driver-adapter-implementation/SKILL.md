---
name: prisma-driver-adapter-implementation
description: Prisma ORM 7 の SQL のドライバーアダプターの作業に欠かせないリファレンス。アダプターの実装・変更、データベースのドライバーの追加、SqlDriverAdapter・Transaction・セーブポイント・結果の対応付け・DriverAdapterError の動きに手を入れるときに使う。今のトランザクションのライフサイクル、省略できるセーブポイントのフック、元のデータベースのエラーを残すこと、確認の方法を扱う。
license: MIT
metadata:
  author: prisma
  version: "7.9.1"
---

# Prisma の SQL のドライバーアダプターの実装

このガイドは、対象の Prisma のリリースでインストールされる、正確な `@prisma/driver-adapter-utils` のバージョンと一緒に使ってください。ドライバーアダプターは、通信の取り決め（プロトコル）の境界です。型が合っているコードでも、値を壊したり、接続を漏らしたり、トランザクションを壊したりすることがあります。

## 使う場面

- `SqlDriverAdapterFactory`、`SqlMigrationAwareDriverAdapterFactory`、`SqlDriverAdapter`、`Transaction` を実装する
- 入れ子のトランザクションやセーブポイントへの対応を追加する
- ドライバーの値、列の情報、バインドする引数、データベースのエラーを対応付ける
- `P2039`、トランザクションの漏れ、シャドーデータベースの失敗、アダプター固有のクエリの動きを調べる

## 取り決め（インターフェース）の概要

```typescript
interface SqlDriverAdapterFactory extends AdapterInfo {
  connect(): Promise<SqlDriverAdapter>
}

interface SqlMigrationAwareDriverAdapterFactory extends SqlDriverAdapterFactory {
  connectToShadowDb(): Promise<SqlDriverAdapter>
}

interface SqlDriverAdapter extends AdapterInfo {
  queryRaw(query: SqlQuery): Promise<SqlResultSet>
  executeRaw(query: SqlQuery): Promise<number>
  executeScript(script: string): Promise<void>
  startTransaction(isolationLevel?: IsolationLevel): Promise<Transaction>
  getConnectionInfo?(): ConnectionInfo
  dispose(): Promise<void>
}

interface Transaction extends AdapterInfo {
  readonly options: { usePhantomQuery: boolean }
  queryRaw(query: SqlQuery): Promise<SqlResultSet>
  executeRaw(query: SqlQuery): Promise<number>
  commit(): Promise<void>
  rollback(): Promise<void>
  createSavepoint?(name: string): Promise<void>
  rollbackToSavepoint?(name: string): Promise<void>
  releaseSavepoint?(name: string): Promise<void>
}
```

`IsolationLevel` には、今のところ `READ UNCOMMITTED`、`READ COMMITTED`、`REPEATABLE READ`、`SNAPSHOT`、`SERIALIZABLE` があります。実際のデータベースがどれに対応しているかを確認してください。

## 優先度別のルール

| 優先度 | ルール | 効果 |
|----------|------|--------|
| 最重要 | トランザクションごとに専用の接続を1つ使う | 処理が混ざることや漏れを防ぐ |
| 最重要 | `commit`・`rollback` は、ライフサイクルの後片付けのフック | COMMIT・ROLLBACK の重複を防ぐ |
| 最重要 | セーブポイントは、アダプター全体の深さではなく `Transaction` が持つ | 入れ子の範囲を、接続ごとに閉じたものにする |
| 最重要 | データベースの元のエラーコードとメッセージを残す | 役に立つ `P2039` のフォールバックができる |
| 高 | 引数と結果の情報を正確に対応付ける | 気づかないうちに値が壊れるのを防ぐ |
| 高 | シャドーデータベースは分離し、必ず後片付けする | Migrate を安全にする |
| 高 | アダプターが持っているリソースだけを破棄する | 呼び出し元が持っているプールを止めてしまうのを防ぐ |

## クエリの実装

`SqlQuery` には、`sql`、`args`、それと並んだ `argTypes` が入っています。それぞれの引数は、値と `ArgType` の両方を使って対応付けてください。型や個数の情報を捨てないでください。列の順番が変わらないように、ドライバーの配列（タプル）の行の形式で実行します。

```typescript
class ExampleQueryable {
  readonly provider = 'postgres' as const
  readonly adapterName = '@acme/adapter-example'

  constructor(protected readonly connection: DriverConnection) {}

  async queryRaw(query: SqlQuery): Promise<SqlResultSet> {
    try {
      const result = await this.connection.query({
        text: query.sql,
        values: query.args.map((value, index) =>
          mapArg(value, query.argTypes[index]),
        ),
        rowMode: 'array',
      })

      return {
        columnNames: result.fields.map((field) => field.name),
        columnTypes: result.fields.map(mapColumnType),
        rows: result.rows,
      }
    } catch (error) {
      throwAdapterError(error)
    }
  }

  async executeRaw(query: SqlQuery): Promise<number> {
    try {
      const result = await this.connection.execute(
        query.sql,
        query.args.map((value, index) => mapArg(value, query.argTypes[index])),
      )
      return result.rowsAffected ?? 0
    } catch (error) {
      throwAdapterError(error)
    }
  }
}
```

### 結果の対応付け

`columnNames`、`columnTypes`、`rows` は、長さと順番を揃えて返します。ドライバーの情報は、よく考えて `ColumnTypeEnum` に対応付けてください。

- 符号付きの整数の幅は `Int32`・`Int64` に。64ビットの値は、JS の number で切り捨てずに残す
- decimal・numeric は、Prisma が想定する表し方で `Numeric` に
- バイナリは `Uint8Array`・`Bytes` に
- 日付だけ、時刻だけ、タイムスタンプは、それぞれ `Date`、`Time`、`DateTime` に
- UUID、JSON、enum、配列、プロバイダー固有の不明な値は、それぞれの明示的な型に
- 対応していないネイティブの型は `DriverAdapterError({ kind: 'UnsupportedNativeDataType', type })` に

`null`、空の配列、配列の要素の型、大きな整数、小数、バイト配列、JSON、日付、ユーザー定義や不明なネイティブの型をテストしてください。

### スクリプトの実行

`executeScript` は、マイグレーションのスクリプトを、プロバイダーが想定するとおりに実行する必要があります。ドライバー自身の複数の文やスクリプトを実行する機能か、本物の SQL のパーサーを使うのがおすすめです。単純に `;` で区切ると、関数、トリガー、引用符で囲んだ文字列、SQL の方言ごとのブロックが壊れます。

## トランザクションの取り決め

`startTransaction` は、専用の接続を1つ確保し、データベースのトランザクションを始め、指定された分離レベルを適用して、その同じ接続に結びついた `Transaction` を返す必要があります。準備に失敗したら、すぐに接続を解放してください。

```typescript
async startTransaction(level?: IsolationLevel): Promise<Transaction> {
  const connection = await this.pool.acquire()
  try {
    const tx = new ExampleTransaction(connection, () => connection.release())
    await tx.executeRaw({ sql: 'BEGIN', args: [], argTypes: [] })
    if (level) {
      await tx.executeRaw({
        sql: `SET TRANSACTION ISOLATION LEVEL ${validateLevel(level)}`,
        args: [],
        argTypes: [],
      })
    }
    return tx
  } catch (error) {
    connection.release(error)
    throwAdapterError(error)
  }
}
```

### コミットとロールバック

SQL の `COMMIT`・`ROLLBACK` は、Prisma が `executeRaw` を通して管理します。トランザクションのオブジェクトの `commit()` と `rollback()` のメソッドは、ライフサイクルのフックです。リスナーを外し、専用の接続をちょうど1回だけ解放します。SQL のコミットやロールバックを、もう一度発行してはいけません。

```typescript
class ExampleTransaction extends ExampleQueryable implements Transaction {
  readonly options = { usePhantomQuery: false }
  #closed = false

  constructor(connection: DriverConnection, private readonly release: () => void) {
    super(connection)
  }

  async commit() { this.finish() }
  async rollback() { this.finish() }

  private finish() {
    if (this.#closed) return
    this.#closed = true
    this.release()
  }

  async createSavepoint(name: string) {
    await this.control(`SAVEPOINT ${safeSavepoint(name)}`)
  }

  async rollbackToSavepoint(name: string) {
    await this.control(`ROLLBACK TO SAVEPOINT ${safeSavepoint(name)}`)
  }

  async releaseSavepoint(name: string) {
    await this.control(`RELEASE SAVEPOINT ${safeSavepoint(name)}`)
  }

  private async control(sql: string) {
    await this.executeRaw({ sql, args: [], argTypes: [] })
  }
}
```

省略できるセーブポイントのメソッドは、プロバイダーが対応している場合だけ実装します。セーブポイントの識別子は、検証するか引用符で囲んでください。セーブポイントが意図して何もしないプロバイダーでは、その制限を文書に書き、テストしてください。

トランザクションの深さを、共有のアダプターに持たせないでください。トランザクションが並行して動くと、アダプター全体の深さは正しくなくなります。入れ子の状態は、返したトランザクションの接続と、Prisma のセーブポイントの呼び出しが持つものです。

## エラーの対応付け

認識できたドライバーの失敗は、`DriverAdapterError` で包みます。制約違反、認証や接続できるかどうか、テーブル・列・データベースがない、タイムアウト、閉じたトランザクション、正しくない入力、値の範囲、書き込みの競合など、分かっている状況は `MappedError` の種類（kind）に対応付けてください。

データベースのエラーでは、プロバイダー固有の生の形にフォールバックするときでも、`originalCode` と `originalMessage` を残してください。

```typescript
import {
  DriverAdapterError,
  type Error as DriverAdapterErrorObject,
  type MappedError,
} from '@prisma/driver-adapter-utils'

function convertDriverError(error: DatabaseError): DriverAdapterErrorObject {
  return {
    originalCode: String(error.code),
    originalMessage: error.message,
    ...mapKnownOrRaw(error),
  }
}

function mapKnownOrRaw(error: DatabaseError): MappedError {
  if (error.code === '23505') {
    return { kind: 'UniqueConstraintViolation', constraint: parsedConstraint(error) }
  }
  return {
    kind: 'postgres',
    code: String(error.code ?? 'N/A'),
    severity: error.severity ?? 'N/A',
    message: error.message,
    detail: error.detail,
    column: error.column,
    hint: error.hint,
  }
}

function throwAdapterError(error: unknown): never {
  if (!isDatabaseError(error)) throw error
  throw new DriverAdapterError(convertDriverError(error))
}
```

対応付けられていないドライバーのエラーが `P2039` になるとき、Prisma は残しておいた元の詳細を使います。不明な例外を、すべて作り上げた `GenericJs` の ID に置き換えないでください。プログラムのバグが見えるように、ドライバー以外の本当に想定外のエラーは、そのまま投げ直してください。

## ファクトリー、持ち主、シャドーデータベース

- `connect()` は、すぐに使える新しいアダプターの接続やプールのラッパーを返す。
- プールをファクトリーが作ったかどうかを記録しておく。`dispose()` は、自分が持っているプールを閉じる。呼び出し元が持っているプールでは、オプションで持ち主を明示的に移していない限り、リスナーを外すだけにする。
- `SqlMigrationAwareDriverAdapterFactory` は、`connectToShadowDb()` が分離したシャドーデータベースを作り、それに接続し、破棄や失敗の後片付けのときに削除できる場合だけ実装する。
- シャドー用のアダプターを、絶対に本来のデータベースに向けない。生成した識別子は引用符で囲み、暗号的に重複しない名前を使う。
- `getConnectionInfo()` は、`schemaName`、当てはまる場合は `maxBindValues`、`supportsRelationJoins` を正確に返すようにする。

## 確認のチェックリスト

- [ ] 対象の正確な `@prisma/driver-adapter-utils` のバージョンで型チェックする
- [ ] `queryRaw` が、列の順番、型、null、精度を保つ
- [ ] `executeRaw` が、影響を受けた行の数を正しく返す
- [ ] `executeScript` が、プロバイダー固有の複数の文の書き方を扱える
- [ ] 同時に動く対話型のトランザクションが、それぞれ別の専用の接続を使う
- [ ] 成功したら1回コミットして解放し、失敗したら1回ロールバックして解放する
- [ ] 入れ子のトランザクションのテストで、セーブポイントの作成・ロールバック・解放のフックを試す
- [ ] 対応していない分離レベルが `InvalidIsolationLevel` として失敗する
- [ ] 分かっている制約が、構造化されたエラーに対応付けられる
- [ ] 対応付けられていないデータベースのエラーが、元のコードとメッセージを残し、役に立つ `P2039` として出てくる
- [ ] 内部と外部のプールで、破棄のときの持ち主の扱いをテストする
- [ ] シャドーデータベースの作成、使用、失敗の後片付け、破棄が分離されている
- [ ] アダプターの単体テストだけでなく、Prisma Client の結合テストや E2E テストも実行する

## ソースの参考

- [ドライバーアダプターのインターフェース](https://github.com/prisma/prisma/blob/v7/packages/driver-adapter-utils/src/types.ts)
- [PostgreSQL のアダプターのトランザクションの実装](https://github.com/prisma/prisma/blob/v7/packages/adapter-pg/src/pg.ts)
- [PostgreSQL のアダプターのエラーの対応付け](https://github.com/prisma/prisma/blob/v7/packages/adapter-pg/src/errors.ts)
