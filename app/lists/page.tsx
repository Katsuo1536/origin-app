"use client";

import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useFetch } from "@/app/_hooks/useFetch";
import { ListForm } from './_components/ListForm';
import type { DeleteKeyId } from '../api/lists/route';



export type ListsResponse = {
  id: string
  userId: string
  name: string
  quantity: string
  recipeId: string | null
}[]


export default function Lists() {

  const { token } = useSupabaseSession()

  const { data, isLoading, error, mutate } = useFetch("/api/lists")

  const lists: ListsResponse = data ? data.lists : [];

  if (isLoading) {
    return <div className="mx-auto text-center mt-5">買い物リスト読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">買い物リストを取得できませんでした</div>
  };


  const ListDelete = async (id: string) => {
    if (!token) return
    try {

      const body: DeleteKeyId = {
        listId: id
      }

      const res: Response = await fetch("/api/lists", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      alert('買い物リストを削除しました。')
      await mutate()
    }
    catch {
      alert('買い物リストの削除に失敗しました。')
    }
  }

  const ListDeleteAll = async () => {
    if (!token) return
    try {

      const res: Response = await fetch("/api/lists", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({})
      })

      alert('買い物リストを削除しました。')
      await mutate()
    }
    catch {
      alert('買い物リストの削除に失敗しました。')
    }
  }


  return (
    <ListForm
      values={lists ?? undefined}
      onDelete={ListDelete}
      onDeleteAll={ListDeleteAll}
    />

  );

}
