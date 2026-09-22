"use client";

import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useFetch } from "@/app/_hooks/useFetch";
import { PlannersArray } from "./_components/PlannersArray"

export type PlannersResponse = {
  id: string
  recipeId: string
  date: Date
  userId: string
  createdAt: Date
  updatedAt: Date
  recipe: {
    name: string
    image: string
    favorite: boolean
  }
}[]


export default function Planners() {

  const { token } = useSupabaseSession()

  const { data, isLoading, error, mutate } = useFetch("/api/planners")

  const planners: PlannersResponse = data ? data.planners : [];


  if (isLoading) {
    return <div className="mx-auto text-center mt-5">献立読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">献立を取得できませんでした</div>
  };


  const PlannersDeleteAll = async () => {
    if (!token) return
    try {

      const res: Response = await fetch("/api/planners", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({})
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }

      alert('献立一覧を削除しました。')
      await mutate()
    }
    catch {
      alert('献立一覧の削除に失敗しました。')
    }
  }


  return (
    <PlannersArray
      values={planners ?? undefined}
      onDeleteAll={PlannersDeleteAll}
    />

  );

}
