"use client";

import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { RecipeForm, Data } from '../_components/RecipeForm';
import { RecipePostType } from '@/app/api/recipes/new_recipe/route';


export type recipeData = {
  id: string
  name: string
  recipeImageKey: string
  recipeUrl: string
  favorite: boolean
  servings: string
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

  const [createValue, setCreateValue] = useState<RecipePostType>();

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
          servings: data.servings,
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

  const createRecipe = async (data: FormData) => {
    if (!token) return
    try {

      const body = data

      const res: Response = await fetch('/api/recipes/new_recipe/agent_recipe', {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json',
          Authorization: token,
        },
        body: body,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }

      setCreateValue(await res.json())

    }
    catch {
      alert('レシピ自動作成に失敗しました。')
    }
  }


  return (
    <>

      <div className="flex gap-20">

        <RecipeForm
          mode='new'
          onSubmit={recipePost}
          onCreateRecipe={createRecipe}
          create={createValue}
        />

      </div>

    </>
  );

}
