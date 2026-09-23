"use client";

import { PlanForm, Data } from '@/app/planners/_components/PlanForm';
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useFetch } from "@/app/_hooks/useFetch";
import { useRouter, useParams } from 'next/navigation';
import type { PlannerUpdateBody } from '@/app/api/planners/[id]/route';
import { PlannerDeleteBody } from '@/app/api/planners/[id]/route';
import { time } from '@/app/_utils/time';
import { CreateListsBody } from '@/app/api/lists/new_lists/route';


export default function Planner() {

  const { token } = useSupabaseSession()

  const router = useRouter()
  const { id } = useParams();

  const { data, isLoading, error, mutate } = useFetch(`/api/planners/${id}`)

  const planner: Data = data ? data.planner : undefined;



  if (isLoading) {
    return <div className="mx-auto text-center mt-5">献立読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">献立を取得できませんでした</div>
  };

  const PlannerUpdate = async (data: Data) => {
    if (!token) return
    try {

      const body: PlannerUpdateBody = {
        planner: {
          recipeId: data.recipeId,
          date: data.date,
        }
      }

      console.log(body)

      const res: Response = await fetch(`/api/planners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }


      alert(`${time(new Date(data.date))}の献立を更新しました。`)
      await mutate()
    }
    catch {
      alert(`${time(new Date(data.date))}の献立を更新に失敗しました。`)
    }
  }

  const PlannerDelete = async (id: string) => {
    if (!token) return
    try {

      const body: PlannerDeleteBody = {
        planner: {
          id: id
        }
      }

      const res: Response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }

      alert(`${time(data.date)}の献立を削除しました。`)
      router.push("/recipes")
    }
    catch {
      alert(`${time(data.date)}の献立の削除に失敗しました。`)
    }
  }

  const CreateLists = async (data: Data) => {
    if (!token) return
    try {

      const body: CreateListsBody = {
        lists: data.recipe.recipeingredients.map(elem => ({
          name: elem.ingredient.name,
          quantity: elem.quantity,
          recipeId: data.recipeId,
        }))
      }

      const res: Response = await fetch('/api/lists/new_lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }


      alert(`${data.recipe.name}から買い物リスト作成しました。`)
      router.push('/lists')
    }
    catch {
      alert(`${data.recipe.name}から買い物リスト作成に失敗しました。`)
    }
  }


  return (
    <>

      <div className="flex gap-20">

        <PlanForm
          mode='edit'
          values={(planner) ? {
            id: planner.id,
            recipeId: planner.recipeId,
            date: new Date(planner.date).toLocaleDateString('sv-SE'),
            recipe: planner.recipe,
          } : undefined}
          onSubmit={PlannerUpdate}
          onDelete={PlannerDelete}
          onCreateLists={CreateLists}

        />

      </div>

    </>
  );

}
