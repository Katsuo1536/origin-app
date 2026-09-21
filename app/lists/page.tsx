"use client";

import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useFetch } from "@/app/_hooks/useFetch";
import { useForm } from "react-hook-form";
import Link from "next/link";


export type ListsResponse = {
  id: string
  userId: string
  name: string
  quantity: string
  recipeId: string | null
}[]


export default function Lists() {

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<Data>();

  const { token } = useSupabaseSession()

  const { data, isLoading, error } = useFetch("/api/lists")

  const lists: ListsResponse = data ? data.lists : [];

  if (isLoading) {
    return <div className="mx-auto text-center mt-5">買い物リスト読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">買い物リストを取得できませんでした</div>
  };


  type Data = {
    listId: string
  }

  const ListDelete = async () => {
    if (!token) return
    try {
      const res: Response = await fetch(`/api/lists`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })

      alert('買い物リストを削除しました。')
      reset()
    }
    catch {
      alert('記事の削除に失敗しました。')
    }
  }


  return (
    <form onSubmit={handleSubmit(ListDelete)}>

      <span className="flex items-center translate-x-275 py-5 gap-5">
        <button className="flex justify-center items-center bg-red-500
                            text-xl text-white font-semibold h-10 w-20
                            rounded-lg">
          全削除
        </button>
        <Link href={"/lists/new_lists"} className="flex justify-center items-center
       text-white text-3xl bg-green-400 border-2 border-green-400 rounded-lg h-10 w-10  py-5">
          +
        </Link>
      </span>

      <div className="flex flex-col items-center justify-center gap-3 py-5">

        {lists?.map(elem => (
          <div className="flex flex-col-2 gap-10 justify-center items-center">
            <button className="flex 
                  border border-gray-300 rounded-lg
                  h-10 w-10" type="submit"
              onSubmit={ListDelete}
              disabled={isSubmitting} />

            <span key={elem.id} className="flex items-center  justify-between
                  border border-gray-300 h-7 w-80 rounded-lg
                  px-3 py-7">

              <span className="text-black  text-2xl">
                {elem.name}
              </span>

              <span className="text-gray-400  text-lg">
                {elem.quantity}
              </span>
            </span>
          </div>
        ))}


      </div>

    </form>
  );

}