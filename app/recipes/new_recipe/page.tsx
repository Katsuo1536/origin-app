"use client";

import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useFetch } from "@/app/_hooks/useFetch";
import { useRouter, useParams } from 'next/navigation';
import { time } from '@/app/_utils/time';
import { RecipesResponse } from '@/app/recipes/page';
import { PlannerPostType } from '@/app/api/planners/new_planner/route';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RecipeForm, Data } from '../_components/RecipeForm';
import { RecipePostType } from '@/app/api/recipes/new_recipe/route';

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


export default function NewRecipe() {

  const { token } = useSupabaseSession()

  const router = useRouter()

  const recipePost = async (data: Data) => {
    if (!token) return
    try {

      const body: RecipePostType = {
        recipe: {
          name: data.name,
          recipeImageKey: data.recipeImageKey,
          recipeUrl: data.recipeUrl,
          favorite: data.favorite,
          recipeingredients: data.recipeingredients,
          processes: data.processes,
        }
      }

      const res: Response = await fetch('/api/recipes/new_recipe', {
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


      alert(`${data.name}を作成しました。`)
      router.push('/recipes')
    }
    catch {
      alert(`${data.name}の作成に失敗しました。`)
    }
  }

  return (
    <>

      <div className="flex gap-20">

        <RecipeForm
          mode='new'
          onSubmit={recipePost}
        />

      </div>

    </>
  );

}
