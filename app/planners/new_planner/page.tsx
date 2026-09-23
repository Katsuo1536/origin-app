"use client";

import { PlanForm, Data } from '@/app/planners/_components/PlanForm';
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useFetch } from "@/app/_hooks/useFetch";
import { useRouter, useParams } from 'next/navigation';
import { time } from '@/app/_utils/time';
import { RecipesResponse } from '@/app/recipes/page';
import { PlannerPostType } from '@/app/api/planners/new_planner/route';
import { useState } from 'react';


export type recipeData = {
  id: string
  name: string
  image: string
  recipeUrl: string
  favorite: boolean
  recipeingredients: {
    id: string
    quantity: string
    ingredient: {
      id: string
      name: string
    }
  }[]
  processes: {
    id: string
    stepNumber: number
    description: string
  }[]
}


export default function NewPlanner() {

  const { token } = useSupabaseSession()

  const router = useRouter()
  const { id } = useParams();

  const { data: recipesArray, isLoading, error, mutate } = useFetch("/api/recipes")

  const recipes: RecipesResponse = recipesArray ? recipesArray.recipes : [];

  const [recipeId, setRecipeId] = useState('')

  const { data: recipeData } = useFetch(recipeId ? `/api/recipes/${recipeId}` : '')

  const recipeInadex: recipeData = recipeData ? recipeData.recipe : undefined;



  if (isLoading) {
    return <div className="mx-auto text-center mt-5">献立読み込み中！！！</div>
  }
  else if (error) {
    return <div className="mx-auto text-center mt-5">献立を取得できませんでした</div>
  };

  const PlannerPost = async (data: Data) => {
    if (!token) return
    try {

      const body: PlannerPostType = {
        planner: {
          recipeId: data.recipeId,
          date: data.date,
        }
      }

      const res: Response = await fetch('/api/planners/new_planner', {
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


      alert(`${time(new Date(data.date))}の献立を作成しました。`)
      router.push('/planners')
    }
    catch {
      alert(`${time(new Date(data.date))}の献立作成に失敗しました。`)
    }
  }



  return (
    <>

      <div className="flex gap-20">

        <PlanForm
          mode='new'
          values={(recipeInadex) ? {
            id: '',
            date: new Date().toLocaleDateString('sv-SE'),
            recipeId: recipeInadex.id,
            recipe: recipeInadex,
          } : undefined}
          array={(recipes) ? recipes : undefined}
          onSubmit={PlannerPost}
          onFetch={setRecipeId}

        />

      </div>

    </>
  );

}
